import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { colors } from "@medchain/ui-tokens";
import "./globals.css";

// `display: swap` para o texto aparecer com a fonte do sistema enquanto a Inter
// carrega, em vez de a tela ficar em branco.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MedChain — Portal Médico",
    template: "%s · MedChain",
  },
  description:
    "Acesso a prontuários com autorização do paciente, escopo definido e prazo para expirar.",
};

export const viewport: Viewport = {
  // O metadado exige um literal, então vem do token e não de variável CSS.
  themeColor: colors.semantic.interactive,
  // Sem limite de zoom: quem precisa ampliar para ler precisa conseguir.
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
