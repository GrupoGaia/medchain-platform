import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// A presença deste arquivo desliga o carregamento automático do .env que o Prisma CLI fazia.
// Carregamos na mão para manter o comportamento anterior: o que já está no ambiente vence o arquivo,
// que é o que permite apontar DATABASE_URL para o Supabase local sem editar o .env.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    // Caminho explícito porque o Prisma roda o seed via cmd.exe no Windows, sem node_modules/.bin no PATH.
    seed: "node_modules/.bin/tsx prisma/seed.ts",
  },
});
