import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateToken } from "@medchain/domain";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;
  const professionalId = request.nextUrl.searchParams.get("professionalId");

  if (!professionalId) {
    return NextResponse.json({ error: "professionalId é obrigatório" }, { status: 400 });
  }

  const token = await prisma.accessToken.findFirst({
    where: { patientId, professionalId, status: "ACTIVE" },
  });

  if (!token) {
    return NextResponse.json({ error: "Sem token ativo para este profissional" }, { status: 401 });
  }

  const validation = validateToken({
    status: token.status,
    expiresAt: token.expiresAt,
    revokedAt: token.revokedAt,
  });

  if (!validation.valid) {
    await prisma.accessToken.update({
      where: { id: token.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ error: "Token expirado" }, { status: 401 });
  }

  const documents = await prisma.medicalDocument.findMany({
    where: { patientId },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json({ documents, minutesRemaining: validation.minutesRemaining });
}
