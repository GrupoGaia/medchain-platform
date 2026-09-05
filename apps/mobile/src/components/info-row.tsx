import { View } from "react-native";
import { Text } from "./text";

type Props = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  /** Destaca o valor que não pode passar despercebido, como alergia. */
  emphasis?: boolean;
};

/**
 * Par rótulo/valor dos dados clínicos. O leitor de tela recebe os dois juntos
 * ("Alergias, Penicilina"), e não duas linhas desconexas.
 */
export function InfoRow({ label, value, icon, emphasis }: Props) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className="flex-row items-start gap-3 py-3"
    >
      {icon ? (
        <View
          className={`h-7 w-7 items-center justify-center rounded-md ${
            emphasis ? "bg-warning-subtle" : "bg-surface-subtle"
          }`}
        >
          {icon}
        </View>
      ) : null}
      <View className="flex-1">
        <Text className="text-caption text-foreground-tertiary">{label}</Text>
        <Text
          className={`text-body ${
            emphasis ? "font-semibold text-foreground" : "text-foreground-secondary"
          }`}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
