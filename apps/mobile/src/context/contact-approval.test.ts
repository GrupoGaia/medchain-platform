import { describe, expect, it } from "vitest";
import { ApiError } from "../services/api-error";
import { awaitsContactApproval, deniesPatientData } from "./contact-approval";

describe("deniesPatientData", () => {
  it("recognizes the 403 that a contact without approval gets", () => {
    expect(deniesPatientData(new ApiError(403, "API 403: Acesso negado"))).toBe(true);
  });

  // A diferenca que motiva a funcao: sem rede nao da para afirmar que a conta
  // esta esperando aprovacao, entao a tela de espera nao pode aparecer.
  it("does not treat a network failure as a denial", () => {
    expect(deniesPatientData(new TypeError("Network request failed"))).toBe(false);
  });

  it("does not treat other api statuses as a denial", () => {
    expect(deniesPatientData(new ApiError(401, "API 401"))).toBe(false);
    expect(deniesPatientData(new ApiError(500, "API 500"))).toBe(false);
  });
});

describe("awaitsContactApproval", () => {
  it("is true while any link of the account is still pending", () => {
    expect(
      awaitsContactApproval([
        { id: "1", status: "PENDING", relation: "Filha", createdAt: "", respondedAt: null },
      ])
    ).toBe(true);
  });

  it("is false once every link got an answer", () => {
    expect(
      awaitsContactApproval([
        { id: "1", status: "DENIED", relation: "Filha", createdAt: "", respondedAt: "x" },
      ])
    ).toBe(false);
  });

  // Um contato aprovado que tomou 403 tem outro problema, e a tela de espera
  // mentiria sobre a causa.
  it("is false for an approved link", () => {
    expect(
      awaitsContactApproval([
        { id: "1", status: "APPROVED", relation: "Filho", createdAt: "", respondedAt: "x" },
      ])
    ).toBe(false);
  });

  it("is false when the account has no link at all", () => {
    expect(awaitsContactApproval([])).toBe(false);
  });
});
