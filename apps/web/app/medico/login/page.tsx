import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

async function signIn(formData: FormData) {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (!email || !password) redirect("/medico/login?error=required");

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/medico/login?error=invalid");
  redirect("/medico/dashboard");
}

const DEMO_USERS = [
  { label: "Cardiologia", email: "carlos.silva@medchain.demo" },
  { label: "Clínica Geral", email: "ana.ferreira@medchain.demo" },
  { label: "Endocrinologia", email: "paulo.mendes@medchain.demo" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-teal-50 p-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600">
            <span className="text-lg font-bold text-white">M</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">MedChain</span>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">Entrar como médico</h1>
        <p className="mb-6 text-sm text-gray-500">Acesse o portal com seu email e senha.</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error === "required" ? "Preencha email e senha." : "Email ou senha incorretos."}
          </div>
        )}

        <form action={signIn} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="seu@email.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
          >
            Entrar
          </button>
        </form>

        <div className="mt-8 rounded-lg bg-gray-50 p-4">
          <p className="mb-2 text-xs font-semibold text-gray-500">Demo - senha: medchain123</p>
          <ul className="space-y-1">
            {DEMO_USERS.map((u) => (
              <li key={u.email} className="text-xs">
                <span className="font-mono text-gray-700">{u.email}</span>
                <span className="ml-1 text-gray-400">({u.label})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
