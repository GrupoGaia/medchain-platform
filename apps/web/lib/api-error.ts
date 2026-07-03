import * as Sentry from "@sentry/nextjs";
import type { NextRequest } from "next/server";
import { logEvent } from "./logger";

export interface ApiErrorContext {
  action: string;
  requestId: string;
  userId?: string | null;
  status?: number;
}

// Reusa o x-request-id da requisição quando presente; senão gera um novo.
export function getRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

// Função pura: contexto enviado ao Sentry.
export function buildSentryContext(ctx: ApiErrorContext) {
  return {
    tags: { action: ctx.action },
    extra: {
      requestId: ctx.requestId,
      userId: ctx.userId ?? null,
      status: ctx.status ?? null,
    },
  };
}

export function reportApiError(error: unknown, ctx: ApiErrorContext): void {
  const message = error instanceof Error ? error.message : String(error);
  logEvent({
    level: "error",
    action: ctx.action,
    requestId: ctx.requestId,
    userId: ctx.userId,
    message,
    extra: { status: ctx.status ?? null },
  });
  Sentry.captureException(error, buildSentryContext(ctx));
}
