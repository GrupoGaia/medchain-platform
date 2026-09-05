// Hierarquia tipográfica do produto. Cada papel tem tamanho, entrelinha, peso
// e ajuste de tracking fechados, para que uma mesma informação tenha o mesmo
// peso visual no portal e no app.
//
// Os tamanhos vão em rem no web (respeita o zoom do navegador) e em px no
// mobile, onde não existe unidade relativa equivalente.

export interface TypeStyle {
  /** Tamanho em px. O web converte para rem dividindo por 16. */
  size: number;
  /** Entrelinha em px. */
  lineHeight: number;
  weight: 400 | 500 | 600 | 700;
  /** Tracking em em. Negativo aperta títulos grandes. */
  tracking: number;
}

export const typography = {
  // Só a manchete da página pública. Dentro do produto o maior papel é o
  // `display`: título de ferramenta de trabalho não compete com o conteúdo.
  hero: { size: 44, lineHeight: 50, weight: 600, tracking: -0.025 },
  display: { size: 30, lineHeight: 38, weight: 600, tracking: -0.02 },
  pageTitle: { size: 22, lineHeight: 30, weight: 600, tracking: -0.015 },
  sectionTitle: { size: 17, lineHeight: 24, weight: 600, tracking: -0.01 },
  cardTitle: { size: 15, lineHeight: 22, weight: 600, tracking: -0.005 },
  body: { size: 14, lineHeight: 22, weight: 400, tracking: 0 },
  bodySmall: { size: 13, lineHeight: 20, weight: 400, tracking: 0 },
  label: { size: 13, lineHeight: 18, weight: 500, tracking: 0 },
  caption: { size: 12, lineHeight: 16, weight: 500, tracking: 0 },
  overline: { size: 11, lineHeight: 16, weight: 600, tracking: 0.06 },
} as const satisfies Record<string, TypeStyle>;

export type TypographyRole = keyof typeof typography;

export const fontFamily = {
  sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
  mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
};
