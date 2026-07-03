import { describe, expect, it } from "vitest";
import { buildLogEntry } from "./logger";

describe("buildLogEntry", () => {
  it("normaliza userId ausente para null", () => {
    expect(
      buildLogEntry({ level: "info", action: "upload_document", requestId: "req-1" })
    ).toEqual({
      level: "info",
      action: "upload_document",
      requestId: "req-1",
      userId: null,
    });
  });

  it("inclui message e achata extra quando fornecidos", () => {
    expect(
      buildLogEntry({
        level: "error",
        action: "upload_document",
        requestId: "req-2",
        userId: "user-9",
        message: "storage falhou",
        extra: { status: 502 },
      })
    ).toEqual({
      level: "error",
      action: "upload_document",
      requestId: "req-2",
      userId: "user-9",
      message: "storage falhou",
      status: 502,
    });
  });
});
