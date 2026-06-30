export const MEDICAL_DOCUMENT_BUCKET = "medical-documents";
export const MAX_MEDICAL_DOCUMENT_BYTES = 10 * 1024 * 1024;

export const MEDICAL_DOCUMENT_TYPES = ["EXAM", "REPORT", "PRESCRIPTION", "IMAGING"] as const;
export const ALLOWED_MEDICAL_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

type MedicalDocumentType = (typeof MEDICAL_DOCUMENT_TYPES)[number];
type MedicalDocumentMimeType = (typeof ALLOWED_MEDICAL_DOCUMENT_MIME_TYPES)[number];

interface UploadCandidate {
  file: { type: string; size: number } | null;
  title: string | null | undefined;
  type: string | null | undefined;
  issuedAt: string | null | undefined;
  now?: Date;
}

type UploadValidationResult =
  | {
      success: true;
      data: {
        title: string;
        type: MedicalDocumentType;
        mimeType: MedicalDocumentMimeType;
        issuedAt: Date;
      };
    }
  | { success: false; status: 400 | 422; error: string };

const MIME_EXTENSION: Record<MedicalDocumentMimeType, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

function isMedicalDocumentType(value: string): value is MedicalDocumentType {
  return MEDICAL_DOCUMENT_TYPES.includes(value as MedicalDocumentType);
}

function isMedicalDocumentMimeType(value: string): value is MedicalDocumentMimeType {
  return ALLOWED_MEDICAL_DOCUMENT_MIME_TYPES.includes(value as MedicalDocumentMimeType);
}

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function validateMedicalDocumentUpload(
  input: UploadCandidate
): UploadValidationResult {
  const title = input.title?.trim();

  if (!input.file || !title || !input.type || !input.issuedAt) {
    return {
      success: false,
      status: 400,
      error: "Campos obrigatórios: file, title, type, issuedAt",
    };
  }

  if (!isMedicalDocumentType(input.type)) {
    return { success: false, status: 422, error: "Tipo de documento inválido." };
  }

  if (!isMedicalDocumentMimeType(input.file.type)) {
    return {
      success: false,
      status: 422,
      error: "Tipo não permitido. Use PDF, JPEG ou PNG.",
    };
  }

  if (input.file.size > MAX_MEDICAL_DOCUMENT_BYTES) {
    return { success: false, status: 422, error: "Arquivo muito grande. Máximo 10 MB." };
  }

  const issuedAt = parseDateOnly(input.issuedAt);
  if (!issuedAt) {
    return { success: false, status: 422, error: "Data de emissão inválida." };
  }

  if (issuedAt > startOfUtcDay(input.now ?? new Date())) {
    return { success: false, status: 422, error: "Data de emissão não pode ser futura." };
  }

  return {
    success: true,
    data: {
      title,
      type: input.type,
      mimeType: input.file.type,
      issuedAt,
    },
  };
}

export function buildMedicalDocumentStorageKey(
  patientId: string,
  docId: string,
  mimeType: MedicalDocumentMimeType
): string {
  return `${patientId}/${docId}.${MIME_EXTENSION[mimeType]}`;
}

export function getMedicalDocumentStorageConfig() {
  return {
    bucket: MEDICAL_DOCUMENT_BUCKET,
    maxBytes: MAX_MEDICAL_DOCUMENT_BYTES,
    allowedMimeTypes: [...ALLOWED_MEDICAL_DOCUMENT_MIME_TYPES],
  };
}
