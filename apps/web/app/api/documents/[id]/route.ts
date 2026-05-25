import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { getManagedPatientIds } from "@/lib/patient-access";
import { createSignedUrl } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

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
    hasProfessionalAccess = !!token;
  }

  if (!isOwner && !hasProfessionalAccess) return forbidden();

  try {
    const signedUrl = await createSignedUrl(doc.storageKey, 60);
    return NextResponse.json({ signedUrl });
  } catch {
    return NextResponse.json(
      { error: "Arquivo não disponível no storage." },
      { status: 404 }
    );
  }
}
