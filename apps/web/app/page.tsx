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
