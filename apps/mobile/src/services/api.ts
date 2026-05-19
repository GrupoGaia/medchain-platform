import Constants from "expo-constants";
import { supabase } from "./supabase";

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

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Paciente
  getMyProfile: () => authedFetch<PatientProfileResponse>("/api/me"),
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
  createUser: (role: string, fullName: string) =>
    authedFetch<unknown>("/api/users", {
      method: "POST",
      body: JSON.stringify({ role, fullName }),
    }),
};

// ─── Tipos das respostas da API ───────────────────────────────────────────────

export interface PatientProfileResponse {
  id: string;
  fullName: string;
  bloodType: string | null;
  allergies: string[];
  chronicConditions: string[];
  continuousMeds: string[];
  emergencyContacts: EmergencyContactResponse[];
}

export interface EmergencyContactResponse {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface MedicalDocumentResponse {
  id: string;
  title: string;
  type: string;
  mimeType: string;
  issuedAt: string;
}

export interface AccessRequestResponse {
  id: string;
  status: string;
  scope: string;
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
  scope: string;
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
