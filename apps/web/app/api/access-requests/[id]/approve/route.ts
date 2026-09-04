import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { buildTokenExpiry, contactLinkGrantsAccess } from "@medchain/domain";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const { id } = await params;

  const accessRequest = await prisma.accessRequest.findUnique({
    where: { id },
    include: {
      patient: {
        include: { emergencyContacts: true },
      },
    },
  });

  if (!accessRequest) {
    return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });
  }
  if (accessRequest.status !== "PENDING") {
    return NextResponse.json({ error: "Solicitação não está pendente" }, { status: 409 });
  }

  const isPatient = user.patientProfile?.id === accessRequest.patientId;
  // Vinculo pendente ou negado nao aprova nada. Sem o filtro de status, quem
  // se declarasse contato de emergencia liberava o prontuario para um medico.
  const isEmergencyContact = accessRequest.patient.emergencyContacts.some(
    (c) => c.userId === user.id && contactLinkGrantsAccess(c.status)
  );
  if (!isPatient && !isEmergencyContact) return forbidden();

  const expiresAt = buildTokenExpiry(accessRequest.durationMinutes);
  const revokedAt = new Date();

  // A concessao nova substitui a anterior. Sem isso, um paciente que autoriza um
  // escopo mais estreito continuaria exposto pelo token antigo ate ele vencer.
  // So os vigentes entram: token ja vencido nao concede acesso, e registrar
  // revogacao dele poluiria a auditoria com um evento que nao aconteceu.
  const supersededTokens = await prisma.accessToken.findMany({
    where: {
      patientId: accessRequest.patientId,
      professionalId: accessRequest.professionalId,
      status: "ACTIVE",
      expiresAt: { gt: revokedAt },
    },
    select: { id: true },
  });

  const [, token] = await prisma.$transaction([
    prisma.accessToken.updateMany({
      where: {
        patientId: accessRequest.patientId,
        professionalId: accessRequest.professionalId,
        status: "ACTIVE",
        expiresAt: { gt: revokedAt },
      },
      data: { status: "REVOKED", revokedAt },
    }),
    prisma.accessToken.create({
      data: {
        requestId: id,
        patientId: accessRequest.patientId,
        professionalId: accessRequest.professionalId,
        scope: accessRequest.scope,
        expiresAt,
        status: "ACTIVE",
      },
    }),
    prisma.accessRequest.update({
      where: { id },
      data: { status: "APPROVED" },
    }),
  ]);

  await prisma.accessLog.create({
    data: {
      tokenId: token.id,
      actorUserId: user.id,
      patientId: accessRequest.patientId,
      eventType: "APPROVE",
      channel: "MOBILE_APP",
    },
  });

  // Um log por token encerrado, para o historico do paciente mostrar que a
  // autorizacao anterior terminou, e nao apenas que uma nova comecou.
  for (const superseded of supersededTokens) {
    await prisma.accessLog.create({
      data: {
        tokenId: superseded.id,
        actorUserId: user.id,
        patientId: accessRequest.patientId,
        eventType: "REVOKE",
        channel: "MOBILE_APP",
      },
    });
  }

  return NextResponse.json(token, { status: 201 });
}
