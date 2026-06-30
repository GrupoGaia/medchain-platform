"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadButton({ docId }: { docId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${docId}`);
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? "Erro ao gerar link");
      }
      const { signedUrl } = (await res.json()) as { signedUrl: string };
      window.open(signedUrl, "_blank");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível baixar o documento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-1.5"
    >
      <Download size={14} />
      {loading ? "..." : "Baixar"}
    </Button>
  );
}
