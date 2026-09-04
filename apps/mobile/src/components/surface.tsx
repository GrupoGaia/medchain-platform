import { View, type ViewProps } from "react-native";

type Tone = "default" | "subtle" | "success" | "warning" | "danger" | "brand";

const TONE: Record<Tone, string> = {
  default: "bg-surface border-border",
  subtle: "bg-surface-subtle border-border",
  success: "bg-success-subtle border-success-border",
  warning: "bg-warning-subtle border-warning-border",
  danger: "bg-danger-subtle border-danger-border",
  brand: "bg-interactive-subtle border-interactive-border",
};

type Props = ViewProps & {
  className?: string;
  tone?: Tone;
  /** Desliga o respiro interno para conteúdo que controla o próprio padding. */
  padded?: boolean;
};

/**
 * Superfície do app: fundo, borda fina e raio contido.
 *
 * Não leva sombra. Em React Native a sombra depende de `elevation` no Android e
 * de `shadow*` no iOS, e o resultado nunca é o mesmo nas duas plataformas; a
 * borda separa igualmente bem e não muda de aparência entre aparelhos.
 */
export function Surface({
  className,
  tone = "default",
  padded = true,
  ...props
}: Props) {
  return (
    <View
      className={`rounded-xl border ${TONE[tone]} ${padded ? "p-4" : ""} ${
        className ?? ""
      }`.trim()}
      {...props}
    />
  );
}
