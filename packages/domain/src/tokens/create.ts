export interface CreateTokenInput {
  patientId: string;
  professionalId: string;
  requestId: string;
  scope: string;
  durationMinutes: number;
}

export interface TokenData {
  id: string;
  patientId: string;
  professionalId: string;
  requestId: string;
  scope: string;
  expiresAt: Date;
  status: "ACTIVE";
  createdAt: Date;
}

export function buildTokenExpiry(durationMinutes: number, from = new Date()): Date {
  const expiry = new Date(from);
  expiry.setMinutes(expiry.getMinutes() + durationMinutes);
  return expiry;
}

export function createTokenData(input: CreateTokenInput, id: string): TokenData {
  return {
    id,
    patientId: input.patientId,
    professionalId: input.professionalId,
    requestId: input.requestId,
    scope: input.scope,
    expiresAt: buildTokenExpiry(input.durationMinutes),
    status: "ACTIVE",
    createdAt: new Date(),
  };
}
