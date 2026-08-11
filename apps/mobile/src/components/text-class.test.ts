import { describe, expect, it } from "vitest";
import { resolveTextClassName } from "./text-class";

describe("resolveTextClassName", () => {
  it("aplica a fonte base quando nenhum peso foi escolhido", () => {
    expect(resolveTextClassName()).toBe("font-sans");
    expect(resolveTextClassName("text-sm text-gray-500")).toBe(
      "font-sans text-sm text-gray-500"
    );
  });

  it("nao aplica a fonte base quando ja existe um peso", () => {
    expect(resolveTextClassName("text-sm font-bold")).toBe(
      "text-sm font-bold"
    );
    expect(resolveTextClassName("font-medium text-brand-700")).toBe(
      "font-medium text-brand-700"
    );
    expect(resolveTextClassName("font-semibold")).toBe("font-semibold");
  });

  it("ignora nomes que apenas contem um peso como trecho", () => {
    expect(resolveTextClassName("text-bolder")).toBe("font-sans text-bolder");
    expect(resolveTextClassName("font-boldish")).toBe("font-sans font-boldish");
  });
});
