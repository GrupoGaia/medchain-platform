"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Ultimo recurso: pega erro de renderizacao do proprio layout raiz, que o
// app/error.tsx nao alcanca. Como substitui o layout raiz, precisa renderizar
// html e body por conta propria, e o globals.css nao esta carregado aqui.
// Por isso o estilo e inline, e nao classe do Tailwind.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          backgroundColor: "#F7F8FA",
          color: "#111827",
        }}
      >
        <main style={{ maxWidth: "26rem", padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
            Algo deu errado
          </h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#6B7280" }}>
            O MedChain não conseguiu carregar. Tente de novo em alguns instantes.
          </p>
          {error.digest && (
            <code
              style={{
                display: "inline-block",
                marginTop: "1rem",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
                backgroundColor: "#F3F4F6",
                fontSize: "0.75rem",
                color: "#6B7280",
              }}
            >
              {error.digest}
            </code>
          )}
          <div style={{ marginTop: "1.5rem" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                cursor: "pointer",
                border: "none",
                borderRadius: "0.5rem",
                backgroundColor: "#0F766E",
                color: "#FFFFFF",
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Tentar de novo
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
