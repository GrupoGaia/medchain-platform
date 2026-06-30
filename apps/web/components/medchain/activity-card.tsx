import { Activity, FileText, ShieldOff, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/format";

const EVENT_ICON: Record<string, typeof Activity> = {
  ACCESS: FileText,
  APPROVE: CheckCircle,
  REVOKE: ShieldOff,
  DENY: ShieldOff,
};

const EVENT_LABEL: Record<string, string> = {
  ACCESS: "Acesso ao prontuário",
  APPROVE: "Acesso aprovado",
  REVOKE: "Acesso encerrado",
  DENY: "Acesso negado",
};

interface ActivityCardProps {
  eventType: string;
  channel: string;
  createdAt: Date | string;
  patientName: string;
}

export function ActivityCard({ eventType, channel, createdAt, patientName }: ActivityCardProps) {
  const Icon = EVENT_ICON[eventType] ?? Activity;
  return (
    <Card className="border shadow-sm">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{EVENT_LABEL[eventType] ?? eventType}</p>
          <p className="truncate text-xs text-muted-foreground">
            {patientName} · {channel === "WEB_PORTAL" ? "Portal web" : "App móvel"}
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeDate(createdAt)}</span>
      </CardContent>
    </Card>
  );
}
