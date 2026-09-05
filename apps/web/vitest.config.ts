import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// O `@/` do tsconfig precisa existir tambem para o Vitest, que nao le paths do
// TypeScript. Sem isto so funcionava `@/` dentro de `vi.mock()`, porque a
// fabrica do mock substitui o modulo antes de ele ser resolvido; qualquer
// import de verdade quebrava com "Failed to load url".
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
