"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  docId: string;
  /** Usado no rótulo acessível, para diferenciar os botões de uma lista. */
  documentTitle?: string;
}

export function DownloadButton({ docId, documentTitle }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${docId}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Não foi possível gerar o link.");
      }
      const { signedUrl } = (await res.json()) as { signedUrl: string };
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      // Erro na própria linha, e não em `alert()`: o aviso do navegador tira o
      // foco da página e não diz de qual documento está falando.
      setError(e instanceof Error ? e.message : "Não foi possível abrir o documento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1 lg:items-end">
      <Button
        onClick={handleDownload}
        disabled={loading}
        variant="outline"
        size="sm"
        className="justify-center"
        aria-label={
          documentTitle ? `Abrir documento ${documentTitle}` : "Abrir documento"
        }
      >
        {loading ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <Download aria-hidden />
        )}
        {loading ? "Abrindo…" : "Abrir"}
      </Button>
      {error && (
        <p role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
