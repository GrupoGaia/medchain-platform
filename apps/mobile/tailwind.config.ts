import type { Config } from "tailwindcss";
import { colors } from "@medchain/ui-tokens";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: colors.brand,
        alert: colors.alert,
        neutral: colors.neutral,
      },
      // Em React Native o negrito não é sintetizado a partir de um arquivo só,
      // então cada peso aponta para o arquivo correspondente da Inter. Os nomes
      // batem com as classes de peso do Tailwind, que emite as duas regras para
      // a mesma classe: font-bold recebe a família e o peso juntos.
      fontFamily: {
        sans: ["Inter_400Regular"],
        medium: ["Inter_500Medium"],
        semibold: ["Inter_600SemiBold"],
        bold: ["Inter_700Bold"],
      },
    },
  },
  plugins: [],
};

export default config;
