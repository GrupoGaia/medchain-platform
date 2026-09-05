/**
 * Erro de resposta da API, com o status preservado.
 *
 * Existe porque `403` e falha de rede pedem telas diferentes: o primeiro
 * significa que a conta nao tem acesso aos dados daquele paciente, e o segundo
 * que nao deu para perguntar. Antes o status so vivia dentro do texto da
 * mensagem, e quem quisesse decidir por ele teria de ler string.
 *
 * Fica em modulo proprio, sem dependencia, para poder ser importado por codigo
 * testavel sem arrastar junto o cliente do Supabase e o `expo-constants`.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isApiErrorWithStatus(error: unknown, status: number): error is ApiError {
  return error instanceof ApiError && error.status === status;
}
