import { supabaseAdmin } from "./supabase/admin";

const BUCKET = "medical-documents";

export async function ensureBucket(): Promise<void> {
  const { data } = await supabaseAdmin.storage.listBuckets();
  if (!data?.some((b) => b.name === BUCKET)) {
    await supabaseAdmin.storage.createBucket(BUCKET, { public: false });
  }
}

export async function uploadToStorage(
  patientId: string,
  docId: string,
  buffer: Buffer | Uint8Array,
  mimeType: string
): Promise<string> {
  await ensureBucket();
  const ext =
    mimeType === "application/pdf" ? "pdf"
    : mimeType === "image/jpeg" ? "jpg"
    : mimeType === "image/png" ? "png"
    : "bin";
  const storageKey = `${patientId}/${docId}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storageKey, buffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`Upload falhou: ${error.message}`);
  return storageKey;
}

export async function createSignedUrl(storageKey: string, expiresIn = 60): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(storageKey, expiresIn);

  if (error || !data?.signedUrl) throw new Error("Erro ao gerar URL assinada");
  return data.signedUrl;
}
