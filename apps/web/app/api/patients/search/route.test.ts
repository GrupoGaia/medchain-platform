import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { resetRateLimits } from "@/lib/rate-limit";
import { SEARCH_RATE_LIMIT } from "./rate-limit-policy";

type DemoUser = {
  id: string;
  professionalProfile?: { id: string } | null;
  patientProfile?: { id: string } | null;
};

const state = vi.hoisted(() => ({
  currentUser: null as DemoUser | null,
  patientsByCpf: new Map<string, { id: string; fullName: string }>(),
}));

vi.mock("@/lib/api-auth", () => ({
  getApiUser: vi.fn(async () => state.currentUser),
  unauthorized: () => NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
  forbidden: () => NextResponse.json({ error: "Acesso negado" }, { status: 403 }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    patientProfile: {
      findUnique: vi.fn(async ({ where }: { where: { cpf: string } }) => {
        return state.patientsByCpf.get(where.cpf) ?? null;
      }),
    },
  },
}));

const DOCTOR: DemoUser = {
  id: "44444444-4444-4444-8444-444444444444",
  professionalProfile: { id: "22222222-2222-4222-8222-222222222222" },
};

const PATIENT_USER: DemoUser = {
  id: "33333333-3333-4333-8333-333333333333",
  patientProfile: { id: "11111111-1111-4111-8111-111111111111" },
};

function search(cpf: string) {
  return new NextRequest(
    `http://localhost:3000/api/patients/search?cpf=${encodeURIComponent(cpf)}`
  );
}

const OTHER_DOCTOR: DemoUser = {
  id: "55555555-5555-4555-8555-555555555555",
  professionalProfile: { id: "66666666-6666-4666-8666-666666666666" },
};

beforeEach(() => {
  state.currentUser = null;
  state.patientsByCpf = new Map([
    ["52998224725", { id: "11111111-1111-4111-8111-111111111111", fullName: "João Batista" }],
  ]);
  resetRateLimits();
});

describe("GET /api/patients/search", () => {
  it("returns the patient for an exact cpf, formatted or not", async () => {
    state.currentUser = DOCTOR;
    const { GET } = await import("./route");

    const plain = await GET(search("52998224725"));
    expect(plain.status).toBe(200);
    expect(await plain.json()).toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      fullName: "João Batista",
    });

    const formatted = await GET(search("529.982.247-25"));
    expect(formatted.status).toBe(200);
  });

  it("rejects a request without a session", async () => {
    state.currentUser = null;
    const { GET } = await import("./route");

    expect((await GET(search("52998224725"))).status).toBe(401);
  });

  // A busca existe para o portal medico. Se o paciente pudesse chamar, ele
  // localizaria qualquer outro paciente pelo CPF.
  it("rejects a user that is not a health professional", async () => {
    state.currentUser = PATIENT_USER;
    const { GET } = await import("./route");

    expect((await GET(search("52998224725"))).status).toBe(403);
  });

  it("rejects a malformed cpf before touching the database", async () => {
    state.currentUser = DOCTOR;
    const { GET } = await import("./route");

    expect((await GET(search("111.111.111-11"))).status).toBe(422);
    expect((await GET(search("529982247"))).status).toBe(422);
    expect((await GET(search(""))).status).toBe(422);
  });

  it("returns 404 for a valid cpf that belongs to nobody", async () => {
    state.currentUser = DOCTOR;
    const { GET } = await import("./route");

    const response = await GET(search("111.444.777-35"));
    expect(response.status).toBe(404);
  });

  // O ponto da rota: nenhuma resposta pode devolver mais de um paciente, senao
  // ela vira a listagem que estamos removendo do formulario.
  it("never returns a list", async () => {
    state.currentUser = DOCTOR;
    const { GET } = await import("./route");

    const body = await (await GET(search("52998224725"))).json();
    expect(Array.isArray(body)).toBe(false);
  });
});

// Quem tem uma lista de CPFs consegue descobrir, um a um, quais deles sao
// pacientes da plataforma. O CPF exato ja limita muito, mas nao limita o ritmo.
describe("GET /api/patients/search: limite de tentativas", () => {
  it("blocks the attempt right after the limit and says when to retry", async () => {
    state.currentUser = DOCTOR;
    const { GET } = await import("./route");

    for (let i = 0; i < SEARCH_RATE_LIMIT.limit; i++) {
      expect((await GET(search("52998224725"))).status).toBe(200);
    }

    const blocked = await GET(search("52998224725"));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  // Uma sequencia de CPFs que nao existem e exatamente o formato de uma
  // varredura, entao a tentativa sem resultado tem de contar igual.
  it("counts attempts that found nobody", async () => {
    state.currentUser = DOCTOR;
    const { GET } = await import("./route");

    for (let i = 0; i < SEARCH_RATE_LIMIT.limit; i++) {
      expect((await GET(search("111.444.777-35"))).status).toBe(404);
    }

    expect((await GET(search("52998224725"))).status).toBe(429);
  });

  it("keeps the budget separate for each doctor", async () => {
    const { GET } = await import("./route");

    state.currentUser = DOCTOR;
    for (let i = 0; i < SEARCH_RATE_LIMIT.limit; i++) {
      await GET(search("52998224725"));
    }
    expect((await GET(search("52998224725"))).status).toBe(429);

    state.currentUser = OTHER_DOCTOR;
    expect((await GET(search("52998224725"))).status).toBe(200);
  });

  // O limite e por medico, entao ele so pode ser cobrado depois de saber quem
  // esta chamando. Senao um anonimo gastaria a cota de alguem.
  it("does not spend anyone's budget on requests that never authenticated", async () => {
    const { GET } = await import("./route");

    state.currentUser = null;
    for (let i = 0; i < SEARCH_RATE_LIMIT.limit * 2; i++) {
      expect((await GET(search("52998224725"))).status).toBe(401);
    }

    state.currentUser = DOCTOR;
    expect((await GET(search("52998224725"))).status).toBe(200);
  });
});
