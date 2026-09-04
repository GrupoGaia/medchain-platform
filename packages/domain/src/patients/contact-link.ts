export const CONTACT_LINK_STATUSES = ["PENDING", "APPROVED", "DENIED"] as const;
export type ContactLinkStatus = (typeof CONTACT_LINK_STATUSES)[number];

// O vinculo entre contato de emergencia e paciente nasce pendente e so vale
// depois que o paciente aprova. O status chega como string do banco, entao
// qualquer valor fora de APPROVED nega, e nao so os que estao no enum.
export function contactLinkGrantsAccess(status: string): boolean {
  return status === "APPROVED";
}
