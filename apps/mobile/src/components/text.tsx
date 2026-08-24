import { Text as RNText, type TextProps } from "react-native";
import { resolveTextClassName } from "./text-class";

type Props = TextProps & { className?: string };

/**
 * Texto do app. Serve para garantir a Inter em todo lugar: no React Native o
 * Text não herda estilo do container, então cada texto precisa declarar a fonte.
 */
export function Text({ className, ...props }: Props) {
  return <RNText className={resolveTextClassName(className)} {...props} />;
}
