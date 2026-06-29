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
import { cn } from "@/lib/utils";
import { Clock, AlertCircle, Plus, FileText, Stethoscope } from "lucide-react";

export default async function DashboardPage() {
  const { doctorId } = await requireDoctor();

  const doctor = await prisma.healthProfessionalProfile.findUnique({
    where: { id: doctorId },
    include: { institution: true },
  });
  if (!doctor) redirect("/medico/login");

  const [pendingRequests, allActiveTokens] = await Promise.all([
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

      {/* Resumo */}
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

      {/* Tokens ativos */}
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
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary" className="gap-1 text-amber-700">
                        <Clock size={13} />
                        {formatMinutesRemaining(minutesRemaining)}
                      </Badge>
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

      {/* Pendentes */}
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
  );
}
