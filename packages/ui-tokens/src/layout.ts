// Raio, elevação, espaçamento e tempo de transição. São poucos valores de
// propósito: quanto menor a escala, mais difícil um ecrã destoar do resto.

// Raio contido. O teto é 16px, e só em elementos que realmente pedem (avatar,
// pílula de contagem). Cartão usa `lg`, controle usa `md`.
export const radius = {
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "10px",
  xl: "12px",
  "2xl": "16px",
  full: "9999px",
};

// Três elevações, e nada além disso. `surface` é quase imperceptível e serve
// para separar cartão do canvas; `floating` é dropdown e popover; `modal` é
// diálogo e sheet. Cartão em lista não recebe sombra: a borda basta.
export const shadow = {
  none: "none",
  surface: "0 1px 2px 0 rgb(16 24 40 / 0.04)",
  floating:
    "0 4px 12px -2px rgb(16 24 40 / 0.08), 0 2px 4px -2px rgb(16 24 40 / 0.04)",
  modal:
    "0 20px 40px -12px rgb(16 24 40 / 0.18), 0 4px 8px -4px rgb(16 24 40 / 0.06)",
};

// Escala de 4px. Os nomes cobrem só o que a escala padrão do Tailwind não tem.
export const spacing = {
  /** Alvo mínimo de toque recomendado pela WCAG 2.2 (SC 2.5.8). */
  touch: "44px",
  /** Largura da barra lateral do portal. */
  sidebar: "256px",
  /** Altura do cabeçalho da aplicação. */
  header: "56px",
};

// Transições curtas e discretas. Nada acima de 200ms em informação clínica.
export const motion = {
  fast: "120ms",
  base: "160ms",
  slow: "200ms",
  easing: "cubic-bezier(0.2, 0, 0.2, 1)",
};
