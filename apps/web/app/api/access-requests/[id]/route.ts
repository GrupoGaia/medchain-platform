import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { canManagePatient } from "@/lib/patient-access";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const { id } = await params;

  const accessRequest = await prisma.accessRequest.findUnique({
    where: { id },
    include: {
      professional: { include: { institution: true } },
      patient: true,
      token: true,
    },
  });

  if (!accessRequest) {
    return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });
  }

  const isProfessional = user.professionalProfile?.id === accessRequest.professionalId;
  const isPatient = canManagePatient(user, accessRequest.patientId);
  if (!isProfessional && !isPatient) return forbidden();

  return NextResponse.json(accessRequest);
}
