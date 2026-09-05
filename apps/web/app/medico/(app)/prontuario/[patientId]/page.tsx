import { revalidatePath } from "next/cache";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDoctor } from "@/lib/session";
import {
  scopeAllowsDocumentType,
  tokenTotalMinutes,
  formatCpf,
  SCOPE_LABEL,
  validateToken,
} from "@medchain/domain";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/medchain/page-header";
import { SectionHeader } from "@/components/medchain/section-header";
import { EmptyState } from "@/components/medchain/empty-state";
import { AllergyAlert } from "@/components/medchain/allergy-alert";
import { InfoList } from "@/components/medchain/info-list";
import {
  DocumentTable,
  documentTypeLabelPlural,
  type DocumentRowData,
} from "@/components/medchain/document-table";
import { PatientContextHeader } from "@/components/medchain/patient-context-header";
import { WithheldScopeNotice } from "@/components/medchain/withheld-scope-notice";
import {
  ActivityTimeline,
  type ActivityEvent,
} from "@/components/medchain/activity-timeline";
import { buildAccessRevocationLogData } from "@/lib/audit-log";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  FileText,
  ShieldOff,
  Droplet,
  AlertTriangle,
  Activity,
  Pill,
  Phone,
  History,
} from "lucide-react";

async function revokeToken(formData: FormData) {
  "use server";
  const { doctorId, user: doctorUser } = await requireDoctor();
  const tokenIds = formData.getAll("tokenId") as string[];
  if (tokenIds.length === 0) return;

  // Pode existir mais de um token ACTIVE para o mesmo par medico-paciente
  // (ver comentario na consulta de tokens abaixo). Encerrar acesso precisa
  // revogar todos, senao a tela continua mostrando acesso ativo por causa
  // do token que sobrou.
  let patientId: string | null = null;

  for (const tokenId of tokenIds) {
    const token = await prisma.accessToken.findUnique({
      where: { id: tokenId },
    });

    if (!token || token.status !== "ACTIVE" || token.professionalId !== doctorId) continue;

    await prisma.accessToken.update({
      where: { id: tokenId },
      data: { status: "REVOKED", revokedAt: new Date() },
    });

    await prisma.accessLog.create({
      data: buildAccessRevocationLogData({
        tokenId,
        actorUserId: doctorUser.id,
        patientId: token.patientId,
        channel: "WEB_PORTAL",
      }),
    });

    patientId = token.patientId;
  }

  if (patientId) {
    revalidatePath(`/medico/prontuario/${patientId}`);
  }
}

// Sem token ativo o medico nao ve nem o nome do paciente. Antes o cabecalho
// ficava fora do bloco autorizado, entao bastava abrir a URL para confirmar
// quem estava por tras de um id.
function UnauthorizedRecord({ hadToken = false }: { hadToken?: boolean }) {
  return (
    <div>
      <PageHeader
        title="Prontuário protegido"
        eyebrow="Acesso temporário"
        description="Este prontuário só abre enquanto houver uma autorização válida do paciente."
        backHref="/medico/dashboard"
        backLabel="Voltar ao dashboard"
      />

      <Alert variant="danger" icon={<ShieldOff />} className="max-w-2xl">
        <AlertTitle>Acesso não autorizado</AlertTitle>
        <AlertDescription>
          {hadToken
            ? "A autorização para este paciente expirou ou foi encerrada. Nenhum dado do prontuário é exibido sem token válido."
            : "Você não possui uma autorização ativa para este paciente. Nenhum dado do prontuário é exibido sem token válido."}
        </AlertDescription>
        <div className="pt-2">
          <Link
            href="/medico/solicitar"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Solicitar novo acesso
          </Link>
        </div>
      </Alert>
    </div>
  );
}

function listOrFallback(values: string[], fallback: string): string {
  return values.length > 0 ? values.join(", ") : fallback;
}

