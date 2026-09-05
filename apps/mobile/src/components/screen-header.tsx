import { Pressable, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@medchain/ui-tokens";
import { Text } from "./text";

type Props = {
  title: string;
  subtitle?: string;
  /** Conteúdo à direita: avatar, contador, ação. */
  trailing?: React.ReactNode;
  onBack?: () => void;
  className?: string;
};

/**
 * Cabeçalho de tela. O título entra como header para o leitor de tela, o que
 * dá a esta tela o mesmo ponto de entrada que o `<h1>` tem no portal.
 */
export function ScreenHeader({
  title,
  subtitle,
  trailing,
  onBack,
  className,
}: Props) {
  return (
    <View className={`mb-5 ${className ?? ""}`.trim()}>
      {onBack && (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={12}
          className="mb-3 h-touch flex-row items-center gap-1.5 self-start pr-3"
        >
          <ArrowLeft size={18} color={colors.semantic.textSecondary} />
          <Text className="text-label font-medium text-foreground-secondary">
            Voltar
          </Text>
        </Pressable>
      )}

      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text
            accessibilityRole="header"
            className="text-page-title font-bold text-foreground"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-1 text-body-sm text-foreground-tertiary">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing}
      </View>
    </View>
  );
}
