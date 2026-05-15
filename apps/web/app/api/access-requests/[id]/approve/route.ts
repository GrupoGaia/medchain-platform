import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildTokenExpiry } from "@medchain/domain";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const accessRequest = await prisma.accessRequest.findUnique({
    where: { id },
    include: {
      patient: { include: { user: true } },
    },
  });

  if (!accessRequest) {
    return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });
  }
  if (accessRequest.status !== "PENDING") {
    return NextResponse.json({ error: "Solicitação não está pendente" }, { status: 409 });
  }

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
      actorUserId: accessRequest.patient.userId,
      patientId: accessRequest.patientId,
      eventType: "APPROVE",
      channel: "MOBILE_APP",
    },
  });

  return NextResponse.json(token, { status: 201 });
}
