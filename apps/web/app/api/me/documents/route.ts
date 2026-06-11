import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { getManagedPatientIds } from "@/lib/patient-access";
import { uploadToStorage } from "@/lib/storage";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024;

// GET /api/me/documents: documentos do paciente logado
export async function GET(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  const patientIds = getManagedPatientIds(user);
  if (patientIds.length === 0) return forbidden();

  const documents = await prisma.medicalDocument.findMany({
    where: { patientId: { in: patientIds } },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json(documents);
}

// POST /api/me/documents: upload de documento pelo paciente
export async function POST(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();
  if (!user.patientProfile) return forbidden();

  const patientId = user.patientProfile.id;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Form data inválido" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null)?.trim();
  const type = formData.get("type") as string | null;
  const issuedAt = formData.get("issuedAt") as string | null;

  if (!file || !title || !type || !issuedAt) {
    return NextResponse.json(
      { error: "Campos obrigatórios: file, title, type, issuedAt" },
      { status: 400 }
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo não permitido. Use PDF, JPEG ou PNG." },
      { status: 422 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Arquivo muito grande. Máximo 10 MB." }, { status: 422 });
  }

  const docId = crypto.randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());
  const storageKey = await uploadToStorage(patientId, docId, buffer, file.type);

  const document = await prisma.medicalDocument.create({
    data: {
      id: docId,
      patientId,
      title,
      type,
      storageKey,
      mimeType: file.type,
      issuedAt: new Date(issuedAt),
    },
  });

  return NextResponse.json(document, { status: 201 });
}
