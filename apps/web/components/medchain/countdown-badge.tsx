import { Clock } from "lucide-react";
import { formatMinutesRemaining } from "@medchain/domain";

interface CountdownBadgeProps {
  minutesRemaining: number;
  totalMinutes?: number;
}

export function CountdownBadge({ minutesRemaining, totalMinutes = 60 }: CountdownBadgeProps) {
  const safeMinutes = Math.max(0, minutesRemaining);
  const progress = Math.min(100, Math.round((safeMinutes / totalMinutes) * 100));
  const color =
    progress > 50 ? "bg-emerald-500" : progress > 25 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="w-full max-w-[180px] space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 font-medium text-amber-700">
          <Clock size={12} />
          {formatMinutesRemaining(safeMinutes)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-100">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
