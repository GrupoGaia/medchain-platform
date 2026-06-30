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

  return (
    <AppShell
      userName={user.professionalProfile?.fullName ?? user.email ?? "Médico"}
      userSubtitle={user.professionalProfile?.specialty}
      logoutAction={logout}
    >
      {children}
    </AppShell>
  );
}
