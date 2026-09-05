import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  /** `inline` cabe dentro de um painel estreito, como a coluna de apoio. */
  size?: "default" | "inline";
  className?: string;
}

/**
 * Estado vazio: explica em uma frase por que não há nada e qual é o próximo
 * passo. Sem ilustração ocupando a tela — em ferramenta de trabalho isso só
 * empurra o conteúdo para baixo.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface text-center",
        size === "default" ? "px-6 py-10" : "px-4 py-7",
        className
      )}
    >
      {Icon && (
        <span
          aria-hidden
          className="mb-3 flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground"
        >
          <Icon size={19} />
        </span>
      )}
      <p className="text-card-title text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-body-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className={cn(buttonVariants({ size: "sm" }), "mt-4")}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
