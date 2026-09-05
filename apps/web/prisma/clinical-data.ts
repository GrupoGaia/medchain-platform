/**
 * Catálogo clínico fictício do seed de demonstração.
 *
 * Os painéis reproduzem a composição e as faixas de referência que um
 * laboratório brasileiro imprime num laudo de adulto. Nada aqui vem de pessoa
 * real: os pacientes, os valores e as datas são inventados para a demo.
 *
 * Só entram analitos numéricos, porque `ExamResult` guarda valor com faixa
 * mínima e máxima. Resultado qualitativo (cor da urina, sorologia reagente)
 * ficaria sem como ser representado, então não é modelado.
 */

export type Sex = "M" | "F";

export interface AnalyteSpec {
  analyte: string;
  unit: string;
  /** Faixa de referência. Quando varia por sexo, use `bySex`. */
  min?: number;
  max?: number;
  bySex?: Record<Sex, { min: number; max: number }>;
  /** Casas decimais do valor gerado. */
  decimals?: number;
}

export interface PanelSpec {
  /** Título do documento, como aparece na lista do prontuário. */
  title: string;
  analytes: AnalyteSpec[];
}

export function referenceFor(
  spec: AnalyteSpec,
  sex: Sex
): { min: number; max: number } {
  if (spec.bySex) return spec.bySex[sex];
  return { min: spec.min ?? 0, max: spec.max ?? 0 };
}

// ── Painéis laboratoriais ────────────────────────────────────────────────────

