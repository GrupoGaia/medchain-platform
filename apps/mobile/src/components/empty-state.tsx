import { View } from "react-native";
import { Text } from "./text";

type Props = {
  title: string;
  description?: string;
  /** Ícone pequeno, dentro de um disco neutro. */
  icon?: React.ReactNode;
  /** Ação de saída, quando existe um próximo passo claro. */
  action?: React.ReactNode;
  className?: string;
};

/**
 * Estado vazio: uma frase explicando por que não há nada e, quando existe, o
 * próximo passo. Sem ilustração ocupando a tela — em app de controle de dados
 * ela só empurra o conteúdo para baixo.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: Props) {
  return (
    <View
      className={`items-center rounded-xl border border-dashed border-border-strong bg-surface px-5 py-8 ${
        className ?? ""
      }`.trim()}
    >
      {icon ? (
        <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-surface-subtle">
          {icon}
        </View>
      ) : null}
      <Text className="text-center text-card-title font-semibold text-foreground">
        {title}
      </Text>
      {description ? (
        <Text className="mt-1 text-center text-body-sm text-foreground-tertiary">
          {description}
        </Text>
      ) : null}
      {action ? <View className="mt-4 w-full">{action}</View> : null}
    </View>
  );
}
