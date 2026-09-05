import { isApiErrorWithStatus } from "../services/api-error";
import type { ContactLinkResponse } from "../services/api";

/**
 * Decide se a falha veio de falta de permissao ou de outra coisa.
 *
 * Contato de emergencia ainda nao aprovado nao gerencia paciente nenhum, entao
 * toda rota de dados do paciente responde 403. Falha de rede tambem derruba a
 * carga, e as duas pedem tela diferente: uma explica a espera, a outra nao pode
 * afirmar nada sobre o vinculo.
 */
export function deniesPatientData(error: unknown): boolean {
  return isApiErrorWithStatus(error, 403);
}

/**
 * Confirma a causa do 403 pelos vinculos da propria conta, que continuam
 * legiveis mesmo sem aprovacao. Sem esta confirmacao, qualquer 403 viraria a
 * tela de espera, inclusive o de um contato ja aprovado com outro problema.
 */
export function awaitsContactApproval(links: ContactLinkResponse[]): boolean {
  return links.some((link) => link.status === "PENDING");
}
