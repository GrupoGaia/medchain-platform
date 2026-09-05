import {
  FileText,
  Pill,
  FlaskConical,
  Scan,
  FileDigit,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { ExamResultsTable, type ExamResultRow } from "./exam-results-table";
import { DownloadButton } from "@/app/medico/(app)/prontuario/[patientId]/download-button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

// Um único container neutro para o ícone, em vez de uma família de cor por
// tipo: a cor fica reservada para estado, e o tipo já é dito por ícone e
// etiqueta.
const DOC_TYPE: Record<
  string,
  { label: string; plural: string; icon: LucideIcon }
> = {
  EXAM: { label: "Exame", plural: "Exames", icon: FlaskConical },
  REPORT: { label: "Laudo", plural: "Laudos", icon: FileText },
  PRESCRIPTION: { label: "Receita", plural: "Receitas", icon: Pill },
  IMAGING: { label: "Imagem", plural: "Imagens", icon: Scan },
};

/** Rótulo de um documento, para a coluna de tipo. */
export function documentTypeLabel(type: string): string {
  return DOC_TYPE[type]?.label ?? type;
}

/**
 * Rótulo de uma categoria de documentos. O aviso de escopo enumera categorias
 * ("não autorizou o acesso a: receitas"), não itens, então ali o plural é o
 * que soa certo.
 */
export function documentTypeLabelPlural(type: string): string {
  return DOC_TYPE[type]?.plural ?? type;
}

export interface DocumentRowData {
  id: string;
  title: string;
  type: string;
  mimeType: string;
  issuedAt: Date | string;
  results?: ExamResultRow[];
}

// As quatro colunas só entram a partir de lg: espremer título, tipo, data e
// ação em 700px deixa o título ilegível, que é justamente o que o profissional
// procura na lista. Abaixo disso a linha vira duas — título em cima, tipo,
// data e ação embaixo — em vez de quatro blocos empilhados.
const ROW_GRID =
  "flex flex-wrap items-center gap-x-3 gap-y-2 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center lg:gap-4";

/**
 * Biblioteca clínica do paciente. Cada linha é enxuta o bastante para uma
 * lista com dezenas de itens; os resultados estruturados de um exame ficam
 * recolhidos em `<details>`, que abre sem JavaScript e já vem com a semântica
 * de expansão que o leitor de tela anuncia.
 */
export function DocumentTable({
  documents,
  className,
}: {
  documents: DocumentRowData[];
  className?: string;
}) {
  if (documents.length === 0) return null;

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
          "hidden border-b border-border bg-surface-subtle px-4 py-2 text-overline uppercase text-muted-foreground lg:grid"
        )}
      >
        <span>Documento</span>
        <span>Tipo</span>
        <span>Emissão</span>
        <span className="sr-only">Ação</span>
      </div>

      <ul className="divide-y divide-border-subtle">
        {documents.map((doc) => {
          const config = DOC_TYPE[doc.type];
          const Icon = config?.icon ?? FileDigit;
          const hasResults = doc.results && doc.results.length > 0;

          return (
            <li key={doc.id} className="px-4 py-3">
              <div className={ROW_GRID}>
                <div className="flex w-full min-w-0 items-center gap-3 lg:w-auto">
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-subtle text-foreground-secondary"
                  >
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-label font-medium text-foreground">
                      {doc.title}
                    </p>
                    <p className="truncate font-mono text-caption text-muted-foreground">
                      {doc.mimeType}
                    </p>
                  </div>
                </div>

                <div>
                  <Badge variant="neutral">{documentTypeLabel(doc.type)}</Badge>
                </div>

                <p className="text-body-sm tabular-nums text-foreground-secondary">
                  <span className="text-muted-foreground lg:hidden">Emitido em </span>
                  {formatDate(doc.issuedAt)}
                </p>

                <div className="ml-auto lg:ml-0">
                  <DownloadButton docId={doc.id} documentTitle={doc.title} />
                </div>
              </div>

              {hasResults && (
                <details className="group mt-3">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-md text-label font-medium text-interactive hover:underline [&::-webkit-details-marker]:hidden">
                    <ChevronRight
                      size={15}
                      aria-hidden
                      className="transition-transform duration-fast group-open:rotate-90"
                    />
                    Resultados laboratoriais ({doc.results!.length})
                  </summary>
                  <ExamResultsTable
                    results={doc.results!}
                    caption={`Resultados de ${doc.title}`}
                    className="mt-3"
                  />
                </details>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
