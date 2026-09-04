import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Logo } from "@/components/medchain/logo";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Clock,
  FileCheck,
  Lock,
} from "lucide-react";

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

const GUARANTEES = [
  {
    icon: ShieldCheck,
    title: "Autorização do paciente",
    description: "Nenhum prontuário abre sem aprovação explícita de quem é dono do dado.",
  },
  {
    icon: Clock,
    title: "Acesso com prazo",
    description: "Cada autorização vira um token que expira sozinho no tempo combinado.",
  },
  {
    icon: FileCheck,
    title: "Auditoria integral",
    description: "Solicitação, aprovação e cada abertura ficam registradas para o paciente.",
  },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Painel de contexto. Só a partir de lg: em telas menores o formulário
          é a única coisa que interessa. */}
      <aside className="relative hidden flex-col justify-between bg-surface-inverse p-10 text-white lg:flex">
        <Logo size="md" className="[&_span:last-child]:text-white" />

        <div className="max-w-md">
          <h2 className="text-display text-white">
            Prontuários abertos com a autorização de quem é dono deles.
          </h2>
          <ul className="mt-8 space-y-5">
            {GUARANTEES.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex gap-3">
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-primary-300"
                  >
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-label font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-body-sm leading-relaxed text-white/70">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-caption text-white/50">
          MedChain · Plataforma de prontuário com soberania do paciente
        </p>
      </aside>

      <main className="flex flex-col justify-center px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 rounded-md text-label font-medium text-muted-foreground transition-colors duration-fast hover:text-foreground"
          >
            <ArrowLeft size={15} aria-hidden />
            Voltar ao início
          </Link>

          <div className="lg:hidden">
            <Logo size="md" />
          </div>

          <h1 className="mt-6 text-page-title text-foreground lg:mt-0">
            Entrar no portal médico
          </h1>
          <p className="mt-1 text-body text-foreground-secondary">
            Use o e-mail e a senha do seu cadastro profissional.
          </p>

          {error && (
            <Alert variant="danger" icon={<AlertCircle />} className="mt-5">
              <AlertTitle>
                {error === "required"
                  ? "Preencha e-mail e senha"
                  : "Não foi possível entrar"}
              </AlertTitle>
              <AlertDescription>
                {error === "required"
                  ? "Os dois campos são obrigatórios."
                  : "E-mail ou senha incorretos. Verifique e tente de novo."}
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
            <button
              type="submit"
              className={cn(buttonVariants({ size: "lg" }), "w-full justify-center")}
            >
              <Lock aria-hidden />
              Entrar com segurança
            </button>
          </form>

          <section
            aria-labelledby="ambiente-demo"
            className="mt-8 rounded-xl border border-border bg-surface-subtle p-4"
          >
            <h2
              id="ambiente-demo"
              className="flex items-center gap-2 text-label font-semibold text-foreground"
            >
              <ShieldCheck size={15} aria-hidden className="text-primary-700" />
              Ambiente de demonstração
            </h2>
            <p className="mt-1 text-caption text-muted-foreground">
              Todas as contas abaixo usam a senha{" "}
              <code className="rounded bg-surface px-1 py-0.5 font-mono text-caption font-semibold text-foreground">
                medchain123
              </code>
            </p>
            <ul className="mt-3 space-y-1.5">
              {DEMO_USERS.map((user) => (
                <li
                  key={user.email}
                  className="flex flex-wrap items-baseline justify-between gap-x-3 text-caption"
                >
                  <span className="font-medium text-foreground">{user.label}</span>
                  <span className="font-mono text-muted-foreground">{user.email}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
