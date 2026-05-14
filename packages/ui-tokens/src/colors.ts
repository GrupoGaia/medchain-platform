export const colors = {
  brand: {
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
  },
  alert: {
    red: "#DC2626",
    redLight: "#FEF2F2",
    amber: "#D97706",
    amberLight: "#FFFBEB",
    green: "#16A34A",
    greenLight: "#F0FDF4",
  },
  neutral: {
    background: "#F9FAFB",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    muted: "#9CA3AF",
    subtle: "#6B7280",
    default: "#374151",
    strong: "#111827",
  },
} as const;

export type Colors = typeof colors;
