import { describe, expect, it } from "vitest";
import { canManagePatient, getManagedPatientIds } from "./patient-access";

describe("getManagedPatientIds", () => {
  it("returns the logged patient profile id", () => {
    expect(
      getManagedPatientIds({
        patientProfile: { id: "patient-1" },
        contactFor: [],
      })
    ).toEqual(["patient-1"]);
  });

  it("returns unique patients managed by an approved emergency contact", () => {
    expect(
      getManagedPatientIds({
        patientProfile: null,
        contactFor: [
          { patientId: "patient-2", status: "APPROVED" },
          { patientId: "patient-2", status: "APPROVED" },
        ],
      })
    ).toEqual(["patient-2"]);
  });

  it("combines patient and emergency-contact patient ids without duplicates", () => {
    expect(
      getManagedPatientIds({
        patientProfile: { id: "patient-1" },
        contactFor: [
          { patientId: "patient-1", status: "APPROVED" },
          { patientId: "patient-2", status: "APPROVED" },
        ],
      })
    ).toEqual(["patient-1", "patient-2"]);
  });

  // O buraco que este filtro fecha: qualquer conta criava um vinculo para um
  // paciente arbitrario e passava a ler o prontuario dele sem consentimento.
  it("ignores a link the patient has not approved", () => {
    expect(
      getManagedPatientIds({
        patientProfile: null,
        contactFor: [
          { patientId: "patient-2", status: "PENDING" },
          { patientId: "patient-3", status: "DENIED" },
        ],
      })
    ).toEqual([]);
  });

  it("keeps only the approved link when the same user has several", () => {
    expect(
      getManagedPatientIds({
        patientProfile: null,
        contactFor: [
          { patientId: "patient-2", status: "PENDING" },
          { patientId: "patient-3", status: "APPROVED" },
        ],
      })
    ).toEqual(["patient-3"]);
  });
});

describe("canManagePatient", () => {
  it("refuses a patient whose link is still pending", () => {
    const user = {
      patientProfile: null,
      contactFor: [{ patientId: "patient-2", status: "PENDING" }],
    };

    expect(canManagePatient(user, "patient-2")).toBe(false);
  });

  it("accepts a patient whose link was approved", () => {
    const user = {
      patientProfile: null,
      contactFor: [{ patientId: "patient-2", status: "APPROVED" }],
    };

    expect(canManagePatient(user, "patient-2")).toBe(true);
  });
});
