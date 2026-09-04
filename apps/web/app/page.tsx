import Image from "next/image";
import Link from "next/link";
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
    description: "O paciente ou o contato de emergência aprova cada solicitação antes da liberação.",
  },
  {
    icon: Clock,
    title: "Tokens temporários",
    description: "O acesso expira sozinho no prazo definido, sem depender de ninguém encerrar.",
  },
  {
    icon: FileCheck,
    title: "Auditoria completa",
    description: "Cada solicitação, aprovação e abertura de prontuário fica registrada.",
  },
  {
    icon: Lock,
    title: "Soberania dos dados",
    description: "O paciente decide quem vê o prontuário, o que vê e por quanto tempo.",
  },
  {
    icon: HeartPulse,
    title: "Prontuário unificado",
    description: "Histórico centralizado, independente do hospital que atendeu.",
  },
];

const steps = [
  {
    title: "O médico solicita acesso",
    description:
      "O profissional localiza o paciente pelo CPF e informa escopo, motivo e duração desejada.",
  },
  {
    title: "O paciente recebe o pedido",
    description:
      "A solicitação chega ao aplicativo do paciente ou de um contato de emergência já aprovado.",
  },
  {
    title: "A autorização vira um token",
    description:
      "Ao aprovar, é criado um acesso temporário com escopo e prazo exatamente como foram pedidos.",
  },
  {
    title: "O prontuário abre pelo tempo combinado",
    description:
      "O médico consulta apenas o que o escopo libera, enquanto o token permanece válido.",
  },
  {
    title: "Tudo fica auditado",
    description:
      "O paciente acompanha cada evento no histórico e pode revogar o acesso quando quiser.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        <section className="border-b border-border bg-surface">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-24">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-interactive-border bg-interactive-subtle px-2 py-1 text-caption font-medium text-primary-800">
                <Shield size={13} aria-hidden />
                Portal médico
              </span>
              <h1 className="mt-4 text-[2rem] font-semibold leading-[1.15] tracking-tight text-foreground sm:text-[2.75rem]">
                Prontuários acessados com{" "}
                <span className="text-primary-700">autorização do paciente</span>
              </h1>
              <p className="mt-5 text-body leading-relaxed text-foreground-secondary sm:text-base">
                O MedChain dá ao profissional o histórico de que ele precisa e ao
                paciente o controle sobre quem vê o quê. Acesso temporário,
                escopo explícito e auditoria em cada evento.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/medico/login"
                  className={cn(buttonVariants({ size: "lg" }), "justify-center")}
                >
                  Entrar como médico
                  <ArrowRight aria-hidden />
                </Link>
                <Link
                  href="#como-funciona"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "justify-center"
                  )}
                >
                  Ver como funciona
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <Image
                src="/img/hero-doctor.png"
                alt="Profissional de saúde consultando um prontuário no portal MedChain"
                width={600}
                height={500}
                className="w-full rounded-xl border border-border object-cover"
                priority
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="por-que" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h2 id="por-que" className="text-page-title text-foreground">
              O que o MedChain garante
            </h2>
            <p className="mt-2 text-body text-foreground-secondary">
              Cinco compromissos que valem para todo acesso, em qualquer
              instituição.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section
          id="como-funciona"
          aria-labelledby="como-funciona-titulo"
          className="border-t border-border bg-surface"
        >
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            <h2 id="como-funciona-titulo" className="text-page-title text-foreground">
              Como funciona
            </h2>
            <p className="mt-2 text-body text-foreground-secondary">
              Da solicitação ao registro de auditoria, em cinco passos.
            </p>
            <ol className="mt-8">
              {steps.map((step, index) => (
                <StepCard
                  key={step.title}
                  step={index + 1}
                  title={step.title}
                  description={step.description}
                  isLast={index === steps.length - 1}
                />
              ))}
            </ol>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
