import { z } from "zod";
import { BLOOD_TYPES } from "@medchain/domain";

const MAX_ENTRY_LENGTH = 120;
const MAX_ENTRIES = 30;

// O paciente digita item a item, entao entrada em branco e repetida chegam o
// tempo todo. Limpar aqui evita que o cartao do medico exiba linha vazia ou a
// mesma alergia tres vezes.
const ClinicalListSchema = z
  .array(z.string().max(MAX_ENTRY_LENGTH))
  .transform((entries) => {
    const seen = new Set<string>();
    const cleaned: string[] = [];

    for (const entry of entries) {
      const value = entry.trim();
      if (!value) continue;

      const key = value.toLocaleLowerCase("pt-BR");
      if (seen.has(key)) continue;

      seen.add(key);
      cleaned.push(value);
    }

    return cleaned;
  })
  .refine((entries) => entries.length <= MAX_ENTRIES, {
    message: `No máximo ${MAX_ENTRIES} itens.`,
  });

export const UpdatePatientProfileSchema = z.object({
  // Nulo representa "não informado", que precisa ser alcancavel por quem
  // marcou o tipo errado antes.
  bloodType: z.enum(BLOOD_TYPES).nullable(),
  allergies: ClinicalListSchema,
  chronicConditions: ClinicalListSchema,
  continuousMeds: ClinicalListSchema,
});

export type UpdatePatientProfileInput = z.infer<typeof UpdatePatientProfileSchema>;
