import { View } from "react-native";
import { Text } from "./text";

type Props = {
  title: string;
  description?: string;
  /** Quantidade de itens da seção, mostrada ao lado do título. */
  count?: number;
  /** Ação à direita, como "ver tudo". */
  action?: React.ReactNode;
  className?: string;
};

/**
 * Título de seção. `accessibilityRole="header"` é o que permite ao leitor de
 * tela navegar de seção em seção, como faz com `<h2>` na web.
 */
export function SectionHeader({
  title,
  description,
  count,
  action,
  className,
}: Props) {
  return (
    <View
      className={`flex-row items-end justify-between gap-3 ${className ?? ""}`.trim()}
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            accessibilityRole="header"
            className="text-section-title font-semibold text-foreground"
          >
            {title}
          </Text>
          {typeof count === "number" && (
            <View className="rounded-md bg-surface-subtle border border-border px-1.5 py-0.5">
              <Text className="text-caption font-medium text-foreground-secondary">
                {count}
              </Text>
            </View>
          )}
        </View>
        {description ? (
          <Text className="mt-0.5 text-body-sm text-foreground-tertiary">
            {description}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}
