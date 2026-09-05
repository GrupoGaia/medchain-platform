import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InfoItem {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  /** Marca o item que o profissional não pode deixar passar. */
  emphasis?: boolean;
}

/**
 * Lista de definição para dados do paciente. É um `<dl>` de verdade: o leitor
 * de tela anuncia "Tipo sanguíneo, O+" em vez de duas linhas soltas.
 *
 * Cada campo é uma linha, não um cartão. Um cartão por campo transformaria o
 * resumo clínico numa parede de caixas.
 */
export function InfoList({
  items,
  className,
}: {
  items: InfoItem[];
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-border-subtle", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
            {Icon && (
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                  item.emphasis
                    ? "bg-warning-subtle text-warning"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                <Icon size={14} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <dt className="text-caption text-muted-foreground">{item.label}</dt>
              <dd
                className={cn(
                  "text-body",
                  item.emphasis
                    ? "font-semibold text-foreground"
                    : "text-foreground-secondary"
                )}
              >
                {item.value}
              </dd>
            </div>
          </div>
        );
      })}
    </dl>
  );
}
