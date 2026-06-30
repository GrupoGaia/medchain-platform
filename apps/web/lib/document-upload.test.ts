import { describe, expect, it } from "vitest";
import {
  MAX_MEDICAL_DOCUMENT_BYTES,
  buildMedicalDocumentStorageKey,
  getMedicalDocumentStorageConfig,
  validateMedicalDocumentUpload,
} from "./document-upload";

function candidate(overrides: Partial<Parameters<typeof validateMedicalDocumentUpload>[0]> = {}) {
  return {
    file: { type: "application/pdf", size: 1024 },
    title: " Hemograma completo ",
    type: "EXAM",
    issuedAt: "2026-06-01",
    now: new Date("2026-06-30T12:00:00.000Z"),
    ...overrides,
  };
}

describe("validateMedicalDocumentUpload", () => {
  it("accepts a valid medical document upload", () => {
    const result = validateMedicalDocumentUpload(candidate());

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        title: "Hemograma completo",
        type: "EXAM",
        mimeType: "application/pdf",
        issuedAt: new Date("2026-06-01T00:00:00.000Z"),
      });
    }
  });

  it("rejects an unknown document type", () => {
    const result = validateMedicalDocumentUpload(candidate({ type: "LAB" }));

    expect(result).toEqual({
      success: false,
      status: 422,
      error: "Tipo de documento inválido.",
    });
  });

  it("rejects an invalid issue date", () => {
    const result = validateMedicalDocumentUpload(candidate({ issuedAt: "sem-data" }));

    expect(result).toEqual({
      success: false,
      status: 422,
      error: "Data de emissão inválida.",
    });
  });

  it("rejects a future issue date", () => {
    const result = validateMedicalDocumentUpload(candidate({ issuedAt: "2026-07-01" }));

    expect(result).toEqual({
      success: false,
      status: 422,
      error: "Data de emissão não pode ser futura.",
    });
  });

  it("rejects files above the configured size limit", () => {
    const result = validateMedicalDocumentUpload(
      candidate({ file: { type: "application/pdf", size: MAX_MEDICAL_DOCUMENT_BYTES + 1 } })
    );

    expect(result).toEqual({
      success: false,
      status: 422,
      error: "Arquivo muito grande. Máximo 10 MB.",
    });
  });

  it("uses the same MIME types in validation and storage config", () => {
    expect(getMedicalDocumentStorageConfig()).toEqual({
      bucket: "medical-documents",
      maxBytes: MAX_MEDICAL_DOCUMENT_BYTES,
      allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
    });
  });
});

describe("buildMedicalDocumentStorageKey", () => {
  it("builds deterministic keys with the expected extension", () => {
    expect(buildMedicalDocumentStorageKey("patient-123", "doc-123", "image/png")).toBe(
      "patient-123/doc-123.png"
    );
  });
});
