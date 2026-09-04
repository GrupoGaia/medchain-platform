import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";

// POST /api/contact-links/[id]/deny: o paciente recusa o pedido de vinculo.
// O registro fica, negado, para o pedido nao sumir sem deixar rastro.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const { id } = await params;

  const link = await prisma.emergencyContact.findUnique({ where: { id } });
  if (!link) {
    return NextResponse.json({ error: "Vínculo não encontrado" }, { status: 404 });
  }

  if (user.patientProfile?.id !== link.patientId) return forbidden();

  if (link.status !== "PENDING") {
    return NextResponse.json({ error: "Vínculo já respondido" }, { status: 409 });
  }

  const updated = await prisma.emergencyContact.update({
    where: { id },
    data: { status: "DENIED", respondedAt: new Date() },
  });

  await prisma.accessLog.create({
    data: {
      actorUserId: user.id,
      patientId: link.patientId,
      eventType: "CONTACT_DENY",
      channel: "MOBILE_APP",
    },
  });

  return NextResponse.json(updated);
}
