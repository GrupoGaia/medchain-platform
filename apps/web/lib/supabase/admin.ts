import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// Usado apenas em operações server-side privilegiadas (upload, URL assinada).
// NUNCA expor SUPABASE_SERVICE_ROLE_KEY ao client.
//
// O cliente é criado sob demanda, e não no import. O `next build` avalia os
// módulos das rotas para coletar os dados de página, e um cliente construído
// no escopo do módulo quebrava o build inteiro em qualquer ambiente sem as
// variáveis, como o CI e um clone novo. Segredo de runtime não pode ser
// requisito de build.
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias para operações de storage."
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return client;
}
