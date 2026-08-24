import { View, type ViewProps } from "react-native";

type Props = ViewProps & { className?: string };

export function Card({ className, ...props }: Props) {
  return (
    <View className={`rounded-2xl bg-white ${className ?? ""}`.trim()} {...props} />
  );
}
