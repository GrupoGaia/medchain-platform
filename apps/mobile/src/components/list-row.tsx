import { Pressable, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@medchain/ui-tokens";
import { Text } from "./text";

type Props = {
  title: string;
  subtitle?: string;
  /** Terceira linha, para data ou origem do item. */
  detail?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Mostra a seta de avanço. Só quando o toque leva a outra tela. */
  chevron?: boolean;
  className?: string;
};

/**
 * Linha de lista. Serve documento, contato e evento de auditoria com a mesma
 * anatomia, que é o que faz três telas diferentes parecerem o mesmo produto.
 *
 * A altura mínima é o alvo de toque de 44px; o rótulo acessível junta título e
 * apoio numa frase só, senão o leitor de tela anuncia três fragmentos soltos.
 */
export function ListRow({
  title,
  subtitle,
  detail,
  leading,
  trailing,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  chevron = false,
  className,
}: Props) {
  const content = (
    <View className="flex-row items-center gap-3">
      {leading}
      <View className="min-w-0 flex-1">
        <Text
          numberOfLines={1}
          className="text-body font-semibold text-foreground"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="text-body-sm text-foreground-secondary">
            {subtitle}
          </Text>
        ) : null}
        {detail ? (
          <Text numberOfLines={1} className="text-caption text-foreground-tertiary">
            {detail}
          </Text>
        ) : null}
      </View>
      {trailing}
      {chevron && (
        <ChevronRight size={18} color={colors.semantic.textDisabled} />
      )}
    </View>
  );

  const base = `min-h-touch justify-center px-4 py-3 ${className ?? ""}`.trim();

  if (!onPress) {
    return <View className={base}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? [title, subtitle, detail].filter(Boolean).join(", ")
      }
      accessibilityHint={accessibilityHint}
      className={`${base} active:bg-surface-subtle`}
    >
      {content}
    </Pressable>
  );
}

/** Fio entre linhas de uma mesma lista. */
export function RowDivider() {
  return <View className="ml-4 h-px bg-border-subtle" />;
}
