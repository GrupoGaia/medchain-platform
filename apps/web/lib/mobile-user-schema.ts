import { z } from "zod";

const FullNameSchema = z.string().trim().min(2).max(120);

export const CreateMobilePatientUserSchema = z.object({
  role: z.literal("PATIENT"),
  fullName: FullNameSchema,
});

export const CreateMobileEmergencyContactUserSchema = z.object({
  role: z.literal("EMERGENCY_CONTACT"),
  fullName: FullNameSchema,
  patientId: z.string().uuid(),
  relation: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(30),
});

export const CreateMobileUserSchema = z.discriminatedUnion("role", [
  CreateMobilePatientUserSchema,
  CreateMobileEmergencyContactUserSchema,
]);

export type CreateMobileUserInput = z.infer<typeof CreateMobileUserSchema>;
