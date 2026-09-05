import {
  Activity,
  FileText,
  ShieldOff,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Vocabulário único dos eventos de auditoria. O portal e o app precisam
// nomear o mesmo evento do mesmo jeito, senão o histórico do paciente conta
// uma história diferente da do médico.
const EVENT: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  ACCESS: {
    label: "Prontuário acessado",
    icon: FileText,
    tone: "bg-info-subtle text-info",
  },
  APPROVE: {
    label: "Acesso autorizado",
    icon: ShieldCheck,
    tone: "bg-success-subtle text-success",
  },
  DENY: {
    label: "Acesso negado",
    icon: ShieldX,
    tone: "bg-danger-subtle text-danger",
  },
  REVOKE: {
    label: "Acesso encerrado",
    icon: ShieldOff,
    tone: "bg-secondary text-foreground-secondary",
  },
  REQUEST: {
    label: "Acesso solicitado",
    icon: Activity,
    tone: "bg-secondary text-foreground-secondary",
  },
  CONTACT_APPROVE: {
    label: "Contato de emergência aceito",
    icon: UserCheck,
    tone: "bg-success-subtle text-success",
  },
  CONTACT_DENY: {
    label: "Contato de emergência recusado",
    icon: UserX,
    tone: "bg-danger-subtle text-danger",
  },
};

export function eventLabel(eventType: string): string {
  return EVENT[eventType]?.label ?? eventType;
}

export interface ActivityEvent {
  id: string;
  eventType: string;
  /** Linha de apoio: paciente, canal, profissional. */
  detail?: React.ReactNode;
  /** Momento do evento, já formatado. */
  timestamp: string;
  /** Valor completo para o atributo `datetime` do `<time>`. */
  isoTimestamp?: string;
}

/**
 * Linha do tempo de auditoria. Compacta de propósito: é apoio, não a atração
 * principal da tela.
 */
export function ActivityTimeline({
  events,
  className,
}: {
  events: ActivityEvent[];
  className?: string;
}) {
  if (events.length === 0) return null;

  return (
    <ol className={cn("space-y-0", className)}>
      {events.map((event, index) => {
        const config = EVENT[event.eventType];
        const Icon = config?.icon ?? Activity;
        const isLast = index === events.length - 1;

        return (
          <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Fio que liga os eventos. Puramente decorativo. */}
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-px bg-border"
              />
            )}
            <span
              aria-hidden
              className={cn(
                "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full ring-4 ring-surface",
                config?.tone ?? "bg-secondary text-foreground-secondary"
              )}
            >
              <Icon size={14} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-label font-medium text-foreground">
                {config?.label ?? event.eventType}
              </p>
              {event.detail && (
                <p className="truncate text-caption text-muted-foreground">
                  {event.detail}
                </p>
              )}
              <time
                dateTime={event.isoTimestamp}
                className="text-caption tabular-nums text-muted-foreground"
              >
                {event.timestamp}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
