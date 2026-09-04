import { View } from "react-native";
import { Clock, TimerReset, AlarmClock, type LucideIcon } from "lucide-react-native";
import { formatMinutesRemaining } from "@medchain/domain";
import { colors } from "@medchain/ui-tokens";
import { Text } from "./text";

export type AccessUrgency = "normal" | "warning" | "critical";

/**
 * Mesmas faixas do portal (apps/web/components/medchain/access-countdown.tsx):
 * trinta minutos ainda dá para concluir um atendimento, quinze é quando o
 * acesso precisa de decisão.
 */
export function urgencyFor(minutesRemaining: number): AccessUrgency {
  if (minutesRemaining <= 15) return "critical";
  if (minutesRemaining <= 30) return "warning";
  return "normal";
}

const URGENCY: Record<
  AccessUrgency,
  { text: string; bar: string; track: string; icon: LucideIcon; color: string }
> = {
  normal: {
    text: "text-interactive",
    bar: "bg-interactive",
    track: "bg-interactive-border",
    icon: Clock,
    color: colors.semantic.interactive,
  },
  warning: {
    text: "text-warning",
    bar: "bg-warning-solid",
    track: "bg-warning-border",
    icon: TimerReset,
    color: colors.status.warning.fg,
  },
  critical: {
    text: "text-danger",
    bar: "bg-danger-solid",
    track: "bg-danger-border",
    icon: AlarmClock,
    color: colors.status.danger.fg,
  },
};

/**
 * Tempo restante do acesso. O texto sempre diz o tempo por extenso; a barra e a
 * cor apenas reforçam.
 */
export function AccessCountdown({
  minutesRemaining,
  totalMinutes,
  showBar = true,
  className,
}: {
  minutesRemaining: number;
  totalMinutes: number;
  showBar?: boolean;
  className?: string;
}) {
  const safeMinutes = Math.max(0, minutesRemaining);
  const style = URGENCY[urgencyFor(safeMinutes)];
  const Icon = style.icon;
  const percent = Math.min(
    100,
    Math.max(2, Math.round((safeMinutes / Math.max(1, totalMinutes)) * 100))
  );

  return (
    <View className={`gap-1.5 ${className ?? ""}`.trim()}>
      <View className="flex-row items-center gap-1.5">
        <Icon size={14} color={style.color} />
        <Text className={`text-label font-semibold ${style.text}`}>
          {formatMinutesRemaining(safeMinutes)} restantes
        </Text>
      </View>
      {showBar && (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          className={`h-1 w-full overflow-hidden rounded-full ${style.track}`}
        >
          <View className={`h-full rounded-full ${style.bar}`} style={{ width: `${percent}%` }} />
        </View>
      )}
    </View>
  );
}
