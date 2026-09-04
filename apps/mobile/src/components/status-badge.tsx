import { View } from "react-native";
import {
  ShieldCheck,
  Clock,
  ShieldOff,
  ShieldX,
  CircleAlert,
  type LucideIcon,
} from "lucide-react-native";
import { colors } from "@medchain/ui-tokens";
import { Text } from "./text";

export type StatusTone =
  | "active"
  | "pending"
  | "expired"
  | "revoked"
  | "denied";

// Ícone + texto + cor. Os três juntos, sempre: quem não distingue as cores
// continua lendo o estado pelo ícone e pelo rótulo. É a mesma regra e o mesmo
// vocabulário do portal (apps/web/components/medchain/status-badge.tsx).
const TONE: Record<
  StatusTone,
  { container: string; label: string; icon: LucideIcon; color: string; defaultLabel: string }
> = {
  active: {
    container: "bg-success-subtle border-success-border",
    label: "text-success",
    icon: ShieldCheck,
    color: colors.status.success.fg,
    defaultLabel: "Ativo",
  },
  pending: {
    container: "bg-warning-subtle border-warning-border",
    label: "text-warning",
    icon: Clock,
    color: colors.status.warning.fg,
    defaultLabel: "Pendente",
  },
  expired: {
    container: "bg-surface-subtle border-border",
    label: "text-foreground-secondary",
    icon: ShieldOff,
    color: colors.semantic.textSecondary,
    defaultLabel: "Expirado",
  },
  revoked: {
    container: "bg-surface-subtle border-border",
    label: "text-foreground-secondary",
    icon: ShieldX,
    color: colors.semantic.textSecondary,
    defaultLabel: "Revogado",
  },
  denied: {
    container: "bg-danger-subtle border-danger-border",
    label: "text-danger",
    icon: CircleAlert,
    color: colors.status.danger.fg,
    defaultLabel: "Negado",
  },
};

export function StatusBadge({
  tone,
  label,
  className,
}: {
  tone: StatusTone;
  label?: string;
  className?: string;
}) {
  const style = TONE[tone];
  const Icon = style.icon;

  return (
    <View
      className={`flex-row items-center gap-1.5 self-start rounded-md border px-2 py-1 ${
        style.container
      } ${className ?? ""}`.trim()}
    >
      <Icon size={13} color={style.color} />
      <Text className={`text-caption font-semibold ${style.label}`}>
        {label ?? style.defaultLabel}
      </Text>
    </View>
  );
}

export function toneForTokenStatus(status: string): StatusTone {
  if (status === "ACTIVE") return "active";
  if (status === "REVOKED") return "revoked";
  return "expired";
}
