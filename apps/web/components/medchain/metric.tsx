import { cn } from "@/lib/utils";

export interface MetricItem {
  label: string;
  value: React.ReactNode;
  /** Complemento curto abaixo do número. */
  hint?: string;
  /** Destaca o número quando o valor exige atenção. */
  tone?: "default" | "warning";
}

/**
 * Faixa de indicadores. Uma tira só, com divisórias, em vez de um cartão
 * grande por número: o painel precisa do espaço para o trabalho, não para as
 * métricas.
 */
export function MetricGroup({
  items,
  className,
}: {
  items: MetricItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <dl
      className={cn(
        "grid grid-cols-1 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0",
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="px-4 py-3">
          <dt className="text-overline uppercase text-muted-foreground">
            {item.label}
          </dt>
          <dd
            className={cn(
              "mt-1 text-page-title tabular-nums",
              item.tone === "warning" ? "text-warning" : "text-foreground"
            )}
          >
            {item.value}
          </dd>
          {item.hint && (
            <p className="mt-0.5 text-caption text-muted-foreground">{item.hint}</p>
          )}
        </div>
      ))}
    </dl>
  );
}
