import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDoctor } from "@/lib/session";
import {
  SCOPE_LABEL,
  formatMinutesRemaining,
  tokenTotalMinutes,
  validateToken,
} from "@medchain/domain";
import { buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/medchain/page-header";
import { SectionHeader } from "@/components/medchain/section-header";
import { MetricGroup } from "@/components/medchain/metric";
import { AccessList, type AccessRowData } from "@/components/medchain/access-card";
import { RequestList, type RequestRowData } from "@/components/medchain/request-card";
import {
  ActivityTimeline,
  type ActivityEvent,
} from "@/components/medchain/activity-timeline";
import { EmptyState } from "@/components/medchain/empty-state";
import { urgencyFor } from "@/components/medchain/access-countdown";
import { buildDoctorRecentLogsWhere } from "@/lib/audit-log";
import { formatDate, formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AlarmClock, FolderOpen, History, Plus } from "lucide-react";

function formatDuration(minutes: number): string {
  return `${formatMinutesRemaining(minutes)} de acesso`;
}

function formatExpiryTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

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
      take: 8,
    }),
  ]);

  const validTokens = allActiveTokens
    .map((token) => ({
      ...token,
      validation: validateToken({
        status: token.status,
        expiresAt: token.expiresAt,
        revokedAt: token.revokedAt,
      }),
    }))
    .filter((token) => token.validation.valid);

  const accessRows: AccessRowData[] = validTokens.map((token) => ({
    tokenId: token.id,
    patientId: token.patientId,
    patientName: token.patient.fullName,
    scopeLabel: SCOPE_LABEL[token.scope],
    minutesRemaining: token.validation.valid ? token.validation.minutesRemaining : 0,
    totalMinutes: tokenTotalMinutes(token),
    expiresAtFormatted: formatExpiryTime(token.expiresAt),
  }));

  // "Exigindo atenção" é o acesso que está prestes a fechar, não uma métrica
  // qualquer: é a única coisa do painel em que a inação do médico custa algo.
  const expiringSoon = accessRows.filter(
    (row) => urgencyFor(row.minutesRemaining) === "critical"
  );

  const requestRows: RequestRowData[] = pendingRequests.map((request) => ({
    id: request.id,
    patientName: request.patient.fullName,
    scopeLabel: SCOPE_LABEL[request.scope],
    reason: request.reason,
    durationLabel: formatDuration(request.durationMinutes),
    createdAtFormatted: formatDate(request.createdAt),
  }));

  const activity: ActivityEvent[] = recentLogs.map((log) => ({
    id: log.id,
    eventType: log.eventType,
    detail: `${log.patient.fullName} · ${
      log.channel === "WEB_PORTAL" ? "Portal web" : "App móvel"
    }`,
    timestamp: formatRelativeDate(log.createdAt),
    isoTimestamp: log.createdAt.toISOString(),
  }));

  const hasWork = accessRows.length > 0 || requestRows.length > 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        eyebrow={`${doctor.specialty}${
          doctor.institution ? ` · ${doctor.institution.name}` : ""
        }`}
        description="Prontuários que você pode abrir agora e solicitações aguardando o paciente."
      >
        <Link href="/medico/solicitar" className={cn(buttonVariants(), "gap-1.5")}>
          <Plus aria-hidden />
          Solicitar acesso
        </Link>
      </PageHeader>

      <MetricGroup
        className="mb-6"
        items={[
          {
            label: "Acessos ativos",
            value: accessRows.length,
            hint:
              accessRows.length === 1
                ? "1 prontuário liberado"
                : `${accessRows.length} prontuários liberados`,
          },
          {
            label: "Aguardando o paciente",
            value: requestRows.length,
            hint: "Solicitações ainda sem resposta",
          },
          {
            label: "Expirando em breve",
            value: expiringSoon.length,
            tone: expiringSoon.length > 0 ? "warning" : "default",
            hint: "Menos de 15 minutos restantes",
          },
        ]}
      />

      {expiringSoon.length > 0 && (
        <Alert variant="warning" icon={<AlarmClock />} className="mb-6">
          <AlertTitle>
            {expiringSoon.length === 1
              ? "Um acesso expira em instantes"
              : `${expiringSoon.length} acessos expiram em instantes`}
          </AlertTitle>
          <AlertDescription>
            {expiringSoon
              .map((row) => `${row.patientName} (${row.expiresAtFormatted})`)
              .join(", ")}
            . Depois de expirar é preciso solicitar uma nova autorização ao
            paciente.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8">
          <section aria-labelledby="acessos-ativos" className="space-y-3">
            <SectionHeader
              id="acessos-ativos"
              title="Prontuários liberados"
              count={accessRows.length}
              description="Autorizações válidas neste momento, da que expira primeiro para a última."
            />
            {accessRows.length > 0 ? (
              <AccessList items={accessRows} />
            ) : (
              <EmptyState
                title="Nenhum acesso ativo"
                description="Assim que um paciente autorizar uma solicitação, o prontuário aparece aqui com o tempo restante."
                action={
                  hasWork
                    ? undefined
                    : { label: "Solicitar primeiro acesso", href: "/medico/solicitar" }
                }
                icon={FolderOpen}
              />
            )}
          </section>

          {requestRows.length > 0 && (
            <section aria-labelledby="aguardando-paciente" className="space-y-3">
              <SectionHeader
                id="aguardando-paciente"
                title="Aguardando autorização do paciente"
                count={requestRows.length}
                description="O paciente ou o contato de emergência precisa aprovar no aplicativo."
              />
              <RequestList items={requestRows} />
            </section>
          )}
        </div>

        <aside aria-labelledby="atividade-recente" className="min-w-0 space-y-3">
          <SectionHeader
            id="atividade-recente"
            title="Atividade recente"
            description="Seus últimos eventos registrados em auditoria."
          />
          <div className="rounded-xl border border-border bg-surface p-4">
            {activity.length > 0 ? (
              <ActivityTimeline events={activity} />
            ) : (
              <p className="flex items-center gap-2 py-2 text-body-sm text-muted-foreground">
                <History size={16} aria-hidden />
                Nenhuma atividade registrada até agora.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
