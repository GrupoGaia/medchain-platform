import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { buildDemoPdf, type DemoPdfResultRow } from "./demo-pdf";
import { IMAGING, PRESCRIPTIONS, REPORTS, type NarrativeDoc } from "./clinical-data";
import { DEMO_PATIENTS, type PatientPlan } from "./demo-patients";
import {
  buildPanelResults,
  formatReference,
  formatResultValue,
  panelTitle,
  type GeneratedResult,
} from "./demo-values";
import { MEDICAL_DOCUMENT_BUCKET, buildMedicalDocumentStorageKey } from "../lib/document-upload";

function loadEnvFile(fileName: string, override = false) {
  const envPath = resolve(process.cwd(), fileName);
  if (!existsSync(envPath)) return;

  for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

// Senha padrão de demonstração. Não usar em produção.
const DEMO_PASSWORD = "medchain123";

const prisma = new PrismaClient();

function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar em apps/web/.env.local"
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const supabaseAdmin = createSupabaseAdminClient();

// Cria usuário no Supabase Auth ou reutiliza se já existir (idempotência)
async function getOrCreateAuthUser(
  email: string,
  fullName: string,
  role: string
): Promise<string> {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { fullName, role },
  });

  if (!error) return data.user.id;

  // Usuário já existe, buscar UUID real
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const existing = list?.users.find((u) => u.email === email);
  if (!existing) {
    throw new Error(
      `Não foi possível criar ou encontrar o usuário ${email}. Erro: ${error.message}`
    );
  }
  return existing.id;
}

// Os documentos da rodada anterior ficam sob outro patientId (uuid novo a cada seed),
// entao nunca sao sobrescritos pelo upsert. Sem essa limpeza, cada re-execucao do
// seed deixa arquivos orfaos no bucket.
async function emptyMedicalDocumentsBucket(): Promise<void> {
  const { data: folders, error } = await supabaseAdmin.storage
    .from(MEDICAL_DOCUMENT_BUCKET)
    .list();
  if (error) throw new Error(`Erro ao listar o bucket: ${error.message}`);
  if (!folders || folders.length === 0) return;

  const pathsPerFolder = await Promise.all(
    folders.map(async (folder) => {
      const { data: files, error: filesError } = await supabaseAdmin.storage
        .from(MEDICAL_DOCUMENT_BUCKET)
        .list(folder.name);
      if (filesError) {
        throw new Error(`Erro ao listar "${folder.name}" no bucket: ${filesError.message}`);
      }
      return (files ?? []).map((file) => `${folder.name}/${file.name}`);
    })
  );

  const paths = pathsPerFolder.flat();
  if (paths.length === 0) return;

  const { error: removeError } = await supabaseAdmin.storage
    .from(MEDICAL_DOCUMENT_BUCKET)
    .remove(paths);
  if (removeError) throw new Error(`Erro ao limpar o bucket: ${removeError.message}`);
}

// ── Utilitários de tempo e concorrência ─────────────────────────────────────

const NOW = new Date();

/**
 * Data de N meses atrás, com dia e hora estáveis derivados da própria
 * distância. Evita que todos os documentos caiam no mesmo dia do mês.
 */
function monthsAgo(months: number, offsetDays = 0): Date {
  const date = new Date(NOW);
  date.setMonth(date.getMonth() - months);
  date.setDate(Math.min(28, 3 + ((months * 7 + offsetDays) % 25)));
  date.setHours(8 + (months % 9), (months * 13) % 60, 0, 0);
  return date;
}

