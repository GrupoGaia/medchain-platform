import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title: string;
  description?: string;
  /** Código técnico que liga esta tela ao erro registrado no servidor. */
  digest?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Falha de carregamento. Linguagem de gente, e sempre com um caminho de saída:
 * tentar de novo ou voltar para uma tela que funciona.
 */
export function ErrorState({
  title,
  description,
  digest,
  children,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-border bg-surface px-6 py-10 text-center",
        className
      )}
    >
      <span
        aria-hidden
        className="mb-3 flex size-10 items-center justify-center rounded-full bg-danger-subtle text-danger"
      >
        <AlertTriangle size={19} />
      </span>
      <p className="text-section-title text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-body-sm text-foreground-secondary">
          {description}
        </p>
      )}
      {digest && (
        <code className="mt-3 rounded-md bg-secondary px-2 py-1 font-mono text-caption text-muted-foreground">
          {digest}
        </code>
      )}
      {children && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">{children}</div>
      )}
    </div>
  );
}
