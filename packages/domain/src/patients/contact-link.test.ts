import { describe, expect, it } from "vitest";
import { CONTACT_LINK_STATUSES, contactLinkGrantsAccess } from "./contact-link";

describe("CONTACT_LINK_STATUSES", () => {
  it("has exactly the three supported statuses", () => {
    expect([...CONTACT_LINK_STATUSES]).toEqual(["PENDING", "APPROVED", "DENIED"]);
  });
});

describe("contactLinkGrantsAccess", () => {
  it("grants access only after the patient approves the link", () => {
    expect(contactLinkGrantsAccess("APPROVED")).toBe(true);
  });

  // O vinculo nasce pendente. Se pendente valesse, qualquer pessoa se
  // declararia contato de um paciente e leria o prontuario dele na hora.
  it("denies a link the patient has not answered yet", () => {
    expect(contactLinkGrantsAccess("PENDING")).toBe(false);
  });

  it("denies a link the patient refused", () => {
    expect(contactLinkGrantsAccess("DENIED")).toBe(false);
  });

  // Status desconhecido nega, para que uma coluna nova no banco nunca abra
  // acesso por omissao.
  it("denies an unknown status", () => {
    expect(contactLinkGrantsAccess("")).toBe(false);
    expect(contactLinkGrantsAccess("approved")).toBe(false);
    expect(contactLinkGrantsAccess("SOMETHING_ELSE")).toBe(false);
  });
});
