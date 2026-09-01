import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { getManagedPatientIds } from "@/lib/patient-access";
import { createSignedUrl } from "@/lib/storage";
import { getRequestId, reportApiError } from "@/lib/api-error";
import { scopeAllowsDocumentType } from "@medchain/domain";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const requestId = getRequestId(request);

  const { id } = await params;

  const doc = await prisma.medicalDocument.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });

  const isOwner = getManagedPatientIds(user).includes(doc.patientId);

  let hasProfessionalAccess = false;
  if (!isOwner && user.professionalProfile) {
    const token = await prisma.accessToken.findFirst({
      where: {
        patientId: doc.patientId,
        professionalId: user.professionalProfile.id,
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
      },
    });
    // Token ativo nao basta: o escopo dele precisa cobrir o tipo do documento.
    // Sem esta checagem, o filtro de tela seria contornavel chamando a API direto.
    hasProfessionalAccess = !!token && scopeAllowsDocumentType(token.scope, doc.type);
  }

  if (!isOwner && !hasProfessionalAccess) return forbidden();

  try {
    const signedUrl = await createSignedUrl(doc.storageKey, 60);
    return NextResponse.json({ signedUrl });
  } catch (error) {
    reportApiError(error, {
      action: "create_signed_url",
      requestId,
      userId: user.id,
      status: 404,
    });
    return NextResponse.json(
      { error: "Arquivo não disponível no storage." },
      { status: 404 }
    );
  }
}
