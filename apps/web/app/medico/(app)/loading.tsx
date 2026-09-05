import { Skeleton } from "@/components/ui/skeleton";

// Vale para todas as rotas do portal que nao tem loading proprio. As paginas
// sao server components com varias consultas em paralelo, e sem isto a
// navegacao ficava travada na tela anterior ate tudo resolver.
//
// O esqueleto espelha o dashboard, que e a rota mais visitada do grupo: faixa
// de indicadores, lista de acessos e coluna de atividade.
export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando…</span>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2 bg-surface px-4 py-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-10" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <Skeleton className="h-5 w-52" />
          <div className="divide-y divide-border-subtle rounded-xl border border-border bg-surface">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4">
                <Skeleton className="size-7 rounded-full" />
                <Skeleton className="h-4 flex-1 max-w-[12rem]" />
                <Skeleton className="hidden h-5 w-28 rounded-md md:block" />
                <Skeleton className="hidden h-4 w-24 md:block" />
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-7 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
