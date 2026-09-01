import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { scopeAllowsDocumentType, validateToken } from "@medchain/domain";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  if (!user.professionalProfile) return forbidden();

  const { id: patientId } = await params;
  const professionalId = user.professionalProfile.id;

  const tokens = await prisma.accessToken.findMany({
    where: { patientId, professionalId, status: "ACTIVE" },
  });

  if (tokens.length === 0) {
    return NextResponse.json({ error: "Sem token ativo para este profissional" }, { status: 401 });
  }

  // Pode existir mais de um token ativo para o mesmo par medico-paciente,
  // porque a aprovacao cria token novo sem revogar os anteriores. Validamos
  // cada um, expirando os vencidos, e usamos a uniao dos que ainda valem.
  const validTokens: Array<{ scope: (typeof tokens)[number]["scope"]; minutesRemaining: number }> = [];

  for (const token of tokens) {
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
      continue;
    }

    validTokens.push({ scope: token.scope, minutesRemaining: validation.minutesRemaining });
  }

  if (validTokens.length === 0) {
    return NextResponse.json({ error: "Token expirado" }, { status: 401 });
  }

  const documents = await prisma.medicalDocument.findMany({
    where: { patientId },
    orderBy: { issuedAt: "desc" },
  });

  const allowedDocuments = documents.filter((doc) =>
    validTokens.some((token) => scopeAllowsDocumentType(token.scope, doc.type))
  );

  const minutesRemaining = Math.max(...validTokens.map((token) => token.minutesRemaining));

  return NextResponse.json({
    documents: allowedDocuments,
    minutesRemaining,
  });
}
