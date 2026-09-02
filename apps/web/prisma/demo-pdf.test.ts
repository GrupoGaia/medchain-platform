import { describe, expect, it } from "vitest";
import { buildDemoPdf } from "./demo-pdf";

function toLatin1(buffer: Buffer): string {
  return buffer.toString("latin1");
}

describe("buildDemoPdf", () => {
  it("produces a well-formed PDF buffer", () => {
    const pdf = buildDemoPdf({
      title: "Hemograma completo",
      patientName: "João Batista",
      type: "EXAM",
      issuedAt: new Date("2026-05-10T00:00:00.000Z"),
    });

    const text = toLatin1(pdf);
    expect(text.startsWith("%PDF-")).toBe(true);
    expect(text.trimEnd().endsWith("%%EOF")).toBe(true);
  });

  it("embeds the document title and patient name, with accents preserved", () => {
    const pdf = buildDemoPdf({
      title: "Perfil lipídico",
      patientName: "João Batista",
      type: "EXAM",
      issuedAt: new Date("2026-05-10T00:00:00.000Z"),
    });

    const text = toLatin1(pdf);
    expect(text).toContain("Perfil lip\xEDdico");
    expect(text).toContain("Jo\xE3o Batista");
  });

  it("embeds the issue date formatted as dd/mm/yyyy", () => {
    const pdf = buildDemoPdf({
      title: "Raio-X de tórax",
      patientName: "Maria Batista",
      type: "IMAGING",
      issuedAt: new Date("2026-05-10T00:00:00.000Z"),
    });

    expect(toLatin1(pdf)).toContain("10/05/2026");
  });

  it("produces different bytes for different documents", () => {
    const base = {
      patientName: "João Batista",
      type: "EXAM" as const,
      issuedAt: new Date("2026-05-10T00:00:00.000Z"),
    };

    const a = buildDemoPdf({ ...base, title: "Hemograma completo" });
    const b = buildDemoPdf({ ...base, title: "Glicemia em jejum" });

    expect(a.equals(b)).toBe(false);
  });
});
