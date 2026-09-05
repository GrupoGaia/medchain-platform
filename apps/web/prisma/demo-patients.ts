/**
 * Pacientes fictícios do seed de demonstração.
 *
 * Cada um tem uma história clínica coerente: as condições da ficha explicam os
 * analitos que saem da faixa, e a linha do tempo mostra a evolução sob
 * tratamento. É isso que faz a demo parecer um prontuário em uso, e não uma
 * tabela preenchida por sorteio.
 *
 * `overrides` fixa o valor de um analito em cada coleta, da mais antiga para a
 * mais recente. Quem não aparece ali recebe um valor dentro da faixa, gerado de
 * forma determinística a partir do nome do paciente, do analito e da data.
 */

import type { Sex } from "./clinical-data";

export interface ContactPlan {
  /** Preenchido só para os contatos que também logam no app. */
  email?: string;
  name: string;
  relation: string;
  phone: string;
}

export interface NarrativePlan {
  /** `report:`, `imaging:` ou `rx:` seguido da chave no catálogo. */
  key: string;
  monthsAgo: number;
}

export interface PatientPlan {
  email: string;
  cpf: string;
  name: string;
  sex: Sex;
  gender: string;
  birthDate: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  continuousMeds: string[];
  contacts: ContactPlan[];
  /** Meses atrás de cada coleta, da mais antiga para a mais recente. */
  collections: number[];
  /** Painéis colhidos em toda coleta. */
  panels: string[];
  /** Painéis pedidos só na coleta mais recente. */
  panelsLatestOnly?: string[];
  overrides?: Record<string, number[]>;
  narratives: NarrativePlan[];
}

