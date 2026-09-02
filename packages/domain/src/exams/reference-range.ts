// A faixa e inclusiva nas duas pontas: valor igual ao minimo ou ao maximo
// esta dentro do normal.
export function isOutOfRange(
  value: number,
  referenceMin: number,
  referenceMax: number
): boolean {
  return value < referenceMin || value > referenceMax;
}
