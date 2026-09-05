import type { Config } from "tailwindcss";
import { colors, typography, radius } from "@medchain/ui-tokens";

// Os papéis semânticos são os mesmos do portal (ver apps/web/tailwind.config.ts):
// as duas pontas precisam nomear a mesma cor do mesmo jeito, senão "acesso
// ativo" acaba com um verde no app e outro no portal.
//
// React Native não tem unidade relativa, então a escala tipográfica sai em px,
// convertida dos mesmos tokens que o portal usa em rem.
function type(role: keyof typeof typography): [string, string] {
  const style = typography[role];
  return [`${style.size}px`, `${style.lineHeight}px`];
}

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Escalas cruas. Continuam expostas porque o app as consome também em
        // prop de cor de ícone, onde não existe classe do Tailwind.
        brand: colors.brand,
        alert: colors.alert,
        neutral: colors.neutral,

        // Papéis semânticos.
        background: colors.semantic.background,
        surface: {
          DEFAULT: colors.semantic.surface,
          subtle: colors.semantic.surfaceSubtle,
          raised: colors.semantic.surfaceRaised,
          inverse: colors.semantic.surfaceInverse,
        },
        border: {
          DEFAULT: colors.semantic.border,
          subtle: colors.semantic.borderSubtle,
          strong: colors.semantic.borderStrong,
          control: colors.semantic.borderControl,
        },
        foreground: {
          DEFAULT: colors.semantic.textPrimary,
          secondary: colors.semantic.textSecondary,
          tertiary: colors.semantic.textTertiary,
          inverse: colors.semantic.textInverse,
          disabled: colors.semantic.textDisabled,
        },
        interactive: {
          DEFAULT: colors.semantic.interactive,
          hover: colors.semantic.interactiveHover,
          subtle: colors.semantic.interactiveSubtle,
          border: colors.semantic.interactiveBorder,
        },
        success: {
          DEFAULT: colors.status.success.fg,
          solid: colors.status.success.solid,
          subtle: colors.status.success.subtle,
          border: colors.status.success.border,
        },
        warning: {
          DEFAULT: colors.status.warning.fg,
          solid: colors.status.warning.solid,
          subtle: colors.status.warning.subtle,
          border: colors.status.warning.border,
        },
        danger: {
          DEFAULT: colors.status.danger.fg,
          solid: colors.status.danger.solid,
          subtle: colors.status.danger.subtle,
          border: colors.status.danger.border,
        },
        info: {
          DEFAULT: colors.status.info.fg,
          solid: colors.status.info.solid,
          subtle: colors.status.info.subtle,
          border: colors.status.info.border,
        },
      },

      fontSize: {
        display: type("display"),
        "page-title": type("pageTitle"),
        "section-title": type("sectionTitle"),
        "card-title": type("cardTitle"),
        body: type("body"),
        "body-sm": type("bodySmall"),
        label: type("label"),
        caption: type("caption"),
        overline: type("overline"),
      },

      // Os nomes à esquerda são os do Tailwind; os valores vêm da escala de
      // raio dos tokens. O mapeamento é o mesmo do portal, então
      // `rounded-lg` é controle e `rounded-xl` é superfície nas duas pontas.
      borderRadius: {
        sm: radius.xs,
        md: radius.sm,
        lg: radius.md,
        xl: radius.lg,
        "2xl": radius.xl,
        "3xl": radius["2xl"],
        full: radius.full,
      },

      spacing: {
        // Alvo mínimo de toque. Todo controle tocável do app parte daqui.
        touch: "44px",
      },

      // Em React Native o negrito não é sintetizado a partir de um arquivo só,
      // então cada peso aponta para o arquivo correspondente da Inter. Os nomes
      // batem com as classes de peso do Tailwind, que emite as duas regras para
      // a mesma classe: font-bold recebe a família e o peso juntos.
      fontFamily: {
        sans: ["Inter_400Regular"],
        medium: ["Inter_500Medium"],
        semibold: ["Inter_600SemiBold"],
        bold: ["Inter_700Bold"],
      },
    },
  },
  plugins: [],
};

export default config;
