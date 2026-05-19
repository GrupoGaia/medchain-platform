import { redirect } from "next/navigation";
import { createSupabaseServer } from "./supabase/server";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.user.findUnique({
    where: { authId: user.id },
    include: {
      professionalProfile: true,
      patientProfile: true,
    },
  });
}

export async function requireDoctor() {
  const user = await getCurrentUser();
  if (!user?.professionalProfile) redirect("/medico/login");
  return { user, doctorId: user.professionalProfile.id };
}

export async function requirePatient() {
  const user = await getCurrentUser();
  if (!user?.patientProfile) redirect("/login");
  return { user, patientId: user.patientProfile.id };
}
