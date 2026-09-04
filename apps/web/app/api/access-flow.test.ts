import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

type DemoUser = {
  id: string;
  patientProfile?: { id: string } | null;
  professionalProfile?: { id: string } | null;
  contactFor?: Array<{ patientId: string; status: string }> | null;
};

type AccessRequest = {
  id: string;
  patientId: string;
  professionalId: string;
  requestedById: string;
  scope: string;
  durationMinutes: number;
  reason: string | null;
  status: "PENDING" | "APPROVED" | "DENIED";
  patient?: { emergencyContacts: Array<{ userId: string; status: string }> };
};

type AccessToken = {
  id: string;
  requestId: string;
  patientId: string;
  professionalId: string;
  scope: string;
  expiresAt: Date;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  revokedAt: Date | null;
};

type MedicalDocument = {
  id: string;
  patientId: string;
  storageKey: string;
  type: string;
};

type AccessLog = {
  tokenId: string;
  actorUserId: string;
  patientId: string;
  eventType: "APPROVE" | "REVOKE";
  channel: "MOBILE_APP" | "WEB_PORTAL";
};

const state = vi.hoisted(() => ({
  currentUser: null as DemoUser | null,
  accessRequests: new Map<string, AccessRequest>(),
  accessTokens: new Map<string, AccessToken>(),
  accessLogs: [] as AccessLog[],
  documents: new Map<string, MedicalDocument>(),
  requestSequence: 0,
  tokenSequence: 0,
  contactLinkStatus: "APPROVED" as string,
}));

const PATIENT_ID = "11111111-1111-4111-8111-111111111111";
const DOCTOR_ID = "22222222-2222-4222-8222-222222222222";
const PATIENT_USER_ID = "33333333-3333-4333-8333-333333333333";
const DOCTOR_USER_ID = "44444444-4444-4444-8444-444444444444";
const CONTACT_USER_ID = "55555555-5555-4555-8555-555555555555";

vi.mock("@/lib/api-auth", () => ({
  getApiUser: vi.fn(async () => state.currentUser),
  unauthorized: () => NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
  forbidden: () => NextResponse.json({ error: "Acesso negado" }, { status: 403 }),
}));

vi.mock("@/lib/storage", () => ({
  createSignedUrl: vi.fn(async (storageKey: string) => `https://storage.local/${storageKey}?signed=1`),
}));

vi.mock("@/lib/api-error", () => ({
  getRequestId: vi.fn(() => "test-request-id"),
  reportApiError: vi.fn(),
}));

vi.mock("@/lib/patient-access", () => ({
  getManagedPatientIds: (user: DemoUser) => {
    const ids = new Set<string>();
    if (user.patientProfile?.id) ids.add(user.patientProfile.id);
    // Espelha o filtro real: vinculo nao aprovado nao gerencia paciente nenhum.
    for (const contact of user.contactFor ?? []) {
      if (contact.status === "APPROVED") ids.add(contact.patientId);
    }
    return Array.from(ids);
  },
  canManagePatient: (user: DemoUser, patientId: string) => {
    if (user.patientProfile?.id === patientId) return true;
    return (user.contactFor ?? []).some(
      (contact) => contact.patientId === patientId && contact.status === "APPROVED"
    );
  },
}));

