import { z } from "zod";

export const AccessRequestStatus = z.enum([
  "PENDING",
  "APPROVED",
  "DENIED",
  "EXPIRED",
  "CANCELLED",
]);
export type AccessRequestStatus = z.infer<typeof AccessRequestStatus>;

export const CreateAccessRequestSchema = z.object({
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  scope: z.string().min(1).max(255),
  durationMinutes: z.number().int().min(15).max(480).default(60),
  reason: z.string().max(500).optional(),
});
export type CreateAccessRequestInput = z.infer<typeof CreateAccessRequestSchema>;

export const ApproveAccessRequestSchema = z.object({
  requestId: z.string().uuid(),
});
export type ApproveAccessRequestInput = z.infer<typeof ApproveAccessRequestSchema>;

export const AccessRequestResponseSchema = z.object({
  id: z.string().uuid(),
  status: AccessRequestStatus,
  patientId: z.string().uuid(),
  professionalId: z.string().uuid(),
  scope: z.string(),
  durationMinutes: z.number(),
  reason: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type AccessRequestResponse = z.infer<typeof AccessRequestResponseSchema>;
