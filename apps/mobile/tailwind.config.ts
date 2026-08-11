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
      fontFamily: {
        sans: ["Inter", "System"],
      },
    },
  },
  plugins: [],
};

export default config;
