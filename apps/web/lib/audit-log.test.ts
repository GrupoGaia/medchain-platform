import { describe, expect, it } from "vitest";
import {
  buildAccessRevocationLogData,
  buildDoctorRecentLogsWhere,
} from "./audit-log";

describe("audit-log helpers", () => {
  it("filters recent doctor activity by the authenticated user id", () => {
    expect(buildDoctorRecentLogsWhere("user-123")).toEqual({
      actorUserId: "user-123",
    });
  });

  it("uses the actor user id when creating a revoke audit log", () => {
    expect(
      buildAccessRevocationLogData({
        tokenId: "token-123",
        actorUserId: "doctor-user-123",
        patientId: "patient-123",
        channel: "WEB_PORTAL",
      })
    ).toEqual({
      tokenId: "token-123",
      actorUserId: "doctor-user-123",
      patientId: "patient-123",
      eventType: "REVOKE",
      channel: "WEB_PORTAL",
    });
  });
});
