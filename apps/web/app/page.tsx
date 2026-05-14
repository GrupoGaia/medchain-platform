export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-teal-50 p-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600">
            <span className="text-lg font-bold text-white">M</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">MedChain</span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Portal Médico
        </h1>
        <p className="mb-8 text-gray-500">
          Acesse prontuários com autorização segura do paciente.
        </p>
        <a
          href="/medico/login"
          className="block w-full rounded-lg bg-teal-600 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-teal-700"
        >
          Entrar como médico
        </a>
      </div>
    </main>
  );
}
