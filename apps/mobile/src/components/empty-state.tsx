import { View, Image, type ImageSourcePropType } from "react-native";
import { Text } from "./text";

type Props = {
  title: string;
  description?: string;
  /** Ilustração da tela vazia. Tem prioridade sobre o ícone. */
  image?: ImageSourcePropType;
  /** Alternativa enxuta para os espaços pequenos, onde a ilustração não cabe. */
  icon?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  image,
  icon,
  className,
}: Props) {
  return (
    <View className={`items-center px-6 ${className ?? ""}`.trim()}>
      {image ? (
        <Image
          source={image}
          className="h-32 w-40"
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          // A ilustração é decorativa: quem usa leitor de tela ouve o título abaixo.
          accessible={false}
        />
      ) : (
        icon
      )}
      <Text className="mt-3 text-base font-medium text-gray-500">{title}</Text>
      {description ? (
        <Text className="mt-1 text-center text-sm text-gray-400">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
