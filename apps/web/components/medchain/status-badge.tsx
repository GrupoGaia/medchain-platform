import {
  ShieldCheck,
  Clock,
  ShieldOff,
  ShieldX,
  CircleAlert,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone =
  | "active"
  | "pending"
  | "expired"
  | "revoked"
  | "denied"
  | "neutral";

// Ícone + texto + cor. Os três juntos, sempre: quem não distingue as cores
// continua lendo o estado pelo ícone e pelo rótulo.
const TONE: Record<
  StatusTone,
  {
    variant: React.ComponentProps<typeof Badge>["variant"];
    icon: LucideIcon;
    defaultLabel: string;
  }
> = {
  active: { variant: "success", icon: ShieldCheck, defaultLabel: "Ativo" },
  pending: { variant: "warning", icon: Clock, defaultLabel: "Pendente" },
  expired: { variant: "neutral", icon: ShieldOff, defaultLabel: "Expirado" },
  revoked: { variant: "neutral", icon: ShieldX, defaultLabel: "Revogado" },
  denied: { variant: "danger", icon: CircleAlert, defaultLabel: "Negado" },
  neutral: { variant: "neutral", icon: CircleCheck, defaultLabel: "—" },
};

interface StatusBadgeProps {
  tone: StatusTone;
  label?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatusBadge({
  tone,
  label,
  icon,
  className,
}: StatusBadgeProps) {
  const config = TONE[tone];
  const Icon = icon ?? config.icon;

  return (
    <Badge variant={config.variant} className={cn("gap-1", className)}>
      <Icon aria-hidden />
      {label ?? config.defaultLabel}
    </Badge>
  );
}

// Mapeia o status que vem do banco para o tom visual. Fica junto do badge
// porque é a mesma decisão: um status novo precisa de tom e ícone no mesmo
// lugar.
export function toneForTokenStatus(status: string): StatusTone {
  if (status === "ACTIVE") return "active";
  if (status === "REVOKED") return "revoked";
  return "expired";
}

export function toneForRequestStatus(status: string): StatusTone {
  if (status === "PENDING") return "pending";
  if (status === "APPROVED") return "active";
  if (status === "DENIED") return "denied";
  return "expired";
}
