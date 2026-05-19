import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

// POST /api/users — cria registro Prisma após signUp no mobile (idempotente)
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
    include: { patientProfile: true, professionalProfile: true },
  });
  if (existing) return NextResponse.json(existing);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { role, fullName } = body as { role: UserRole; fullName: string };
  if (!role || !fullName) {
    return NextResponse.json({ error: "role e fullName são obrigatórios" }, { status: 400 });
  }

  const dbUser = await prisma.user.create({
    data: {
      authId: authUser.id,
      email: authUser.email!,
      role,
    },
  });

  if (role === "PATIENT") {
    await prisma.patientProfile.create({
      data: { userId: dbUser.id, fullName },
    });
  }

  return NextResponse.json(dbUser, { status: 201 });
}
