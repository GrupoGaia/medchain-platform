import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { isOutOfRange } from "@medchain/domain";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface ExamResultRow {
  id: string;
  analyte: string;
  value: number;
  unit: string;
  referenceMin: number;
  referenceMax: number;
}

function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

/**
 * Tabela de resultados laboratoriais.
 *
 * A avaliação diz apenas se o valor está dentro ou fora da faixa de referência
 * que veio junto com o resultado. Não é diagnóstico, não classifica gravidade
 * e não infere nada que o laboratório não tenha informado.
 */
export function ExamResultsTable({
  results,
  caption,
  className,
}: {
  results: ExamResultRow[];
  caption?: string;
  className?: string;
}) {
  if (results.length === 0) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-surface",
        className
      )}
    >
      <Table>
        {caption && <TableCaption className="sr-only">{caption}</TableCaption>}
        <TableHeader>
          <TableRow className="hover:bg-surface-subtle">
            <TableHead scope="col" className="w-[38%]">
              Analito
            </TableHead>
            <TableHead scope="col" className="text-right">
              Resultado
            </TableHead>
            <TableHead scope="col" className="text-right">
              Faixa de referência
            </TableHead>
            <TableHead scope="col" className="text-right">
              Avaliação
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => {
            const outOfRange = isOutOfRange(
              result.value,
              result.referenceMin,
              result.referenceMax
            );
            const isHigh = result.value > result.referenceMax;

            return (
              <TableRow
                key={result.id}
                className={cn(outOfRange && "bg-warning-subtle hover:bg-warning-subtle")}
              >
                <TableCell className="whitespace-normal font-medium text-foreground">
                  {result.analyte}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right tabular-nums",
                    outOfRange
                      ? "font-semibold text-warning"
                      : "font-medium text-foreground"
                  )}
                >
                  {formatNumber(result.value)}{" "}
                  <span className="font-normal text-muted-foreground">
                    {result.unit}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatNumber(result.referenceMin)} –{" "}
                  {formatNumber(result.referenceMax)} {result.unit}
                </TableCell>
                <TableCell className="text-right">
                  {/* Ícone + texto: fora da faixa não é comunicado só pelo
                      fundo âmbar da linha. */}
                  {outOfRange ? (
                    <span className="inline-flex items-center gap-1 text-label font-medium text-warning">
                      {isHigh ? (
                        <ArrowUp size={13} aria-hidden />
                      ) : (
                        <ArrowDown size={13} aria-hidden />
                      )}
                      {isHigh ? "Acima da faixa" : "Abaixo da faixa"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-label text-muted-foreground">
                      <Minus size={13} aria-hidden />
                      Dentro da faixa
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
