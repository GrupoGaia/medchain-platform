import { afterEach, describe, expect, it, vi } from "vitest";
import { buildTokenExpiry, createTokenData } from "./create";
import { formatMinutesRemaining, validateToken } from "./validate";

describe("token creation", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds an expiry date from the requested duration", () => {
    const from = new Date("2026-06-30T12:00:00.000Z");

    expect(buildTokenExpiry(45, from)).toEqual(new Date("2026-06-30T12:45:00.000Z"));
  });

  it("creates active token data with the expected expiration", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-30T12:00:00.000Z"));

    const token = createTokenData(
      {
        patientId: "patient-123",
        professionalId: "doctor-123",
        requestId: "request-123",
        scope: "Prontuario completo",
        durationMinutes: 30,
      },
      "token-123"
    );

    expect(token).toEqual({
      id: "token-123",
      patientId: "patient-123",
      professionalId: "doctor-123",
      requestId: "request-123",
      scope: "Prontuario completo",
      expiresAt: new Date("2026-06-30T12:30:00.000Z"),
      status: "ACTIVE",
      createdAt: new Date("2026-06-30T12:00:00.000Z"),
    });
  });
});

describe("validateToken", () => {
  const now = new Date("2026-06-30T12:00:00.000Z");

  it("returns the remaining whole minutes for an active token", () => {
    expect(
      validateToken(
        {
          status: "ACTIVE",
          expiresAt: new Date("2026-06-30T12:45:30.000Z"),
          revokedAt: null,
        },
        now
      )
    ).toEqual({ valid: true, minutesRemaining: 45 });
  });

  it("rejects an active token after its expiration date", () => {
    expect(
      validateToken(
        {
          status: "ACTIVE",
          expiresAt: new Date("2026-06-30T11:59:59.000Z"),
          revokedAt: null,
        },
        now
      )
    ).toEqual({ valid: false, reason: "EXPIRED" });
  });

  it("rejects a revoked token", () => {
    expect(
      validateToken(
        {
          status: "REVOKED",
          expiresAt: new Date("2026-06-30T12:45:00.000Z"),
          revokedAt: new Date("2026-06-30T12:10:00.000Z"),
        },
        now
      )
    ).toEqual({ valid: false, reason: "REVOKED" });
  });
});

describe("formatMinutesRemaining", () => {
  it("formats durations below one hour in minutes", () => {
    expect(formatMinutesRemaining(45)).toBe("45m");
  });

  it("formats exact hours without trailing minutes", () => {
    expect(formatMinutesRemaining(120)).toBe("2h");
  });

  it("formats hours and minutes together", () => {
    expect(formatMinutesRemaining(135)).toBe("2h 15m");
  });
});
