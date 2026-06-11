import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { getManagedPatientIds } from "@/lib/patient-access";

// GET /api/me: perfil do paciente logado
export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  const [patientId] = getManagedPatientIds(user);
  if (!patientId) return forbidden();

  const profile = await prisma.patientProfile.findUnique({
    where: { id: patientId },
    include: { emergencyContacts: true },
  });

  return NextResponse.json(profile);
}
