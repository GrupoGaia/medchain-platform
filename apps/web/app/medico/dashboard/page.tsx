import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireDoctor } from "@/lib/session";
import { createSupabaseServer } from "@/lib/supabase/server";
import { validateToken, formatMinutesRemaining } from "@medchain/domain";
import { LogOut, Plus, Clock, AlertCircle } from "lucide-react";

async function logout() {
  "use server";
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/medico/login");
}

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <span className="font-semibold text-gray-900">MedChain</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{doctor.fullName}</p>
              <p className="text-xs text-gray-500">{doctor.specialty} · {doctor.crm}</p>
            </div>
            <Link
              href="/medico/solicitar"
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              <Plus size={15} />
              Solicitar acesso
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                title="Sair"
              >
                <LogOut size={15} />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Resumo */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Acessos ativos</p>
            <p className="mt-1 text-3xl font-bold text-teal-600">{validTokens.length}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Aguardando aprovação</p>
            <p className="mt-1 text-3xl font-bold text-amber-500">{pendingRequests.length}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Especialidade</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{doctor.specialty}</p>
            {doctor.institution && (
              <p className="text-xs text-gray-400">{doctor.institution.name}</p>
            )}
          </div>
        </div>

        {/* Tokens ativos */}
        {validTokens.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Acessos autorizados</h2>
            <div className="space-y-3">
              {validTokens.map((token) => {
                const minutesRemaining = token.validation.valid ? token.validation.minutesRemaining : 0;
                return (
                  <div key={token.id} className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm">
                    <div>
                      <p className="font-medium text-gray-900">{token.patient.fullName}</p>
                      <p className="text-sm text-gray-500">{token.scope}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-sm text-amber-600">
                        <Clock size={13} />
                        {formatMinutesRemaining(minutesRemaining)}
                      </span>
                      <Link
                        href={`/medico/prontuario/${token.patientId}`}
                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                      >
                        Abrir prontuário
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Pendentes */}
        {pendingRequests.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Aguardando autorização do paciente</h2>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="flex items-start justify-between rounded-xl bg-white p-5 shadow-sm">
                  <div>
                    <p className="font-medium text-gray-900">{req.patient.fullName}</p>
                    <p className="text-sm text-gray-500">{req.scope}</p>
                    {req.reason && <p className="mt-1 text-xs text-gray-400">{req.reason}</p>}
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    <AlertCircle size={12} />
                    Pendente
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {validTokens.length === 0 && pendingRequests.length === 0 && (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">Nenhum acesso ativo ou solicitação pendente.</p>
            <Link
              href="/medico/solicitar"
              className="mt-4 inline-block rounded-lg bg-teal-600 px-6 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Solicitar acesso ao prontuário
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