export const PANELS: Record<string, PanelSpec> = {
  hemograma: {
    title: "Hemograma completo",
    analytes: [
      {
        analyte: "Hemoglobina",
        unit: "g/dL",
        decimals: 1,
        bySex: { M: { min: 13, max: 17 }, F: { min: 12, max: 15.5 } },
      },
      {
        analyte: "Hematócrito",
        unit: "%",
        decimals: 1,
        bySex: { M: { min: 39, max: 50 }, F: { min: 35, max: 45 } },
      },
      {
        analyte: "Eritrócitos",
        unit: "milhões/mm³",
        decimals: 2,
        bySex: { M: { min: 4.5, max: 5.9 }, F: { min: 4, max: 5.2 } },
      },
      { analyte: "VCM", unit: "fL", min: 80, max: 100, decimals: 1 },
      { analyte: "HCM", unit: "pg", min: 27, max: 32, decimals: 1 },
      { analyte: "CHCM", unit: "g/dL", min: 32, max: 36, decimals: 1 },
      { analyte: "RDW", unit: "%", min: 11.5, max: 14.5, decimals: 1 },
      { analyte: "Leucócitos", unit: "/mm³", min: 4000, max: 11000 },
      { analyte: "Neutrófilos", unit: "/mm³", min: 1700, max: 8000 },
      { analyte: "Linfócitos", unit: "/mm³", min: 900, max: 2900 },
      { analyte: "Plaquetas", unit: "/mm³", min: 150000, max: 450000 },
    ],
  },

  lipidico: {
    title: "Perfil lipídico",
    analytes: [
      { analyte: "Colesterol total", unit: "mg/dL", min: 0, max: 190 },
      { analyte: "LDL-colesterol", unit: "mg/dL", min: 0, max: 130 },
      { analyte: "HDL-colesterol", unit: "mg/dL", min: 40, max: 100 },
      { analyte: "VLDL-colesterol", unit: "mg/dL", min: 0, max: 30 },
      { analyte: "Triglicerídeos", unit: "mg/dL", min: 0, max: 150 },
      { analyte: "Colesterol não-HDL", unit: "mg/dL", min: 0, max: 160 },
    ],
  },

  glicemico: {
    title: "Perfil glicêmico",
    analytes: [
      { analyte: "Glicose de jejum", unit: "mg/dL", min: 70, max: 99 },
      { analyte: "Hemoglobina glicada (HbA1c)", unit: "%", min: 4, max: 5.6, decimals: 1 },
      { analyte: "Insulina de jejum", unit: "µU/mL", min: 2.6, max: 24.9, decimals: 1 },
      { analyte: "HOMA-IR", unit: "", min: 0, max: 2.7, decimals: 2 },
    ],
  },

  renal: {
    title: "Função renal",
    analytes: [
      { analyte: "Ureia", unit: "mg/dL", min: 15, max: 45 },
      {
        analyte: "Creatinina",
        unit: "mg/dL",
        decimals: 2,
        bySex: { M: { min: 0.7, max: 1.2 }, F: { min: 0.5, max: 0.9 } },
      },
      { analyte: "Taxa de filtração glomerular (CKD-EPI)", unit: "mL/min/1,73m²", min: 90, max: 120 },
      {
        analyte: "Ácido úrico",
        unit: "mg/dL",
        decimals: 1,
        bySex: { M: { min: 3.4, max: 7 }, F: { min: 2.4, max: 5.7 } },
      },
    ],
  },

  hepatico: {
    title: "Função hepática",
    analytes: [
      { analyte: "TGO (AST)", unit: "U/L", min: 10, max: 40 },
      { analyte: "TGP (ALT)", unit: "U/L", min: 10, max: 49 },
      {
        analyte: "Gama-GT",
        unit: "U/L",
        bySex: { M: { min: 8, max: 61 }, F: { min: 5, max: 36 } },
      },
      { analyte: "Fosfatase alcalina", unit: "U/L", min: 40, max: 129 },
      { analyte: "Bilirrubina total", unit: "mg/dL", min: 0.2, max: 1.2, decimals: 2 },
      { analyte: "Bilirrubina direta", unit: "mg/dL", min: 0, max: 0.3, decimals: 2 },
      { analyte: "Albumina", unit: "g/dL", min: 3.5, max: 5.2, decimals: 1 },
    ],
  },

  eletrolitos: {
    title: "Eletrólitos séricos",
    analytes: [
      { analyte: "Sódio", unit: "mEq/L", min: 136, max: 145 },
      { analyte: "Potássio", unit: "mEq/L", min: 3.5, max: 5.1, decimals: 1 },
      { analyte: "Cálcio total", unit: "mg/dL", min: 8.6, max: 10.2, decimals: 1 },
      { analyte: "Magnésio", unit: "mg/dL", min: 1.6, max: 2.6, decimals: 1 },
      { analyte: "Cloro", unit: "mEq/L", min: 98, max: 107 },
      { analyte: "Fósforo", unit: "mg/dL", min: 2.5, max: 4.5, decimals: 1 },
    ],
  },

  tireoide: {
    title: "Perfil tireoidiano",
    analytes: [
      { analyte: "TSH", unit: "µUI/mL", min: 0.4, max: 4.5, decimals: 2 },
      { analyte: "T4 livre", unit: "ng/dL", min: 0.89, max: 1.76, decimals: 2 },
      { analyte: "T3 total", unit: "ng/dL", min: 80, max: 200 },
    ],
  },

  cardiaco: {
    title: "Marcadores cardíacos",
    analytes: [
      { analyte: "Troponina I", unit: "ng/mL", min: 0, max: 0.04, decimals: 3 },
      { analyte: "CK-MB massa", unit: "ng/mL", min: 0, max: 5, decimals: 1 },
      { analyte: "CPK total", unit: "U/L", min: 39, max: 308 },
      { analyte: "BNP", unit: "pg/mL", min: 0, max: 100 },
    ],
  },

  coagulograma: {
    title: "Coagulograma",
    analytes: [
      { analyte: "Tempo de protrombina (atividade)", unit: "%", min: 70, max: 100 },
      { analyte: "INR", unit: "", min: 0.9, max: 1.2, decimals: 2 },
      { analyte: "TTPA", unit: "s", min: 25, max: 37, decimals: 1 },
      { analyte: "Fibrinogênio", unit: "mg/dL", min: 200, max: 400 },
    ],
  },

  ferro: {
    title: "Metabolismo do ferro e vitaminas",
    analytes: [
      { analyte: "Ferro sérico", unit: "µg/dL", min: 60, max: 160 },
      {
        analyte: "Ferritina",
        unit: "ng/mL",
        bySex: { M: { min: 30, max: 400 }, F: { min: 13, max: 150 } },
      },
      { analyte: "Saturação de transferrina", unit: "%", min: 20, max: 50 },
      { analyte: "Vitamina D (25-OH)", unit: "ng/mL", min: 30, max: 100, decimals: 1 },
      { analyte: "Vitamina B12", unit: "pg/mL", min: 200, max: 900 },
      { analyte: "Ácido fólico", unit: "ng/mL", min: 3, max: 17, decimals: 1 },
    ],
  },

  inflamatorio: {
    title: "Marcadores inflamatórios",
    analytes: [
      { analyte: "Proteína C reativa ultrassensível", unit: "mg/L", min: 0, max: 3, decimals: 2 },
      {
        analyte: "VHS (1ª hora)",
        unit: "mm/h",
        bySex: { M: { min: 0, max: 15 }, F: { min: 0, max: 20 } },
      },
    ],
  },

  urina: {
    title: "Urina tipo I (EAS)",
    analytes: [
      { analyte: "Densidade", unit: "", min: 1.005, max: 1.03, decimals: 3 },
      { analyte: "pH", unit: "", min: 5, max: 7, decimals: 1 },
      { analyte: "Leucócitos", unit: "/campo", min: 0, max: 10 },
      { analyte: "Hemácias", unit: "/campo", min: 0, max: 5 },
      { analyte: "Proteinúria de 24 horas", unit: "mg/24h", min: 0, max: 150 },
    ],
  },

  prostata: {
    title: "Rastreio prostático",
    analytes: [
      { analyte: "PSA total", unit: "ng/mL", min: 0, max: 4, decimals: 2 },
      { analyte: "Relação PSA livre/total", unit: "%", min: 15, max: 100, decimals: 1 },
    ],
  },
};

