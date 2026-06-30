type AuditChannel = "WEB_PORTAL" | "MOBILE_APP";

export function buildDoctorRecentLogsWhere(actorUserId: string) {
  return { actorUserId };
}

export function buildAccessRevocationLogData(input: {
  tokenId: string;
  actorUserId: string;
  patientId: string;
  channel: AuditChannel;
}) {
  return {
    tokenId: input.tokenId,
    actorUserId: input.actorUserId,
    patientId: input.patientId,
    eventType: "REVOKE",
    channel: input.channel,
  };
}
