export const ACCESS_SCOPES = ["FULL", "EMERGENCY", "EXAMS", "PRESCRIPTIONS"] as const;
export type AccessScope = (typeof ACCESS_SCOPES)[number];

// Laudo entra com exames porque laudo e resultado de exame.
const DOCUMENT_TYPES_BY_SCOPE: Record<AccessScope, readonly string[]> = {
  FULL: ["EXAM", "IMAGING", "REPORT", "PRESCRIPTION"],
  EMERGENCY: [],
  EXAMS: ["EXAM", "IMAGING", "REPORT"],
  PRESCRIPTIONS: ["PRESCRIPTION"],
};

// documentType chega como string do banco, entao tipo desconhecido nega.
export function scopeAllowsDocumentType(scope: AccessScope, documentType: string): boolean {
  return DOCUMENT_TYPES_BY_SCOPE[scope].includes(documentType);
}
