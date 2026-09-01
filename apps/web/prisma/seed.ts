import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker/locale/pt_BR";
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { buildDemoPdf } from "./demo-pdf";
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
    perPage: 50,
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

async function main() {
  console.log("Iniciando seed...");

  // Verificar variáveis de ambiente necessárias
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
  const [hospSaoLucas, upaCentro] = await Promise.all([
    prisma.institution.create({
      data: { name: "Hospital São Lucas", type: "HOSPITAL", cnpj: "12.345.678/0001-90" },
    }),
    prisma.institution.create({
      data: { name: "UPA Centro", type: "CLINIC", cnpj: "98.765.432/0001-10" },
    }),
  ]);

  // ── Médicos ───────────────────────────────────────────────────────────────
  // Emails fixos para que o login da demo seja reproduzível
  const doctorSeeds = [
    { name: "Dr. Carlos Silva",  email: "carlos.silva@medchain.demo",  crm: "CRM-SP 123456", specialty: "Cardiologia",    instId: hospSaoLucas.id },
    { name: "Dra. Ana Ferreira", email: "ana.ferreira@medchain.demo",  crm: "CRM-SP 654321", specialty: "Clínica Geral",  instId: upaCentro.id },
    { name: "Dr. Paulo Mendes",  email: "paulo.mendes@medchain.demo",  crm: "CRM-SP 111222", specialty: "Endocrinologia", instId: hospSaoLucas.id },
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
      return { user, profile };
    })
  );

  // ── Pacientes ─────────────────────────────────────────────────────────────
  // Emails fixos para pacientes de demo; os demais são fictícios mas determinísticos
  type ContactSeed = {
    email?: string;
    name: string;
    relation: string;
    phone: string;
  };

  type PatientSeed = {
    email: string;
    name: string;
    birthDate: Date;
    bloodType: string;
    allergies: string[];
    chronicConditions: string[];
    continuousMeds: string[];
    contacts: ContactSeed[];
  };

  const patientSeeds: PatientSeed[] = [
    {
      email: "joao.batista@exemplo.com",
      name: "João Batista",
      birthDate: new Date("1963-04-15"),
      bloodType: "A+",
      allergies: ["Penicilina", "AAS"],
      chronicConditions: ["Hipertensão arterial", "Pré-diabetes"],
      continuousMeds: ["Losartana 50mg", "Metformina 850mg"],
      contacts: [
        {
          email: "maria.batista@exemplo.com",
          name: "Maria Batista",
          relation: "Filha",
          phone: "(11) 9 9999-0001",
        },
        {
          email: "pedro.batista@exemplo.com",
          name: "Pedro Batista",
          relation: "Filho",
          phone: "(11) 9 9999-0002",
        },
      ],
    },
    {
      email: "paciente2@medchain.demo",
      name: faker.person.fullName(),
      birthDate: faker.date.birthdate({ min: 50, max: 80, mode: "age" }),
      bloodType: faker.helpers.arrayElement(["A+", "A-", "B+", "O+", "O-"]),
      allergies: [faker.helpers.arrayElement(["Dipirona", "Ibuprofeno", "Sulfa"])],
      chronicConditions: [faker.helpers.arrayElement(["Diabetes tipo 2", "Asma", "Artrite reumatoide"])],
      continuousMeds: ["Metformina 500mg"],
      contacts: [{ name: faker.person.fullName(), relation: "Cônjuge", phone: faker.phone.number() }],
    },
    {
      email: "paciente3@medchain.demo",
      name: faker.person.fullName(),
      birthDate: faker.date.birthdate({ min: 40, max: 70, mode: "age" }),
      bloodType: faker.helpers.arrayElement(["B+", "O+", "AB-"]),
      allergies: [] as string[],
      chronicConditions: ["Hipertensão arterial"],
      continuousMeds: ["Atenolol 25mg"],
      contacts: [{ name: faker.person.fullName(), relation: "Filho(a)", phone: faker.phone.number() }],
    },
    {
      email: "paciente4@medchain.demo",
      name: faker.person.fullName(),
      birthDate: faker.date.birthdate({ min: 60, max: 85, mode: "age" }),
      bloodType: faker.helpers.arrayElement(["O+", "A+"]),
      allergies: ["Contraste iodado"],
      chronicConditions: ["Doença renal crônica", "Hipertensão arterial"],
      continuousMeds: ["Furosemida 40mg", "Anlodipino 5mg"],
      contacts: [
        { name: faker.person.fullName(), relation: "Filha",  phone: faker.phone.number() },
        { name: faker.person.fullName(), relation: "Filho",  phone: faker.phone.number() },
      ],
    },
    {
      email: "paciente5@medchain.demo",
      name: faker.person.fullName(),
      birthDate: faker.date.birthdate({ min: 55, max: 75, mode: "age" }),
      bloodType: "B+",
      allergies: ["Penicilina"],
      chronicConditions: ["Diabetes tipo 1", "Retinopatia diabética"],
      continuousMeds: ["Insulina Glargina", "Metformina 850mg"],
      contacts: [{ name: faker.person.fullName(), relation: "Cônjuge", phone: faker.phone.number() }],
    },
  ];

  const patients = await Promise.all(
    patientSeeds.map(async (p) => {
      const authId = await getOrCreateAuthUser(p.email, p.name, "PATIENT");
      const user = await prisma.user.create({
        data: { authId, email: p.email, role: "PATIENT" },
      });
      const profile = await prisma.patientProfile.create({
        data: {
          userId: user.id,
          fullName: p.name,
          birthDate: p.birthDate,
          bloodType: p.bloodType,
          allergies: p.allergies,
          chronicConditions: p.chronicConditions,
          continuousMeds: p.continuousMeds,
        },
      });
      await Promise.all(
        p.contacts.map(async (c) => {
          let contactUserId: string | undefined;

          if (c.email) {
            const contactAuthId = await getOrCreateAuthUser(c.email, c.name, "EMERGENCY_CONTACT");
            const contactUser = await prisma.user.create({
              data: { authId: contactAuthId, email: c.email, role: "EMERGENCY_CONTACT" },
            });
            contactUserId = contactUser.id;
          }

          return prisma.emergencyContact.create({
            data: {
              patientId: profile.id,
              userId: contactUserId,
              name: c.name,
              relation: c.relation,
              phone: c.phone,
            },
          });
        })
      );
      return { user, profile };
    })
  );

  // ── Documentos médicos (21) ───────────────────────────────────────────────
  const docTemplates: { title: string; type: "EXAM" | "REPORT" | "PRESCRIPTION" | "IMAGING" }[] = [
    // João Batista: 6 docs
    { title: "Hemograma completo", type: "EXAM" },
    { title: "Raio-X de tórax", type: "EXAM" },
    { title: "Perfil lipídico", type: "EXAM" },
    { title: "Ecocardiograma", type: "REPORT" },
    { title: "Receita Losartana + Metformina", type: "PRESCRIPTION" },
    { title: "Glicemia em jejum", type: "EXAM" },
    // Paciente 2: 4 docs
    { title: "Ultrassonografia abdominal", type: "IMAGING" },
    { title: "Espirometria", type: "REPORT" },
    { title: "Glicemia em jejum", type: "EXAM" },
    { title: "HbA1c", type: "EXAM" },
    // Paciente 3: 4 docs
    { title: "Eletrocardiograma", type: "REPORT" },
    { title: "Densitometria óssea", type: "IMAGING" },
    { title: "Receita Atenolol", type: "PRESCRIPTION" },
    { title: "Ressonância magnética lombar", type: "IMAGING" },
    // Paciente 4: 4 docs
    { title: "Creatinina sérica", type: "EXAM" },
    { title: "Sumário de urina", type: "EXAM" },
    { title: "Tomografia de tórax", type: "IMAGING" },
    { title: "Receita Furosemida", type: "PRESCRIPTION" },
    // Paciente 5: 3 docs
    { title: "Fundo de olho", type: "REPORT" },
    { title: "TSH e T4 livre", type: "EXAM" },
    { title: "Laudo cirúrgico de apendicectomia", type: "REPORT" },
  ];

  const docsPerPatient = [
    docTemplates.slice(0, 6),
    docTemplates.slice(6, 10),
    docTemplates.slice(10, 14),
    docTemplates.slice(14, 18),
    docTemplates.slice(18, 21),
  ];

  const createdDocuments = await Promise.all(
    patients.flatMap(({ profile }, pi) =>
      docsPerPatient[pi].map(async (doc) => {
        const issuedAt = faker.date.recent({ days: 180 });
        const docId = randomUUID();
        const pdf = buildDemoPdf({
          title: doc.title,
          patientName: profile.fullName,
          type: doc.type,
          issuedAt,
        });
        const storageKey = buildMedicalDocumentStorageKey(profile.id, docId, "application/pdf");

        const { error: uploadError } = await supabaseAdmin.storage
          .from(MEDICAL_DOCUMENT_BUCKET)
          .upload(storageKey, pdf, { contentType: "application/pdf", upsert: true });
        if (uploadError) {
          throw new Error(`Upload de "${doc.title}" falhou: ${uploadError.message}`);
        }

        return prisma.medicalDocument.create({
          data: {
            id: docId,
            patientId: profile.id,
            title: doc.title,
            type: doc.type,
            storageKey,
            mimeType: "application/pdf",
            issuedAt,
          },
        });
      })
    )
  );

  // ── Resultados de exame (apenas João Batista) ─────────────────────────────
  // Valores escolhidos para bater com o perfil dele: hipertensao e pre-diabetes.
  const examResultsByTitle: Record<
    string,
    { analyte: string; value: number; unit: string; referenceMin: number; referenceMax: number }[]
  > = {
    "Hemograma completo": [
      { analyte: "Hemoglobina", value: 14.2, unit: "g/dL", referenceMin: 13, referenceMax: 17 },
      { analyte: "Hematócrito", value: 42, unit: "%", referenceMin: 39, referenceMax: 50 },
      { analyte: "Leucócitos", value: 7200, unit: "/mm3", referenceMin: 4000, referenceMax: 11000 },
      { analyte: "Plaquetas", value: 245000, unit: "/mm3", referenceMin: 150000, referenceMax: 450000 },
    ],
    "Perfil lipídico": [
      { analyte: "Colesterol total", value: 214, unit: "mg/dL", referenceMin: 0, referenceMax: 190 },
      { analyte: "LDL", value: 142, unit: "mg/dL", referenceMin: 0, referenceMax: 130 },
      { analyte: "HDL", value: 38, unit: "mg/dL", referenceMin: 40, referenceMax: 100 },
      { analyte: "Triglicerídeos", value: 189, unit: "mg/dL", referenceMin: 0, referenceMax: 150 },
    ],
    "Glicemia em jejum": [
      { analyte: "Glicose", value: 114, unit: "mg/dL", referenceMin: 70, referenceMax: 99 },
    ],
  };

  const joaoProfileId = patients[0].profile.id;
  const joaoExamDocuments = createdDocuments.filter(
    (doc) => doc.patientId === joaoProfileId && examResultsByTitle[doc.title] !== undefined
  );

  await Promise.all(
    joaoExamDocuments.flatMap((doc) =>
      examResultsByTitle[doc.title].map((result) =>
        prisma.examResult.create({
          data: {
            documentId: doc.id,
            analyte: result.analyte,
            value: result.value,
            unit: result.unit,
            referenceMin: result.referenceMin,
            referenceMax: result.referenceMax,
          },
        })
      )
    )
  );

  // ── Solicitações e tokens ─────────────────────────────────────────────────
  const [dr0, dr1] = doctors;
  const joao = patients[0];
  const now = new Date();

  // 1. Aprovada + token ativo (demo imediata)
  const approvedReq = await prisma.accessRequest.create({
    data: {
      patientId: joao.profile.id,
      professionalId: dr0.profile.id,
      requestedById: dr0.user.id,
      status: "APPROVED",
      scope: "FULL",
      durationMinutes: 60,
      reason: "Consulta de retorno para avaliação cardiológica",
      channelType: "WEB_PORTAL",
    },
  });

  const activeToken = await prisma.accessToken.create({
    data: {
      requestId: approvedReq.id,
      patientId: joao.profile.id,
      professionalId: dr0.profile.id,
      status: "ACTIVE",
      scope: "FULL",
      expiresAt: new Date(now.getTime() + 45 * 60_000),
    },
  });

  // 2. Pendente (para demo de aprovação no mobile)
  await prisma.accessRequest.create({
    data: {
      patientId: joao.profile.id,
      professionalId: dr1.profile.id,
      requestedById: dr1.user.id,
      status: "PENDING",
      scope: "EMERGENCY",
      durationMinutes: 30,
      reason: "Atendimento de urgência na UPA",
      channelType: "WEB_PORTAL",
    },
  });

  // 3. Expirada (para histórico de auditoria)
  const expiredReq = await prisma.accessRequest.create({
    data: {
      patientId: joao.profile.id,
      professionalId: dr0.profile.id,
      requestedById: dr0.user.id,
      status: "EXPIRED",
      scope: "EXAMS",
      durationMinutes: 30,
      reason: "Consulta anterior",
      channelType: "WEB_PORTAL",
    },
  });

  const expiredToken = await prisma.accessToken.create({
    data: {
      requestId: expiredReq.id,
      patientId: joao.profile.id,
      professionalId: dr0.profile.id,
      status: "EXPIRED",
      scope: "EXAMS",
      expiresAt: new Date(now.getTime() - 2 * 60 * 60_000),
    },
  });

  // ── Logs de auditoria ─────────────────────────────────────────────────────
  await prisma.accessLog.createMany({
    data: [
      {
        tokenId: activeToken.id,
        actorUserId: joao.user.id,
        patientId: joao.profile.id,
        eventType: "APPROVE",
        channel: "MOBILE_APP",
        createdAt: new Date(now.getTime() - 15 * 60_000),
      },
      {
        tokenId: activeToken.id,
        actorUserId: dr0.user.id,
        patientId: joao.profile.id,
        eventType: "ACCESS",
        channel: "WEB_PORTAL",
        createdAt: new Date(now.getTime() - 10 * 60_000),
      },
      {
        tokenId: expiredToken.id,
        actorUserId: joao.user.id,
        patientId: joao.profile.id,
        eventType: "APPROVE",
        channel: "MOBILE_APP",
        createdAt: new Date(now.getTime() - 3 * 60 * 60_000),
      },
      {
        tokenId: expiredToken.id,
        actorUserId: dr0.user.id,
        patientId: joao.profile.id,
        eventType: "ACCESS",
        channel: "WEB_PORTAL",
        createdAt: new Date(now.getTime() - 2.5 * 60 * 60_000),
      },
    ],
  });

  console.log("\nSeed concluído.");
  console.log(`   Instituições : 2`);
  console.log(`   Médicos      : ${doctors.length}`);
  console.log(`   Pacientes    : ${patients.length}`);
  console.log(`   Contatos Auth: 2`);
  console.log(`   Documentos   : ${await prisma.medicalDocument.count()}`);
  console.log(`   Resultados   : ${await prisma.examResult.count()}`);
  console.log(`   Solicitações : 3 (1 ativa, 1 pendente, 1 expirada)`);
  console.log("\nIDs para demo:");
  console.log(`   João Batista (patientProfileId) : ${joao.profile.id}`);
  console.log(`   João Batista (userId)            : ${joao.user.id}`);
  console.log(`   Dr. Carlos Silva (profileId)     : ${dr0.profile.id}`);
  console.log(`   Dra. Ana Ferreira (profileId)    : ${dr1.profile.id}`);
  console.log(`   Token ativo (tokenId)            : ${activeToken.id}`);
  console.log("\nCredenciais de demo (senha: medchain123):");
  console.log("   carlos.silva@medchain.demo    (médico, Cardiologia)");
  console.log("   ana.ferreira@medchain.demo    (médico, Clínica Geral)");
  console.log("   paulo.mendes@medchain.demo    (médico, Endocrinologia)");
  console.log("   joao.batista@exemplo.com      (paciente)");
  console.log("   maria.batista@exemplo.com     (contato de emergência)");
  console.log("   pedro.batista@exemplo.com     (contato de emergência)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
