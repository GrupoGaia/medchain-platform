import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServer } from "./supabase/server";
import { prisma } from "./prisma";

async function findDbUser(authId: string) {
  return prisma.user.findUnique({
    where: { authId },
    include: { professionalProfile: true, patientProfile: true },
  });
}

// Suporta sessão por cookie (portal web) e Bearer token (mobile)
export async function getApiUser(request: NextRequest) {
  // 1. Cookie-based (web portal)
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return findDbUser(user.id);

  // 2. Bearer token (mobile)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const {
      data: { user: tokenUser },
    } = await anon.auth.getUser(token);
    if (tokenUser) return findDbUser(tokenUser.id);
  }

  return null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function badRequest(message = "Bad Request") {
  return NextResponse.json({ error: message }, { status: 400 });
}
