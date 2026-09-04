import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { getManagedPatientIds } from "@/lib/patient-access";
import { UpdatePatientProfileSchema } from "@/lib/patient-profile-schema";

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

// PATCH /api/me: o paciente edita o proprio perfil clinico.
//
// Restrito ao proprio paciente, e nao a quem gerencia o perfil dele. O contato
// de emergencia aprovado consente por ele em acesso, que e decisao sobre
// privacidade, mas nao escreve alergia no lugar dele: dado clinico errado aqui
// vira decisao clinica errada na ponta.
export async function PATCH(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  if (!user.patientProfile) return forbidden();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const result = UpdatePatientProfileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 });
  }

  const updated = await prisma.patientProfile.update({
    where: { id: user.patientProfile.id },
    data: result.data,
    include: { emergencyContacts: true },
  });

  return NextResponse.json(updated);
}
