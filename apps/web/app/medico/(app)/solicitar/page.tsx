import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDoctor } from "@/lib/session";
import { CreateAccessRequestSchema } from "@medchain/api-contract";
import { buttonVariants } from "@/components/ui/button";
import { Label, FieldDescription } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/medchain/page-header";
import { PatientSearch } from "./patient-search";
import { ScopeField } from "./scope-field";
import { cn } from "@/lib/utils";
import { AlertCircle, Send, ShieldCheck, Timer, ClipboardList } from "lucide-react";

async function createRequest(formData: FormData) {
  "use server";
  const { doctorId } = await requireDoctor();

  const raw = {
    patientId: formData.get("patientId") as string,
    scope: formData.get("scope") as string,
    durationMinutes: Number(formData.get("durationMinutes")),
    reason: (formData.get("reason") as string) || undefined,
  };

  const result = CreateAccessRequestSchema.safeParse(raw);
  if (!result.success) redirect("/medico/solicitar?error=invalid");

  // O patientId chega de um campo oculto preenchido pela busca, entao vale
  // conferir que ele existe. Sem isso, um id forjado quebraria na chave
  // estrangeira e viraria erro 500 em vez de mensagem no formulario.
  const patient = await prisma.patientProfile.findUnique({
    where: { id: result.data.patientId },
    select: { id: true },
  });
  if (!patient) redirect("/medico/solicitar?error=invalid");

  const professional = await prisma.healthProfessionalProfile.findUniqueOrThrow({
    where: { id: doctorId },
    select: { userId: true },
  });

  await prisma.accessRequest.create({
    data: {
      patientId: result.data.patientId,
      professionalId: doctorId,
      requestedById: professional.userId,
      scope: result.data.scope,
      durationMinutes: result.data.durationMinutes ?? 60,
      reason: result.data.reason,
      channelType: "WEB_PORTAL",
    },
  });

  redirect("/medico/dashboard");
}

// Os itens precisam ser declarados no `Select` também como mapa: o gatilho é
// renderizado antes de o popup existir, e sem isso o campo mostraria "60" no
// lugar de "1 hora" enquanto o usuário não abrisse a lista.
const DURATION_ITEMS: Record<string, string> = {
  "15": "15 minutos",
  "30": "30 minutos",
  "60": "1 hora",
  "120": "2 horas",
  "480": "8 horas",
};

const STEPS = [
  {
    icon: Send,
    title: "Você envia o pedido",
    description:
      "O paciente ou o contato de emergência aprovado recebe a solicitação no aplicativo.",
  },
  {
    icon: ShieldCheck,
    title: "O paciente decide",
    description:
      "Ele vê quem pediu, o motivo, o escopo e a duração antes de autorizar ou negar.",
  },
  {
    icon: Timer,
    title: "O acesso expira sozinho",
    description:
      "Ao aprovar, um token temporário é criado e encerra no prazo escolhido, sem ação sua.",
  },
];

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-b border-border-subtle pb-6 last:border-b-0 last:pb-0">
      <div>
        <h2 className="text-card-title text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-body-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export default async function SolicitarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { doctorId } = await requireDoctor();

  const doctor = await prisma.healthProfessionalProfile.findUnique({
    where: { id: doctorId },
  });
  if (!doctor) redirect("/medico/login");

  return (
    <div>
      <PageHeader
        title="Solicitar acesso ao prontuário"
        eyebrow="Nova autorização"
        description="O acesso só existe depois que o paciente aprovar, e sempre com prazo para expirar."
        backHref="/medico/dashboard"
        backLabel="Voltar ao dashboard"
      />

      {error && (
        <Alert variant="danger" icon={<AlertCircle />} className="mb-6 max-w-3xl">
          <AlertTitle>Não foi possível enviar a solicitação</AlertTitle>
          <AlertDescription>
            Confira se o paciente foi localizado pelo CPF e se o escopo e a
            duração estão preenchidos.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <form
          action={createRequest}
          className="min-w-0 space-y-6 rounded-xl border border-border bg-surface p-5"
        >
          <FormSection
            title="Paciente"
            description="Localize pelo CPF completo para confirmar de quem é o prontuário."
          >
            <PatientSearch />
          </FormSection>

          <FormSection
            title="Escopo e duração"
            description="Peça o mínimo necessário: o paciente aprova com mais facilidade e o dado exposto é menor."
          >
            <ScopeField />

            <div className="space-y-1.5">
              <Label htmlFor="durationMinutes">
                Duração do acesso
                <span aria-hidden className="text-danger">
                  *
                </span>
              </Label>
              <Select
                name="durationMinutes"
                defaultValue="60"
                items={DURATION_ITEMS}
                required
              >
                <SelectTrigger id="durationMinutes" aria-describedby="duracao-ajuda">
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DURATION_ITEMS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription id="duracao-ajuda">
                O tempo começa a contar quando o paciente aprova, e não agora.
              </FieldDescription>
            </div>
          </FormSection>

          <FormSection
            title="Justificativa"
            description="Escrever o motivo aumenta bastante a chance de aprovação."
          >
            <div className="space-y-1.5">
              <Label htmlFor="reason">
                Motivo
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id="reason"
                name="reason"
                rows={3}
                maxLength={500}
                aria-describedby="reason-ajuda"
                placeholder="Ex.: consulta de retorno para avaliação cardiológica"
              />
              <FieldDescription id="reason-ajuda">
                Até 500 caracteres. O paciente lê este texto na tela de
                autorização.
              </FieldDescription>
            </div>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Link
              href="/medico/dashboard"
              className={cn(buttonVariants({ variant: "ghost" }), "justify-center")}
            >
              Cancelar
            </Link>
            <button type="submit" className={cn(buttonVariants(), "justify-center")}>
              <Send aria-hidden />
              Enviar solicitação
            </button>
          </div>
        </form>

        <aside
          aria-labelledby="como-funciona"
          className="h-fit rounded-xl border border-border bg-surface p-4"
        >
          <h2
            id="como-funciona"
            className="flex items-center gap-2 text-card-title text-foreground"
          >
            <ClipboardList size={16} aria-hidden className="text-muted-foreground" />
            O que acontece depois
          </h2>
          <ol className="mt-3 space-y-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex gap-3">
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground"
                  >
                    <Icon size={14} />
                  </span>
                  <div>
                    <p className="text-label font-medium text-foreground">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-0.5 text-caption leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 border-t border-border-subtle pt-3 text-caption text-muted-foreground">
            Toda solicitação, aprovação e abertura de prontuário fica registrada
            em auditoria, visível para o paciente.
          </p>
        </aside>
      </div>
    </div>
  );
}
