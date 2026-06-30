# Melhorias estéticas do portal médico web — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar a qualidade visual e a experiência de demo do portal médico desktop, alinhando landing page, login, dashboard e prontuário ao posicionamento de segurança e soberania do paciente do MedChain.

**Architecture:** As páginas continuam server-components do Next.js App Router. Serão criados componentes reutilizáveis no `components/medchain/` para evitar duplicação. O `domain` já fornece `validateToken` e `formatMinutesRemaining`, que serão aproveitados para feedback visual de tempo. O Prisma será usado para buscar logs de auditoria recentes no dashboard.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 3, shadcn/ui (Base UI), Lucide React, Prisma, `@medchain/domain`.

---

## File Structure

| File | Responsibility |
|---|---|
| `apps/web/app/page.tsx` | Landing page pública com hero, fluxo de 5 passos, destaques e footer. |
| `apps/web/app/medico/login/page.tsx` | Tela de login com layout refinado, disclaimer de segurança e credenciais de demo mais limpas. |
| `apps/web/app/medico/(app)/dashboard/page.tsx` | Dashboard com resumo, acessos autorizados, pendentes e card de última atividade. |
| `apps/web/app/medico/(app)/prontuario/[patientId]/page.tsx` | Prontuário com linha do tempo, agrupamento de documentos por tipo, alerta de alergias destacado. |
| `apps/web/components/medchain/feature-card.tsx` | Card de destaque da landing page. |
| `apps/web/components/medchain/step-card.tsx` | Card numerado do fluxo de 5 passos. |
| `apps/web/components/medchain/document-card.tsx` | Card de documento com ícone por tipo, ações e metadados. |
| `apps/web/components/medchain/countdown-badge.tsx` | Badge com barra de progresso visual do tempo restante do token. |
| `apps/web/components/medchain/activity-card.tsx` | Card de atividade recente no dashboard. |
| `apps/web/components/medchain/footer.tsx` | Footer minimalista da landing page. |
| `apps/web/components/medchain/index.ts` | Barril de exportação dos componentes MedChain. |
| `apps/web/lib/format.ts` | Helpers de formatação de data/hora reutilizáveis. |

---

## Task 1: Helpers de formatação

**Files:**
- Create: `apps/web/lib/format.ts`
- Modify: —
- Test: —

- [ ] **Step 1: Criar helpers de formatação**

```ts
export function formatDate(value: Date | string | number | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(value: Date | string | number | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDate(value: Date | string | number | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHour < 24) return `há ${diffHour} h`;
  if (diffDay < 7) return `há ${diffDay} dia${diffDay > 1 ? "s" : ""}`;
  return formatDate(date);
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/lib/format.ts
git commit -m "feat(web): add reusable date formatting helpers

Co-authored-by: Davi Marcell"
```

---

## Task 2: Componentes reutilizáveis

**Files:**
- Create: `apps/web/components/medchain/feature-card.tsx`
- Create: `apps/web/components/medchain/step-card.tsx`
- Create: `apps/web/components/medchain/document-card.tsx`
- Create: `apps/web/components/medchain/countdown-badge.tsx`
- Create: `apps/web/components/medchain/activity-card.tsx`
- Create: `apps/web/components/medchain/footer.tsx`
- Create: `apps/web/components/medchain/index.ts`

- [ ] **Step 1: FeatureCard**

```tsx
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="border bg-white/80 shadow-sm transition hover:shadow-md">
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary">
          <Icon size={24} />
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: StepCard**

```tsx
interface StepCardProps {
  step: number;
  title: string;
  description: string;
}

export function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {step}
        </div>
        {step < 5 && <div className="mt-2 h-full w-px bg-primary-100" />}
      </div>
      <div className="pb-8">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: DocumentCard**

```tsx
import { FileText, Pill, Image, FileDigit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { DownloadButton } from "@/app/medico/(app)/prontuario/[patientId]/download-button";

const DOC_TYPE_ICON = {
  EXAM: FileText,
  REPORT: FileText,
  PRESCRIPTION: Pill,
  IMAGING: Image,
} as const;

const DOC_TYPE_LABEL: Record<string, string> = {
  EXAM: "Exame",
  REPORT: "Laudo",
  PRESCRIPTION: "Receita",
  IMAGING: "Imagem",
};

interface DocumentCardProps {
  id: string;
  title: string;
  type: string;
  mimeType: string;
  issuedAt: Date | string;
}

export function DocumentCard({ id, title, type, mimeType, issuedAt }: DocumentCardProps) {
  const Icon = DOC_TYPE_ICON[type as keyof typeof DOC_TYPE_ICON] ?? FileDigit;
  return (
    <Card className="border shadow-sm transition hover:shadow-md">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="font-normal">
                {DOC_TYPE_LABEL[type] ?? type}
              </Badge>
              <span>{formatDate(issuedAt)}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">{mimeType}</span>
            </div>
          </div>
        </div>
        <DownloadButton docId={id} />
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: CountdownBadge**

```tsx
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMinutesRemaining } from "@medchain/domain";

