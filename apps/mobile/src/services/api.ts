import Constants from "expo-constants";
import type { AccessScope, BloodType, ContactLinkStatus } from "@medchain/domain";
import { supabase } from "./supabase";
import { buildApiUrl } from "./api-url";


const API_URL = ((Constants.expoConfig?.extra ?? {}) as { apiUrl?: string }).apiUrl ?? "";

async function authedFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(buildApiUrl(API_URL, path), { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Paciente
  getMyProfile: () => authedFetch<PatientProfileResponse>("/api/me"),
  updateMyProfile: (input: UpdatePatientProfileInput) =>
    authedFetch<PatientProfileResponse>("/api/me", {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  getMyDocuments: () => authedFetch<MedicalDocumentResponse[]>("/api/me/documents"),

  // Solicitações (como paciente)
  getPendingRequests: () =>
    authedFetch<AccessRequestResponse[]>("/api/access-requests?status=PENDING"),
  getAllRequests: () => authedFetch<AccessRequestResponse[]>("/api/access-requests"),
  approveRequest: (id: string) =>
    authedFetch<AccessTokenResponse>(`/api/access-requests/${id}/approve`, { method: "POST" }),
  denyRequest: (id: string) =>
    authedFetch<unknown>(`/api/access-requests/${id}/deny`, { method: "POST" }),

  // Tokens
  getActiveTokens: () =>
    authedFetch<AccessTokenResponse[]>("/api/access-tokens?status=ACTIVE"),
  revokeToken: (id: string) =>
    authedFetch<unknown>(`/api/tokens/${id}/revoke`, { method: "POST" }),

  // Logs
  getAuditLogs: () => authedFetch<AuditLogResponse[]>("/api/audit-logs"),

  // Registro pós-signup
  createUser: (input: CreateUserInput) =>
    authedFetch<unknown>("/api/users", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  // Vínculos de contato de emergência
  getMyContactLinks: () => authedFetch<ContactLinkResponse[]>("/api/me/contact-links"),
  approveContactLink: (id: string) =>
    authedFetch<unknown>(`/api/contact-links/${id}/approve`, { method: "POST" }),
  denyContactLink: (id: string) =>
    authedFetch<unknown>(`/api/contact-links/${id}/deny`, { method: "POST" }),

  // Upload de documento (multipart/form-data)
  uploadDocument: async (data: {
    uri: string;
    mimeType: string;
    name: string;
    title: string;
    type: string;
    issuedAt: string;
  }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const formData = new FormData();
    formData.append("file", {
      uri: data.uri,
      type: data.mimeType,
      name: data.name,
    } as unknown as Blob);
    formData.append("title", data.title);
    formData.append("type", data.type);
    formData.append("issuedAt", data.issuedAt);

    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const res = await fetch(buildApiUrl(API_URL, "/api/me/documents"), {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`API ${res.status}: ${text}`);
    }
    return res.json() as Promise<MedicalDocumentResponse>;
  },

  // URL assinada para download
  getDocumentUrl: (docId: string) =>
    authedFetch<{ signedUrl: string }>(`/api/documents/${docId}`),
};

// ─── Tipos das respostas da API ───────────────────────────────────────────────

export interface PatientProfileResponse {
  id: string;
  fullName: string;
  // Nulo para quem se cadastrou antes da coluna existir. Chega do servidor
  // como digitos, sem mascara.
  cpf: string | null;
  bloodType: string | null;
  allergies: string[];
  chronicConditions: string[];
  continuousMeds: string[];
  emergencyContacts: EmergencyContactResponse[];
}

export interface UpdatePatientProfileInput {
  bloodType: BloodType | null;
  allergies: string[];
  chronicConditions: string[];
  continuousMeds: string[];
}

export type CreateUserInput =
  | { role: "PATIENT"; fullName: string; cpf: string }
  | {
      role: "EMERGENCY_CONTACT";
      fullName: string;
      patientCpf: string;
      relation: string;
      phone: string;
    };

// O vínculo do próprio usuário. Não traz nada do paciente: quem pediu já sabe
// de quem se trata, e um pedido pendente não pode virar meio de confirmar
// dados de quem ainda não respondeu.
export interface ContactLinkResponse {
  id: string;
  status: ContactLinkStatus;
  relation: string;
  createdAt: string;
  respondedAt: string | null;
}

export interface EmergencyContactResponse {
  id: string;
  status: ContactLinkStatus;
  name: string;
  relation: string;
  phone: string;
}

export interface ExamResultResponse {
  id: string;
  analyte: string;
  value: number;
  unit: string;
  referenceMin: number;
  referenceMax: number;
}

export interface MedicalDocumentResponse {
  id: string;
  title: string;
  type: string;
  mimeType: string;
  issuedAt: string;
  results?: ExamResultResponse[];
}

export interface AccessRequestResponse {
  id: string;
  status: string;
  scope: AccessScope;
  durationMinutes: number;
  reason: string | null;
  createdAt: string;
  professional: {
    id: string;
    fullName: string;
    crm: string;
    specialty: string;
    institution: { name: string } | null;
  };
}

export interface AccessTokenResponse {
  id: string;
  status: string;
  scope: AccessScope;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  professional: {
    id: string;
    fullName: string;
    crm: string;
    specialty: string;
    institution: { name: string } | null;
  };
}

export interface AuditLogResponse {
  id: string;
  eventType: string;
  createdAt: string;
  actor: { email: string; role: string };
  token: {
    professional: { fullName: string; crm: string };
  } | null;
}
