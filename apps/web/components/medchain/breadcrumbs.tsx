import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Trilha da página. Fica no cabeçalho da aplicação, fora do `<main>`, para que
 * o conteúdo principal continue começando no título da página.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Trilha de navegação" className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  size={14}
                  aria-hidden
                  className="shrink-0 text-border-strong"
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="truncate rounded-sm text-label text-muted-foreground transition-colors duration-fast hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "truncate text-label",
                    isLast ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Rótulos das rotas do portal. Segmento dinâmico (um id de paciente, por
// exemplo) nunca vira rótulo: além de ilegível, exporia o identificador na
// trilha antes mesmo de a página confirmar se há autorização.
const SEGMENT_LABEL: Record<string, string> = {
  medico: "Portal médico",
  dashboard: "Dashboard",
  solicitar: "Solicitar acesso",
  prontuario: "Prontuário",
};

export function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  let href = "";

  for (const segment of segments) {
    href += `/${segment}`;
    const label = SEGMENT_LABEL[segment];
    if (!label) continue;
    // "medico" é só o prefixo das rotas do portal, não uma página navegável.
    if (segment === "medico") continue;
    crumbs.push({ label, href });
  }

  return crumbs;
}