interface CountdownBadgeProps {
  minutesRemaining: number;
  totalMinutes?: number;
}

export function CountdownBadge({ minutesRemaining, totalMinutes = 60 }: CountdownBadgeProps) {
  const safeMinutes = Math.max(0, minutesRemaining);
  const progress = Math.min(100, Math.round((safeMinutes / totalMinutes) * 100));
  const color =
    progress > 50 ? "bg-emerald-500" : progress > 25 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="w-full max-w-[180px] space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 font-medium text-amber-700">
          <Clock size={12} />
          {formatMinutesRemaining(safeMinutes)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-100">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: ActivityCard**

```tsx
import { Activity, FileText, ShieldOff, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/format";

const EVENT_ICON: Record<string, typeof Activity> = {
  ACCESS: FileText,
  APPROVE: CheckCircle,
  REVOKE: ShieldOff,
  DENY: ShieldOff,
};

const EVENT_LABEL: Record<string, string> = {
  ACCESS: "Acesso ao prontuário",
  APPROVE: "Acesso aprovado",
  REVOKE: "Acesso encerrado",
  DENY: "Acesso negado",
};

interface ActivityCardProps {
  eventType: string;
  channel: string;
  createdAt: Date | string;
  patientName: string;
}

export function ActivityCard({ eventType, channel, createdAt, patientName }: ActivityCardProps) {
  const Icon = EVENT_ICON[eventType] ?? Activity;
  return (
    <Card className="border shadow-sm">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{EVENT_LABEL[eventType] ?? eventType}</p>
          <p className="truncate text-xs text-muted-foreground">
            {patientName} · {channel === "WEB_PORTAL" ? "Portal web" : "App móvel"}
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeDate(createdAt)}</span>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 6: Footer**

```tsx
export function Footer() {
  return (
    <footer className="border-t bg-white py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MedChain. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Plataforma de prontuário eletrônico com soberania do paciente.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: Barril de exportação**

```ts
export * from "./app-shell";
export * from "./empty-state";
export * from "./feature-card";
export * from "./footer";
export * from "./logo";
export * from "./page-header";
export * from "./public-header";
export * from "./stat-card";
export * from "./step-card";
export * from "./user-menu";
export * from "./document-card";
export * from "./countdown-badge";
export * from "./activity-card";
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/components/medchain/
git commit -m "feat(web): add reusable UI components for landing and dashboard

Co-authored-by: Davi Marcell"
```

---

## Task 3: Landing page

**Files:**
- Modify: `apps/web/app/page.tsx`
- Create: —
- Test: visual

- [ ] **Step 1: Substituir conteúdo da landing page**

Manter importações do shadcn e componentes MedChain. Usar `FeatureCard` e `StepCard`. Adicionar seção de fluxo com 5 passos e footer.

Código completo:

```tsx
import { ArrowRight, Shield, Lock, Clock, FileCheck, HeartPulse } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PublicHeader } from "@/components/medchain/public-header";
import { FeatureCard } from "@/components/medchain/feature-card";
import { StepCard } from "@/components/medchain/step-card";
import { Footer } from "@/components/medchain/footer";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Shield,
    title: "Acesso autorizado",
    description: "O paciente ou familiar aprova cada solicitação antes do acesso.",
  },
  {
    icon: Clock,
    title: "Tokens temporários",
    description: "O acesso expira automaticamente após o prazo definido.",
  },
  {
    icon: FileCheck,
    title: "Auditoria completa",
    description: "Todo acesso é registrado de forma transparente e rastreável.",
  },
  {
    icon: Lock,
    title: "Soberania dos dados",
    description: "O paciente decide quem vê seu prontuário e por quanto tempo.",
  },
  {
    icon: HeartPulse,
    title: "Prontuário unificado",
    description: "Histórico médico centralizado, independente do hospital.",
  },
];

const steps = [
  { title: "Médico solicita acesso", description: "O profissional pede autorização para visualizar o prontuário, informando o motivo e a duração desejada." },
  { title: "Paciente ou familiar recebe", description: "A notificação chega ao app móvel do paciente ou de um contato de emergência vinculado." },
  { title: "Autorização temporária", description: "Após aprovação, um token de acesso temporário é gerado com prazo de expiração configurável." },
  { title: "Acesso seguro ao prontuário", description: "O médico visualiza dados e documentos enquanto o token permanece ativo." },
  { title: "Auditoria automática", description: "Cada acesso é registrado em log, garantindo rastreabilidade para o paciente." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary-50 via-white to-white">
      <PublicHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
                <Shield size={14} />
                Portal médico
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Prontuários com{" "}
                <span className="text-primary">autorização do paciente</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Acesse dados de saúde de forma segura, temporária e totalmente auditada.
                O MedChain coloca o paciente no controle do próprio histórico médico.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="/medico/login" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
                  Entrar como médico
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />
              <div className="relative rounded-2xl border bg-white p-8 shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary">
                      <HeartPulse size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Paciente</p>
                      <p className="text-lg font-semibold text-foreground">João Batista</p>
                    </div>
                    <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      Acesso ativo
                    </span>
                  </div>
                  <div className="space-y-3 rounded-xl bg-muted/50 p-4">
                    <div className="h-2 w-3/4 rounded bg-muted" />
                    <div className="h-2 w-1/2 rounded bg-muted" />
                    <div className="h-2 w-5/6 rounded bg-muted" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Hemograma completo</span>
                    <span>Expira em 42 min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Por que MedChain?</h2>
              <p className="mt-3 text-muted-foreground">Segurança e transparência em cada acesso.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Como funciona</h2>
            <p className="mt-3 text-muted-foreground">Fluxo simples de solicitação, aprovação e acesso.</p>
          </div>
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            {steps.map((step, index) => (
              <StepCard key={step.title} step={index + 1} {...step} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/page.tsx
git commit -m "feat(web): redesign public landing page with hero, steps and footer

Co-authored-by: Davi Marcell"
```

---

## Task 4: Tela de login

**Files:**
- Modify: `apps/web/app/medico/login/page.tsx`
- Create: —
- Test: visual

- [ ] **Step 1: Refinar layout e adicionar disclaimer**

Manter server action `signIn` e `DEMO_USERS`. Substituir a exibição das credenciais de demo por um accordion mais discreto e adicionar um banner de segurança.

Código completo:

```tsx
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

      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-24">
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/medico/login/page.tsx
git commit -m "feat(web): refine doctor login page with demo panel and security cues

Co-authored-by: Davi Marcell"
```

---

## Task 5: Dashboard

**Files:**
- Modify: `apps/web/app/medico/(app)/dashboard/page.tsx`
- Create: —
- Test: visual

- [ ] **Step 1: Buscar logs recentes e adicionar CountdownBadge/ActivityCard**

Após buscar `pendingRequests` e `allActiveTokens`, adicionar consulta dos últimos 5 `AccessLog` do médico com informações do paciente.

Código completo da página:

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDoctor } from "@/lib/session";
import { validateToken, formatMinutesRemaining } from "@medchain/domain";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/medchain/page-header";
import { StatCard } from "@/components/medchain/stat-card";
import { EmptyState } from "@/components/medchain/empty-state";
import { CountdownBadge } from "@/components/medchain/countdown-badge";
import { ActivityCard } from "@/components/medchain/activity-card";
import { cn } from "@/lib/utils";
import { Clock, AlertCircle, Plus, FileText, Stethoscope, History } from "lucide-react";

export default async function DashboardPage() {
  const { doctorId } = await requireDoctor();

  const doctor = await prisma.healthProfessionalProfile.findUnique({
    where: { id: doctorId },
    include: { institution: true },
  });
  if (!doctor) redirect("/medico/login");

  const [pendingRequests, allActiveTokens, recentLogs] = await Promise.all([
    prisma.accessRequest.findMany({
      where: { professionalId: doctorId, status: "PENDING" },
      include: { patient: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.accessToken.findMany({
      where: { professionalId: doctorId, status: "ACTIVE" },
      include: { patient: true },
      orderBy: { expiresAt: "asc" },
    }),
    prisma.accessLog.findMany({
      where: { actorUserId: doctorId },
      include: { patient: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const validTokens = allActiveTokens
    .map((t) => ({
      ...t,
      validation: validateToken({ status: t.status, expiresAt: t.expiresAt, revokedAt: t.revokedAt }),
    }))
    .filter((t) => t.validation.valid);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`${doctor.specialty}${doctor.institution ? ` · ${doctor.institution.name}` : ""}`}
      >
        <Link href="/medico/solicitar" className={cn(buttonVariants(), "gap-1.5")}>
          <Plus size={16} />
          Solicitar acesso
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Acessos ativos"
          value={validTokens.length}
          icon={FileText}
          variant="primary"
          description="Tokens válidos no momento"
        />
        <StatCard
          title="Aguardando aprovação"
          value={pendingRequests.length}
          icon={Clock}
          variant="amber"
          description="Solicitações pendentes"
        />
        <StatCard
          title="Especialidade"
          value={doctor.specialty}
          icon={Stethoscope}
          description={doctor.institution?.name ?? "—"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {validTokens.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Acessos autorizados</h2>
              <div className="grid gap-3">
                {validTokens.map((token) => {
                  const minutesRemaining = token.validation.valid ? token.validation.minutesRemaining : 0;
                  return (
                    <Card key={token.id} className="border shadow-sm">
                      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{token.patient.fullName}</p>
                          <p className="text-sm text-muted-foreground">{token.scope}</p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <CountdownBadge minutesRemaining={minutesRemaining} totalMinutes={60} />
                          <Link
                            href={`/medico/prontuario/${token.patientId}`}
                            className={cn(buttonVariants())}
                          >
                            Abrir prontuário
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {pendingRequests.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Aguardando autorização do paciente</h2>
              <div className="grid gap-3">
                {pendingRequests.map((req) => (
                  <Card key={req.id} className="border shadow-sm">
                    <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{req.patient.fullName}</p>
                        <p className="text-sm text-muted-foreground">{req.scope}</p>
                        {req.reason && <p className="text-xs text-muted-foreground/80">{req.reason}</p>}
                      </div>
                      <Badge variant="secondary" className="w-fit gap-1 bg-amber-50 text-amber-700 hover:bg-amber-100">
                        <AlertCircle size={12} />
                        Pendente
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {validTokens.length === 0 && pendingRequests.length === 0 && (
            <EmptyState
              icon={FileText}
              title="Nenhum acesso ativo"
              description="Você ainda não possui acessos autorizados. Solicite o primeiro acesso a um prontuário."
              action={{ label: "Solicitar acesso ao prontuário", href: "/medico/solicitar" }}
            />
          )}
        </div>

        <aside className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
            <History size={18} className="text-primary" />
            Atividade recente
          </div>
          {recentLogs.length === 0 ? (
            <Card className="border shadow-sm">
              <CardContent className="p-5 text-sm text-muted-foreground">
                Nenhuma atividade registrada recentemente.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <ActivityCard
                  key={log.id}
                  eventType={log.eventType}
                  channel={log.channel}
                  createdAt={log.createdAt}
                  patientName={log.patient.fullName}
                />
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/medico/\(app\)/dashboard/page.tsx
git commit -m "feat(web): enhance dashboard with countdown badges and activity sidebar

Co-authored-by: Davi Marcell"
```

---

## Task 6: Prontuário

**Files:**
- Modify: `apps/web/app/medico/(app)/prontuario/[patientId]/page.tsx`
- Create: —
- Test: visual

- [ ] **Step 1: Usar DocumentCard, adicionar linha do tempo e destacar alergias**

Manter server action `revokeToken`. Substituir a listagem manual de documentos por `DocumentCard`. Adicionar seção de linha do tempo com base nos `AccessLog` do paciente. Melhorar o alerta de alergias.

Código completo da página:

```tsx
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDoctor } from "@/lib/session";
import { validateToken, formatMinutesRemaining } from "@medchain/domain";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/medchain/page-header";
import { EmptyState } from "@/components/medchain/empty-state";
import { DocumentCard } from "@/components/medchain/document-card";
import { DownloadButton } from "./download-button";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  FileText,
  ShieldOff,
  User,
  Droplet,
  AlertTriangle,
  Activity,
  FlaskConical,
  History,
  Calendar,
} from "lucide-react";

async function revokeToken(formData: FormData) {
  "use server";
  const { doctorId } = await requireDoctor();
  const tokenId = formData.get("tokenId") as string;
  const patientId = formData.get("patientId") as string;
  if (!tokenId) return;

  const token = await prisma.accessToken.findUnique({
    where: { id: tokenId },
    include: { patient: { include: { user: true } } },
  });

  if (!token || token.status !== "ACTIVE" || token.professionalId !== doctorId) return;

  await prisma.accessToken.update({
    where: { id: tokenId },
    data: { status: "REVOKED", revokedAt: new Date() },
  });

  await prisma.accessLog.create({
    data: {
      tokenId,
      actorUserId: token.patient.userId,
      patientId: token.patientId,
      eventType: "REVOKE",
      channel: "WEB_PORTAL",
    },
  });

  revalidatePath(`/medico/prontuario/${patientId}`);
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}

function InfoItem({ icon: Icon, label, value, highlight }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          highlight ? "bg-primary-100 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default async function ProntuarioPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const { doctorId, user: doctorUser } = await requireDoctor();

  const [patient, token, documents, logs] = await Promise.all([
    prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: { emergencyContacts: true },
    }),
    prisma.accessToken.findFirst({
      where: { professionalId: doctorId, patientId, status: "ACTIVE" },
    }),
    prisma.medicalDocument.findMany({
      where: { patientId },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.accessLog.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  if (!patient) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyState
          icon={User}
          title="Paciente não encontrado"
          description="Verifique o link ou volte ao dashboard."
          action={{ label: "Voltar ao dashboard", href: "/medico/dashboard" }}
        />
      </div>
    );
  }

  const validation = token
    ? validateToken({ status: token.status, expiresAt: token.expiresAt, revokedAt: token.revokedAt })
    : null;

  if (token && validation?.valid) {
    await prisma.accessLog
      .create({
        data: {
          tokenId: token.id,
          actorUserId: doctorUser.id,
          patientId,
          eventType: "ACCESS",
          channel: "WEB_PORTAL",
        },
      })
      .catch(() => {});
  }

  const groupedDocuments = documents.reduce<Record<string, typeof documents>>((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {});

  const documentTypes = Object.keys(groupedDocuments).sort();

  return (
    <div className="space-y-6">
      <PageHeader title={patient.fullName} description="Prontuário do paciente">
        <Link
          href="/medico/dashboard"
          className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </PageHeader>

      {!validation?.valid && (
        <Alert variant="destructive" className="border-destructive/50">
          <ShieldOff size={18} />
          <AlertTitle>Acesso não autorizado</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            {token
              ? "O token para este paciente expirou ou foi revogado."
              : "Você não possui um token ativo para este paciente."}
            <Link
              href="/medico/solicitar"
              className={cn(buttonVariants({ variant: "destructive", size: "sm" }), "w-fit")}
            >
              Solicitar novo acesso
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {validation?.valid && token && (
        <>
          <Alert className="border-primary-200 bg-primary-50 text-primary-foreground [&>svg]:text-primary">
            <Clock size={18} className="text-primary" />
            <AlertTitle className="text-primary">Acesso ativo</AlertTitle>
            <AlertDescription className="flex flex-col gap-3 text-primary/90">
              O acesso expira em {formatMinutesRemaining(validation.minutesRemaining)}.
              <form action={revokeToken} className="flex">
                <input type="hidden" name="tokenId" value={token.id} />
                <input type="hidden" name="patientId" value={patientId} />
                <button
                  type="submit"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-fit border-primary-200 bg-white text-destructive hover:bg-red-50 hover:text-destructive"
                  )}
                >
                  <ShieldOff size={14} className="mr-1.5" />
                  Encerrar acesso
                </button>
              </form>
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="space-y-4">
              <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User size={18} className="text-primary" />
                    Dados do paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InfoItem icon={Droplet} label="Tipo sanguíneo" value={patient.bloodType ?? "Não informado"} />
                  <InfoItem
                    icon={AlertTriangle}
                    label="Alergias"
                    value={patient.allergies.length > 0 ? patient.allergies.join(", ") : "Nenhuma conhecida"}
                    highlight={patient.allergies.length > 0}
                  />
                  <InfoItem
                    icon={Activity}
                    label="Condições crônicas"
                    value={patient.chronicConditions.length > 0 ? patient.chronicConditions.join(", ") : "Nenhuma"}
                  />
                  <InfoItem
                    icon={FlaskConical}
                    label="Medicamentos contínuos"
                    value={patient.continuousMeds.length > 0 ? patient.continuousMeds.join(", ") : "Nenhum"}
                  />
                </CardContent>
              </Card>

              {patient.allergies.length > 0 && (
                <Alert className="border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600">
                  <AlertTriangle size={20} />
                  <AlertTitle className="text-red-900">Alergias conhecidas</AlertTitle>
                  <AlertDescription className="text-base font-semibold text-red-800">
                    {patient.allergies.join(" · ")}
                  </AlertDescription>
                </Alert>
              )}

              {patient.emergencyContacts.length > 0 && (
                <Card className="border shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User size={16} className="text-primary" />
                      Contatos de emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {patient.emergencyContacts.map((contact) => (
                      <div key={contact.id} className="text-sm">
                        <p className="font-medium text-foreground">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {contact.relation} · {contact.phone}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Documentos</h2>
                  <Badge variant="secondary">{documents.length}</Badge>
                </div>

                {documents.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="Nenhum documento cadastrado"
                    description="O paciente ainda não possui documentos no prontuário."
                  />
                ) : (
                  <div className="space-y-6">
                    {documentTypes.map((type) => (
                      <div key={type} className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          {type === "EXAM" && "Exames"}
                          {type === "REPORT" && "Laudos"}
                          {type === "PRESCRIPTION" && "Receitas"}
                          {type === "IMAGING" && "Imagens"}
                        </h3>
                        <div className="space-y-3">
                          {groupedDocuments[type].map((doc) => (
                            <DocumentCard
                              key={doc.id}
                              id={doc.id}
                              title={doc.title}
                              type={doc.type}
                              mimeType={doc.mimeType}
                              issuedAt={doc.issuedAt}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
                  <History size={18} className="text-primary" />
                  Histórico de acessos
                </div>
                {logs.length === 0 ? (
                  <Card className="border shadow-sm">
                    <CardContent className="p-5 text-sm text-muted-foreground">
                      Nenhum acesso registrado.
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border shadow-sm">
                    <CardContent className="divide-y p-0">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-muted-foreground" />
                            <span className="text-sm text-foreground">
                              {log.eventType === "ACCESS" && "Acesso ao prontuário"}
                              {log.eventType === "APPROVE" && "Acesso aprovado"}
                              {log.eventType === "REVOKE" && "Acesso encerrado"}
                              {log.eventType === "DENY" && "Acesso negado"}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(log.createdAt)}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/app/medico/\(app\)/prontuario/\[patientId\]/page.tsx
git commit -m "feat(web): improve medical record with document grouping and access timeline

Co-authored-by: Davi Marcell"
```

---

## Task 7: Verificação

**Files:**
- All modified files
- Test commands

- [ ] **Step 1: Rodar typecheck e lint**

```bash
pnpm --filter @medchain/web typecheck
pnpm --filter @medchain/web lint
```

Expected: typecheck sem erros, lint com "No ESLint warnings or errors".

- [ ] **Step 2: Gerar novos screenshots**

Garantir que o dev server esteja rodando em `127.0.0.1:3000` e Supabase em `127.0.0.1:54321`. Executar script Playwright para capturar:
- login.png
- dashboard.png
- solicitar.png
- prontuario.png

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "feat(web): polish medical portal UI for demo

- Landing page with hero, feature grid, steps and footer.
- Refined login with demo panel and security cues.
- Dashboard with countdown badges and activity sidebar.
- Medical record with document grouping and access timeline.

Co-authored-by: Davi Marcell"
```

---

## Spec Coverage

| Requirement | Task |
|---|---|
| Landing page mais convincente para demo | Task 3 |
| Disclaimer de segurança no login | Task 4 |
| Melhor apresentação das credenciais de demo | Task 4 |
| Card de última atividade no dashboard | Task 5 |
| Tempo restante visual no dashboard | Task 5 |
| Agrupar documentos por tipo no prontuário | Task 6 |
| Alerta de alergias mais destacado | Task 6 |
| Linha do tempo de acessos no prontuário | Task 6 |
| Componentes reutilizáveis | Task 2 |
| Helpers de formatação | Task 1 |

## Placeholder Scan

Nenhum TBD, TODO ou referência indefinida encontrada. Todos os componentes, imports e funções estão definidos em tarefas anteriores.

## Type Consistency

- `formatDate`, `formatDateTime`, `formatRelativeDate` aceitam `Date | string | number | null | undefined`.
- `DocumentCard` usa `type` como string, com fallback seguro.
- `CountdownBadge` recebe `minutesRemaining: number` e `totalMinutes?: number`.
- `ActivityCard` usa `eventType`, `channel`, `createdAt`, `patientName`.
