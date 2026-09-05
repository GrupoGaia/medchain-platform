/**
 * Geração dos valores de exame do seed de demonstração.
 *
 * É determinística de propósito: a mesma semente produz sempre o mesmo número.
 * Sem isso, cada reseed mudaria todos os resultados e nenhuma captura de tela
 * ou roteiro de demo sobreviveria à execução seguinte.
 */

import { PANELS, referenceFor, type AnalyteSpec, type Sex } from "./clinical-data";

/** Hash de string para semente de 32 bits (FNV-1a). */
function hashSeed(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** PRNG mulberry32: pequeno, sem dependência e estável entre execuções. */
function random(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Arredonda para um passo plausível de laudo: contagem celular não sai do
 * laboratório com unidade cravada.
 */
function roundToStep(value: number, decimals: number | undefined, max: number): number {
  if (decimals !== undefined) {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }
  if (max >= 100000) return Math.round(value / 1000) * 1000;
  if (max >= 10000) return Math.round(value / 100) * 100;
  if (max >= 1000) return Math.round(value / 10) * 10;
  return Math.round(value);
}

/**
 * Valor dentro da faixa, na parte central dela. Fica longe das bordas para que
 * um exame sem história clínica não apareça marcado como alterado por acaso.
 */
function valueInRange(spec: AnalyteSpec, sex: Sex, seedKey: string): number {
  const { min, max } = referenceFor(spec, sex);
  const position = 0.25 + random(hashSeed(seedKey)) * 0.5;
  return roundToStep(min + position * (max - min), spec.decimals, max);
}

export interface GeneratedResult {
  analyte: string;
  value: number;
  unit: string;
  referenceMin: number;
  referenceMax: number;
}

export interface PanelInput {
  panelKey: string;
  sex: Sex;
  /** Compõe a semente, para que dois pacientes não recebam o mesmo número. */
  patientKey: string;
  collectedAt: Date;
  /** Índice da coleta na linha do tempo, da mais antiga para a mais recente. */
  collectionIndex: number;
  /** Valores fixos por analito, um por coleta. */
  overrides?: Record<string, number[]>;
}

export function buildPanelResults(input: PanelInput): GeneratedResult[] {
  const panel = PANELS[input.panelKey];
  if (!panel) throw new Error(`Painel desconhecido no seed: ${input.panelKey}`);

  return panel.analytes.map((spec) => {
    const { min, max } = referenceFor(spec, input.sex);
    const series = input.overrides?.[spec.analyte];

    // Série mais curta que a linha do tempo repete o último valor: o analito
    // pedido só na coleta recente não precisa de um valor para cada data.
    const overridden =
      series && series.length > 0
        ? series[Math.min(input.collectionIndex, series.length - 1)]
        : undefined;

    const value =
      overridden ??
      valueInRange(
        spec,
        input.sex,
        `${input.patientKey}|${input.panelKey}|${spec.analyte}|${input.collectionIndex}`
      );

    return {
      analyte: spec.analyte,
      value,
      unit: spec.unit,
      referenceMin: min,
      referenceMax: max,
    };
  });
}

export function panelTitle(panelKey: string): string {
  const panel = PANELS[panelKey];
  if (!panel) throw new Error(`Painel desconhecido no seed: ${panelKey}`);
  return panel.title;
}

/** Número no formato do laudo brasileiro, com vírgula decimal. */
export function formatResultValue(value: number, unit: string): string {
  const decimals = Number.isInteger(value) ? 0 : (String(value).split(".")[1]?.length ?? 0);
  const text = value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return unit ? `${text}` : text;
}

/** Faixa de referência como o laudo imprime. */
export function formatReference(result: GeneratedResult): string {
  const min = formatResultValue(result.referenceMin, "");
  const max = formatResultValue(result.referenceMax, "");
  if (result.referenceMin === 0) return `até ${max}`;
  return `${min} a ${max}`;
}
