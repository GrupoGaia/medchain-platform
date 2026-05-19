import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const { id } = await params;

  const token = await prisma.accessToken.findUnique({ where: { id } });

  if (!token) {
    return NextResponse.json({ error: "Token não encontrado" }, { status: 404 });
  }
  if (token.status !== "ACTIVE") {
    return NextResponse.json({ error: "Token não está ativo" }, { status: 409 });
  }

  const isPatient = user.patientProfile?.id === token.patientId;
  const isProfessional = user.professionalProfile?.id === token.professionalId;
  if (!isPatient && !isProfessional) return forbidden();

  const updated = await prisma.accessToken.update({
    where: { id },
    data: { status: "REVOKED", revokedAt: new Date() },
  });

  await prisma.accessLog.create({
    data: {
      tokenId: id,
      actorUserId: user.id,
      patientId: token.patientId,
      eventType: "REVOKE",
      channel: "MOBILE_APP",
    },
  });

  return NextResponse.json(updated);
}
