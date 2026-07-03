import { NextResponse } from "next/server";

// Rota de verificação de observabilidade. Só responde quando explicitamente habilitada.
export function GET() {
  if (process.env.SENTRY_DEBUG_ENDPOINT !== "enabled") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  throw new Error(
    "MedChain Sentry check: erro proposital para validar a observabilidade"
  );
}
