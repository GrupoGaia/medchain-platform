import { describe, expect, it } from "vitest";
import { getManagedPatientIds } from "./patient-access";

describe("getManagedPatientIds", () => {
  it("returns the logged patient profile id", () => {
    expect(
      getManagedPatientIds({
        patientProfile: { id: "patient-1" },
        contactFor: [],
      })
    ).toEqual(["patient-1"]);
  });

  it("returns unique patients managed by an emergency contact", () => {
    expect(
      getManagedPatientIds({
        patientProfile: null,
        contactFor: [{ patientId: "patient-2" }, { patientId: "patient-2" }],
      })
    ).toEqual(["patient-2"]);
  });

  it("combines patient and emergency-contact patient ids without duplicates", () => {
    expect(
      getManagedPatientIds({
        patientProfile: { id: "patient-1" },
        contactFor: [{ patientId: "patient-1" }, { patientId: "patient-2" }],
      })
    ).toEqual(["patient-1", "patient-2"]);
  });
});
