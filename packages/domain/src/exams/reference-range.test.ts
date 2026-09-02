import { describe, expect, it } from "vitest";
import { isOutOfRange } from "./reference-range";

describe("isOutOfRange", () => {
  it("flags a value below the minimum", () => {
    expect(isOutOfRange(38, 40, 100)).toBe(true);
  });

  it("flags a value above the maximum", () => {
    expect(isOutOfRange(189, 0, 150)).toBe(true);
  });

  it("accepts a value inside the range", () => {
    expect(isOutOfRange(14.2, 13, 17)).toBe(false);
  });

  it("treats the range as inclusive on both ends", () => {
    expect(isOutOfRange(40, 40, 100)).toBe(false);
    expect(isOutOfRange(100, 40, 100)).toBe(false);
  });
});
