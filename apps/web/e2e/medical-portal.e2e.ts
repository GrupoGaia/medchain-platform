import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "playwright/test";
import type { APIRequestContext, APIResponse, Page } from "playwright/test";

const WEB_ROOT = process.cwd();
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const PATIENT_EMAIL = "joao.batista@exemplo.com";
const PATIENT_CPF = "529.982.247-25";
const DOCTOR_EMAIL = "ana.ferreira@medchain.demo";
const DEMO_PASSWORD = "medchain123";

type AccessRequestResponse = {
  id: string;
  patientId: string;
  professionalId: string;
  reason: string | null;
  status: string;
};

type AccessTokenResponse = {
  id: string;
  patientId: string;
  professionalId: string;
  status: string;
};

test.use({ baseURL: BASE_URL });

test("medico solicita acesso, paciente aprova e o medico encerra o token", async ({
  page,
  request: api,
}) => {
  loadLocalEnv();

  const patientAccessToken = await signInPatient();
  const reason = `E2E portal medico ${Date.now()}`;

  await page.goto("/medico/login");
  await page.getByLabel("Email").fill(DOCTOR_EMAIL);
  await page.getByLabel("Senha").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Entrar com segurança" }).click();
  await expect(page).toHaveURL(/\/medico\/dashboard$/);

  await page.getByRole("main").getByRole("link", { name: "Solicitar acesso" }).click();
  await expect(page.getByRole("heading", { name: "Solicitar acesso ao prontuário" })).toBeVisible();

  // O formulario nao lista mais pacientes: o medico localiza pelo CPF exato.
  await page.locator("#cpf").fill(PATIENT_CPF);
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page.getByText("João Batista")).toBeVisible();

  await selectOption(page, "#scope", "Prontuário completo");
  await page.locator("#reason").fill(reason);
  await page.getByRole("button", { name: "Enviar solicitação" }).click();

  await expect(page).toHaveURL(/\/medico\/dashboard$/);
  await expect(page.getByText(reason)).toBeVisible();

  const accessRequest = await waitForPendingRequest(api, patientAccessToken, reason);
  await revokeActiveTokensForScenario(api, patientAccessToken, accessRequest);

  const approvedToken = await approveRequest(api, patientAccessToken, accessRequest.id);
  expect(approvedToken.status).toBe("ACTIVE");
  expect(approvedToken.patientId).toBe(accessRequest.patientId);
  expect(approvedToken.professionalId).toBe(accessRequest.professionalId);

  await page.goto(`/medico/prontuario/${approvedToken.patientId}`);
  await expect(page.getByText("Acesso ativo")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Documentos" })).toBeVisible();

  await page.getByRole("button", { name: "Encerrar acesso" }).click();
  await expect(page.getByText("Acesso não autorizado")).toBeVisible();
  await expect(page.getByRole("link", { name: "Solicitar novo acesso" })).toBeVisible();
});

async function selectOption(page: Page, triggerSelector: string, optionText: string) {
  await page.locator(triggerSelector).click();
  await page
    .locator('[data-slot="select-item"]')
    .filter({ hasText: optionText })
    .first()
    .click();
}

async function signInPatient() {
  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: PATIENT_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (error || !data.session?.access_token) {
    throw new Error("Não foi possível autenticar o paciente de demonstração no Supabase local.");
  }

  return data.session.access_token;
}

async function waitForPendingRequest(
  api: APIRequestContext,
  patientAccessToken: string,
  reason: string
) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await api.get("/api/access-requests?status=PENDING", {
      headers: authHeaders(patientAccessToken),
    });
    await expectStatus(response, 200);

    const requests = (await response.json()) as AccessRequestResponse[];
    const accessRequest = requests.find((request) => request.reason === reason);
    if (accessRequest) return accessRequest;

    await pageDelay(500);
  }

  throw new Error("A solicitação criada pela UI não apareceu para o paciente.");
}

async function revokeActiveTokensForScenario(
  api: APIRequestContext,
  patientAccessToken: string,
  accessRequest: AccessRequestResponse
) {
  const response = await api.get("/api/access-tokens?status=ACTIVE", {
    headers: authHeaders(patientAccessToken),
  });
  await expectStatus(response, 200);

  const tokens = (await response.json()) as AccessTokenResponse[];
  const scenarioTokens = tokens.filter(
    (token) =>
      token.patientId === accessRequest.patientId &&
      token.professionalId === accessRequest.professionalId
  );

  for (const token of scenarioTokens) {
    const revokeResponse = await api.post(`/api/tokens/${token.id}/revoke`, {
      headers: authHeaders(patientAccessToken),
    });
    expect([200, 409]).toContain(revokeResponse.status());
  }
}

async function approveRequest(
  api: APIRequestContext,
  patientAccessToken: string,
  accessRequestId: string
) {
  const response = await api.post(`/api/access-requests/${accessRequestId}/approve`, {
    headers: authHeaders(patientAccessToken),
  });
  await expectStatus(response, 201);

  return (await response.json()) as AccessTokenResponse;
}

async function expectStatus(response: APIResponse, expectedStatus: number) {
  if (response.status() !== expectedStatus) {
    throw new Error(
      `Resposta inesperada ${response.status()} em ${response.url()}: ${await response.text()}`
    );
  }
}

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

function loadLocalEnv() {
  for (const fileName of [".env.local", ".env"]) {
    const envPath = path.join(WEB_ROOT, fileName);
    if (!fs.existsSync(envPath)) continue;

    const contents = fs.readFileSync(envPath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(trimmed);
      if (!match) continue;

      const key = match[1];
      const rawValue = match[2] ?? "";
      if (process.env[key] === undefined) {
        process.env[key] = normalizeEnvValue(rawValue);
      }
    }
  }
}

function normalizeEnvValue(rawValue: string) {
  let value = rawValue.trim();
  const quoted =
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"));

  if (quoted) {
    value = value.slice(1, -1);
  }

  return value;
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ausente para o E2E: ${name}`);
  }

  return value;
}

function pageDelay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
