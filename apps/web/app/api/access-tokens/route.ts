import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { getManagedPatientIds } from "@/lib/patient-access";
import type { AccessTokenStatus } from "@prisma/client";

// GET /api/access-tokens?status=ACTIVE — tokens do paciente logado
export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  const patientIds = getManagedPatientIds(user);
  if (patientIds.length === 0) return forbidden();

  const status = request.nextUrl.searchParams.get("status") as AccessTokenStatus | null;

  const tokens = await prisma.accessToken.findMany({
    where: {
      patientId: { in: patientIds },
      ...(status ? { status } : {}),
    },
    include: {
      professional: { include: { institution: true } },
    },
    orderBy: { expiresAt: "asc" },
  });

  return NextResponse.json(tokens);
}
