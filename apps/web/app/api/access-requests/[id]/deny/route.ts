import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const accessRequest = await prisma.accessRequest.findUnique({
    where: { id },
    include: {
      patient: { include: { user: true } },
    },
  });

  if (!accessRequest) {
    return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });
  }
  if (accessRequest.status !== "PENDING") {
    return NextResponse.json({ error: "Solicitação não está pendente" }, { status: 409 });
  }

  const updated = await prisma.accessRequest.update({
    where: { id },
    data: { status: "DENIED" },
  });

  await prisma.accessLog.create({
    data: {
      actorUserId: accessRequest.patient.userId,
      patientId: accessRequest.patientId,
      eventType: "DENY",
      channel: "MOBILE_APP",
    },
  });

  return NextResponse.json(updated);
}
