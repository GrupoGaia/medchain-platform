import { isOutOfRange } from "@medchain/domain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

export function ExamResultsTable({ results }: { results: ExamResultRow[] }) {
  if (results.length === 0) return null;

  return (
    <div className="mt-4 border-t pt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Analito</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Referência</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => {
            const outOfRange = isOutOfRange(result.value, result.referenceMin, result.referenceMax);
            return (
              <TableRow key={result.id} className={cn(outOfRange && "bg-amber-50")}>
                <TableCell className="text-muted-foreground">{result.analyte}</TableCell>
                <TableCell
                  className={cn(
                    "tabular-nums",
                    outOfRange ? "font-semibold text-amber-700" : "text-foreground"
                  )}
                >
                  {formatNumber(result.value)} {result.unit}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {formatNumber(result.referenceMin)} a {formatNumber(result.referenceMax)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
