import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";

// GET /api/me/documents — documentos do paciente logado
export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  if (!user.patientProfile) return forbidden();

  const documents = await prisma.medicalDocument.findMany({
    where: { patientId: user.patientProfile.id },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json(documents);
}
