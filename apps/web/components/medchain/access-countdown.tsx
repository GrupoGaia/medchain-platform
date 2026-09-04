import { Clock, TimerReset, AlarmClock } from "lucide-react";
import { formatMinutesRemaining } from "@medchain/domain";
import { cn } from "@/lib/utils";

export type AccessUrgency = "normal" | "warning" | "critical";

/**
 * Faixas de urgência do token. Trinta minutos é o ponto em que ainda dá para
 * concluir um atendimento; quinze é o ponto em que o médico precisa decidir se
 * pede renovação.
 */
export function urgencyFor(minutesRemaining: number): AccessUrgency {
  if (minutesRemaining <= 15) return "critical";
  if (minutesRemaining <= 30) return "warning";
  return "normal";
}

const URGENCY = {
  normal: {
    text: "text-primary-800",
    bar: "bg-primary-600",
    track: "bg-primary-100",
    icon: Clock,
  },
  warning: {
    text: "text-warning",
    bar: "bg-warning-solid",
    track: "bg-warning-border",
    icon: TimerReset,
  },
  critical: {
    text: "text-danger",
    bar: "bg-danger-solid",
    track: "bg-danger-border",
    icon: AlarmClock,
  },
} as const;

interface AccessCountdownProps {
  minutesRemaining: number;
  totalMinutes: number;
  /** `bar` mostra a proporção restante; `inline` cabe numa linha de tabela. */
  variant?: "bar" | "inline";
  className?: string;
}

/**
 * Tempo restante de um acesso temporário. O texto sempre diz o tempo por
 * extenso: a barra e a cor apenas reforçam, nunca são a única informação.
 */
export function AccessCountdown({
  minutesRemaining,
  totalMinutes,
  variant = "bar",
  className,
}: AccessCountdownProps) {
  const safeMinutes = Math.max(0, minutesRemaining);
  const urgency = urgencyFor(safeMinutes);
  const style = URGENCY[urgency];
  const Icon = style.icon;

  const percent = Math.min(
    100,
    Math.max(2, Math.round((safeMinutes / Math.max(1, totalMinutes)) * 100))
  );

  if (variant === "inline") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-label font-medium tabular-nums",
          style.text,
          className
        )}
      >
        <Icon size={14} aria-hidden />
        {formatMinutesRemaining(safeMinutes)} restantes
      </span>
    );
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <p
        className={cn(
          "flex items-center gap-1.5 text-label font-medium tabular-nums",
          style.text
        )}
      >
        <Icon size={14} aria-hidden />
        {formatMinutesRemaining(safeMinutes)} restantes
      </p>
      <div
        aria-hidden
        className={cn("h-1 w-full overflow-hidden rounded-full", style.track)}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-slow ease-standard",
            style.bar
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
