"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { RotateCcw, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/medchain/error-state";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sem DSN o Sentry fica desativado, entao em dev e no CI isto nao envia nada.
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <ErrorState
        className="w-full max-w-md"
        title="Não foi possível carregar esta página"
        description="O erro foi registrado. Tente de novo em alguns instantes; se continuar, volte ao dashboard."
        digest={error.digest}
      >
        <button type="button" onClick={reset} className={cn(buttonVariants())}>
          <RotateCcw aria-hidden />
          Tentar de novo
        </button>
        <Link
          href="/medico/dashboard"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <ArrowLeft aria-hidden />
          Voltar ao dashboard
        </Link>
      </ErrorState>
    </div>
  );
}
