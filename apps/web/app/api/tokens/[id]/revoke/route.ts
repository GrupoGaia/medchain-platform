import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token = await prisma.accessToken.findUnique({
    where: { id },
    include: {
      patient: { include: { user: true } },
    },
  });

  if (!token) {
    return NextResponse.json({ error: "Token não encontrado" }, { status: 404 });
  }
  if (token.status !== "ACTIVE") {
    return NextResponse.json({ error: "Token não está ativo" }, { status: 409 });
  }

  const now = new Date();
  const updated = await prisma.accessToken.update({
    where: { id },
    data: { status: "REVOKED", revokedAt: now },
  });

  await prisma.accessLog.create({
    data: {
      tokenId: id,
      actorUserId: token.patient.userId,
      patientId: token.patientId,
      eventType: "REVOKE",
      channel: "MOBILE_APP",
    },
  });

  return NextResponse.json(updated);
}
