import type { AccessScope } from "./scope";

export const SCOPE_LABEL: Record<AccessScope, string> = {
  FULL: "Prontuario completo",
  EMERGENCY: "Dados de emergencia",
  EXAMS: "Exames e laudos",
  PRESCRIPTIONS: "Receitas",
};

// O que o paciente ve na tela de autorizacao antes de decidir.
// Dados do paciente e contatos aparecem em todo escopo: esconder alergia
// de um profissional autorizado cria risco de prescricao perigosa.
const BASELINE = "Tipo sanguineo, alergias, condicoes e medicamentos";
const CONTACTS = "Contatos de emergencia";

export const SCOPE_SHARES: Record<AccessScope, readonly string[]> = {
  FULL: [BASELINE, CONTACTS, "Todos os documentos do prontuario"],
  EMERGENCY: [BASELINE, CONTACTS],
  EXAMS: [BASELINE, CONTACTS, "Exames, laudos e exames de imagem"],
  PRESCRIPTIONS: [BASELINE, CONTACTS, "Receitas e prescricoes"],
};

export const SCOPE_WITHHOLDS: Record<AccessScope, readonly string[]> = {
  FULL: [],
  EMERGENCY: ["Exames, laudos e receitas"],
  EXAMS: ["Receitas e prescricoes"],
  PRESCRIPTIONS: ["Exames, laudos e exames de imagem"],
};