export default async function ProntuarioPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const { doctorId, user: doctorUser } = await requireDoctor();

  const [patient, tokens, documents, logs] = await Promise.all([
    prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: { emergencyContacts: true },
    }),
    prisma.accessToken.findMany({
      where: { professionalId: doctorId, patientId, status: "ACTIVE" },
      // O motivo declarado na solicitacao e o que responde "por que eu tenho
      // acesso a este prontuario" no cabecalho de contexto.
      include: { request: { select: { reason: true } } },
    }),
    prisma.medicalDocument.findMany({
      where: { patientId },
      orderBy: { issuedAt: "desc" },
      include: { results: { orderBy: { analyte: "asc" } } },
    }),
    prisma.accessLog.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Paciente inexistente devolve exatamente a mesma tela de "sem autorizacao".
  // Diferenciar os dois casos entregaria de graca quais ids sao de paciente
  // real, que e a enumeracao que a busca por CPF fechou do outro lado.
  if (!patient) return <UnauthorizedRecord />;

  // Pode existir mais de um token ACTIVE para o mesmo par medico-paciente,
  // porque a aprovacao cria token novo sem revogar os anteriores. Validamos
  // cada um e usamos a uniao dos que ainda valem, do mesmo jeito que a rota
  // de documentos (apps/web/app/api/patients/[id]/documents/route.ts).
  const validTokens = tokens
    .map((t) => ({
      ...t,
      validation: validateToken({ status: t.status, expiresAt: t.expiresAt, revokedAt: t.revokedAt }),
    }))
    .filter((t) => t.validation.valid);

  const hasAccess = validTokens.length > 0;
  const activeToken = validTokens[0] ?? null;
  const minutesRemaining = hasAccess
    ? Math.max(...validTokens.map((t) => (t.validation.valid ? t.validation.minutesRemaining : 0)))
    : 0;

  if (!hasAccess || !activeToken) {
    return <UnauthorizedRecord hadToken={tokens.length > 0} />;
  }

  await prisma.accessLog
    .create({
      data: {
        tokenId: activeToken.id,
        actorUserId: doctorUser.id,
        patientId,
        eventType: "ACCESS",
        channel: "WEB_PORTAL",
      },
    })
    .catch(() => {});

  const visibleDocuments = documents.filter((doc) =>
    validTokens.some((t) => scopeAllowsDocumentType(t.scope, doc.type))
  );

  // Retido precisa refletir documento real que existe e foi filtrado, nao o
  // que o escopo abstratamente esconderia. Um paciente sem documento nenhum
  // nao pode acionar o aviso de bloqueio so porque o escopo e restrito.
  const withheld = Array.from(
    new Set(
      documents
        .filter((doc) => !validTokens.some((t) => scopeAllowsDocumentType(t.scope, doc.type)))
        .map((doc) => documentTypeLabelPlural(doc.type))
    )
  );

  const documentRows: DocumentRowData[] = visibleDocuments.map((doc) => ({
    id: doc.id,
    title: doc.title,
    type: doc.type,
    mimeType: doc.mimeType,
    issuedAt: doc.issuedAt,
    results: doc.results,
  }));

  const accessHistory: ActivityEvent[] = logs.map((log) => ({
    id: log.id,
    eventType: log.eventType,
    timestamp: formatDateTime(log.createdAt),
    isoTimestamp: log.createdAt.toISOString(),
  }));

  const identifiers = [
    patient.cpf ? `CPF ${formatCpf(patient.cpf)}` : null,
    patient.birthDate ? `Nascimento ${formatDate(patient.birthDate)}` : null,
    patient.gender,
  ].filter((value): value is string => Boolean(value));

  return (
    <div className="space-y-5">
      <Link
        href="/medico/dashboard"
        className="inline-flex items-center gap-1.5 rounded-md text-label font-medium text-muted-foreground transition-colors duration-fast hover:text-foreground"
      >
        <ArrowLeft size={15} aria-hidden />
        Voltar ao dashboard
      </Link>

      <PatientContextHeader
        patientName={patient.fullName}
        identifiers={identifiers}
        scopeLabel={SCOPE_LABEL[activeToken.scope]}
        reason={activeToken.request?.reason}
        expiresAtFormatted={formatDateTime(activeToken.expiresAt)}
        minutesRemaining={minutesRemaining}
        totalMinutes={tokenTotalMinutes(activeToken)}
        actions={
          <form action={revokeToken}>
            {validTokens.map((token) => (
              <input key={token.id} type="hidden" name="tokenId" value={token.id} />
            ))}
            <Button type="submit" variant="destructive-outline" size="sm">
              <ShieldOff aria-hidden />
              Encerrar acesso
            </Button>
          </form>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <AllergyAlert allergies={patient.allergies} />

          <section
            aria-labelledby="resumo-clinico"
            className="rounded-xl border border-border bg-surface p-4"
          >
            <SectionHeader
              id="resumo-clinico"
              as="h2"
              title="Resumo clínico"
              className="mb-3"
            />
            <InfoList
              items={[
                {
                  icon: Droplet,
                  label: "Tipo sanguíneo",
                  value: patient.bloodType ?? "Não informado",
                },
                {
                  icon: AlertTriangle,
                  label: "Alergias",
                  value: listOrFallback(patient.allergies, "Nenhuma registrada"),
                  emphasis: patient.allergies.length > 0,
                },
                {
                  icon: Activity,
                  label: "Condições crônicas",
                  value: listOrFallback(
                    patient.chronicConditions,
                    "Nenhuma registrada"
                  ),
                },
                {
                  icon: Pill,
                  label: "Medicamentos contínuos",
                  value: listOrFallback(patient.continuousMeds, "Nenhum registrado"),
                },
              ]}
            />
          </section>

          {patient.emergencyContacts.length > 0 && (
            <section
              aria-labelledby="contatos-emergencia"
              className="rounded-xl border border-border bg-surface p-4"
            >
              <SectionHeader
                id="contatos-emergencia"
                as="h2"
                title="Contatos de emergência"
                className="mb-3"
              />
              <ul className="divide-y divide-border-subtle">
                {patient.emergencyContacts.map((contact) => (
                  <li key={contact.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground"
                    >
                      <Phone size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-body font-medium text-foreground">
                        {contact.name}
                      </p>
                      <p className="truncate text-caption text-muted-foreground">
                        {contact.relation} · {contact.phone}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <Tabs defaultValue="documentos" className="min-w-0">
          <TabsList>
            <TabsTrigger value="documentos">
              <FileText aria-hidden />
              Documentos
              <span className="rounded-md bg-secondary px-1.5 text-caption tabular-nums text-foreground-secondary">
                {documentRows.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="historico">
              <History aria-hidden />
              Histórico de acessos
              <span className="rounded-md bg-secondary px-1.5 text-caption tabular-nums text-foreground-secondary">
                {accessHistory.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsPanel value="documentos" className="space-y-4">
            <SectionHeader
              as="h2"
              title="Documentos"
              description="Ordenados do mais recente para o mais antigo. Só aparece o que o escopo autorizado libera."
            />

            <WithheldScopeNotice withheld={withheld} />

            {documentRows.length > 0 ? (
              <DocumentTable documents={documentRows} />
            ) : withheld.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Nenhum documento no prontuário"
                description="O paciente ainda não enviou exames, laudos ou receitas pelo aplicativo."
              />
            ) : null}
          </TabsPanel>

          <TabsPanel value="historico" className="space-y-4">
            <SectionHeader
              as="h2"
              title="Histórico de acessos"
              description="Registro de auditoria deste prontuário, incluindo acessos de outros profissionais."
            />
            {accessHistory.length > 0 ? (
              <div className="rounded-xl border border-border bg-surface p-4">
                <ActivityTimeline events={accessHistory} />
              </div>
            ) : (
              <EmptyState
                icon={History}
                title="Nenhum acesso registrado"
                description="Os eventos de auditoria deste prontuário aparecerão aqui."
              />
            )}
          </TabsPanel>
        </Tabs>
      </div>
    </div>
  );
}
