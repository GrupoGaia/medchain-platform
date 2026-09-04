export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export type BloodType = (typeof BLOOD_TYPES)[number];

// Lista fechada de proposito: o valor vai para o cartao que o medico le em
// atendimento, e formato livre deixaria passar "a+" ou "O" como se fossem
// tipos validos.
export function isBloodType(value: string): value is BloodType {
  return (BLOOD_TYPES as readonly string[]).includes(value);
}
