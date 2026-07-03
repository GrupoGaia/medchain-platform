export type LogLevel = "info" | "warn" | "error";

export interface LogInput {
  level: LogLevel;
  action: string;
  requestId: string;
  userId?: string | null;
  message?: string;
  extra?: Record<string, unknown>;
}

// Função pura: monta o objeto de log estruturado (sem timestamp; a Vercel timestampa cada linha)
export function buildLogEntry(input: LogInput) {
  return {
    level: input.level,
    action: input.action,
    requestId: input.requestId,
    userId: input.userId ?? null,
    ...(input.message ? { message: input.message } : {}),
    ...(input.extra ?? {}),
  };
}

export function logEvent(input: LogInput): void {
  console.log(JSON.stringify(buildLogEntry(input)));
}
