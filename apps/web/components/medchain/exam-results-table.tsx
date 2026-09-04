import { isOutOfRange } from "@medchain/domain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Check } from "lucide-react";

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

export function ExamResultsTable({ results }: { results: ExamResultRow[] }) {
  if (results.length === 0) return null;

  return (
    <div className="mt-4 overflow-hidden rounded-lg border bg-slate-50/50">
      <div className="border-b bg-slate-100/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
        Resultados laboratoriais estruturados
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-white hover:bg-white">
            <TableHead className="w-[35%] text-xs font-semibold text-slate-700">Analito</TableHead>
            <TableHead className="text-xs font-semibold text-slate-700">Resultado</TableHead>
            <TableHead className="text-xs font-semibold text-slate-700">Faixa de Referência</TableHead>
            <TableHead className="text-right text-xs font-semibold text-slate-700">Avaliação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => {
            const outOfRange = isOutOfRange(result.value, result.referenceMin, result.referenceMax);
            const isHigh = result.value > result.referenceMax;
            const isLow = result.value < result.referenceMin;

            return (
              <TableRow
                key={result.id}
                className={cn(
                  "border-b transition-colors",
                  outOfRange ? "bg-amber-50/60 hover:bg-amber-50" : "bg-white hover:bg-slate-50/80"
                )}
              >
                <TableCell className="font-medium text-slate-900">{result.analyte}</TableCell>
                <TableCell
                  className={cn(
                    "font-mono text-sm tabular-nums",
                    outOfRange ? "font-bold text-amber-900" : "font-semibold text-slate-800"
                  )}
                >
                  {formatNumber(result.value)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">{result.unit}</span>
                </TableCell>
                <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatNumber(result.referenceMin)} – {formatNumber(result.referenceMax)}{" "}
                  <span className="text-[11px]">{result.unit}</span>
                </TableCell>
                <TableCell className="text-right">
                  {isHigh && (
                    <Badge
                      variant="outline"
                      className="border-amber-300 bg-amber-100/90 text-amber-900 hover:bg-amber-100"
                    >
                      <ArrowUpRight size={12} className="mr-0.5 text-amber-700" />
                      Acima
                    </Badge>
                  )}
                  {isLow && (
                    <Badge
                      variant="outline"
                      className="border-amber-300 bg-amber-100/90 text-amber-900 hover:bg-amber-100"
                    >
                      <ArrowDownRight size={12} className="mr-0.5 text-amber-700" />
                      Abaixo
                    </Badge>
                  )}
                  {!outOfRange && (
                    <Badge
                      variant="outline"
                      className="border-slate-200 bg-slate-100/80 text-slate-700 hover:bg-slate-100"
                    >
                      <Check size={11} className="mr-1 text-emerald-600" />
                      Normal
                    </Badge>
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

