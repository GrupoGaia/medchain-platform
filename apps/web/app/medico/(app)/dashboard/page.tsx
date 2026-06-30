import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDoctor } from "@/lib/session";
import { validateToken } from "@medchain/domain";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/medchain/page-header";
import { StatCard } from "@/components/medchain/stat-card";
import { EmptyState } from "@/components/medchain/empty-state";
import { CountdownBadge } from "@/components/medchain/countdown-badge";
import { ActivityCard } from "@/components/medchain/activity-card";
import { buildDoctorRecentLogsWhere } from "@/lib/audit-log";
import { cn } from "@/lib/utils";
import { Clock, AlertCircle, Plus, FileText, Stethoscope, History } from "lucide-react";

export default async function DashboardPage() {
  const { doctorId, user } = await requireDoctor();

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
      where: buildDoctorRecentLogsWhere(user.id),
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
                        <div className="flex items-center gap-3">
                          <Image
                            src="/img/patient-avatar-joao.png"
                            alt={token.patient.fullName}
                            width={40}
                            height={40}
                            className="rounded-full border bg-muted object-cover"
                          />
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">{token.patient.fullName}</p>
                            <p className="text-sm text-muted-foreground">{token.scope}</p>
                          </div>
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
            <div className="flex flex-col items-center rounded-2xl border bg-white p-8 text-center shadow-sm">
              <Image
                src="/img/empty-state-access.png"
                alt="Nenhum acesso ativo"
                width={240}
                height={192}
                className="mb-4 rounded-xl object-cover"
              />
              <EmptyState
                icon={FileText}
                title="Nenhum acesso ativo"
                description="Você ainda não possui acessos autorizados. Solicite o primeiro acesso a um prontuário."
                action={{ label: "Solicitar acesso ao prontuário", href: "/medico/solicitar" }}
              />
            </div>
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
