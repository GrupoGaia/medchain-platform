"use client";
import { useState } from "react";
import { Download } from "lucide-react";

export function DownloadButton({ docId }: { docId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${docId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? "Erro ao gerar link");
      }
      const { signedUrl } = await res.json() as { signedUrl: string };
      window.open(signedUrl, "_blank");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Não foi possível baixar o documento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-teal-300 hover:text-teal-700 disabled:opacity-50"
    >
      <Download size={12} />
      {loading ? "..." : "Baixar"}
    </button>
  );
}
