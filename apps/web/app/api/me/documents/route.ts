import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { getManagedPatientIds } from "@/lib/patient-access";

// GET /api/me/documents — documentos do paciente logado
export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  const patientIds = getManagedPatientIds(user);
  if (patientIds.length === 0) return forbidden();

  const documents = await prisma.medicalDocument.findMany({
    where: { patientId: { in: patientIds } },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json(documents);
}
