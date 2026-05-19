import { describe, expect, it } from "vitest";
import { buildApiUrl } from "./api-url";

describe("buildApiUrl", () => {
  it("keeps /api from being duplicated when the base URL already includes it", () => {
    expect(buildApiUrl("http://192.168.0.10:3000/api", "/api/me")).toBe(
      "http://192.168.0.10:3000/api/me"
    );
  });

  it("supports a host-only base URL", () => {
    expect(buildApiUrl("http://192.168.0.10:3000", "/api/me/documents")).toBe(
      "http://192.168.0.10:3000/api/me/documents"
    );
  });
});
