import { describe, expect, it } from "vitest";
import { formatCrm } from "./crm";

describe("formatCrm", () => {
  it("mantém o valor que já vem com o prefixo", () => {
    expect(formatCrm("CRM-SP 123456")).toBe("CRM-SP 123456");
    expect(formatCrm("CRM 123456")).toBe("CRM 123456");
  });

  it("aceita o prefixo em qualquer caixa", () => {
    expect(formatCrm("crm-sp 123456")).toBe("crm-sp 123456");
  });

  it("prefixa quando vem só o número", () => {
    expect(formatCrm("123456")).toBe("CRM 123456");
    expect(formatCrm(" 123456 ")).toBe("CRM 123456");
  });

  it("devolve vazio para valor vazio, sem deixar o rótulo solto", () => {
    expect(formatCrm("")).toBe("");
    expect(formatCrm("   ")).toBe("");
  });
});
