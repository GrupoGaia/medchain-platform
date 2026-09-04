import { describe, expect, it } from "vitest";
import { UpdatePatientProfileSchema } from "./patient-profile-schema";

const valid = {
  bloodType: "A+",
  allergies: ["Penicilina"],
  chronicConditions: ["Hipertensão arterial"],
  continuousMeds: ["Losartana 50mg"],
};

describe("UpdatePatientProfileSchema", () => {
  it("accepts a complete clinical profile", () => {
    expect(UpdatePatientProfileSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty lists, because the patient can clear what no longer applies", () => {
    const result = UpdatePatientProfileSchema.safeParse({
      ...valid,
      allergies: [],
      chronicConditions: [],
      continuousMeds: [],
    });

    expect(result.success).toBe(true);
  });

  // "Não informado" precisa ser representável. Sem isso, quem marcou o tipo
  // errado nao teria como desfazer.
  it("accepts a null blood type", () => {
    expect(UpdatePatientProfileSchema.safeParse({ ...valid, bloodType: null }).success).toBe(
      true
    );
  });

  it("rejects a blood type outside the list", () => {
    expect(UpdatePatientProfileSchema.safeParse({ ...valid, bloodType: "C+" }).success).toBe(
      false
    );
    expect(UpdatePatientProfileSchema.safeParse({ ...valid, bloodType: "a+" }).success).toBe(
      false
    );
  });

  it("trims each entry and drops the blank ones", () => {
    const result = UpdatePatientProfileSchema.parse({
      ...valid,
      allergies: ["  Penicilina  ", "", "   ", "AAS"],
    });

    expect(result.allergies).toEqual(["Penicilina", "AAS"]);
  });

  it("removes duplicates, comparing without case", () => {
    const result = UpdatePatientProfileSchema.parse({
      ...valid,
      allergies: ["Penicilina", "penicilina", "PENICILINA"],
    });

    expect(result.allergies).toEqual(["Penicilina"]);
  });

  it("rejects an entry longer than the column allows", () => {
    const result = UpdatePatientProfileSchema.safeParse({
      ...valid,
      allergies: ["a".repeat(121)],
    });

    expect(result.success).toBe(false);
  });

  // Limite de itens para o campo nao virar deposito de texto livre e nao
  // estourar o cartao que o medico le em atendimento.
  it("rejects more entries than the limit", () => {
    const result = UpdatePatientProfileSchema.safeParse({
      ...valid,
      allergies: Array.from({ length: 31 }, (_, i) => `Alergia ${i}`),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing list instead of guessing it is empty", () => {
    const result = UpdatePatientProfileSchema.safeParse({
      bloodType: valid.bloodType,
      chronicConditions: valid.chronicConditions,
      continuousMeds: valid.continuousMeds,
    });

    expect(result.success).toBe(false);
  });
});
