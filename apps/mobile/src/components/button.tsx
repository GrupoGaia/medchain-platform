import { ActivityIndicator, Pressable, View } from "react-native";
import { colors } from "@medchain/ui-tokens";
import { Text } from "./text";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "destructive"
  | "ghost";

type Size = "sm" | "default" | "lg";

// A variante primária usa brand-700 e não brand-600: é o tom mais claro da
// marca que sustenta texto branco em cima com 4,5:1.
const VARIANT: Record<
  ButtonVariant,
  { container: string; label: string; spinner: string }
> = {
  primary: {
    container: "bg-interactive active:bg-interactive-hover border-interactive",
    label: "text-foreground-inverse",
    spinner: "#FFFFFF",
  },
  secondary: {
    container: "bg-interactive-subtle active:bg-interactive-border border-interactive-border",
    label: "text-interactive",
    spinner: colors.semantic.interactive,
  },
  outline: {
    container: "bg-surface active:bg-surface-subtle border-border-strong",
    label: "text-foreground",
    spinner: colors.semantic.textPrimary,
  },
  destructive: {
    container: "bg-surface active:bg-danger-subtle border-danger-border",
    label: "text-danger",
    spinner: colors.status.danger.fg,
  },
  ghost: {
    container: "bg-transparent active:bg-surface-subtle border-transparent",
    label: "text-foreground-secondary",
    spinner: colors.semantic.textSecondary,
  },
};

// Toda altura fica igual ou acima do alvo mínimo de toque de 44px recomendado
// pela WCAG 2.2 (SC 2.5.8).
const SIZE: Record<Size, { container: string; label: string }> = {
  sm: { container: "h-11 px-3.5", label: "text-label" },
  default: { container: "h-12 px-4", label: "text-body" },
  lg: { container: "h-14 px-5", label: "text-body" },
};

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: Size;
  /** Ícone à esquerda do rótulo. Decorativo: o rótulo já diz a ação. */
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Sobrescreve o rótulo lido pelo leitor de tela quando o texto é ambíguo. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  className?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "default",
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  accessibilityLabel,
  accessibilityHint,
  className,
}: Props) {
  const style = VARIANT[variant];
  const dimensions = SIZE[size];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      className={`flex-row items-center justify-center gap-2 rounded-lg border ${
        style.container
      } ${dimensions.container} ${fullWidth ? "w-full" : "self-start"} ${
        inactive ? "opacity-50" : ""
      } ${className ?? ""}`.trim()}
    >
      {loading ? (
        <ActivityIndicator size="small" color={style.spinner} />
      ) : (
        icon && <View>{icon}</View>
      )}
      <Text className={`font-semibold ${dimensions.label} ${style.label}`}>
        {label}
      </Text>
    </Pressable>
  );
}
