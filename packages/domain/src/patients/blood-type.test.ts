import { describe, expect, it } from "vitest";
import { BLOOD_TYPES, isBloodType } from "./blood-type";

describe("BLOOD_TYPES", () => {
  it("has the eight ABO and Rh combinations", () => {
    expect([...BLOOD_TYPES]).toEqual(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
  });
});

describe("isBloodType", () => {
  it("accepts every supported type", () => {
    for (const type of BLOOD_TYPES) {
      expect(isBloodType(type)).toBe(true);
    }
  });

  // Tipo sanguineo errado no prontuario e dado clinico errado, entao a
  // validacao e por lista fechada e nao por formato.
  it("rejects anything outside the list", () => {
    expect(isBloodType("")).toBe(false);
    expect(isBloodType("a+")).toBe(false);
    expect(isBloodType("A")).toBe(false);
    expect(isBloodType("C+")).toBe(false);
    expect(isBloodType("O+ ")).toBe(false);
  });
});
