export type AccessRequestStatus = "PENDING" | "APPROVED" | "DENIED" | "EXPIRED" | "CANCELLED";
export type AccessTokenStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

export interface Patient {
  id: string;
  name: string;
  initials: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  continuousMeds: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface HealthProfessional {
  id: string;
  name: string;
  crm: string;
  specialty: string;
  institution: string;
}

export interface MedicalDocument {
  id: string;
  title: string;
  type: "EXAM" | "PRESCRIPTION" | "REPORT";
  issuedAt: string;
}

export interface HistoryEvent {
  id: string;
  period: string;
  type: "Consulta" | "Exame" | "Receita" | "Cirurgia";
  description: string;
  detail: string;
  action?: string;
}

export interface AccessRequest {
  id: string;
  professional: HealthProfessional;
  status: AccessRequestStatus;
  scope: string;
  durationMinutes: number;
  reason: string;
  createdAt: string;
}

export interface AccessToken {
  id: string;
  requestId: string;
  professional: HealthProfessional;
  scope: string;
  expiresAt: Date;
  status: AccessTokenStatus;
  revokedAt?: Date;
}

export interface AccessLog {
  id: string;
  eventType: string;
  description: string;
  professional: string;
  createdAt: string;
}

