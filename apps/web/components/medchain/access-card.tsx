import Link from "next/link";
import { ArrowRight, FileLock2 } from "lucide-react";
import { AccessCountdown } from "./access-countdown";
import { PatientIdentity } from "./patient-identity";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AccessRowData {
  tokenId: string;
  patientId: string;
  patientName: string;
  scopeLabel: string;
  minutesRemaining: number;
  totalMinutes: number;
  expiresAtFormatted: string;
}

// Uma grade só, que vira lista empilhada abaixo de md. Duplicar a marcação em
// tabela e cartão faria as duas versões divergirem com o tempo.
//
// Três colunas, não quatro: o escopo acompanha o nome do paciente, porque é
// atributo da autorização daquela pessoa e porque uma coluna própria para ele
// espremia o nome em telas de 1024px.
const ROW_GRID =
  "grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_auto] md:items-center md:gap-5";

export function AccessList({
  items,
  className,
}: {
  items: AccessRowData[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface",
        className
      )}
    >
      <div
        aria-hidden
        className={cn(
          ROW_GRID,
          "hidden border-b border-border bg-surface-subtle px-4 py-2 text-overline uppercase text-muted-foreground md:grid"
        )}
      >
        <span>Paciente e escopo autorizado</span>
        <span>Tempo restante</span>
        <span className="sr-only">Ação</span>
      </div>

      <ul className="divide-y divide-border-subtle">
        {items.map((item) => (
          <li
            key={item.tokenId}
            className={cn(
              ROW_GRID,
              "px-4 py-3.5 transition-colors duration-fast hover:bg-surface-subtle"
            )}
          >
            <PatientIdentity
              name={item.patientName}
              meta={
                <span className="inline-flex items-center gap-1.5">
                  <FileLock2 size={13} aria-hidden className="shrink-0" />
                  {item.scopeLabel}
                </span>
              }
            />

            <div>
              <AccessCountdown
                minutesRemaining={item.minutesRemaining}
                totalMinutes={item.totalMinutes}
              />
              <p className="mt-1 text-caption tabular-nums text-muted-foreground">
                Expira às {item.expiresAtFormatted}
              </p>
            </div>

            <Link
              href={`/medico/prontuario/${item.patientId}`}
              className={cn(
                buttonVariants({ size: "sm" }),
                "w-full justify-center md:w-auto"
              )}
              aria-label={`Abrir prontuário de ${item.patientName}`}
            >
              Abrir prontuário
              <ArrowRight aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