// ── Documentos sem resultado estruturado ─────────────────────────────────────
// Laudo e imagem entram como PDF: o conteúdo é descritivo e não cabe na tabela
// de analitos.

export interface NarrativeDoc {
  title: string;
  type: "REPORT" | "IMAGING" | "PRESCRIPTION";
  /** Linhas do laudo, impressas no PDF de demonstração. */
  body: string[];
}

export const REPORTS: Record<string, NarrativeDoc> = {
  ecocardiograma: {
    title: "Ecocardiograma transtorácico",
    type: "REPORT",
    body: [
      "Ventrículo esquerdo de dimensões preservadas, com espessura parietal",
      "no limite superior da normalidade. Fração de ejeção estimada em 62%",
      "pelo método de Simpson biplanar.",
      "Função diastólica com padrão de alteração do relaxamento.",
      "Valvas morfologicamente normais, sem refluxos significativos.",
      "Ausência de derrame pericárdico.",
    ],
  },
  eletrocardiograma: {
    title: "Eletrocardiograma de repouso",
    type: "REPORT",
    body: [
      "Ritmo sinusal, frequência cardíaca de 72 bpm.",
      "Eixo elétrico dentro da faixa esperada.",
      "Intervalo PR de 168 ms, QRS de 92 ms, QTc de 412 ms.",
      "Sem alterações agudas de repolarização ventricular.",
    ],
  },
  ergometrico: {
    title: "Teste ergométrico",
    type: "REPORT",
    body: [
      "Protocolo de Bruce, interrompido por fadiga muscular no 9º minuto.",
      "Capacidade funcional estimada em 10,2 MET.",
      "Comportamento pressórico com elevação além do esperado no pico.",
      "Ausência de arritmias complexas durante o esforço e a recuperação.",
    ],
  },
  mapa: {
    title: "MAPA de 24 horas",
    type: "REPORT",
    body: [
      "Média das 24 horas: 138 x 86 mmHg.",
      "Média de vigília: 142 x 89 mmHg. Média de sono: 128 x 76 mmHg.",
      "Descenso noturno da pressão sistólica de 9,8%, caracterizando padrão",
      "de descenso atenuado.",
    ],
  },
  holter: {
    title: "Holter de 24 horas",
    type: "REPORT",
    body: [
      "Ritmo sinusal predominante. Frequência média de 74 bpm.",
      "Extrassístoles supraventriculares isoladas, raras.",
      "Sem pausas maiores que 2 segundos no período analisado.",
    ],
  },
  endoscopia: {
    title: "Endoscopia digestiva alta",
    type: "REPORT",
    body: [
      "Esôfago com mucosa de aspecto habitual até a transição.",
      "Estômago com hiperemia difusa de antro.",
      "Duodeno sem lesões nas porções examinadas.",
      "Realizada biópsia de antro para pesquisa de H. pylori.",
    ],
  },
  fundoscopia: {
    title: "Mapeamento de retina",
    type: "REPORT",
    body: [
      "Meios transparentes em ambos os olhos.",
      "Disco óptico de contornos nítidos, escavação fisiológica.",
      "Mácula sem alterações. Vasos com cruzamentos preservados.",
    ],
  },
  espirometria: {
    title: "Espirometria com prova broncodilatadora",
    type: "REPORT",
    body: [
      "CVF de 3,84 L (94% do previsto).",
      "VEF1 de 3,02 L (91% do previsto).",
      "Relação VEF1/CVF de 0,79.",
      "Sem resposta significativa ao broncodilatador.",
    ],
  },
};

