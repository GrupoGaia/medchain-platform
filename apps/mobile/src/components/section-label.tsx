import { Text } from "./text";

// Cor por prop, e não por className: duas classes de cor na mesma string dependem
// da ordem em que o Tailwind emitiu as regras, que não é garantida aqui.
const TONE = {
  muted: "text-gray-400",
  warning: "text-amber-500",
} as const;

type Props = {
  children: React.ReactNode;
  tone?: keyof typeof TONE;
  className?: string;
};

export function SectionLabel({ children, tone = "muted", className }: Props) {
  return (
    <Text
      className={`mb-3 text-xs font-semibold uppercase tracking-wider ${
        TONE[tone]
      } ${className ?? ""}`.trim()}
    >
      {children}
    </Text>
  );
}
