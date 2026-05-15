import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";

async function selectDoctor(formData: FormData) {
  "use server";
  const doctorId = formData.get("doctorId") as string;
  if (!doctorId) return;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, doctorId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
  });
  redirect("/medico/dashboard");
}

export default async function LoginPage() {
  const doctors = await prisma.healthProfessionalProfile.findMany({
    include: { institution: true },
    orderBy: { fullName: "asc" },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-teal-50 p-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600">
            <span className="text-lg font-bold text-white">M</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">MedChain</span>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">Entrar como médico</h1>
        <p className="mb-6 text-sm text-gray-500">
          Selecione seu perfil para acessar o portal. Autenticação real chegará na Fase 3.
        </p>

        {doctors.length === 0 ? (
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
            Nenhum médico encontrado. Execute{" "}
            <code className="font-mono text-xs">pnpm --filter @medchain/web exec npx prisma db seed</code>{" "}
            para popular o banco.
          </div>
        ) : (
          <div className="space-y-3">
            {doctors.map((doctor) => (
              <form key={doctor.id} action={selectDoctor}>
                <input type="hidden" name="doctorId" value={doctor.id} />
                <button
                  type="submit"
                  className="w-full rounded-lg border border-gray-200 p-4 text-left transition hover:border-teal-400 hover:bg-teal-50"
                >
                  <p className="font-medium text-gray-900">{doctor.fullName}</p>
                  <p className="text-sm text-gray-500">
                    {doctor.specialty} · {doctor.crm}
                  </p>
                  {doctor.institution && (
                    <p className="mt-0.5 text-xs text-gray-400">{doctor.institution.name}</p>
                  )}
                </button>
              </form>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