export const IMAGING: Record<string, NarrativeDoc> = {
  raioxTorax: {
    title: "Radiografia de tórax PA e perfil",
    type: "IMAGING",
    body: [
      "Campos pulmonares com transparência preservada.",
      "Seios costofrênicos livres.",
      "Área cardíaca no limite superior da normalidade.",
      "Arcos costais e partes moles sem alterações.",
    ],
  },
  usgAbdome: {
    title: "Ultrassonografia de abdome total",
    type: "IMAGING",
    body: [
      "Fígado de dimensões normais, com ecogenicidade difusamente aumentada,",
      "compatível com esteatose de grau leve.",
      "Vesícula biliar sem cálculos. Vias biliares não dilatadas.",
      "Rins tópicos, com relação córtico-medular preservada.",
    ],
  },
  tomografiaTorax: {
    title: "Tomografia computadorizada de tórax",
    type: "IMAGING",
    body: [
      "Exame realizado sem contraste endovenoso.",
      "Parênquima pulmonar sem consolidações ou opacidades em vidro fosco.",
      "Ausência de linfonodomegalias mediastinais.",
      "Estruturas ósseas sem lesões.",
    ],
  },
  angioCoronaria: {
    title: "Angiotomografia de artérias coronárias",
    type: "IMAGING",
    body: [
      "Escore de cálcio de Agatston: 78 (percentil 62 para idade e sexo).",
      "Artéria descendente anterior com placa calcificada em terço proximal,",
      "determinando redução luminal estimada em menos de 30%.",
      "Demais artérias sem obstruções significativas.",
    ],
  },
  ressonanciaLombar: {
    title: "Ressonância magnética de coluna lombar",
    type: "IMAGING",
    body: [
      "Redução da altura e do sinal do disco em L4-L5.",
      "Abaulamento discal difuso no mesmo nível, sem compressão radicular.",
      "Corpos vertebrais com altura e alinhamento preservados.",
    ],
  },
  densitometria: {
    title: "Densitometria óssea",
    type: "IMAGING",
    body: [
      "Coluna lombar (L1-L4): T-score de -1,4.",
      "Colo femoral: T-score de -1,1.",
      "Achados compatíveis com osteopenia, segundo critérios da OMS.",
    ],
  },
  usgTireoide: {
    title: "Ultrassonografia de tireoide",
    type: "IMAGING",
    body: [
      "Glândula tópica, de dimensões normais e ecotextura homogênea.",
      "Nódulo sólido isoecogênico de 0,7 cm no lobo direito, categoria TI-RADS 2.",
      "Ausência de linfonodomegalias cervicais.",
    ],
  },
  mamografia: {
    title: "Mamografia digital bilateral",
    type: "IMAGING",
    body: [
      "Mamas de composição predominantemente fibroglandular (categoria B).",
      "Ausência de nódulos, distorções ou microcalcificações suspeitas.",
      "Classificação BI-RADS 1.",
    ],
  },
};

export const PRESCRIPTIONS: Record<string, NarrativeDoc> = {
  antihipertensivo: {
    title: "Receita — Losartana e Hidroclorotiazida",
    type: "PRESCRIPTION",
    body: [
      "Losartana potássica 50 mg — 1 comprimido pela manhã, uso contínuo.",
      "Hidroclorotiazida 25 mg — 1 comprimido pela manhã, uso contínuo.",
      "Retorno em 90 dias com exames de controle.",
    ],
  },
  metabolico: {
    title: "Receita — Metformina e Atorvastatina",
    type: "PRESCRIPTION",
    body: [
      "Metformina 850 mg — 1 comprimido após o almoço e após o jantar.",
      "Atorvastatina 20 mg — 1 comprimido à noite, uso contínuo.",
      "Orientação nutricional e atividade física conforme tolerância.",
    ],
  },
  insulina: {
    title: "Receita — Insulina glargina",
    type: "PRESCRIPTION",
    body: [
      "Insulina glargina 100 U/mL — 18 unidades por via subcutânea à noite.",
      "Ajustar conforme glicemia capilar de jejum, segundo orientação.",
    ],
  },
  levotiroxina: {
    title: "Receita — Levotiroxina sódica",
    type: "PRESCRIPTION",
    body: [
      "Levotiroxina sódica 75 mcg — 1 comprimido em jejum, uso contínuo.",
      "Repetir TSH em 8 semanas.",
    ],
  },
  diuretico: {
    title: "Receita — Furosemida e Anlodipino",
    type: "PRESCRIPTION",
    body: [
      "Furosemida 40 mg — 1 comprimido pela manhã.",
      "Anlodipino 5 mg — 1 comprimido à noite, uso contínuo.",
      "Controle de peso diário e restrição de sódio.",
    ],
  },
  anticoagulante: {
    title: "Receita — Rivaroxabana",
    type: "PRESCRIPTION",
    body: [
      "Rivaroxabana 20 mg — 1 comprimido ao jantar, uso contínuo.",
      "Não interromper sem orientação médica.",
    ],
  },
  ferro: {
    title: "Receita — Sulfato ferroso",
    type: "PRESCRIPTION",
    body: [
      "Sulfato ferroso 40 mg de ferro elementar — 1 comprimido em jejum.",
      "Tomar com suco cítrico. Reavaliar ferritina em 90 dias.",
    ],
  },
};
