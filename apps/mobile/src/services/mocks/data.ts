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

// ─── Dados do paciente ────────────────────────────────────────────────────────

export const MOCK_PATIENT: Patient = {
  id: "patient-001",
  name: "João Batista",
  initials: "JB",
  bloodType: "A+",
  allergies: ["Penicilina", "AAS"],
  chronicConditions: ["Hipertensão arterial", "Pré-diabetes"],
  continuousMeds: ["Losartana 50mg", "Metformina 850mg"],
};

export const MOCK_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: "ec-001", name: "Maria Batista", relation: "Filha", phone: "(11) 9 9999-0001" },
  { id: "ec-002", name: "Pedro Batista", relation: "Filho", phone: "(11) 9 9999-0002" },
];

// ─── Profissionais ────────────────────────────────────────────────────────────

export const MOCK_PROFESSIONALS: HealthProfessional[] = [
  {
    id: "prof-001",
    name: "Dr. Carlos Silva",
    crm: "CRM-SP 123456",
    specialty: "Cardiologia",
    institution: "Hospital São Lucas",
  },
  {
    id: "prof-002",
    name: "Dra. Ana Ferreira",
    crm: "CRM-SP 654321",
    specialty: "Clínica Geral",
    institution: "UPA Centro",
  },
];

// ─── Documentos ───────────────────────────────────────────────────────────────

export const MOCK_DOCUMENTS: MedicalDocument[] = [
  { id: "doc-001", title: "Hemograma completo", type: "EXAM", issuedAt: "12 mai 2026" },
  { id: "doc-002", title: "Raio-X de tórax", type: "EXAM", issuedAt: "05 mai 2026" },
  { id: "doc-003", title: "Perfil lipídico", type: "EXAM", issuedAt: "28 abr 2026" },
  { id: "doc-004", title: "Ecocardiograma", type: "REPORT", issuedAt: "10 mar 2026" },
  { id: "doc-005", title: "Receita Losartana + Metformina", type: "PRESCRIPTION", issuedAt: "01 mai 2026" },
];

// ─── Histórico ────────────────────────────────────────────────────────────────

export const MOCK_HISTORY: HistoryEvent[] = [
  {
    id: "h-001",
    period: "Hoje",
    type: "Consulta",
    description: "Cardiologista — Dr. Carlos Silva",
    detail: "Retorno semestral",
  },
  {
    id: "h-002",
    period: "Mês passado",
    type: "Exame",
    description: "Hemograma completo",
    detail: "Resultado: normal",
  },
  {
    id: "h-003",
    period: "Mês passado",
    type: "Receita",
    description: "Renovação de receita",
    detail: "Losartana 50mg · Metformina 850mg",
    action: "Baixar PDF",
  },
  {
    id: "h-004",
    period: "Ano passado",
    type: "Cirurgia",
    description: "Apendicectomia",
    detail: "Hospital São Lucas · Laparoscopia",
  },
];

// ─── Pedidos de acesso (1 ativo aprovado + 1 pendente) ───────────────────────

const now = new Date();

export const MOCK_ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: "req-001",
    professional: MOCK_PROFESSIONALS[0],
    status: "APPROVED",
    scope: "Prontuário completo",
    durationMinutes: 60,
    reason: "Consulta de retorno — avaliação cardiológica",
    createdAt: new Date(now.getTime() - 15 * 60_000).toISOString(),
  },
  {
    id: "req-002",
    professional: MOCK_PROFESSIONALS[1],
    status: "PENDING",
    scope: "Dados de emergência (alergias, medicamentos, tipo sanguíneo)",
    durationMinutes: 30,
    reason: "Atendimento de urgência na UPA",
    createdAt: new Date().toISOString(),
  },
];

// ─── Tokens ativos ────────────────────────────────────────────────────────────

export const MOCK_TOKENS: AccessToken[] = [
  {
    id: "token-001",
    requestId: "req-001",
    professional: MOCK_PROFESSIONALS[0],
    scope: "Prontuário completo",
    expiresAt: new Date(now.getTime() + 45 * 60_000), // expira em 45min
    status: "ACTIVE",
  },
];

// ─── Logs de auditoria ────────────────────────────────────────────────────────

export const MOCK_LOGS: AccessLog[] = [
  {
    id: "log-001",
    eventType: "ACCESS",
    description: "Prontuário acessado",
    professional: "Dr. Carlos Silva — CRM-SP 123456",
    createdAt: "Hoje, 09h14",
  },
  {
    id: "log-002",
    eventType: "APPROVE",
    description: "Acesso autorizado",
    professional: "Dr. Carlos Silva — CRM-SP 123456",
    createdAt: "Hoje, 08h58",
  },
];
