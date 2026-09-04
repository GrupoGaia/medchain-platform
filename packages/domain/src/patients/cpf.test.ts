import { describe, expect, it } from "vitest";
import { formatCpf, isValidCpf, normalizeCpf } from "./cpf";

describe("normalizeCpf", () => {
  it("keeps only the digits", () => {
    expect(normalizeCpf("529.982.247-25")).toBe("52998224725");
    expect(normalizeCpf(" 529 982 247 25 ")).toBe("52998224725");
    expect(normalizeCpf("52998224725")).toBe("52998224725");
  });

  it("returns an empty string when there is no digit", () => {
    expect(normalizeCpf("")).toBe("");
    expect(normalizeCpf("abc.def-gh")).toBe("");
  });
});

describe("isValidCpf", () => {
  it("accepts a CPF with correct check digits, formatted or not", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("52998224725")).toBe(true);
    expect(isValidCpf("111.444.777-35")).toBe(true);
  });

  it("rejects a CPF with a wrong check digit", () => {
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("111.444.777-30")).toBe(false);
  });

  it("rejects the wrong number of digits", () => {
    expect(isValidCpf("5299822472")).toBe(false);
    expect(isValidCpf("529982247251")).toBe(false);
    expect(isValidCpf("")).toBe(false);
  });

  // Sequencias repetidas passam na conta dos digitos verificadores, entao
  // precisam de rejeicao explicita, senao 000.000.000-00 entraria como valido.
  it("rejects a repeated digit sequence even though the check digits match", () => {
    expect(isValidCpf("00000000000")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("99999999999")).toBe(false);
  });
});

describe("formatCpf", () => {
  it("applies the mask to eleven digits", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
  });

  it("normalizes before applying the mask", () => {
    expect(formatCpf("529.982.247-25")).toBe("529.982.247-25");
  });

  // Sem os onze digitos nao ha mascara possivel, e inventar uma esconderia o
  // dado ruim de quem chamou.
  it("returns the input unchanged when it does not have eleven digits", () => {
    expect(formatCpf("5299822")).toBe("5299822");
  });
});
