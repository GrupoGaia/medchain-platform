import Image from "next/image";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDoctor } from "@/lib/session";
import {
  scopeAllowsDocumentType,
  tokenTotalMinutes,
  SCOPE_LABEL,
  validateToken,
} from "@medchain/domain";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/medchain/page-header";
import { EmptyState } from "@/components/medchain/empty-state";
import { DocumentCard } from "@/components/medchain/document-card";
import { CountdownCard } from "@/components/medchain/countdown-badge";
import { BlockedDocumentsCard } from "@/components/medchain/blocked-documents-card";
import { buildAccessRevocationLogData } from "@/lib/audit-log";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
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
    <div className="space-y-6">
      <PageHeader title="Prontuário protegido" description="Sem autorização ativa">
        <Link
          href="/medico/dashboard"
          className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </PageHeader>

      <Alert variant="destructive" className="border-destructive/50">
        <ShieldOff size={18} />
        <AlertTitle>Acesso não autorizado</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          {hadToken
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
    </div>
  );
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

  const [patient, tokens, documents, logs] = await Promise.all([
    prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: { emergencyContacts: true },
    }),
    prisma.accessToken.findMany({
      where: { professionalId: doctorId, patientId, status: "ACTIVE" },
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

  const typeLabel: Record<string, string> = {
    EXAM: "Exames",
    REPORT: "Laudos",
    PRESCRIPTION: "Receitas",
    IMAGING: "Imagens",
  };

  const visibleDocuments = documents.filter((doc) =>
    validTokens.some((t) => scopeAllowsDocumentType(t.scope, doc.type))
  );

  // Retido precisa refletir documento real que existe e foi filtrado, nao o
  // que o escopo abstratamente esconderia. Um paciente sem documento nenhum
  // nao pode acionar o cartao bloqueado so porque o escopo e restrito.
  const hiddenDocumentTypes = Array.from(
    new Set(
      documents
        .filter((doc) => !validTokens.some((t) => scopeAllowsDocumentType(t.scope, doc.type)))
        .map((doc) => doc.type)
    )
  );
  const withheld = hiddenDocumentTypes.map((type) => typeLabel[type] ?? type);

  const groupedDocuments = visibleDocuments.reduce<Record<string, typeof documents>>(
    (acc, doc) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
      return acc;
    },
    {}
  );

  const documentTypes = Object.keys(groupedDocuments).sort();

  return (
    <div className="space-y-6">
      <PageHeader title={patient.fullName} description="Prontuário do paciente">
        <div className="flex items-center gap-3">
          <Image
            src="/img/patient-avatar-joao.png"
            alt={patient.fullName}
            width={48}
            height={48}
            className="rounded-full border bg-muted object-cover"
          />
          <Link
            href="/medico/dashboard"
            className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
        </div>
      </PageHeader>

      <CountdownCard
        minutesRemaining={minutesRemaining}
        totalMinutes={tokenTotalMinutes(activeToken)}
        expiresAtFormatted={formatDateTime(activeToken.expiresAt)}
        scopeLabel={SCOPE_LABEL[activeToken.scope]}
      >
        <form action={revokeToken} className="flex">
          {validTokens.map((t) => (
            <input key={t.id} type="hidden" name="tokenId" value={t.id} />
          ))}
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-slate-200 bg-white text-rose-600 shadow-2xs hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            )}
          >
            <ShieldOff size={14} className="mr-1.5" />
            Encerrar acesso
          </button>
        </form>
      </CountdownCard>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card className="border border-slate-200/80 bg-white shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <User size={18} className="text-teal-600" />
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
            <div className="overflow-hidden rounded-xl border border-rose-200/90 bg-gradient-to-br from-rose-50/90 via-white to-rose-50/40 p-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-rose-950">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700 shadow-2xs">
                  <AlertTriangle size={17} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                    Alerta de Emergência Clínica
                  </h4>
                  <p className="text-xs text-rose-700">Alergias severas conhecidas</p>
                </div>
              </div>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {patient.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center rounded-md border border-rose-200 bg-rose-100/90 px-2.5 py-1 text-xs font-bold text-rose-900 shadow-2xs"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
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
              <Badge variant="secondary">{visibleDocuments.length}</Badge>
            </div>

            {visibleDocuments.length === 0 ? (
              withheld.length > 0 ? (
                <BlockedDocumentsCard withheld={withheld} />
              ) : (
                <div className="flex flex-col items-center rounded-2xl border bg-white p-8 text-center shadow-sm">
                  <Image
                    src="/img/empty-state-documents.png"
                    alt="Nenhum documento cadastrado"
                    width={240}
                    height={192}
                    className="mb-4 rounded-xl object-cover"
                  />
                  <EmptyState
                    icon={FileText}
                    title="Nenhum documento cadastrado"
                    description="O paciente ainda não possui documentos no prontuário."
                  />
                </div>
              )
            ) : (
              <div className="space-y-6">
                {documentTypes.map((type) => (
                  <div key={type} className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {typeLabel[type] ?? type}
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
                          results={doc.results}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <BlockedDocumentsCard withheld={withheld} />
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
                          {log.eventType === "CONTACT_APPROVE" && "Contato de emergência aceito"}
                          {log.eventType === "CONTACT_DENY" && "Contato de emergência recusado"}
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
    </div>
  );
}
