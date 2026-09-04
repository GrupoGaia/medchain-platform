import { redirect } from "next/navigation";
import { requireDoctor } from "@/lib/session";
import { createSupabaseServer } from "@/lib/supabase/server";
import { AppShell } from "@/components/medchain/app-shell";

async function logout() {
  "use server";
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/medico/login");
}

export default async function MedicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireDoctor();
  const profile = user.professionalProfile;

  return (
    <AppShell
      userName={profile?.fullName ?? user.email ?? "Profissional"}
      userSubtitle={
        profile ? `${profile.specialty} · CRM ${profile.crm}` : undefined
      }
      institution={profile?.institution?.name}
      logoutAction={logout}
    >
      {children}
    </AppShell>
  );
}
