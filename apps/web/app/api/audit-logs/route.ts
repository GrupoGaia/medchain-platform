import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  if (!user.patientProfile) return forbidden();

  const patientId = user.patientProfile.id;

  const logs = await prisma.accessLog.findMany({
    where: { patientId },
    include: {
      actor: { select: { email: true, role: true } },
      token: {
        include: {
          professional: { select: { fullName: true, crm: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(logs);
}
