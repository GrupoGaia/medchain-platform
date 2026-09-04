import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  /** Linha curta acima do título: instituição, especialidade, contexto. */
  eyebrow?: React.ReactNode;
  description?: string;
  /** Ações da página. A primária vai por último, encostada na direita. */
  children?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

/**
 * Cabeçalho de página. É sempre o primeiro elemento do `<main>` e carrega o
 * único `<h1>` da tela, para que a ordem de títulos faça sentido no leitor de
 * tela.
 */
export function PageHeader({
  title,
  eyebrow,
  description,
  children,
  backHref,
  backLabel = "Voltar",
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1.5 rounded-md text-label font-medium text-muted-foreground transition-colors duration-fast hover:text-foreground"
        >
          <ArrowLeft size={15} />
          {backLabel}
        </Link>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          {eyebrow && (
            <p className="text-overline uppercase text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h1 className="text-page-title text-foreground">{title}</h1>
          {description && (
            <p className="max-w-2xl text-body text-foreground-secondary">
              {description}
            </p>
          )}
        </div>

        {children && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