vi.mock("@/lib/prisma", () => {
  const prisma = {
    patientProfile: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
        where.id === PATIENT_ID ? { id: PATIENT_ID, fullName: "João Batista" } : null
      ),
    },
    medicalDocument: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
        state.documents.get(where.id) ?? null
      ),
    },
    accessRequest: {
      create: vi.fn(async ({ data }: { data: Omit<AccessRequest, "id" | "status"> }) => {
        const accessRequest: AccessRequest = {
          id: `request-${++state.requestSequence}`,
          ...data,
          status: "PENDING",
        };
        state.accessRequests.set(accessRequest.id, accessRequest);
        return accessRequest;
      }),
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        const accessRequest = state.accessRequests.get(where.id);
        if (!accessRequest) return null;
        return {
          ...accessRequest,
          patient: {
            emergencyContacts: [
              { userId: CONTACT_USER_ID, status: state.contactLinkStatus },
            ],
          },
        };
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<AccessRequest> }) => {
        const accessRequest = state.accessRequests.get(where.id);
        if (!accessRequest) throw new Error(`AccessRequest not found: ${where.id}`);
        const updated = { ...accessRequest, ...data };
        state.accessRequests.set(where.id, updated);
        return updated;
      }),
    },
    accessToken: {
      create: vi.fn(async ({ data }: { data: Omit<AccessToken, "id" | "revokedAt"> }) => {
        const token: AccessToken = {
          id: `token-${++state.tokenSequence}`,
          ...data,
          revokedAt: null,
        };
        state.accessTokens.set(token.id, token);
        return token;
      }),
      findFirst: vi.fn(async ({ where }: { where: { patientId: string; professionalId: string; status: string; expiresAt?: { gt: Date } } }) => {
        return (
          Array.from(state.accessTokens.values()).find((token) => {
            const expiresAfter = where.expiresAt ? token.expiresAt > where.expiresAt.gt : true;
            return (
              token.patientId === where.patientId &&
              token.professionalId === where.professionalId &&
              token.status === where.status &&
              expiresAfter
            );
          }) ?? null
        );
      }),
      findMany: vi.fn(async ({ where }: { where: { patientId: string; professionalId: string; status: string; expiresAt?: { gt: Date } } }) => {
        return Array.from(state.accessTokens.values()).filter((token) => {
          const expiresAfter = where.expiresAt ? token.expiresAt > where.expiresAt.gt : true;
          return (
            token.patientId === where.patientId &&
            token.professionalId === where.professionalId &&
            token.status === where.status &&
            expiresAfter
          );
        });
      }),
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) =>
        state.accessTokens.get(where.id) ?? null
      ),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Partial<AccessToken> }) => {
        const token = state.accessTokens.get(where.id);
        if (!token) throw new Error(`AccessToken not found: ${where.id}`);
        const updated = { ...token, ...data };
        state.accessTokens.set(where.id, updated);
        return updated;
      }),
      updateMany: vi.fn(
        async ({
          where,
          data,
        }: {
          where: { patientId: string; professionalId: string; status: string; expiresAt?: { gt: Date } };
          data: Partial<AccessToken>;
        }) => {
          const matches = Array.from(state.accessTokens.values()).filter((token) => {
            const expiresAfter = where.expiresAt ? token.expiresAt > where.expiresAt.gt : true;
            return (
              token.patientId === where.patientId &&
              token.professionalId === where.professionalId &&
              token.status === where.status &&
              expiresAfter
            );
          });
          for (const token of matches) {
            state.accessTokens.set(token.id, { ...token, ...data });
          }
          return { count: matches.length };
        }
      ),
    },
    accessLog: {
      create: vi.fn(async ({ data }: { data: AccessLog }) => {
        state.accessLogs.push(data);
        return data;
      }),
      findMany: vi.fn(async ({ where }: { where: { patientId: { in: string[] } } }) =>
        state.accessLogs.filter((log) => where.patientId.in.includes(log.patientId))
      ),
    },
    $transaction: vi.fn(async (operations: Array<Promise<unknown>>) => Promise.all(operations)),
  };

  return { prisma };
});

function request(path: string, init?: RequestInit) {
  return new NextRequest(new Request(`http://localhost:3000${path}`, init));
}

