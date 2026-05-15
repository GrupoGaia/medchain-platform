import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  return NextResponse.json(accessRequest);
}
