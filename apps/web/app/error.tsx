"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <Card className="w-full max-w-md border shadow-sm">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle size={22} />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Algo deu errado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Não foi possível carregar esta página. Tente de novo em alguns instantes.
          </p>

          {/* O digest e o que liga esta tela ao erro registrado no servidor. */}
          {error.digest && (
            <code className="mt-4 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
              {error.digest}
            </code>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={reset} className={cn(buttonVariants(), "gap-1.5")}>
              <RotateCcw size={16} />
              Tentar de novo
            </button>
            <Link
              href="/medico/dashboard"
              className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
            >
              <ArrowLeft size={16} />
              Voltar ao dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
