import { describe, expect, it } from "vitest";
import { ACCESS_SCOPES, scopeAllowsDocumentType } from "./scope";

describe("ACCESS_SCOPES", () => {
  it("has exactly the four supported scopes", () => {
    expect([...ACCESS_SCOPES]).toEqual(["FULL", "EMERGENCY", "EXAMS", "PRESCRIPTIONS"]);
  });
});

describe("scopeAllowsDocumentType", () => {
  it("lets the full scope through for every document type", () => {
    expect(scopeAllowsDocumentType("FULL", "EXAM")).toBe(true);
    expect(scopeAllowsDocumentType("FULL", "REPORT")).toBe(true);
    expect(scopeAllowsDocumentType("FULL", "PRESCRIPTION")).toBe(true);
    expect(scopeAllowsDocumentType("FULL", "IMAGING")).toBe(true);
  });

  it("blocks every document type for the emergency scope", () => {
    expect(scopeAllowsDocumentType("EMERGENCY", "EXAM")).toBe(false);
    expect(scopeAllowsDocumentType("EMERGENCY", "REPORT")).toBe(false);
    expect(scopeAllowsDocumentType("EMERGENCY", "PRESCRIPTION")).toBe(false);
    expect(scopeAllowsDocumentType("EMERGENCY", "IMAGING")).toBe(false);
  });

  it("lets exams, imaging and reports through for the exams scope", () => {
    expect(scopeAllowsDocumentType("EXAMS", "EXAM")).toBe(true);
    expect(scopeAllowsDocumentType("EXAMS", "IMAGING")).toBe(true);
    expect(scopeAllowsDocumentType("EXAMS", "REPORT")).toBe(true);
  });

  it("blocks prescriptions for the exams scope", () => {
    expect(scopeAllowsDocumentType("EXAMS", "PRESCRIPTION")).toBe(false);
  });

  it("lets only prescriptions through for the prescriptions scope", () => {
    expect(scopeAllowsDocumentType("PRESCRIPTIONS", "PRESCRIPTION")).toBe(true);
    expect(scopeAllowsDocumentType("PRESCRIPTIONS", "EXAM")).toBe(false);
    expect(scopeAllowsDocumentType("PRESCRIPTIONS", "IMAGING")).toBe(false);
    expect(scopeAllowsDocumentType("PRESCRIPTIONS", "REPORT")).toBe(false);
  });

  it("rejects an unknown document type for every scope", () => {
    expect(scopeAllowsDocumentType("FULL", "SOMETHING_ELSE")).toBe(false);
    expect(scopeAllowsDocumentType("EXAMS", "SOMETHING_ELSE")).toBe(false);
    expect(scopeAllowsDocumentType("EMERGENCY", "SOMETHING_ELSE")).toBe(false);
    expect(scopeAllowsDocumentType("PRESCRIPTIONS", "SOMETHING_ELSE")).toBe(false);
  });
});
