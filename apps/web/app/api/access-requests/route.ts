import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { getManagedPatientIds } from "@/lib/patient-access";
import { CreateAccessRequestSchema } from "@medchain/api-contract";
import type { AccessRequestStatus } from "@prisma/client";

// GET /api/access-requests?status=PENDING — retorna requests do paciente logado
export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  const patientIds = getManagedPatientIds(user);
  if (patientIds.length === 0) return forbidden();

  const status = request.nextUrl.searchParams.get("status") as AccessRequestStatus | null;

  const requests = await prisma.accessRequest.findMany({
    where: {
      patientId: { in: patientIds },
      ...(status ? { status } : {}),
    },
    include: { professional: { include: { institution: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  if (!user.professionalProfile) return forbidden();

  const doctorId = user.professionalProfile.id;

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

  const { patientId, scope, durationMinutes, reason } = result.data;

  const patient = await prisma.patientProfile.findUnique({ where: { id: patientId } });
  if (!patient) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });

  const accessRequest = await prisma.accessRequest.create({
    data: {
      patientId,
      professionalId: doctorId,
      requestedById: user.id,
      scope,
      durationMinutes: durationMinutes ?? 60,
      reason,
      channelType: "WEB_PORTAL",
    },
  });

  return NextResponse.json(accessRequest, { status: 201 });
}
