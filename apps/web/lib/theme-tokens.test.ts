import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { colors } from "@medchain/ui-tokens";

// O tema do portal vive em variáveis CSS no globals.css, e não em classes do Tailwind.
// Estes testes garantem que essas variáveis continuem derivadas de packages/ui-tokens,
// que é a única definição da paleta compartilhada com o app mobile.

const globalsCss = readFileSync(
  new URL("../app/globals.css", import.meta.url),
  "utf8"
);

function readCssVariable(name: string): string {
  const match = globalsCss.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`Variável --${name} não encontrada em globals.css`);
  return match[1].trim();
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;

  let hue = 0;
  let saturation = 0;

  if (max !== min) {
    const delta = max - min;
    saturation =
      lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === r) hue = (g - b) / delta + (g < b ? 6 : 0);
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;

    hue *= 60;
  }

  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(
    lightness * 100
  )}%`;
}

// Luminância relativa e razão de contraste da WCAG 2.x. Ficam aqui, e não numa
// dependência, porque a paleta é pequena e o cálculo é curto o bastante para
// ser lido junto com o valor que ele defende.
function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5]
    .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((value) =>
      value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    );

  return (
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  );
}

function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("tema do portal derivado dos tokens", () => {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

  it.each(shades)("mantém --primary-%i igual ao token brand", (shade) => {
    expect(readCssVariable(`primary-${shade}`)).toBe(
      hexToHsl(colors.brand[String(shade) as keyof typeof colors.brand])
    );
  });

  it("usa o brand 600 como cor primária e o brand 50 como cor clara", () => {
    expect(readCssVariable("brand-primary").toUpperCase()).toBe(
      colors.brand["600"]
    );
    expect(readCssVariable("brand-light").toUpperCase()).toBe(
      colors.brand["50"]
    );
    expect(readCssVariable("primary")).toBe(hexToHsl(colors.brand["600"]));
  });

  it("converte hexadecimal para HSL no formato aceito pelo Tailwind", () => {
    expect(hexToHsl("#FFFFFF")).toBe("0 0% 100%");
    expect(hexToHsl("#000000")).toBe("0 0% 0%");
    expect(hexToHsl("#0D9488")).toBe("175 84% 32%");
  });
});

// A camada semântica é o que as telas realmente consomem. Sem estes testes,
// mudar um papel no ui-tokens deixaria o portal com a cor antiga e o app
// mobile com a nova, sem nada quebrar.
describe("papéis semânticos derivados dos tokens", () => {
  const surfaceRoles = [
    ["background", colors.semantic.background],
    ["surface", colors.semantic.surface],
    ["surface-subtle", colors.semantic.surfaceSubtle],
    ["surface-inverse", colors.semantic.surfaceInverse],
    ["border", colors.semantic.border],
    ["border-subtle", colors.semantic.borderSubtle],
    ["border-strong", colors.semantic.borderStrong],
    ["text-primary", colors.semantic.textPrimary],
    ["text-secondary", colors.semantic.textSecondary],
    ["text-tertiary", colors.semantic.textTertiary],
    ["text-disabled", colors.semantic.textDisabled],
    ["interactive", colors.semantic.interactive],
    ["interactive-hover", colors.semantic.interactiveHover],
    ["interactive-subtle", colors.semantic.interactiveSubtle],
    ["interactive-border", colors.semantic.interactiveBorder],
    ["ring", colors.semantic.focus],
  ] as const;

  it.each(surfaceRoles)("mantém --%s igual ao token", (name, hex) => {
    expect(readCssVariable(name)).toBe(hexToHsl(hex));
  });

  const statusRoles = [
    ["success", colors.status.success],
    ["warning", colors.status.warning],
    ["danger", colors.status.danger],
    ["info", colors.status.info],
  ] as const;

  it.each(statusRoles)("mantém a família --%s igual ao token", (name, tone) => {
    expect(readCssVariable(name)).toBe(hexToHsl(tone.fg));
    expect(readCssVariable(`${name}-solid`)).toBe(hexToHsl(tone.solid));
    expect(readCssVariable(`${name}-subtle`)).toBe(hexToHsl(tone.subtle));
    expect(readCssVariable(`${name}-border`)).toBe(hexToHsl(tone.border));
  });

  // O contorno de campo é o único cinza que precisa alcançar 3:1 contra a
  // superfície branca (WCAG 2.2, SC 1.4.11). Se alguém clarear este token para
  // "suavizar" o formulário, o teste avisa.
  it("usa o cinza de controle na borda de campo", () => {
    expect(readCssVariable("input")).toBe(hexToHsl(colors.semantic.borderControl));
    expect(contrastRatio(colors.semantic.borderControl, "#FFFFFF")).toBeGreaterThanOrEqual(3);
  });

  const textContrast = [
    ["textPrimary", colors.semantic.textPrimary],
    ["textSecondary", colors.semantic.textSecondary],
    ["textTertiary", colors.semantic.textTertiary],
  ] as const;

  it.each(textContrast)(
    "mantém %s acima de 4,5:1 contra a superfície e contra o canvas",
    (_name, hex) => {
      expect(contrastRatio(hex, colors.semantic.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(hex, colors.semantic.background)).toBeGreaterThanOrEqual(4.5);
    }
  );

  const statusText = [
    ["success", colors.status.success],
    ["warning", colors.status.warning],
    ["danger", colors.status.danger],
    ["info", colors.status.info],
  ] as const;

  it.each(statusText)(
    "mantém o tom de texto de %s legível sobre o próprio fundo tingido",
    (_name, tone) => {
      expect(contrastRatio(tone.fg, tone.subtle)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(tone.fg, colors.semantic.surface)).toBeGreaterThanOrEqual(4.5);
    }
  );

  // O botão primário é pintado com `interactive`, e não com a cor da marca:
  // brand-600 não sustenta texto branco em cima.
  it("mantém texto branco legível sobre a cor interativa", () => {
    expect(
      contrastRatio(colors.semantic.interactive, colors.semantic.textInverse)
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(colors.semantic.interactiveHover, colors.semantic.textInverse)
    ).toBeGreaterThanOrEqual(4.5);
  });

  // O anel de foco precisa de 3:1 contra o que está em volta para ser
  // perceptível (SC 1.4.11).
  it("mantém o anel de foco perceptível sobre superfície e canvas", () => {
    expect(contrastRatio(colors.semantic.focus, colors.semantic.surface)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(colors.semantic.focus, colors.semantic.background)).toBeGreaterThanOrEqual(3);
  });
});
