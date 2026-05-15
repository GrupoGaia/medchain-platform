import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";
import { CreateAccessRequestSchema } from "@medchain/api-contract";
import { ArrowLeft } from "lucide-react";

async function createRequest(formData: FormData) {
  "use server";
  const cookieStore = await cookies();
  const doctorId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!doctorId) redirect("/medico/login");

  const raw = {
    patientId: formData.get("patientId") as string,
    professionalId: doctorId,
    scope: formData.get("scope") as string,
    durationMinutes: Number(formData.get("durationMinutes")),
    reason: (formData.get("reason") as string) || undefined,
  };

  const result = CreateAccessRequestSchema.safeParse(raw);
  if (!result.success) redirect("/medico/solicitar?error=invalid");

  await prisma.accessRequest.create({
    data: {
      patientId: result.data.patientId,
      professionalId: result.data.professionalId,
      requestedById: (
        await prisma.healthProfessionalProfile.findUniqueOrThrow({
          where: { id: doctorId },
          select: { userId: true },
        })
      ).userId,
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
  const cookieStore = await cookies();
  const doctorId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!doctorId) redirect("/medico/login");

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
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-6 py-4">
          <Link
            href="/medico/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={15} />
            Dashboard
          </Link>
          <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <span className="font-semibold text-gray-900">MedChain</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Solicitar acesso ao prontuário</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            Dados inválidos. Verifique os campos e tente novamente.
          </div>
        )}

        <form action={createRequest} className="space-y-6 rounded-xl bg-white p-6 shadow-sm">
          {/* Paciente */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Paciente *
            </label>
            <select
              name="patientId"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">Selecione o paciente</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} — {p.bloodType ?? "Tipo sang. não informado"}
                </option>
              ))}
            </select>
          </div>

          {/* Escopo */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Dados solicitados *
            </label>
            <select
              name="scope"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">Selecione o escopo</option>
              {scopeOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Duração */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Duração do acesso *
            </label>
            <select
              name="durationMinutes"
              defaultValue="60"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="60">1 hora</option>
              <option value="120">2 horas</option>
              <option value="480">8 horas</option>
            </select>
          </div>

          {/* Motivo */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Motivo <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              name="reason"
              rows={3}
              maxLength={500}
              placeholder="Ex: Consulta de retorno — avaliação cardiológica"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
            >
              Enviar solicitação
            </button>
            <Link
              href="/medico/dashboard"
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>
        </form>

        <p className="mt-4 text-xs text-gray-400 text-center">
          O paciente ou familiar receberá uma notificação e precisará aprovar antes do acesso ser liberado.
        </p>
      </main>
    </div>
  );
}
