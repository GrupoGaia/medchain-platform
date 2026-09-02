export type TokenStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

export interface TokenForValidation {
  status: TokenStatus;
  expiresAt: Date;
  revokedAt: Date | null;
}

export type ValidationResult =
  | { valid: true; minutesRemaining: number }
  | { valid: false; reason: "EXPIRED" | "REVOKED" | "INACTIVE" };

export function validateToken(token: TokenForValidation, now = new Date()): ValidationResult {
  if (token.status === "REVOKED" || token.revokedAt !== null) {
    return { valid: false, reason: "REVOKED" };
  }
  if (token.status !== "ACTIVE") {
    return { valid: false, reason: "INACTIVE" };
  }
  const msRemaining = token.expiresAt.getTime() - now.getTime();
  if (msRemaining <= 0) {
    return { valid: false, reason: "EXPIRED" };
  }
  return { valid: true, minutesRemaining: Math.floor(msRemaining / 60_000) };
}

export function formatMinutesRemaining(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// A duracao concedida nao fica gravada no token: ela e a distancia entre criacao e expiracao.
// O minimo de 1 evita divisao por zero em quem usa isso como denominador de progresso.
export function tokenTotalMinutes(token: { createdAt: Date; expiresAt: Date }): number {
  const minutes = Math.round((token.expiresAt.getTime() - token.createdAt.getTime()) / 60_000);
  return Math.max(1, minutes);
}
