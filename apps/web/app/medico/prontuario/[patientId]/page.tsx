import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";
import { validateToken, formatMinutesRemaining } from "@medchain/domain";
import { ArrowLeft, Clock, FileText, Image, Pill, AlertTriangle, ShieldOff } from "lucide-react";

async function revokeToken(formData: FormData) {
  "use server";
  const tokenId = formData.get("tokenId") as string;
  const patientId = formData.get("patientId") as string;
  if (!tokenId) return;

  const token = await prisma.accessToken.findUnique({
    where: { id: tokenId },
    include: { patient: { include: { user: true } } },
  });
  if (!token || token.status !== "ACTIVE") return;

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
  EXAM:         FileText,
  REPORT:       FileText,
  PRESCRIPTION: Pill,
  IMAGING:      Image,
};

const DOC_TYPE_LABEL: Record<string, string> = {
  EXAM:         "Exame",
  REPORT:       "Laudo",
  PRESCRIPTION: "Receita",
  IMAGING:      "Imagem",
};

export default async function ProntuarioPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const cookieStore = await cookies();
  const doctorId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!doctorId) redirect("/medico/login");

  const [doctor, patient, token, documents] = await Promise.all([
    prisma.healthProfessionalProfile.findUnique({ where: { id: doctorId } }),
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

  if (!doctor) redirect("/medico/login");

  if (!patient) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Paciente não encontrado.</p>
      </main>
    );
  }

  const validation = token
    ? validateToken({ status: token.status, expiresAt: token.expiresAt, revokedAt: token.revokedAt })
    : null;

  // Log ACCESS se token válido
  if (token && validation?.valid) {
    await prisma.accessLog.create({
      data: {
        tokenId: token.id,
        actorUserId: doctor.userId,
        patientId,
        eventType: "ACCESS",
        channel: "WEB_PORTAL",
      },
    }).catch(() => {});
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
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
          <span className="ml-auto text-sm text-gray-500">{doctor.fullName}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Token inválido ou inexistente */}
        {!validation?.valid && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <ShieldOff className="mx-auto mb-3 text-red-400" size={40} />
            <p className="text-lg font-semibold text-red-700">Acesso não autorizado</p>
            <p className="mt-2 text-sm text-red-600">
              {token
                ? "O token para este paciente expirou ou foi revogado."
                : "Você não possui um token ativo para este paciente."}
            </p>
            <Link
              href="/medico/solicitar"
              className="mt-4 inline-block rounded-lg bg-teal-600 px-6 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Solicitar novo acesso
            </Link>
          </div>
        )}

        {/* Prontuário acessível */}
        {validation?.valid && token && (
          <>
            {/* Banner de token */}
            <div className="mb-6 flex items-center justify-between rounded-xl bg-teal-50 border border-teal-200 px-5 py-3">
              <span className="flex items-center gap-2 text-sm font-medium text-teal-700">
                <Clock size={15} />
                Acesso expira em {formatMinutesRemaining(validation.minutesRemaining)}
              </span>
              <form action={revokeToken}>
                <input type="hidden" name="tokenId" value={token.id} />
                <input type="hidden" name="patientId" value={patientId} />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <ShieldOff size={12} />
                  Encerrar acesso
                </button>
              </form>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Dados do paciente */}
              <div className="col-span-1 space-y-4">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="mb-3 font-semibold text-gray-900">{patient.fullName}</h2>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-400">Tipo sanguíneo</dt>
                      <dd className="font-medium text-gray-900">{patient.bloodType ?? "Não informado"}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Alergias</dt>
                      <dd className="font-medium text-gray-900">
                        {patient.allergies.length > 0
                          ? patient.allergies.join(", ")
                          : "Nenhuma conhecida"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Condições crônicas</dt>
                      <dd className="font-medium text-gray-900">
                        {patient.chronicConditions.length > 0
                          ? patient.chronicConditions.join(", ")
                          : "Nenhuma"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Medicamentos contínuos</dt>
                      <dd className="font-medium text-gray-900">
                        {patient.continuousMeds.length > 0
                          ? patient.continuousMeds.join(", ")
                          : "Nenhum"}
                      </dd>
                    </div>
                  </dl>
                </div>

                {patient.allergies.length > 0 && (
                  <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                    <div>
                      <p className="text-xs font-semibold text-amber-700">Alergias conhecidas</p>
                      <p className="mt-0.5 text-xs text-amber-600">{patient.allergies.join(" · ")}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Documentos */}
              <div className="col-span-2">
                <h2 className="mb-4 font-semibold text-gray-900">
                  Documentos ({documents.length})
                </h2>
                {documents.length === 0 ? (
                  <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-gray-500">Nenhum documento cadastrado.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => {
                      const Icon = DOC_TYPE_ICON[doc.type] ?? FileText;
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50">
                              <Icon size={17} className="text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                              <p className="text-xs text-gray-400">
                                {DOC_TYPE_LABEL[doc.type] ?? doc.type} ·{" "}
                                {new Date(doc.issuedAt).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-300">
                            {doc.mimeType === "application/pdf" ? "PDF" : "Imagem"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
