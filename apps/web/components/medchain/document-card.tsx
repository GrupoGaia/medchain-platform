import { FileText, Pill, Image as ImageIcon, FlaskConical, FileDigit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { DownloadButton } from "@/app/medico/(app)/prontuario/[patientId]/download-button";
import { ExamResultsTable, type ExamResultRow } from "@/components/medchain/exam-results-table";

const DOC_TYPE_CONFIG = {
  EXAM: {
    icon: FlaskConical,
    label: "Exame Laboratorial",
    iconContainer: "bg-teal-50 text-teal-700 border border-teal-200/60",
    badge: "bg-teal-50 text-teal-800 border-teal-200",
  },
  REPORT: {
    icon: FileText,
    label: "Laudo Médico",
    iconContainer: "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  PRESCRIPTION: {
    icon: Pill,
    label: "Receita",
    iconContainer: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  IMAGING: {
    icon: ImageIcon,
    label: "Exame de Imagem",
    iconContainer: "bg-violet-50 text-violet-700 border border-violet-200/60",
    badge: "bg-violet-50 text-violet-800 border-violet-200",
  },
} as const;

interface DocumentCardProps {
  id: string;
  title: string;
  type: string;
  mimeType: string;
  issuedAt: Date | string;
  results?: ExamResultRow[];
}

export function DocumentCard({ id, title, type, mimeType, issuedAt, results }: DocumentCardProps) {
  const config = DOC_TYPE_CONFIG[type as keyof typeof DOC_TYPE_CONFIG] ?? {
    icon: FileDigit,
    label: type,
    iconContainer: "bg-slate-50 text-slate-700 border border-slate-200/60",
    badge: "bg-slate-50 text-slate-800 border-slate-200",
  };

  const Icon = config.icon;

  return (
    <Card className="border border-slate-200/80 bg-white shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-2xs ${config.iconContainer}`}
            >
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className={`text-[11px] font-medium ${config.badge}`}>
                  {config.label}
                </Badge>
                <span className="text-slate-600 font-medium">{formatDate(issuedAt)}</span>
                <span className="hidden sm:inline text-slate-300">·</span>
                <span className="hidden sm:inline font-mono text-[11px] text-slate-500">{mimeType}</span>
              </div>
            </div>
          </div>
          <DownloadButton docId={id} />
        </div>
        {results && results.length > 0 && <ExamResultsTable results={results} />}
      </CardContent>
    </Card>
  );
}

