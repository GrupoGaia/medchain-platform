import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { CreateMobileUserSchema } from "@/lib/mobile-user-schema";

// POST /api/users: cria registro Prisma após signUp no mobile (idempotente)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser(token);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Idempotente: retorna se já existe
  const existing = await prisma.user.findUnique({
    where: { authId: authUser.id },
    include: { patientProfile: true, professionalProfile: true, contactFor: true },
  });
  if (existing) return NextResponse.json(existing);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const result = CreateMobileUserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 422 });
  }

  const input = result.data;

  if (input.role === "EMERGENCY_CONTACT") {
    const patient = await prisma.patientProfile.findUnique({
      where: { id: input.patientId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
    }
  }

  const created = await prisma.$transaction(async (tx) => {
    const dbUser = await tx.user.create({
      data: {
        authId: authUser.id,
        email: authUser.email!,
        role: input.role,
      },
    });

    if (input.role === "PATIENT") {
      await tx.patientProfile.create({
        data: {
          userId: dbUser.id,
          fullName: input.fullName,
          allergies: [],
          chronicConditions: [],
          continuousMeds: [],
        },
      });
    } else {
      await tx.emergencyContact.create({
        data: {
          patientId: input.patientId,
          userId: dbUser.id,
          name: input.fullName,
          relation: input.relation,
          phone: input.phone,
        },
      });
    }

    return tx.user.findUniqueOrThrow({
      where: { id: dbUser.id },
      include: { patientProfile: true, professionalProfile: true, contactFor: true },
    });
  });

  return NextResponse.json(created, { status: 201 });
}
