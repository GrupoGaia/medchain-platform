import { useId } from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { colors } from "@medchain/ui-tokens";
import { Text } from "./text";

type Props = TextInputProps & {
  label: string;
  /** Texto de apoio abaixo do campo. */
  hint?: string;
  /** Mensagem de erro. Substitui a dica e marca o campo como inválido. */
  error?: string;
  className?: string;
};

/**
 * Campo de formulário.
 *
 * A borda usa `border-control`, o único cinza da escala com 3:1 contra a
 * superfície — o contorno do campo precisa ser perceptível por si só
 * (WCAG 2.2, SC 1.4.11). O erro entra como `accessibilityLabel` do campo para
 * que o leitor de tela leia a falha junto com o rótulo, e não numa linha solta
 * mais adiante.
 */
export function Field({ label, hint, error, className, ...props }: Props) {
  const id = useId();
  const describedBy = error ?? hint;

  return (
    <View className={`gap-1.5 ${className ?? ""}`.trim()}>
      <Text nativeID={`${id}-label`} className="text-label font-medium text-foreground">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={error ? `${label}. Erro: ${error}` : label}
        accessibilityLabelledBy={`${id}-label`}
        accessibilityHint={hint}
        placeholderTextColor={colors.semantic.textDisabled}
        className={`min-h-touch rounded-lg border px-3 py-3 text-body text-foreground ${
          error ? "border-danger bg-danger-subtle" : "border-border-control bg-surface"
        }`}
        {...props}
      />
      {describedBy ? (
        <Text
          className={`text-caption ${
            error ? "font-medium text-danger" : "text-foreground-tertiary"
          }`}
        >
          {describedBy}
        </Text>
      ) : null}
    </View>
  );
}
