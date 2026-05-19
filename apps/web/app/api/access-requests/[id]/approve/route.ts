import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { buildTokenExpiry } from "@medchain/domain";

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
  const isEmergencyContact = accessRequest.patient.emergencyContacts.some(
    (c) => c.userId === user.id
  );
  if (!isPatient && !isEmergencyContact) return forbidden();

  const expiresAt = buildTokenExpiry(accessRequest.durationMinutes);

  const [token] = await prisma.$transaction([
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

  return NextResponse.json(token, { status: 201 });
}
