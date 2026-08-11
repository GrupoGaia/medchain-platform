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
