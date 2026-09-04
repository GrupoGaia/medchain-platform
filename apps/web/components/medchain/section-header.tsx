import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Quantidade de itens da seção. Aparece como contador ao lado do título. */
  count?: number;
  /** Nível do título. A página já tem o h1, então o padrão aqui é h2. */
  as?: "h2" | "h3";
  id?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Título de seção dentro de uma página. Usa `<h2>` por padrão para manter a
 * hierarquia de títulos contínua abaixo do `<h1>` do PageHeader.
 */
export function SectionHeader({
  title,
  description,
  count,
  as: Heading = "h2",
  id,
  children,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-4 gap-y-2",
        className
      )}
    >
      <div className="min-w-0">
        <Heading
          id={id}
          className="flex items-center gap-2 text-section-title text-foreground"
        >
          {title}
          {typeof count === "number" && (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-caption font-medium tabular-nums text-foreground-secondary">
              {count}
            </span>
          )}
        </Heading>
        {description && (
          <p className="mt-0.5 text-body-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
