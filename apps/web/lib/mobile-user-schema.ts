import { z } from "zod";
import { isValidCpf, normalizeCpf } from "@medchain/domain";

const FullNameSchema = z.string().trim().min(2).max(120);

// O CPF e o unico jeito de o medico localizar o paciente na busca. Guardamos
// so os digitos, senao "529.982.247-25" e "52998224725" viram dois cadastros.
const CpfSchema = z
  .string()
  .trim()
  .refine(isValidCpf, "CPF inválido.")
  .transform(normalizeCpf);

export const CreateMobilePatientUserSchema = z.object({
  role: z.literal("PATIENT"),
  fullName: FullNameSchema,
  cpf: CpfSchema,
});

// O contato identifica o paciente pelo CPF, e nao pelo id interno. Um UUID
// vazado virava vinculo direto; o CPF quem tem e a familia, e mesmo assim o
// vinculo so nasce pendente.
export const CreateMobileEmergencyContactUserSchema = z.object({
  role: z.literal("EMERGENCY_CONTACT"),
  fullName: FullNameSchema,
  patientCpf: CpfSchema,
  relation: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(30),
});

export const CreateMobileUserSchema = z.discriminatedUnion("role", [
  CreateMobilePatientUserSchema,
  CreateMobileEmergencyContactUserSchema,
]);

export type CreateMobileUserInput = z.infer<typeof CreateMobileUserSchema>;
