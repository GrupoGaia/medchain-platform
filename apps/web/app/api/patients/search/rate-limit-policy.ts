import type { RateLimitRule } from "@/lib/rate-limit";

// Dez por minuto. Em atendimento o medico digita um CPF, confere o nome e segue;
// dez seguidos ja e muito mais do que o uso real pede, e corta o ritmo de quem
// esta testando uma lista de CPFs para ver quais respondem.
//
// Fica fora de `route.ts` porque o Next so aceita naquele arquivo os nomes que
// ele reconhece como handler ou configuracao de rota. Qualquer outro export
// passa no teste e quebra no `next build`.
export const SEARCH_RATE_LIMIT: RateLimitRule = { limit: 10, windowMs: 60_000 };
