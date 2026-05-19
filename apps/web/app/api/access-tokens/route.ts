import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import type { AccessTokenStatus } from "@prisma/client";

// GET /api/access-tokens?status=ACTIVE — tokens do paciente logado
export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  if (!user.patientProfile) return forbidden();

  const status = request.nextUrl.searchParams.get("status") as AccessTokenStatus | null;

  const tokens = await prisma.accessToken.findMany({
    where: {
      patientId: user.patientProfile.id,
      ...(status ? { status } : {}),
    },
    include: {
      professional: { include: { institution: true } },
    },
    orderBy: { expiresAt: "asc" },
  });

  return NextResponse.json(tokens);
}
