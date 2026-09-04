import { describe, expect, it } from "vitest";
import { CreateMobileUserSchema } from "./mobile-user-schema";

describe("CreateMobileUserSchema", () => {
  it("accepts a patient signup payload", () => {
    const result = CreateMobileUserSchema.safeParse({
      role: "PATIENT",
      fullName: "João Batista",
      cpf: "529.982.247-25",
    });

    expect(result.success).toBe(true);
  });

  it("stores the patient cpf as digits only", () => {
    const result = CreateMobileUserSchema.parse({
      role: "PATIENT",
      fullName: "João Batista",
      cpf: "529.982.247-25",
    });

    expect(result).toMatchObject({ cpf: "52998224725" });
  });

  it("rejects a patient signup with an invalid cpf", () => {
    const result = CreateMobileUserSchema.safeParse({
      role: "PATIENT",
      fullName: "João Batista",
      cpf: "111.111.111-11",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a patient signup without a cpf", () => {
    const result = CreateMobileUserSchema.safeParse({
      role: "PATIENT",
      fullName: "João Batista",
    });

    expect(result.success).toBe(false);
  });

  it("accepts an emergency contact signup payload linked to a patient", () => {
    const result = CreateMobileUserSchema.safeParse({
      role: "EMERGENCY_CONTACT",
      fullName: "Maria Batista",
      patientId: "255cd166-4ea8-4698-8224-c2189ba029e8",
      relation: "Filha",
      phone: "(11) 9 9999-0001",
    });

    expect(result.success).toBe(true);
  });

  it("rejects privileged roles from public mobile signup", () => {
    const result = CreateMobileUserSchema.safeParse({
      role: "HEALTH_PROFESSIONAL",
      fullName: "Dr. Carlos Silva",
    });

    expect(result.success).toBe(false);
  });
});
