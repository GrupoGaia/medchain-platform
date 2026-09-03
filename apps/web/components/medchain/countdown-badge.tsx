import { Clock, ShieldCheck } from "lucide-react";
import { formatMinutesRemaining } from "@medchain/domain";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CountdownBadgeProps {
  minutesRemaining: number;
  totalMinutes: number;
  className?: string;
}

export function CountdownBadge({ minutesRemaining, totalMinutes, className }: CountdownBadgeProps) {
  const safeMinutes = Math.max(0, minutesRemaining);
  const progress = Math.min(100, Math.round((safeMinutes / Math.max(1, totalMinutes)) * 100));

  const isWarning = safeMinutes <= 30 && safeMinutes > 15;
  const isCritical = safeMinutes <= 15;

  const textColor = isCritical
    ? "text-rose-700"
    : isWarning
    ? "text-amber-700"
    : "text-teal-700";

  const barColor = isCritical
    ? "bg-rose-500"
    : isWarning
    ? "bg-amber-500"
    : "bg-teal-500";

  const trackColor = isCritical
    ? "bg-rose-100"
    : isWarning
    ? "bg-amber-100"
    : "bg-teal-100";

  return (
    <div className={cn("w-full max-w-[180px] space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className={cn("flex items-center gap-1 font-medium", textColor)}>
          <Clock size={12} />
          {formatMinutesRemaining(safeMinutes)}
        </span>
      </div>
      <div className={cn("h-1.5 w-full overflow-hidden rounded-full", trackColor)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface CountdownRingProps {
  minutesRemaining: number;
  totalMinutes: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CountdownRing({
  minutesRemaining,
  totalMinutes,
  size = 76,
  strokeWidth = 6,
  className,
}: CountdownRingProps) {
  const safeMinutes = Math.max(0, minutesRemaining);
  const progress = Math.min(100, Math.max(0, Math.round((safeMinutes / Math.max(1, totalMinutes)) * 100)));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isWarning = safeMinutes <= 30 && safeMinutes > 15;
  const isCritical = safeMinutes <= 15;

  const strokeColor = isCritical
    ? "#F43F5E" // rose-500
    : isWarning
    ? "#F59E0B" // amber-500
    : "#0D9488"; // teal-600

  const trackColor = isCritical
    ? "#FFE4E6" // rose-100
    : isWarning
    ? "#FEF3C7" // amber-100
    : "#CCFBF1"; // teal-100

  const textColor = isCritical
    ? "text-rose-700"
    : isWarning
    ? "text-amber-700"
    : "text-teal-800";

  return (
    <div className={cn("relative flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn("text-base font-bold tabular-nums leading-none tracking-tight", textColor)}>
          {safeMinutes}m
        </span>
        <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          restantes
        </span>
      </div>
    </div>
  );
}

interface CountdownCardProps {
  minutesRemaining: number;
  totalMinutes: number;
  expiresAtFormatted?: string;
  scopeLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export function CountdownCard({
  minutesRemaining,
  totalMinutes,
  expiresAtFormatted,
  scopeLabel,
  children,
  className,
}: CountdownCardProps) {
  const safeMinutes = Math.max(0, minutesRemaining);
  const isWarning = safeMinutes <= 30 && safeMinutes > 15;
  const isCritical = safeMinutes <= 15;

  const cardBorder = isCritical
    ? "border-rose-200 bg-gradient-to-r from-rose-50/70 via-white to-white"
    : isWarning
    ? "border-amber-200 bg-gradient-to-r from-amber-50/70 via-white to-white"
    : "border-teal-200 bg-gradient-to-r from-teal-50/70 via-white to-white";

  return (
    <Card className={cn("overflow-hidden border shadow-sm transition-all", cardBorder, className)}>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <CountdownRing minutesRemaining={minutesRemaining} totalMinutes={totalMinutes} />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <ShieldCheck size={16} className="text-teal-600" />
                Acesso Temporário Ativo
              </span>
              {scopeLabel && (
                <span className="rounded-md bg-teal-100/70 px-2 py-0.5 text-xs font-medium text-teal-800">
                  {scopeLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Sessão autorizada com soberania do paciente. {expiresAtFormatted ? `Expira às ${expiresAtFormatted}.` : `Expira em ${formatMinutesRemaining(safeMinutes)}.`}
            </p>
          </div>
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </CardContent>
    </Card>
  );
}