async function json(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("critical API access flow", () => {
  beforeEach(() => {
    state.currentUser = null;
    state.accessRequests.clear();
    state.accessTokens.clear();
    state.accessLogs.length = 0;
    state.documents.clear();
    state.contactLinkStatus = "APPROVED";
    state.requestSequence = 0;
    state.tokenSequence = 0;
    state.documents.set("doc-1", {
      id: "doc-1",
      patientId: PATIENT_ID,
      storageKey: `${PATIENT_ID}/doc-1.pdf`,
      type: "EXAM",
    });
    state.documents.set("doc-2", {
      id: "doc-2",
      patientId: PATIENT_ID,
      storageKey: `${PATIENT_ID}/doc-2.pdf`,
      type: "PRESCRIPTION",
    });
  });

  it("creates, approves, authorizes document access, revokes, and audits the flow", async () => {
    const { POST: createAccessRequest } = await import("./access-requests/route");
    const { POST: approveAccessRequest } = await import("./access-requests/[id]/approve/route");
    const { GET: getDocumentUrl } = await import("./documents/[id]/route");
    const { POST: revokeToken } = await import("./tokens/[id]/revoke/route");
    const { GET: getAuditLogs } = await import("./audit-logs/route");

    state.currentUser = {
      id: DOCTOR_USER_ID,
      professionalProfile: { id: DOCTOR_ID },
      patientProfile: null,
      contactFor: [],
    };

    const forbiddenBeforeRequest = await getDocumentUrl(request("/api/documents/doc-1"), {
      params: Promise.resolve({ id: "doc-1" }),
    });
    expect(forbiddenBeforeRequest.status).toBe(403);

    const created = await createAccessRequest(
      request("/api/access-requests", {
        method: "POST",
        body: JSON.stringify({
          patientId: PATIENT_ID,
          scope: "FULL",
          durationMinutes: 30,
          reason: "Atendimento de urgência",
        }),
      })
    );
    expect(created.status).toBe(201);
    const createdBody = await json(created);
    expect(createdBody).toMatchObject({
      id: "request-1",
      patientId: PATIENT_ID,
      professionalId: DOCTOR_ID,
      requestedById: DOCTOR_USER_ID,
      status: "PENDING",
    });

    state.currentUser = {
      id: PATIENT_USER_ID,
      patientProfile: { id: PATIENT_ID },
      professionalProfile: null,
      contactFor: [],
    };

    const approved = await approveAccessRequest(
      request("/api/access-requests/request-1/approve", { method: "POST" }),
      {
        params: Promise.resolve({ id: "request-1" }),
      }
    );
    expect(approved.status).toBe(201);
    const approvedBody = await json(approved);
    expect(approvedBody).toMatchObject({
      id: "token-1",
      requestId: "request-1",
      patientId: PATIENT_ID,
      professionalId: DOCTOR_ID,
      status: "ACTIVE",
    });
    expect(state.accessRequests.get("request-1")?.status).toBe("APPROVED");

    state.currentUser = {
      id: DOCTOR_USER_ID,
      professionalProfile: { id: DOCTOR_ID },
      patientProfile: null,
      contactFor: [],
    };

    const signedDocument = await getDocumentUrl(request("/api/documents/doc-1"), {
      params: Promise.resolve({ id: "doc-1" }),
    });
    expect(signedDocument.status).toBe(200);
    await expect(json(signedDocument)).resolves.toEqual({
      signedUrl: `https://storage.local/${PATIENT_ID}/doc-1.pdf?signed=1`,
    });

    const revoked = await revokeToken(request("/api/tokens/token-1/revoke"), {
      params: Promise.resolve({ id: "token-1" }),
    });
    expect(revoked.status).toBe(200);
    const revokedBody = await json(revoked);
    expect(revokedBody).toMatchObject({ id: "token-1", status: "REVOKED" });

    const forbiddenAfterRevoke = await getDocumentUrl(request("/api/documents/doc-1"), {
      params: Promise.resolve({ id: "doc-1" }),
    });
    expect(forbiddenAfterRevoke.status).toBe(403);

    state.currentUser = {
      id: PATIENT_USER_ID,
      patientProfile: { id: PATIENT_ID },
      professionalProfile: null,
      contactFor: [],
    };

    const auditLogs = await getAuditLogs(request("/api/audit-logs"));
    expect(auditLogs.status).toBe(200);
    const auditBody = await auditLogs.json();
    expect(auditBody).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tokenId: "token-1",
          actorUserId: PATIENT_USER_ID,
          patientId: PATIENT_ID,
          eventType: "APPROVE",
          channel: "MOBILE_APP",
        }),
        expect.objectContaining({
          tokenId: "token-1",
          actorUserId: DOCTOR_USER_ID,
          patientId: PATIENT_ID,
          eventType: "REVOKE",
          channel: "MOBILE_APP",
        }),
      ])
    );
  });

  it("blocks a document whose type is outside the token scope", async () => {
    const { POST: createAccessRequest } = await import("./access-requests/route");
    const { POST: approveAccessRequest } = await import("./access-requests/[id]/approve/route");
    const { GET: getDocumentUrl } = await import("./documents/[id]/route");

    state.currentUser = {
      id: DOCTOR_USER_ID,
      professionalProfile: { id: DOCTOR_ID },
      patientProfile: null,
      contactFor: [],
    };

    const created = await createAccessRequest(
      request("/api/access-requests", {
        method: "POST",
        body: JSON.stringify({
          patientId: PATIENT_ID,
          scope: "EXAMS",
          durationMinutes: 60,
        }),
      })
    );
    expect(created.status).toBe(201);
    const createdBody = await json(created);
    const requestId = createdBody.id as string;

    state.currentUser = {
      id: PATIENT_USER_ID,
      patientProfile: { id: PATIENT_ID },
      professionalProfile: null,
      contactFor: [],
    };

    const approved = await approveAccessRequest(
      request(`/api/access-requests/${requestId}/approve`, { method: "POST" }),
      {
        params: Promise.resolve({ id: requestId }),
      }
    );
    expect(approved.status).toBe(201);

    state.currentUser = {
      id: DOCTOR_USER_ID,
      professionalProfile: { id: DOCTOR_ID },
      patientProfile: null,
      contactFor: [],
    };

    const allowed = await getDocumentUrl(request("/api/documents/doc-1"), {
      params: Promise.resolve({ id: "doc-1" }),
    });
    expect(allowed.status).toBe(200);

    const blocked = await getDocumentUrl(request("/api/documents/doc-2"), {
      params: Promise.resolve({ id: "doc-2" }),
    });
    expect(blocked.status).toBe(403);
  });

  it("allows access when the doctor has more than one active token with complementary scopes", async () => {
    const { GET: getDocumentUrl } = await import("./documents/[id]/route");

    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);

    state.accessTokens.set("token-exams", {
      id: "token-exams",
      requestId: "request-exams",
      patientId: PATIENT_ID,
      professionalId: DOCTOR_ID,
      scope: "EXAMS",
      expiresAt: oneHourFromNow,
      status: "ACTIVE",
      revokedAt: null,
    });
    state.accessTokens.set("token-prescriptions", {
      id: "token-prescriptions",
      requestId: "request-prescriptions",
      patientId: PATIENT_ID,
      professionalId: DOCTOR_ID,
      scope: "PRESCRIPTIONS",
      expiresAt: oneHourFromNow,
      status: "ACTIVE",
      revokedAt: null,
    });

    state.currentUser = {
      id: DOCTOR_USER_ID,
      professionalProfile: { id: DOCTOR_ID },
      patientProfile: null,
      contactFor: [],
    };

    const examResponse = await getDocumentUrl(request("/api/documents/doc-1"), {
      params: Promise.resolve({ id: "doc-1" }),
    });
    expect(examResponse.status).toBe(200);

    const prescriptionResponse = await getDocumentUrl(request("/api/documents/doc-2"), {
      params: Promise.resolve({ id: "doc-2" }),
    });
    expect(prescriptionResponse.status).toBe(200);
  });

  it("lets the patient owner read their own documents of any type without a token, since scope only limits third parties", async () => {
    const { GET: getDocumentUrl } = await import("./documents/[id]/route");

    state.currentUser = {
      id: PATIENT_USER_ID,
      patientProfile: { id: PATIENT_ID },
      professionalProfile: null,
      contactFor: [],
    };

    expect(state.accessTokens.size).toBe(0);

    const examResponse = await getDocumentUrl(request("/api/documents/doc-1"), {
      params: Promise.resolve({ id: "doc-1" }),
    });
    expect(examResponse.status).toBe(200);
    await expect(json(examResponse)).resolves.toEqual({
      signedUrl: `https://storage.local/${PATIENT_ID}/doc-1.pdf?signed=1`,
    });

    const prescriptionResponse = await getDocumentUrl(request("/api/documents/doc-2"), {
      params: Promise.resolve({ id: "doc-2" }),
    });
    expect(prescriptionResponse.status).toBe(200);
    await expect(json(prescriptionResponse)).resolves.toEqual({
      signedUrl: `https://storage.local/${PATIENT_ID}/doc-2.pdf?signed=1`,
    });
  });

  it("revokes the previous active token when the patient approves a new request", async () => {
    const { POST: createAccessRequest } = await import("./access-requests/route");
    const { POST: approveAccessRequest } = await import("./access-requests/[id]/approve/route");
    const { GET: getDocumentUrl } = await import("./documents/[id]/route");
    const { GET: getAuditLogs } = await import("./audit-logs/route");

    const doctor = {
      id: DOCTOR_USER_ID,
      professionalProfile: { id: DOCTOR_ID },
      patientProfile: null,
      contactFor: [],
    };
    const patient = {
      id: PATIENT_USER_ID,
      patientProfile: { id: PATIENT_ID },
      professionalProfile: null,
      contactFor: [],
    };

    async function requestAndApprove(scope: string) {
      state.currentUser = doctor;
      const created = await createAccessRequest(
        request("/api/access-requests", {
          method: "POST",
          body: JSON.stringify({ patientId: PATIENT_ID, scope, durationMinutes: 60 }),
        })
      );
      expect(created.status).toBe(201);
      const requestId = (await json(created)).id as string;

      state.currentUser = patient;
      const approved = await approveAccessRequest(
        request(`/api/access-requests/${requestId}/approve`, { method: "POST" }),
        { params: Promise.resolve({ id: requestId }) }
      );
      expect(approved.status).toBe(201);
      return (await json(approved)).id as string;
    }

    const examsTokenId = await requestAndApprove("EXAMS");
    const prescriptionsTokenId = await requestAndApprove("PRESCRIPTIONS");

    // A concessao nova substitui a anterior: so o ultimo token fica vigente.
    expect(state.accessTokens.get(examsTokenId)?.status).toBe("REVOKED");
    expect(state.accessTokens.get(examsTokenId)?.revokedAt).toBeInstanceOf(Date);
    expect(state.accessTokens.get(prescriptionsTokenId)?.status).toBe("ACTIVE");

    state.currentUser = doctor;

    // O exame que o token anterior liberava passa a ser negado.
    const blockedExam = await getDocumentUrl(request("/api/documents/doc-1"), {
      params: Promise.resolve({ id: "doc-1" }),
    });
    expect(blockedExam.status).toBe(403);

    const allowedPrescription = await getDocumentUrl(request("/api/documents/doc-2"), {
      params: Promise.resolve({ id: "doc-2" }),
    });
    expect(allowedPrescription.status).toBe(200);

    // A auditoria precisa registrar o encerramento, nao so a nova autorizacao.
    state.currentUser = patient;
    const auditResponse = await getAuditLogs(request("/api/audit-logs"));
    expect(auditResponse.status).toBe(200);
    const revokeLogs = state.accessLogs.filter(
      (log) => log.eventType === "REVOKE" && log.tokenId === examsTokenId
    );
    expect(revokeLogs).toHaveLength(1);
    expect(revokeLogs[0]?.actorUserId).toBe(PATIENT_USER_ID);
  });

  // Antes, bastava existir uma linha em emergency_contacts para responder pelo
  // paciente, e qualquer conta criava a sua. Agora o vinculo precisa estar
  // aprovado, e o proprio pedido pendente nao vale nada.
  it("refuses an emergency contact whose link the patient has not approved", async () => {
    const { POST: createAccessRequest } = await import("./access-requests/route");
    const { POST: approveAccessRequest } = await import("./access-requests/[id]/approve/route");

    state.currentUser = {
      id: DOCTOR_USER_ID,
      professionalProfile: { id: DOCTOR_ID },
      patientProfile: null,
      contactFor: [],
    };

    const created = await createAccessRequest(
      request("/api/access-requests", {
        method: "POST",
        body: JSON.stringify({ patientId: PATIENT_ID, scope: "FULL", durationMinutes: 60 }),
      })
    );
    expect(created.status).toBe(201);
    const requestId = (await json(created)).id as string;

    const pendingContact = {
      id: CONTACT_USER_ID,
      professionalProfile: null,
      patientProfile: null,
      contactFor: [{ patientId: PATIENT_ID, status: "PENDING" }],
    };

    state.contactLinkStatus = "PENDING";
    state.currentUser = pendingContact;

    const refused = await approveAccessRequest(
      request(`/api/access-requests/${requestId}/approve`, { method: "POST" }),
      { params: Promise.resolve({ id: requestId }) }
    );
    expect(refused.status).toBe(403);
    expect(state.accessTokens.size).toBe(0);

    // Com o vinculo aprovado pelo paciente, o mesmo contato passa a responder.
    state.contactLinkStatus = "APPROVED";
    state.currentUser = {
      ...pendingContact,
      contactFor: [{ patientId: PATIENT_ID, status: "APPROVED" }],
    };

    const approved = await approveAccessRequest(
      request(`/api/access-requests/${requestId}/approve`, { method: "POST" }),
      { params: Promise.resolve({ id: requestId }) }
    );
    expect(approved.status).toBe(201);
    expect(state.accessTokens.size).toBe(1);
  });
});