/**
 * Executa em lotes. O bucket local aguenta o volume, mas disparar cento e
 * poucos uploads de uma vez faz o Storage devolver erro de conexão.
 */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function run(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

function isOutOfRange(result: GeneratedResult): boolean {
  return result.value < result.referenceMin || result.value > result.referenceMax;
}

function toPdfRows(results: GeneratedResult[]): DemoPdfResultRow[] {
  return results.map((result) => ({
    analyte: result.analyte,
    value: formatResultValue(result.value, result.unit),
    unit: result.unit,
    reference: formatReference(result),
    outOfRange: isOutOfRange(result),
  }));
}

// ── Documentos planejados antes de ir para o banco ──────────────────────────

interface PlannedDocument {
  id: string;
  patientIndex: number;
  title: string;
  type: "EXAM" | "REPORT" | "PRESCRIPTION" | "IMAGING";
  issuedAt: Date;
  results: GeneratedResult[];
  body?: string[];
}

const NARRATIVE_CATALOGUES: Record<string, Record<string, NarrativeDoc>> = {
  report: REPORTS,
  imaging: IMAGING,
  rx: PRESCRIPTIONS,
};

function resolveNarrative(key: string): NarrativeDoc {
  const [prefix, name] = key.split(":");
  const catalogue = NARRATIVE_CATALOGUES[prefix];
  const doc = catalogue?.[name];
  if (!doc) throw new Error(`Documento narrativo desconhecido no seed: ${key}`);
  return doc;
}

function planDocuments(plan: PatientPlan, patientIndex: number): PlannedDocument[] {
  const documents: PlannedDocument[] = [];

  plan.collections.forEach((months, collectionIndex) => {
    const isLatest = collectionIndex === plan.collections.length - 1;
    const panels = isLatest
      ? [...plan.panels, ...(plan.panelsLatestOnly ?? [])]
      : plan.panels;

    panels.forEach((panelKey, panelIndex) => {
      const issuedAt = monthsAgo(months, panelIndex);
      const results = buildPanelResults({
        panelKey,
        sex: plan.sex,
        patientKey: plan.cpf,
        collectedAt: issuedAt,
        collectionIndex,
        overrides: plan.overrides,
      });

      documents.push({
        id: randomUUID(),
        patientIndex,
        title: panelTitle(panelKey),
        type: "EXAM",
        issuedAt,
        results,
      });
    });
  });

  plan.narratives.forEach((narrative, index) => {
    const doc = resolveNarrative(narrative.key);
    documents.push({
      id: randomUUID(),
      patientIndex,
      title: doc.title,
      type: doc.type,
      issuedAt: monthsAgo(narrative.monthsAgo, index * 3),
      results: [],
      body: doc.body,
    });
  });

  return documents;
}

async function main() {
  console.log("Iniciando seed...");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !(process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY)
  ) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar em apps/web/.env.local"
    );
  }

  await prisma.examResult.deleteMany();
  await prisma.accessLog.deleteMany();
  await prisma.accessToken.deleteMany();
  await prisma.accessRequest.deleteMany();
  await prisma.medicalDocument.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.healthProfessionalProfile.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.user.deleteMany();
  await emptyMedicalDocumentsBucket();

  // ── Instituições ──────────────────────────────────────────────────────────
  const institutionSeeds = [
    { name: "Hospital São Lucas", type: "HOSPITAL", cnpj: "12.345.678/0001-90" },
    { name: "UPA Centro", type: "CLINIC", cnpj: "98.765.432/0001-10" },
    { name: "Instituto do Coração Aliança", type: "HOSPITAL", cnpj: "45.678.912/0001-33" },
    { name: "Laboratório Diagnóstico Central", type: "LAB", cnpj: "23.456.789/0001-77" },
  ];

  const institutions = await Promise.all(
    institutionSeeds.map((i) => prisma.institution.create({ data: i }))
  );
  const [hospSaoLucas, upaCentro, institutoAlianca, laboratorioCentral] = institutions;

  // ── Médicos ───────────────────────────────────────────────────────────────
  // Emails fixos para que o login da demo seja reproduzível.
  const doctorSeeds = [
    { name: "Dr. Carlos Silva",   email: "carlos.silva@medchain.demo",   crm: "CRM-SP 123456", specialty: "Cardiologia",    instId: hospSaoLucas.id },
    { name: "Dra. Ana Ferreira",  email: "ana.ferreira@medchain.demo",   crm: "CRM-SP 654321", specialty: "Clínica Geral",  instId: upaCentro.id },
    { name: "Dr. Paulo Mendes",   email: "paulo.mendes@medchain.demo",   crm: "CRM-SP 111222", specialty: "Endocrinologia", instId: hospSaoLucas.id },
    { name: "Dra. Renata Aoki",   email: "renata.aoki@medchain.demo",    crm: "CRM-SP 334455", specialty: "Nefrologia",     instId: institutoAlianca.id },
    { name: "Dr. Sérgio Vilela",  email: "sergio.vilela@medchain.demo",  crm: "CRM-SP 778899", specialty: "Radiologia",     instId: laboratorioCentral.id },
  ];

  const doctors = await Promise.all(
    doctorSeeds.map(async (d) => {
      const authId = await getOrCreateAuthUser(d.email, d.name, "HEALTH_PROFESSIONAL");
      const user = await prisma.user.create({
        data: { authId, email: d.email, role: "HEALTH_PROFESSIONAL" },
      });
      const profile = await prisma.healthProfessionalProfile.create({
        data: {
          userId: user.id,
          fullName: d.name,
          crm: d.crm,
          specialty: d.specialty,
          institutionId: d.instId,
          verified: true,
        },
      });
      const institution = institutions.find((i) => i.id === d.instId)!;
      return { user, profile, institution };
    })
  );

  // ── Pacientes ─────────────────────────────────────────────────────────────
  const patients = await Promise.all(
    DEMO_PATIENTS.map(async (plan) => {
      const authId = await getOrCreateAuthUser(plan.email, plan.name, "PATIENT");
      const user = await prisma.user.create({
        data: { authId, email: plan.email, role: "PATIENT" },
      });
      const profile = await prisma.patientProfile.create({
        data: {
          userId: user.id,
          fullName: plan.name,
          cpf: plan.cpf,
          birthDate: new Date(plan.birthDate),
          gender: plan.gender,
          bloodType: plan.bloodType,
          allergies: plan.allergies,
          chronicConditions: plan.chronicConditions,
          continuousMeds: plan.continuousMeds,
        },
      });

      for (const contact of plan.contacts) {
        let contactUserId: string | undefined;

        if (contact.email) {
          const contactAuthId = await getOrCreateAuthUser(
            contact.email,
            contact.name,
            "EMERGENCY_CONTACT"
          );
          const contactUser = await prisma.user.create({
            data: { authId: contactAuthId, email: contact.email, role: "EMERGENCY_CONTACT" },
          });
          contactUserId = contactUser.id;
        }

        await prisma.emergencyContact.create({
          data: {
            patientId: profile.id,
            userId: contactUserId,
            name: contact.name,
            relation: contact.relation,
            phone: contact.phone,
            // O vinculo nasce PENDING por default. Na demo os contatos ja
            // sao de confianca do paciente, entao entram aprovados, senao a
            // Maria e o Pedro perdem o acesso a cada reseed.
            status: "APPROVED",
            respondedAt: new Date(),
          },
        });
      }

      return { plan, user, profile };
    })
  );

  // ── Documentos, PDFs e resultados estruturados ────────────────────────────
  // O médico que assina o documento no PDF varia por paciente, para o cabeçalho
  // do laudo não repetir o mesmo nome em todo o acervo.
  const planned = DEMO_PATIENTS.flatMap((plan, index) => planDocuments(plan, index));
  planned.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());

  console.log(`   Gerando ${planned.length} documentos...`);

  await mapWithConcurrency(planned, 8, async (doc) => {
    const { profile, plan } = patients[doc.patientIndex];
    const signer = doctors[doc.patientIndex % doctors.length];

    const pdf = buildDemoPdf({
      title: doc.title,
      patientName: profile.fullName,
      type: doc.type,
      issuedAt: doc.issuedAt,
      patientBirthDate: new Date(plan.birthDate),
      patientId: profile.id.slice(0, 8).toUpperCase(),
      requestedBy: `${signer.profile.fullName} — ${signer.profile.crm}`,
      institution: signer.institution.name,
      results: doc.results.length > 0 ? toPdfRows(doc.results) : undefined,
      body: doc.body,
    });

    const storageKey = buildMedicalDocumentStorageKey(profile.id, doc.id, "application/pdf");
    const { error: uploadError } = await supabaseAdmin.storage
      .from(MEDICAL_DOCUMENT_BUCKET)
      .upload(storageKey, pdf, { contentType: "application/pdf", upsert: true });
    if (uploadError) {
      throw new Error(`Upload de "${doc.title}" falhou: ${uploadError.message}`);
    }

    await prisma.medicalDocument.create({
      data: {
        id: doc.id,
        patientId: profile.id,
        title: doc.title,
        type: doc.type,
        storageKey,
        mimeType: "application/pdf",
        issuedAt: doc.issuedAt,
      },
    });

    if (doc.results.length > 0) {
      await prisma.examResult.createMany({
        data: doc.results.map((result) => ({
          documentId: doc.id,
          analyte: result.analyte,
          value: result.value,
          unit: result.unit,
          referenceMin: result.referenceMin,
          referenceMax: result.referenceMax,
        })),
      });
    }
  });

  // ── Solicitações, tokens e auditoria ──────────────────────────────────────
  const [drCarlos, draAna, drPaulo, draRenata] = doctors;
  const [joao, helena, rubens] = patients;

  const auditLogs: {
    tokenId?: string;
    actorUserId: string;
    patientId: string;
    eventType: string;
    channel: "WEB_PORTAL" | "MOBILE_APP";
    createdAt: Date;
  }[] = [];

  /** Cria solicitação, token e o par de logs que todo acesso concedido gera. */
  async function grantAccess(input: {
    patient: (typeof patients)[number];
    doctor: (typeof doctors)[number];
    scope: "FULL" | "EMERGENCY" | "EXAMS" | "PRESCRIPTIONS";
    durationMinutes: number;
    reason: string;
    status: "ACTIVE" | "EXPIRED" | "REVOKED";
    /** Minutos atrás em que o paciente aprovou. */
    approvedMinutesAgo: number;
    channel?: "WEB_PORTAL" | "MOBILE_APP";
    /** Quantas aberturas do prontuário registrar. */
    accessCount?: number;
  }) {
    const approvedAt = new Date(NOW.getTime() - input.approvedMinutesAgo * 60_000);
    const expiresAt = new Date(approvedAt.getTime() + input.durationMinutes * 60_000);

    const request = await prisma.accessRequest.create({
      data: {
        patientId: input.patient.profile.id,
        professionalId: input.doctor.profile.id,
        requestedById: input.doctor.user.id,
        status: input.status === "REVOKED" ? "APPROVED" : input.status === "ACTIVE" ? "APPROVED" : "EXPIRED",
        scope: input.scope,
        durationMinutes: input.durationMinutes,
        reason: input.reason,
        channelType: input.channel ?? "WEB_PORTAL",
        createdAt: new Date(approvedAt.getTime() - 8 * 60_000),
      },
    });

    const token = await prisma.accessToken.create({
      data: {
        requestId: request.id,
        patientId: input.patient.profile.id,
        professionalId: input.doctor.profile.id,
        status: input.status,
        scope: input.scope,
        expiresAt,
        revokedAt: input.status === "REVOKED" ? new Date(expiresAt.getTime() - 10 * 60_000) : null,
        createdAt: approvedAt,
      },
    });

    auditLogs.push({
      tokenId: token.id,
      actorUserId: input.patient.user.id,
      patientId: input.patient.profile.id,
      eventType: "APPROVE",
      channel: "MOBILE_APP",
      createdAt: approvedAt,
    });

    for (let i = 0; i < (input.accessCount ?? 1); i += 1) {
      auditLogs.push({
        tokenId: token.id,
        actorUserId: input.doctor.user.id,
        patientId: input.patient.profile.id,
        eventType: "ACCESS",
        channel: "WEB_PORTAL",
        createdAt: new Date(approvedAt.getTime() + (i + 1) * 4 * 60_000),
      });
    }

    if (input.status === "REVOKED") {
      auditLogs.push({
        tokenId: token.id,
        actorUserId: input.patient.user.id,
        patientId: input.patient.profile.id,
        eventType: "REVOKE",
        channel: "MOBILE_APP",
        createdAt: new Date(expiresAt.getTime() - 10 * 60_000),
      });
    }

    return { request, token };
  }

  const MINUTES_PER_DAY = 24 * 60;

  // 1. Acesso válido agora, para a demo abrir o prontuário direto.
  const { token: activeToken } = await grantAccess({
    patient: joao,
    doctor: drCarlos,
    scope: "FULL",
    durationMinutes: 60,
    reason: "Consulta de retorno para avaliação cardiológica",
    status: "ACTIVE",
    approvedMinutesAgo: 15,
    accessCount: 2,
  });

  // 2. Pendente, para a demo de aprovação no aplicativo.
  await prisma.accessRequest.create({
    data: {
      patientId: joao.profile.id,
      professionalId: draAna.profile.id,
      requestedById: draAna.user.id,
      status: "PENDING",
      scope: "EMERGENCY",
      durationMinutes: 30,
      reason: "Atendimento de urgência na UPA",
      channelType: "WEB_PORTAL",
      createdAt: new Date(NOW.getTime() - 6 * 60_000),
    },
  });

  // 3. Histórico do João: acessos anteriores, um deles revogado por ele.
  await grantAccess({
    patient: joao,
    doctor: drPaulo,
    scope: "EXAMS",
    durationMinutes: 120,
    reason: "Avaliação endocrinológica do perfil glicêmico",
    status: "EXPIRED",
    approvedMinutesAgo: 6 * MINUTES_PER_DAY,
    accessCount: 3,
  });

  await grantAccess({
    patient: joao,
    doctor: draRenata,
    scope: "FULL",
    durationMinutes: 60,
    reason: "Parecer sobre função renal",
    status: "REVOKED",
    approvedMinutesAgo: 21 * MINUTES_PER_DAY,
    accessCount: 1,
  });

  await grantAccess({
    patient: joao,
    doctor: drCarlos,
    scope: "EXAMS",
    durationMinutes: 30,
    reason: "Consulta anterior",
    status: "EXPIRED",
    approvedMinutesAgo: 48 * MINUTES_PER_DAY,
    accessCount: 2,
  });

  // 4. Pedido negado, para o histórico mostrar que negar também fica registrado.
  const deniedRequest = await prisma.accessRequest.create({
    data: {
      patientId: joao.profile.id,
      professionalId: draAna.profile.id,
      requestedById: draAna.user.id,
      status: "DENIED",
      scope: "FULL",
      durationMinutes: 480,
      reason: "Solicitação de acesso amplo para triagem",
      channelType: "WEB_PORTAL",
      createdAt: new Date(NOW.getTime() - 33 * MINUTES_PER_DAY * 60_000),
    },
  });

  auditLogs.push({
    actorUserId: joao.user.id,
    patientId: joao.profile.id,
    eventType: "DENY",
    channel: "MOBILE_APP",
    createdAt: new Date(deniedRequest.createdAt.getTime() + 12 * 60_000),
  });

  // 5. Outros pacientes, para o portal de cada médico não ficar vazio.
  await grantAccess({
    patient: helena,
    doctor: drPaulo,
    scope: "FULL",
    durationMinutes: 120,
    reason: "Ajuste de esquema de insulina",
    status: "ACTIVE",
    approvedMinutesAgo: 40,
    accessCount: 1,
  });

  await grantAccess({
    patient: rubens,
    doctor: draRenata,
    scope: "EXAMS",
    durationMinutes: 240,
    reason: "Acompanhamento de doença renal crônica",
    status: "ACTIVE",
    approvedMinutesAgo: 25,
    accessCount: 2,
  });

  await grantAccess({
    patient: helena,
    doctor: draAna,
    scope: "PRESCRIPTIONS",
    durationMinutes: 60,
    reason: "Renovação de receita de uso contínuo",
    status: "EXPIRED",
    approvedMinutesAgo: 12 * MINUTES_PER_DAY,
    accessCount: 1,
  });

  // 6. Vínculo de contato de emergência aceito, que também é evento de auditoria.
  auditLogs.push({
    actorUserId: joao.user.id,
    patientId: joao.profile.id,
    eventType: "CONTACT_APPROVE",
    channel: "MOBILE_APP",
    createdAt: new Date(NOW.getTime() - 64 * MINUTES_PER_DAY * 60_000),
  });

  await prisma.accessLog.createMany({ data: auditLogs });

  // ── Resumo ────────────────────────────────────────────────────────────────
  const [documentCount, resultCount, requestCount, tokenCount, logCount] = await Promise.all([
    prisma.medicalDocument.count(),
    prisma.examResult.count(),
    prisma.accessRequest.count(),
    prisma.accessToken.count(),
    prisma.accessLog.count(),
  ]);

  console.log("\nSeed concluído.");
  console.log(`   Instituições : ${institutions.length}`);
  console.log(`   Médicos      : ${doctors.length}`);
  console.log(`   Pacientes    : ${patients.length}`);
  console.log(`   Documentos   : ${documentCount}`);
  console.log(`   Resultados   : ${resultCount}`);
  console.log(`   Solicitações : ${requestCount}`);
  console.log(`   Tokens       : ${tokenCount}`);
  console.log(`   Auditoria    : ${logCount} eventos`);

  console.log("\nAcervo por paciente:");
  for (const { plan, profile } of patients) {
    const docs = await prisma.medicalDocument.count({ where: { patientId: profile.id } });
    console.log(`   ${plan.name.padEnd(28)} ${String(docs).padStart(3)} documentos`);
  }

  console.log("\nIDs para demo:");
  console.log(`   João Batista (patientProfileId) : ${joao.profile.id}`);
  console.log(`   Token ativo (tokenId)            : ${activeToken.id}`);

  console.log("\nCredenciais de demo (senha: medchain123):");
  for (const d of doctorSeeds) {
    console.log(`   ${d.email.padEnd(32)} (médico, ${d.specialty})`);
  }
  for (const plan of DEMO_PATIENTS) {
    console.log(`   ${plan.email.padEnd(32)} (paciente)`);
  }
  console.log("   maria.batista@exemplo.com        (contato de emergência)");
  console.log("   pedro.batista@exemplo.com        (contato de emergência)");

  console.log("\nCPF para a busca do portal médico:");
  for (const plan of DEMO_PATIENTS) {
    const cpf = plan.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    console.log(`   ${plan.name.padEnd(28)} ${cpf}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
