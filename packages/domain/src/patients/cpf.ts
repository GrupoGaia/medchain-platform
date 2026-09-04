const CPF_LENGTH = 11;

export function normalizeCpf(input: string): string {
  return input.replace(/\D/g, "");
}

// Digito verificador do CPF: soma ponderada decrescente, resto da divisao por
// 11, e o digito e 11 menos o resto. Resto 0 ou 1 vira digito 0.
function checkDigit(digits: string, weightStart: number): number {
  let sum = 0;
  for (let i = 0; i < digits.length; i += 1) {
    sum += Number(digits[i]) * (weightStart - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(input: string): boolean {
  const digits = normalizeCpf(input);
  if (digits.length !== CPF_LENGTH) return false;

  // 000.000.000-00 e as demais sequencias repetidas satisfazem a conta dos
  // digitos verificadores, entao a rejeicao precisa ser explicita.
  if (/^(\d)\1{10}$/.test(digits)) return false;

  if (checkDigit(digits.slice(0, 9), 10) !== Number(digits[9])) return false;
  return checkDigit(digits.slice(0, 10), 11) === Number(digits[10]);
}

export function formatCpf(input: string): string {
  const digits = normalizeCpf(input);
  if (digits.length !== CPF_LENGTH) return input;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}
