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
      // A instituição vem junto porque o cabeçalho do portal mostra em nome de
      // quem o profissional está acessando o prontuário.
      professionalProfile: { include: { institution: true } },
      patientProfile: true,
      contactFor: true,
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
