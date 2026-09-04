import { Skeleton } from "@/components/ui/skeleton";

// O prontuario tem layout proprio, de duas colunas, e faz quatro consultas em
// paralelo. O esqueleto generico do grupo deixaria o conteudo saltando de
// posicao quando os dados chegassem.
export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="space-y-5">
      <span className="sr-only">Carregando prontuário…</span>

      <Skeleton className="h-4 w-40" />

      <div className="rounded-xl border border-border bg-surface">
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-56" />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-32 rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-36 rounded-lg" />
          </div>
        </div>
        <div className="border-t border-border-subtle bg-surface-subtle px-4 py-3">
          <Skeleton className="h-4 w-72" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <Skeleton className="h-5 w-36" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-7 shrink-0 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 border-b border-border pb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="divide-y divide-border-subtle rounded-xl border border-border bg-surface">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4">
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <Skeleton className="h-4 flex-1 max-w-[16rem]" />
                <Skeleton className="hidden h-5 w-16 rounded-md md:block" />
                <Skeleton className="hidden h-4 w-20 md:block" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
