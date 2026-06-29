import { ArrowRight, Shield, Clock, FileCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicHeader } from "@/components/medchain/public-header";
import { Logo } from "@/components/medchain/logo";
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
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-white">
      <PublicHeader />

      <main className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pt-24 lg:flex-row lg:gap-16">
        <div className="max-w-xl text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
            <Shield size={14} />
            Portal médico
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Prontuários com
            <span className="text-primary"> autorização do paciente</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Acesse dados de saúde de forma segura, temporária e totalmente auditada.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-primary-50 bg-white/80 text-center shadow-sm">
                <CardContent className="p-5">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
                    <feature.icon size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mt-12 w-full max-w-md border shadow-lg lg:mt-0">
          <CardContent className="p-8">
            <div className="mb-6 flex justify-center lg:justify-start">
              <Logo size="lg" />
            </div>
            
            <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground lg:text-left">
              Portal Médico
            </h2>
            <p className="mb-8 mt-2 text-center text-sm text-muted-foreground lg:text-left">
              Entre com suas credenciais para acessar prontuários autorizados.
            </p>

            <a
              href="/medico/login"
              className={cn(buttonVariants({ size: "lg" }), "w-full gap-2")}
            >
              Entrar como médico
              <ArrowRight size={18} />
            </a>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
