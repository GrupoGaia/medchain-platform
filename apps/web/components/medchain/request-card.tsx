import { Hourglass } from "lucide-react";
import { PatientIdentity } from "./patient-identity";
import { StatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface RequestRowData {
  id: string;
  patientName: string;
  scopeLabel: string;
  reason: string | null;
  durationLabel: string;
  createdAtFormatted: string;
}

/**
 * Solicitação aguardando a decisão do paciente. Não tem ação para o médico:
 * o cartão existe para dizer o que já foi pedido e desde quando, e por isso é
 * mais discreto que a lista de acessos ativos.
 */
export function RequestList({
  items,
  className,
}: {
  items: RequestRowData[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-xl border border-warning-border bg-warning-subtle p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <PatientIdentity
              name={item.patientName}
              size="sm"
              meta={
                <>
                  Solicitado em {item.createdAtFormatted} · {item.durationLabel}
                </>
              }
            />
            <StatusBadge
              tone="pending"
              label="Aguardando o paciente"
              icon={Hourglass}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{item.scopeLabel}</Badge>
            {item.reason && (
              <p className="text-body-sm text-foreground-secondary">
                <span className="font-medium text-foreground">Motivo:</span>{" "}
                {item.reason}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
