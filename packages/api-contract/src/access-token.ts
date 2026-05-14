import { z } from "zod";

export const AccessTokenStatus = z.enum(["ACTIVE", "EXPIRED", "REVOKED"]);
export type AccessTokenStatus = z.infer<typeof AccessTokenStatus>;

export const RevokeTokenSchema = z.object({
  tokenId: z.string().uuid(),
  reason: z.string().max(255).optional(),
});
export type RevokeTokenInput = z.infer<typeof RevokeTokenSchema>;

export const AccessTokenResponseSchema = z.object({
  id: z.string().uuid(),
  status: AccessTokenStatus,
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  scope: z.string(),
  expiresAt: z.string().datetime(),
  revokedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  minutesRemaining: z.number().nonnegative(),
});
export type AccessTokenResponse = z.infer<typeof AccessTokenResponseSchema>;
