import { describe, expect, it } from "vitest";
import { CreateMobileUserSchema } from "./mobile-user-schema";

describe("CreateMobileUserSchema", () => {
  it("accepts a patient signup payload", () => {
    const result = CreateMobileUserSchema.safeParse({
      role: "PATIENT",
      fullName: "João Batista",
    });

    expect(result.success).toBe(true);
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
