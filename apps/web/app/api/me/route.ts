import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";

// GET /api/me — perfil do paciente logado
export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  if (!user.patientProfile) return forbidden();

  const profile = await prisma.patientProfile.findUnique({
    where: { id: user.patientProfile.id },
    include: { emergencyContacts: true },
  });

  return NextResponse.json(profile);
}
