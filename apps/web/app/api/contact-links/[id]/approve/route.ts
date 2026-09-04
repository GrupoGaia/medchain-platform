import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";

// POST /api/contact-links/[id]/approve: o paciente aceita alguem como contato
// de emergencia. Antes disso o vinculo existe mas nao da acesso a nada.
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

  // So o proprio paciente decide quem fala por ele. Um contato ja aprovado nao
  // pode aprovar outros, senao o consentimento se propagaria sozinho.
  if (user.patientProfile?.id !== link.patientId) return forbidden();

  if (link.status !== "PENDING") {
    return NextResponse.json({ error: "Vínculo já respondido" }, { status: 409 });
  }

  const updated = await prisma.emergencyContact.update({
    where: { id },
    data: { status: "APPROVED", respondedAt: new Date() },
  });

  await prisma.accessLog.create({
    data: {
      actorUserId: user.id,
      patientId: link.patientId,
      eventType: "CONTACT_APPROVE",
      channel: "MOBILE_APP",
    },
  });

  return NextResponse.json(updated);
}
