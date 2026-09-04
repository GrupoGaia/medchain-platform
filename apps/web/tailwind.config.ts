import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import { radius } from "@medchain/ui-tokens";

// A paleta do portal vem das variáveis CSS do globals.css, derivadas de
// packages/ui-tokens. Ver lib/theme-tokens.test.ts, que falha se as duas fontes
// saírem de sincronia.
//
// As escalas abaixo são fechadas de propósito: raio, elevação e tipografia têm
// poucos degraus para que uma tela nova não consiga destoar sem sair do
// sistema.

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Superfície ────────────────────────────────────────────────────
        background: "hsl(var(--background) / <alpha-value>)",
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          subtle: "hsl(var(--surface-subtle) / <alpha-value>)",
          raised: "hsl(var(--surface-raised) / <alpha-value>)",
          inverse: "hsl(var(--surface-inverse) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },

        // ── Texto ─────────────────────────────────────────────────────────
        // `foreground` é o nível primário; `foreground-secondary` é o apoio;
        // `muted-foreground` é o terciário. Os três passam em AA.
        foreground: {
          DEFAULT: "hsl(var(--text-primary) / <alpha-value>)",
          secondary: "hsl(var(--text-secondary) / <alpha-value>)",
          inverse: "hsl(var(--text-inverse) / <alpha-value>)",
          disabled: "hsl(var(--text-disabled) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },

        // ── Bordas ────────────────────────────────────────────────────────
        border: {
          DEFAULT: "hsl(var(--border) / <alpha-value>)",
          subtle: "hsl(var(--border-subtle) / <alpha-value>)",
          strong: "hsl(var(--border-strong) / <alpha-value>)",
        },
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",

        // ── Marca e interação ─────────────────────────────────────────────
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          50: "hsl(var(--primary-50) / <alpha-value>)",
          100: "hsl(var(--primary-100) / <alpha-value>)",
          200: "hsl(var(--primary-200) / <alpha-value>)",
          300: "hsl(var(--primary-300) / <alpha-value>)",
          400: "hsl(var(--primary-400) / <alpha-value>)",
          500: "hsl(var(--primary-500) / <alpha-value>)",
          600: "hsl(var(--primary-600) / <alpha-value>)",
          700: "hsl(var(--primary-700) / <alpha-value>)",
          800: "hsl(var(--primary-800) / <alpha-value>)",
          900: "hsl(var(--primary-900) / <alpha-value>)",
        },
        interactive: {
          DEFAULT: "hsl(var(--interactive) / <alpha-value>)",
          hover: "hsl(var(--interactive-hover) / <alpha-value>)",
          subtle: "hsl(var(--interactive-subtle) / <alpha-value>)",
          border: "hsl(var(--interactive-border) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        disabled: "hsl(var(--disabled) / <alpha-value>)",

        // ── Estado ────────────────────────────────────────────────────────
        // O tom sem sufixo é o de texto e ícone. `solid` preenche, `subtle` é
        // o fundo tingido e `border` delimita esse fundo.
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          solid: "hsl(var(--success-solid) / <alpha-value>)",
          subtle: "hsl(var(--success-subtle) / <alpha-value>)",
          border: "hsl(var(--success-border) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          solid: "hsl(var(--warning-solid) / <alpha-value>)",
          subtle: "hsl(var(--warning-subtle) / <alpha-value>)",
          border: "hsl(var(--warning-border) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "hsl(var(--danger) / <alpha-value>)",
          solid: "hsl(var(--danger-solid) / <alpha-value>)",
          subtle: "hsl(var(--danger-subtle) / <alpha-value>)",
          border: "hsl(var(--danger-border) / <alpha-value>)",
        },
        info: {
          DEFAULT: "hsl(var(--info) / <alpha-value>)",
          solid: "hsl(var(--info-solid) / <alpha-value>)",
          subtle: "hsl(var(--info-subtle) / <alpha-value>)",
          border: "hsl(var(--info-border) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },

        // ── Barra lateral ─────────────────────────────────────────────────
        sidebar: {
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground":
            "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground":
            "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
        },
      },

      // Raio contido: controle em 8px (`rounded-lg`), superfície em 10px
      // (`rounded-xl`), e 16px só onde a forma realmente pede. Os nomes à
      // esquerda são os do Tailwind; os valores vêm da escala dos tokens, e o
      // mapeamento é o mesmo do app mobile.
      borderRadius: {
        sm: radius.xs,
        md: radius.sm,
        lg: "var(--radius)",
        xl: radius.lg,
        "2xl": radius.xl,
        "3xl": radius["2xl"],
      },

      // Três elevações. Cartão em lista fica sem sombra: a borda já separa.
      boxShadow: {
        surface: "var(--shadow-surface)",
        floating: "var(--shadow-floating)",
        modal: "var(--shadow-modal)",
      },

      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },

      // Papéis tipográficos. Usar estes em vez de text-sm/text-lg mantém a
      // mesma informação com o mesmo peso em todas as telas.
      fontSize: {
        display: ["1.875rem", { lineHeight: "2.375rem", letterSpacing: "-0.02em", fontWeight: "600" }],
        "page-title": ["1.375rem", { lineHeight: "1.875rem", letterSpacing: "-0.015em", fontWeight: "600" }],
        "section-title": ["1.0625rem", { lineHeight: "1.5rem", letterSpacing: "-0.01em", fontWeight: "600" }],
        "card-title": ["0.9375rem", { lineHeight: "1.375rem", letterSpacing: "-0.005em", fontWeight: "600" }],
        body: ["0.875rem", { lineHeight: "1.375rem" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.25rem" }],
        label: ["0.8125rem", { lineHeight: "1.125rem", fontWeight: "500" }],
        caption: ["0.75rem", { lineHeight: "1rem" }],
        overline: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.06em", fontWeight: "600" }],
      },

      spacing: {
        header: "3.5rem",
        sidebar: "16rem",
        touch: "2.75rem",
      },

      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },

      transitionTimingFunction: {
        standard: "var(--ease-standard)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [forms, typography],
};

export default config;
