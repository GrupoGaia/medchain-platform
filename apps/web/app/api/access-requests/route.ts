import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateAccessRequestSchema } from "@medchain/api-contract";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const result = CreateAccessRequestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 });
  }

  const { patientId, professionalId, scope, durationMinutes, reason } = result.data;

  const [patient, professional] = await Promise.all([
    prisma.patientProfile.findUnique({ where: { id: patientId } }),
    prisma.healthProfessionalProfile.findUnique({ where: { id: professionalId } }),
  ]);

  if (!patient)       return NextResponse.json({ error: "Paciente não encontrado" },     { status: 404 });
  if (!professional)  return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });

  const accessRequest = await prisma.accessRequest.create({
    data: {
      patientId,
      professionalId,
      requestedById: professional.userId,
      scope,
      durationMinutes: durationMinutes ?? 60,
      reason,
      channelType: "WEB_PORTAL",
    },
  });

  return NextResponse.json(accessRequest, { status: 201 });
}
