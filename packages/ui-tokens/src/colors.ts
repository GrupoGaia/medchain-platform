// Paleta única do MedChain. O portal web converte estes valores para variáveis
// CSS em apps/web/app/globals.css e o app mobile os consome direto no
// tailwind.config.ts. lib/theme-tokens.test.ts falha se as duas fontes saírem
// de sincronia.
//
// Contraste: os tons marcados como texto foram escolhidos para passar em
// WCAG 2.2 AA (4.5:1) sobre superfície branca ou sobre o canvas do app.
// Os tons "solid" servem para preenchimento e ícone, onde o mínimo é 3:1.

export const colors = {
  // Identidade. brand-600 é a cor da marca; brand-700 é o menor tom que
  // sustenta texto branco em cima (5.47:1), então é ele quem pinta botão
  // primário e link, não o 600.
  brand: {
    "50": "#F0FDFA",
    "100": "#CCFBF1",
    "200": "#99F6E4",
    "300": "#5EEAD4",
    "400": "#2DD4BF",
    "500": "#14B8A6",
    "600": "#0D9488",
    "700": "#0F766E",
    "800": "#115E59",
    "900": "#134E4A",
  },

  // Mantido porque o app mobile já importa estas chaves. Os novos ecrãs usam
  // `status`, que separa o tom de texto do tom de preenchimento.
  alert: {
    red: "#DC2626",
    redLight: "#FEF2F2",
    amber: "#D97706",
    amberLight: "#FFFBEB",
    green: "#16A34A",
    greenLight: "#F0FDF4",
    info: "#6366F1",
    infoLight: "#EEF2FF",
  },

  // Rampa neutra completa. As chaves nomeadas (background, surface, border...)
  // continuam existindo porque o mobile já as usa como `neutral.muted` e afins.
  neutral: {
    "0": "#FFFFFF",
    "25": "#FCFCFD",
    "50": "#F9FAFB",
    "75": "#F7F8FA",
    "100": "#F3F4F6",
    "200": "#E5E7EB",
    "300": "#D1D5DB",
    "400": "#9CA3AF",
    "500": "#6B7280",
    "600": "#4B5563",
    "700": "#374151",
    "800": "#1F2937",
    "900": "#111827",
    "950": "#030712",

    background: "#F9FAFB",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    borderSubtle: "#F3F4F6",
    muted: "#9CA3AF",
    subtle: "#6B7280",
    default: "#374151",
    strong: "#111827",
  },

  // Estado semântico. `fg` é o único tom aprovado para texto e ícone pequeno
  // sobre fundo claro; `solid` preenche; `subtle` é o fundo tingido; `border`
  // delimita esse fundo.
  status: {
    success: {
      fg: "#15803D",
      solid: "#16A34A",
      subtle: "#F0FDF4",
      border: "#BBF7D0",
    },
    warning: {
      fg: "#B45309",
      solid: "#D97706",
      subtle: "#FFFBEB",
      border: "#FDE68A",
    },
    danger: {
      fg: "#B91C1C",
      solid: "#DC2626",
      subtle: "#FEF2F2",
      border: "#FECACA",
    },
    info: {
      fg: "#4338CA",
      solid: "#6366F1",
      subtle: "#EEF2FF",
      border: "#C7D2FE",
    },
  },

  // Papéis de superfície, texto e interação. É esta camada que as telas devem
  // consultar; a rampa acima existe para alimentá-la.
  semantic: {
    background: "#F7F8FA",
    surface: "#FFFFFF",
    surfaceSubtle: "#F9FAFB",
    surfaceRaised: "#FFFFFF",
    surfaceInverse: "#111827",

    border: "#E5E7EB",
    borderSubtle: "#F3F4F6",
    borderStrong: "#D1D5DB",
    // Contorno de campo, caixa e outro controle de formulário. Precisa de 3:1
    // contra a superfície (WCAG 2.2, SC 1.4.11), o que a borda decorativa
    // acima não alcança.
    borderControl: "#858E9F",

    textPrimary: "#111827",
    textSecondary: "#4B5563",
    textTertiary: "#6B7280",
    textInverse: "#FFFFFF",
    textDisabled: "#9CA3AF",

    interactive: "#0F766E",
    interactiveHover: "#115E59",
    interactiveSubtle: "#F0FDFA",
    interactiveBorder: "#CCFBF1",
    focus: "#0D9488",
    disabled: "#F3F4F6",
  },
} as const;

export type Colors = typeof colors;
