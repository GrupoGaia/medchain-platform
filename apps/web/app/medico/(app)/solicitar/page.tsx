import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDoctor } from "@/lib/session";
import { CreateAccessRequestSchema } from "@medchain/api-contract";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/medchain/page-header";
import { cn } from "@/lib/utils";
import { ArrowLeft, AlertCircle, Clock, Shield, Send } from "lucide-react";

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

export default async function SolicitarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { doctorId } = await requireDoctor();

  const [doctor, patients] = await Promise.all([
    prisma.healthProfessionalProfile.findUnique({ where: { id: doctorId } }),
    prisma.patientProfile.findMany({ orderBy: { fullName: "asc" } }),
  ]);
  if (!doctor) redirect("/medico/login");

  const scopeOptions = [
    "Prontuário completo",
    "Dados de emergência (alergias, medicamentos, tipo sanguíneo)",
    "Exames laboratoriais",
    "Exames de imagem",
    "Receitas e prescrições",
    "Histórico de internações",
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Solicitar acesso ao prontuário" description="Preencha os dados abaixo para solicitar autorização do paciente.">
        <Link href="/medico/dashboard" className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}>
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </PageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertCircle size={16} />
          <AlertDescription>Dados inválidos. Verifique os campos e tente novamente.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <form action={createRequest} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="patientId">Paciente *</Label>
                <Select name="patientId" required>
                  <SelectTrigger id="patientId">
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.fullName} — {p.bloodType ?? "Tipo sang. não informado"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="scope">Dados solicitados *</Label>
                <Select name="scope" required>
                  <SelectTrigger id="scope">
                    <SelectValue placeholder="Selecione o escopo" />
                  </SelectTrigger>
                  <SelectContent>
                    {scopeOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="durationMinutes">Duração do acesso *</Label>
                <Select name="durationMinutes" defaultValue="60">
                  <SelectTrigger id="durationMinutes">
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="480">8 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason">
                  Motivo <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  maxLength={500}
                  placeholder="Ex: Consulta de retorno para avaliação cardiológica"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Link href="/medico/dashboard" className={cn(buttonVariants({ variant: "outline" }), "sm:flex-1")}>
                  Cancelar
                </Link>
                <button type="submit" className={cn(buttonVariants(), "gap-1.5 sm:flex-1")}>
                  <Send size={16} />
                  Enviar solicitação
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="hidden space-y-4 lg:block">
          <Card className="border-primary-100 bg-primary-50/50 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary">
                <Shield size={20} />
              </div>
              <h3 className="font-semibold text-foreground">Segurança primeiro</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                O paciente ou familiar receberá uma notificação e precisará aprovar antes do acesso ser liberado.
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Clock size={20} />
              </div>
              <h3 className="font-semibold text-foreground">Acesso temporário</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                O token expira automaticamente após o prazo selecionado, garantindo controle do paciente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground lg:hidden">
        O paciente ou familiar receberá uma notificação e precisará aprovar antes do acesso ser liberado.
      </p>
    </div>
  );
}
