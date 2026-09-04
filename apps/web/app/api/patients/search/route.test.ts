import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

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

beforeEach(() => {
  state.currentUser = null;
  state.patientsByCpf = new Map([
    ["52998224725", { id: "11111111-1111-4111-8111-111111111111", fullName: "João Batista" }],
  ]);
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
