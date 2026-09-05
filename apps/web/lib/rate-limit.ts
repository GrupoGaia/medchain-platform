// Limite de tentativas por janela fixa, guardado na memoria do processo.
//
// Escolha consciente para o MVP: nao adiciona dependencia, nao pede migration e
// resolve o abuso que importa aqui, que e a mesma sessao repetindo consulta em
// sequencia. O preco esta em duas limitacoes que precisam ser conhecidas antes
// de confiar nisto como defesa de producao:
//
// 1. O contador vive no processo. Em varias instancias (Vercel serverless, por
//    exemplo) cada uma tem o seu, e o teto efetivo e o limite vezes o numero de
//    instancias ativas.
// 2. Reiniciar o servidor zera tudo.
//
// Para valer em producao, a contagem precisa sair para um armazenamento
// compartilhado (Redis ou uma tabela). Ver `revisao-pre-producao.md` nas docs.

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitRule {
  /** Tentativas permitidas dentro da janela. */
  limit: number;
  /** Duracao da janela em milissegundos. */
  windowMs: number;
  /** Injetavel para o teste nao depender do relogio real. */
  now?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Tentativas restantes na janela corrente. Zero quando bloqueado. */
  remaining: number;
  /** Segundos ate a janela virar. Nunca abaixo de 1, para o cliente nao voltar no mesmo instante. */
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, rule: RateLimitRule): RateLimitResult {
  const now = rule.now ?? Date.now();
  sweepExpired(now);

  const current = windows.get(key);

  if (!current || now >= current.resetAt) {
    const resetAt = now + rule.windowMs;
    windows.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: rule.limit - 1,
      retryAfterSeconds: secondsUntil(resetAt, now),
    };
  }

  if (current.count >= rule.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: secondsUntil(current.resetAt, now),
    };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: rule.limit - current.count,
    retryAfterSeconds: secondsUntil(current.resetAt, now),
  };
}

/** Zera o estado entre testes. Nao usar em codigo de producao. */
export function resetRateLimits() {
  windows.clear();
}

/** Quantas janelas o processo esta rastreando. Existe para o teste da limpeza. */
export function trackedWindowCount() {
  return windows.size;
}

// Uma chave usada uma vez ficaria no mapa ate o restart. A varredura e barata
// porque o mapa so cresce ate o numero de usuarios ativos na janela.
function sweepExpired(now: number) {
  for (const [key, window] of windows) {
    if (now >= window.resetAt) windows.delete(key);
  }
}

function secondsUntil(resetAt: number, now: number) {
  return Math.max(1, Math.ceil((resetAt - now) / 1000));
}
