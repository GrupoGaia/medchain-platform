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
import { DownloadButton } from "./download-button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  FileText,
  Image,
  Pill,
  AlertTriangle,
  ShieldOff,
  User,
  Droplet,
  Activity,
  FlaskConical,
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

const DOC_TYPE_ICON: Record<string, React.ElementType> = {
  EXAM: FileText,
  REPORT: FileText,
  PRESCRIPTION: Pill,
  IMAGING: Image,
};

const DOC_TYPE_LABEL: Record<string, string> = {
  EXAM: "Exame",
  REPORT: "Laudo",
  PRESCRIPTION: "Receita",
  IMAGING: "Imagem",
};

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

  const [patient, token, documents] = await Promise.all([
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
    await prisma.accessLog.create({
      data: {
        tokenId: token.id,
        actorUserId: doctorUser.id,
        patientId,
        eventType: "ACCESS",
        channel: "WEB_PORTAL",
      },
    }).catch(() => {});
  }

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
                <Alert className="border-amber-200 bg-amber-50 text-amber-900 [&>svg]:text-amber-600">
                  <AlertTriangle size={18} />
                  <AlertTitle className="text-amber-900">Alergias conhecidas</AlertTitle>
                  <AlertDescription className="text-amber-800">
                    {patient.allergies.join(" · ")}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-4">
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
                <div className="space-y-3">
                  {documents.map((doc) => {
                    const Icon = DOC_TYPE_ICON[doc.type] ?? FileText;
                    return (
                      <Card key={doc.id} className="border shadow-sm transition-shadow hover:shadow-md">
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary">
                              <Icon size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {DOC_TYPE_LABEL[doc.type] ?? doc.type} ·{" "}
                                {new Date(doc.issuedAt).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <DownloadButton docId={doc.id} />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
