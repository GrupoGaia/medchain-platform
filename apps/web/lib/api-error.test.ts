import { afterEach, describe, expect, it, vi } from "vitest";
import * as Sentry from "@sentry/nextjs";
import { buildSentryContext, reportApiError } from "./api-error";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildSentryContext", () => {
  it("mapeia action para tag e o resto para extra", () => {
    expect(
      buildSentryContext({
        action: "upload_document",
        requestId: "req-1",
        userId: "u1",
        status: 502,
      })
    ).toEqual({
      tags: { action: "upload_document" },
      extra: { requestId: "req-1", userId: "u1", status: 502 },
    });
  });

  it("normaliza userId e status ausentes para null", () => {
    expect(buildSentryContext({ action: "x", requestId: "req-2" })).toEqual({
      tags: { action: "x" },
      extra: { requestId: "req-2", userId: null, status: null },
    });
  });
});

describe("reportApiError", () => {
  it("loga estruturado e reporta ao Sentry", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const error = new Error("boom");

    reportApiError(error, {
      action: "upload_document",
      requestId: "req-3",
      userId: "u3",
      status: 500,
    });

    expect(logSpy).toHaveBeenCalledOnce();
    expect(JSON.parse(logSpy.mock.calls[0][0] as string)).toMatchObject({
      level: "error",
      action: "upload_document",
      requestId: "req-3",
      userId: "u3",
      message: "boom",
      status: 500,
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: { action: "upload_document" },
      extra: { requestId: "req-3", userId: "u3", status: 500 },
    });
  });
});
