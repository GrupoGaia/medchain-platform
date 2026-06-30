import { FileText, Pill, Image, FileDigit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { DownloadButton } from "@/app/medico/(app)/prontuario/[patientId]/download-button";

const DOC_TYPE_ICON = {
  EXAM: FileText,
  REPORT: FileText,
  PRESCRIPTION: Pill,
  IMAGING: Image,
} as const;

const DOC_TYPE_LABEL: Record<string, string> = {
  EXAM: "Exame",
  REPORT: "Laudo",
  PRESCRIPTION: "Receita",
  IMAGING: "Imagem",
};

interface DocumentCardProps {
  id: string;
  title: string;
  type: string;
  mimeType: string;
  issuedAt: Date | string;
}

export function DocumentCard({ id, title, type, mimeType, issuedAt }: DocumentCardProps) {
  const Icon = DOC_TYPE_ICON[type as keyof typeof DOC_TYPE_ICON] ?? FileDigit;
  return (
    <Card className="border shadow-sm transition hover:shadow-md">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="font-normal">
                {DOC_TYPE_LABEL[type] ?? type}
              </Badge>
              <span>{formatDate(issuedAt)}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">{mimeType}</span>
            </div>
          </div>
        </div>
        <DownloadButton docId={id} />
      </CardContent>
    </Card>
  );
}
