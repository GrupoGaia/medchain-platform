import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PublicHeader } from "@/components/medchain/public-header";
import { Logo } from "@/components/medchain/logo";
import { cn } from "@/lib/utils";
import { ArrowLeft, AlertCircle, ShieldCheck, Lock } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-white">
      <PublicHeader />

      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-24 lg:flex-row lg:gap-12">
        <div className="relative mb-8 hidden max-w-sm lg:block">
          <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />
          <Image
            src="/img/security-shield.png"
            alt="Escudo de segurança representando proteção de dados médicos"
            width={400}
            height={320}
            className="relative rounded-2xl border bg-white object-cover shadow-xl"
            priority
          />
        </div>

        <Card className="w-full max-w-md border shadow-lg">
          <CardContent className="p-8">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>

            <div className="mb-6">
              <Logo size="md" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Entrar como médico
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Acesse o portal com seu email e senha.
            </p>

            {error && (
              <Alert variant="destructive" className="mt-5">
                <AlertCircle size={16} />
                <AlertDescription>
                  {error === "required" ? "Preencha email e senha." : "Email ou senha incorretos."}
                </AlertDescription>
              </Alert>
            )}

            <form action={signIn} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className={cn(buttonVariants(), "w-full")}>
                <Lock size={16} className="mr-2" />
                Entrar com segurança
              </button>
            </form>

            <div className="mt-6 rounded-lg border border-primary-100 bg-primary-50/50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
                <ShieldCheck size={16} />
                Ambiente de demonstração
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Use uma das contas abaixo. Todas têm a senha:
              </p>
              <code className="mb-3 block rounded bg-white px-2 py-1 text-center text-xs font-semibold text-foreground">
                medchain123
              </code>
              <ul className="space-y-1.5">
                {DEMO_USERS.map((u) => (
                  <li key={u.email} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{u.label}</span>
                    <span className="font-mono text-muted-foreground">{u.email}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
