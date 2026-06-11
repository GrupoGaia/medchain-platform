import type { Config } from "tailwindcss";

// Cores definidas inline, mesmos valores de packages/ui-tokens/src/colors.ts
const brand = {
  "50": "#F0FDFA",
  "100": "#CCFBF1",
  "200": "#99F6E4",
  "300": "#5EEAD4",
  "400": "#2DD4BF",
  "500": "#14B8A6",
  "600": "#0D9488",
  "700": "#0F766E",
  "800": "#115E59",
  "900": "#134E4A",
};

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: { brand },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};

export default config;
