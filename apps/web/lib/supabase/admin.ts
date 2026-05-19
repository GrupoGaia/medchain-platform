import { createClient } from "@supabase/supabase-js";

// Usado apenas em operações server-side privilegiadas (seed, admin).
// NUNCA expor SUPABASE_SERVICE_ROLE_KEY ao client.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