export const DEMO_PATIENTS: PatientPlan[] = [
  // ── Persona principal ─────────────────────────────────────────────────────
  // Hipertenso, pré-diabético e dislipidêmico. A linha do tempo mostra o LDL
  // caindo depois da estatina e a HbA1c se estabilizando na faixa de
  // pré-diabetes.
  {
    email: "joao.batista@exemplo.com",
    cpf: "52998224725",
    name: "João Batista",
    sex: "M",
    gender: "Masculino",
    birthDate: "1963-04-15",
    bloodType: "A+",
    allergies: ["Penicilina", "Ácido acetilsalicílico"],
    chronicConditions: [
      "Hipertensão arterial sistêmica",
      "Pré-diabetes",
      "Dislipidemia",
    ],
    continuousMeds: [
      "Losartana 50mg",
      "Hidroclorotiazida 25mg",
      "Metformina 850mg",
      "Atorvastatina 20mg",
    ],
    contacts: [
      {
        email: "maria.batista@exemplo.com",
        name: "Maria Batista",
        relation: "Filha",
        phone: "(11) 9 9999-0001",
      },
      {
        email: "pedro.batista@exemplo.com",
        name: "Pedro Batista",
        relation: "Filho",
        phone: "(11) 9 9999-0002",
      },
    ],
    collections: [18, 12, 8, 4, 1],
    panels: ["hemograma", "lipidico", "glicemico", "renal", "hepatico"],
    panelsLatestOnly: ["eletrolitos", "inflamatorio", "prostata", "ferro"],
    overrides: {
      "Colesterol total": [263, 244, 226, 212, 198],
      "LDL-colesterol": [178, 161, 148, 139, 128],
      "HDL-colesterol": [34, 35, 36, 38, 41],
      "Triglicerídeos": [255, 231, 208, 186, 164],
      "Colesterol não-HDL": [229, 209, 190, 174, 157],
      "Glicose de jejum": [118, 115, 112, 109, 106],
      "Hemoglobina glicada (HbA1c)": [6.3, 6.2, 6.1, 6, 5.9],
      "HOMA-IR": [3.4, 3.2, 3.05, 2.9, 2.8],
      "Insulina de jejum": [21.4, 20.1, 19.2, 18.4, 17.9],
      Creatinina: [1.14, 1.16, 1.18, 1.19, 1.21],
      "Taxa de filtração glomerular (CKD-EPI)": [79, 77, 75, 74, 72],
      "Ácido úrico": [7.2, 7.1, 7.3, 6.9, 6.8],
      "Gama-GT": [72, 68, 64, 59, 54],
      "PSA total": [2.84],
    },
    narratives: [
      { key: "rx:antihipertensivo", monthsAgo: 18 },
      { key: "report:eletrocardiograma", monthsAgo: 17 },
      { key: "imaging:raioxTorax", monthsAgo: 17 },
      { key: "report:ecocardiograma", monthsAgo: 12 },
      { key: "rx:metabolico", monthsAgo: 12 },
      { key: "report:mapa", monthsAgo: 10 },
      { key: "imaging:usgAbdome", monthsAgo: 8 },
      { key: "report:ergometrico", monthsAgo: 6 },
      { key: "imaging:angioCoronaria", monthsAgo: 5 },
      { key: "report:holter", monthsAgo: 4 },
      { key: "report:endoscopia", monthsAgo: 3 },
      { key: "rx:antihipertensivo", monthsAgo: 2 },
      { key: "report:fundoscopia", monthsAgo: 2 },
      { key: "rx:metabolico", monthsAgo: 1 },
    ],
  },

  // ── Diabetes tipo 2 de longa data ─────────────────────────────────────────
  {
    email: "helena.prado@exemplo.com",
    cpf: "11144477735",
    name: "Helena Prado Vasconcelos",
    sex: "F",
    gender: "Feminino",
    birthDate: "1968-11-02",
    bloodType: "O+",
    allergies: ["Dipirona"],
    chronicConditions: ["Diabetes mellitus tipo 2", "Obesidade grau I"],
    continuousMeds: ["Metformina 850mg", "Insulina glargina", "Dapagliflozina 10mg"],
    contacts: [
      { name: "Rogério Vasconcelos", relation: "Cônjuge", phone: "(11) 9 8888-2010" },
      { name: "Beatriz Prado", relation: "Filha", phone: "(11) 9 8888-2011" },
    ],
    collections: [14, 9, 5, 1],
    panels: ["hemograma", "glicemico", "lipidico", "renal", "urina"],
    panelsLatestOnly: ["ferro", "eletrolitos"],
    overrides: {
      "Glicose de jejum": [186, 171, 158, 142],
      "Hemoglobina glicada (HbA1c)": [9.1, 8.4, 7.8, 7.2],
      "Insulina de jejum": [28.6, 27.1, 26.4, 25.8],
      "HOMA-IR": [5.9, 5.4, 5.1, 4.7],
      "Triglicerídeos": [212, 198, 184, 171],
      "Proteinúria de 24 horas": [188, 196, 174, 162],
      Creatinina: [0.94, 0.96, 0.95, 0.97],
    },
    narratives: [
      { key: "rx:insulina", monthsAgo: 14 },
      { key: "report:fundoscopia", monthsAgo: 12 },
      { key: "imaging:usgAbdome", monthsAgo: 9 },
      { key: "rx:metabolico", monthsAgo: 6 },
      { key: "imaging:mamografia", monthsAgo: 4 },
      { key: "report:eletrocardiograma", monthsAgo: 2 },
      { key: "rx:insulina", monthsAgo: 1 },
    ],
  },

  // ── Doença renal crônica ──────────────────────────────────────────────────
  {
    email: "rubens.carvalho@exemplo.com",
    cpf: "39053344705",
    name: "Rubens Carvalho Antunes",
    sex: "M",
    gender: "Masculino",
    birthDate: "1955-06-23",
    bloodType: "B+",
    allergies: ["Contraste iodado"],
    chronicConditions: [
      "Doença renal crônica estágio 3b",
      "Hipertensão arterial sistêmica",
      "Anemia da doença renal",
    ],
    continuousMeds: ["Furosemida 40mg", "Anlodipino 5mg", "Carbonato de cálcio 500mg"],
    contacts: [
      { name: "Vera Antunes", relation: "Cônjuge", phone: "(21) 9 7777-3030" },
      { name: "Diogo Antunes", relation: "Filho", phone: "(21) 9 7777-3031" },
    ],
    collections: [12, 8, 4, 1],
    panels: ["hemograma", "renal", "eletrolitos", "urina"],
    panelsLatestOnly: ["ferro", "inflamatorio", "hepatico"],
    overrides: {
      Creatinina: [2.14, 2.28, 2.41, 2.53],
      Ureia: [78, 84, 91, 98],
      "Taxa de filtração glomerular (CKD-EPI)": [38, 35, 33, 31],
      Potássio: [5.3, 5.4, 5.2, 5.5],
      Fósforo: [4.8, 5.1, 5, 5.3],
      Hemoglobina: [11.2, 10.8, 10.5, 10.3],
      Hematócrito: [34, 33, 32.4, 31.8],
      "Proteinúria de 24 horas": [612, 684, 731, 798],
      Ferritina: [22],
    },
    narratives: [
      { key: "rx:diuretico", monthsAgo: 12 },
      { key: "imaging:usgAbdome", monthsAgo: 10 },
      { key: "report:eletrocardiograma", monthsAgo: 7 },
      { key: "imaging:raioxTorax", monthsAgo: 5 },
      { key: "report:ecocardiograma", monthsAgo: 3 },
      { key: "rx:diuretico", monthsAgo: 1 },
    ],
  },

  // ── Hipotireoidismo e anemia ferropriva ───────────────────────────────────
  {
    email: "marta.nogueira@exemplo.com",
    cpf: "16899560461",
    name: "Marta Nogueira Lins",
    sex: "F",
    gender: "Feminino",
    birthDate: "1980-02-09",
    bloodType: "A-",
    allergies: [],
    chronicConditions: ["Hipotireoidismo", "Anemia ferropriva"],
    continuousMeds: ["Levotiroxina 75mcg", "Sulfato ferroso 40mg"],
    contacts: [{ name: "Cláudio Lins", relation: "Cônjuge", phone: "(31) 9 6666-4040" }],
    collections: [10, 6, 2],
    panels: ["hemograma", "tireoide", "ferro"],
    panelsLatestOnly: ["lipidico", "hepatico"],
    overrides: {
      TSH: [11.4, 5.82, 2.94],
      "T4 livre": [0.71, 0.86, 1.12],
      Hemoglobina: [10.1, 11.3, 12.4],
      Hematócrito: [31.5, 34.8, 37.2],
      VCM: [74, 78, 83],
      HCM: [23.1, 25.4, 27.6],
      Ferritina: [6, 11, 28],
      "Ferro sérico": [31, 48, 66],
      "Saturação de transferrina": [9, 14, 21],
    },
    narratives: [
      { key: "rx:levotiroxina", monthsAgo: 10 },
      { key: "imaging:usgTireoide", monthsAgo: 9 },
      { key: "rx:ferro", monthsAgo: 9 },
      { key: "report:endoscopia", monthsAgo: 7 },
      { key: "rx:levotiroxina", monthsAgo: 2 },
    ],
  },

  // ── Check-up de adulto jovem, tudo dentro da faixa ────────────────────────
  // Serve de contraste: mostra a tela sem nenhum alerta.
  {
    email: "otavio.salgado@exemplo.com",
    cpf: "23344556606",
    name: "Otávio Salgado Ribeiro",
    sex: "M",
    gender: "Masculino",
    birthDate: "1992-08-30",
    bloodType: "O-",
    allergies: [],
    chronicConditions: [],
    continuousMeds: [],
    contacts: [{ name: "Lúcia Salgado", relation: "Mãe", phone: "(41) 9 5555-5050" }],
    collections: [12, 1],
    panels: ["hemograma", "lipidico", "glicemico", "hepatico"],
    panelsLatestOnly: ["ferro"],
    narratives: [
      { key: "report:espirometria", monthsAgo: 12 },
      { key: "imaging:raioxTorax", monthsAgo: 12 },
      { key: "report:eletrocardiograma", monthsAgo: 1 },
    ],
  },

  // ── Insuficiência cardíaca e fibrilação atrial ────────────────────────────
  {
    email: "celia.bastos@exemplo.com",
    cpf: "76502838009",
    name: "Célia Bastos Ferrão",
    sex: "F",
    gender: "Feminino",
    birthDate: "1959-12-11",
    bloodType: "AB+",
    allergies: ["Sulfametoxazol"],
    chronicConditions: [
      "Insuficiência cardíaca com fração de ejeção reduzida",
      "Fibrilação atrial permanente",
      "Osteopenia",
    ],
    continuousMeds: ["Rivaroxabana 20mg", "Carvedilol 6,25mg", "Espironolactona 25mg"],
    contacts: [
      { name: "Ana Ferrão", relation: "Filha", phone: "(51) 9 4444-6060" },
      { name: "Tiago Ferrão", relation: "Filho", phone: "(51) 9 4444-6061" },
    ],
    collections: [11, 7, 3, 1],
    panels: ["hemograma", "cardiaco", "renal", "coagulograma", "eletrolitos"],
    panelsLatestOnly: ["hepatico", "tireoide"],
    overrides: {
      BNP: [612, 488, 396, 341],
      "CK-MB massa": [4.2, 3.8, 3.6, 3.4],
      Creatinina: [1.02, 1.06, 1.09, 1.11],
      "Taxa de filtração glomerular (CKD-EPI)": [58, 56, 54, 53],
      Potássio: [5.2, 4.9, 5, 4.8],
      INR: [2.4, 2.6, 2.3, 2.5],
      "Tempo de protrombina (atividade)": [42, 38, 44, 40],
    },
    narratives: [
      { key: "rx:anticoagulante", monthsAgo: 11 },
      { key: "report:ecocardiograma", monthsAgo: 11 },
      { key: "report:holter", monthsAgo: 9 },
      { key: "imaging:raioxTorax", monthsAgo: 7 },
      { key: "imaging:densitometria", monthsAgo: 5 },
      { key: "report:ecocardiograma", monthsAgo: 2 },
      { key: "rx:anticoagulante", monthsAgo: 1 },
    ],
  },
];
