import type { AccessScope } from "./scope";

export const SCOPE_LABEL: Record<AccessScope, string> = {
  FULL: "Prontuário completo",
  EMERGENCY: "Dados de emergência",
  EXAMS: "Exames e laudos",
  PRESCRIPTIONS: "Receitas",
};

// O que o paciente ve na tela de autorizacao antes de decidir.
// Dados do paciente e contatos aparecem em todo escopo: esconder alergia
// de um profissional autorizado cria risco de prescricao perigosa.
const BASELINE = "Tipo sanguíneo, alergias, condições e medicamentos";
const CONTACTS = "Contatos de emergência";

export const SCOPE_SHARES: Record<AccessScope, readonly string[]> = {
  FULL: [BASELINE, CONTACTS, "Todos os documentos do prontuário"],
  EMERGENCY: [BASELINE, CONTACTS],
  EXAMS: [BASELINE, CONTACTS, "Exames, laudos e exames de imagem"],
  PRESCRIPTIONS: [BASELINE, CONTACTS, "Receitas e prescrições"],
};

export const SCOPE_WITHHOLDS: Record<AccessScope, readonly string[]> = {
  FULL: [],
  EMERGENCY: ["Exames, laudos, exames de imagem e receitas"],
  EXAMS: ["Receitas e prescrições"],
  PRESCRIPTIONS: ["Exames, laudos e exames de imagem"],
};
