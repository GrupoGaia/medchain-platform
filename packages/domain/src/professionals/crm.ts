/**
 * Rótulo do registro profissional.
 *
 * O valor gravado varia: parte dos cadastros já traz o prefixo ("CRM-SP
 * 123456") e parte guarda só o número. Prefixar sem checar produzia
 * "CRM CRM-SP 123456" na tela.
 */
export function formatCrm(crm: string): string {
  const value = crm.trim();
  if (value.length === 0) return "";
  return /^crm\b|^crm-/i.test(value) ? value : `CRM ${value}`;
}
