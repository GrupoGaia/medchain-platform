import { supabaseAdmin } from "./supabase/admin";
import {
  buildMedicalDocumentStorageKey,
  getMedicalDocumentStorageConfig,
} from "./document-upload";

export async function ensureBucket(): Promise<void> {
  const config = getMedicalDocumentStorageConfig();
  const { data, error } = await supabaseAdmin.storage.listBuckets();
  if (error) throw new Error(`Erro ao listar buckets: ${error.message}`);

  const options = {
    public: false,
    fileSizeLimit: config.maxBytes,
    allowedMimeTypes: config.allowedMimeTypes,
  };

  if (data?.some((b) => b.name === config.bucket)) {
    const { error: updateError } = await supabaseAdmin.storage.updateBucket(
      config.bucket,
      options
    );
    if (updateError) throw new Error(`Erro ao atualizar bucket: ${updateError.message}`);
    return;
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(
    config.bucket,
    options
  );
  if (createError) throw new Error(`Erro ao criar bucket: ${createError.message}`);
}

export async function uploadToStorage(
  patientId: string,
  docId: string,
  buffer: Buffer | Uint8Array,
  mimeType: "application/pdf" | "image/jpeg" | "image/png"
): Promise<string> {
  await ensureBucket();
  const config = getMedicalDocumentStorageConfig();
  const storageKey = buildMedicalDocumentStorageKey(patientId, docId, mimeType);

  const { error } = await supabaseAdmin.storage
    .from(config.bucket)
    .upload(storageKey, buffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`Upload falhou: ${error.message}`);
  return storageKey;
}

export async function deleteFromStorage(storageKey: string): Promise<void> {
  const config = getMedicalDocumentStorageConfig();
  await supabaseAdmin.storage.from(config.bucket).remove([storageKey]);
}

export async function createSignedUrl(storageKey: string, expiresIn = 60): Promise<string> {
  const config = getMedicalDocumentStorageConfig();
  const { data, error } = await supabaseAdmin.storage
    .from(config.bucket)
    .createSignedUrl(storageKey, expiresIn);

  if (error || !data?.signedUrl) throw new Error("Erro ao gerar URL assinada");
  return data.signedUrl;
}
