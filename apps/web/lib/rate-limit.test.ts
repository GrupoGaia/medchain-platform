import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimits, trackedWindowCount } from "./rate-limit";

const RULE = { limit: 3, windowMs: 60_000 };

beforeEach(() => {
  resetRateLimits();
});

describe("checkRateLimit", () => {
  it("allows up to the limit and reports what is left", () => {
    const first = checkRateLimit("a", { ...RULE, now: 0 });
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);

    expect(checkRateLimit("a", { ...RULE, now: 0 }).remaining).toBe(1);

    const last = checkRateLimit("a", { ...RULE, now: 0 });
    expect(last.allowed).toBe(true);
    expect(last.remaining).toBe(0);
  });

  it("blocks the attempt after the limit and says when to retry", () => {
    for (let i = 0; i < RULE.limit; i++) {
      checkRateLimit("a", { ...RULE, now: 0 });
    }

    const blocked = checkRateLimit("a", { ...RULE, now: 15_000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBe(45);
  });

  // Sem isto o bloqueio duraria para sempre: a janela precisa virar sozinha.
  it("opens a fresh window once the old one expires", () => {
    for (let i = 0; i < RULE.limit; i++) {
      checkRateLimit("a", { ...RULE, now: 0 });
    }
    expect(checkRateLimit("a", { ...RULE, now: 59_999 }).allowed).toBe(false);

    const renewed = checkRateLimit("a", { ...RULE, now: 60_000 });
    expect(renewed.allowed).toBe(true);
    expect(renewed.remaining).toBe(RULE.limit - 1);
  });

  // O limite e por medico. Um estourando o dele nao pode travar a busca do outro.
  it("keeps one counter per key", () => {
    for (let i = 0; i < RULE.limit; i++) {
      checkRateLimit("a", { ...RULE, now: 0 });
    }

    expect(checkRateLimit("a", { ...RULE, now: 0 }).allowed).toBe(false);
    expect(checkRateLimit("b", { ...RULE, now: 0 }).allowed).toBe(true);
  });

  // O mapa vive no processo. Sem a limpeza, cada chave usada uma vez so ficaria
  // ocupando memoria ate o restart.
  it("drops windows that expired instead of keeping them forever", () => {
    checkRateLimit("a", { ...RULE, now: 0 });
    expect(trackedWindowCount()).toBe(1);

    checkRateLimit("b", { ...RULE, now: 120_000 });
    expect(trackedWindowCount()).toBe(1);
  });

  // Um retry-after de 0 faria o cliente tentar de novo no mesmo instante e
  // levar outro 429.
  it("never reports a retry-after below one second", () => {
    for (let i = 0; i < RULE.limit; i++) {
      checkRateLimit("a", { ...RULE, now: 0 });
    }

    expect(checkRateLimit("a", { ...RULE, now: 59_999 }).retryAfterSeconds).toBe(1);
  });
});
