import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, unauthorized, forbidden } from "@/lib/api-auth";
import { getManagedPatientIds } from "@/lib/patient-access";
import { deleteFromStorage, uploadToStorage } from "@/lib/storage";
import { validateMedicalDocumentUpload } from "@/lib/document-upload";
import { getRequestId, reportApiError } from "@/lib/api-error";

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

  const requestId = getRequestId(request);

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

  const validation = validateMedicalDocumentUpload({ file, title, type, issuedAt });
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  const docId = crypto.randomUUID();
  const buffer = Buffer.from(await file!.arrayBuffer());
  let storageKey: string;

  try {
    storageKey = await uploadToStorage(patientId, docId, buffer, validation.data.mimeType);
  } catch (error) {
    reportApiError(error, {
      action: "upload_document_storage",
      requestId,
      userId: user.id,
      status: 502,
    });
    return NextResponse.json(
      { error: "Não foi possível salvar o arquivo no storage." },
      { status: 502 }
    );
  }

  try {
    const document = await prisma.medicalDocument.create({
      data: {
        id: docId,
        patientId,
        title: validation.data.title,
        type: validation.data.type,
        storageKey,
        mimeType: validation.data.mimeType,
        issuedAt: validation.data.issuedAt,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    await deleteFromStorage(storageKey).catch(() => {});
    reportApiError(error, {
      action: "create_document_record",
      requestId,
      userId: user.id,
      status: 500,
    });
    return NextResponse.json(
      { error: "Não foi possível registrar o documento." },
      { status: 500 }
    );
  }
}
