import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const patientId = searchParams.get("patientId") ?? undefined;

  const logs = await prisma.accessLog.findMany({
    where: patientId ? { patientId } : {},
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
