import { describe, expect, it } from "vitest";
import { fastJumpLevel } from "../src/ui/levelJump";

describe("fastJumpLevel", () => {
  it("steps forward through multiples of 10", () => {
    expect(fastJumpLevel(1, 1, 100, 1)).toBe(10);
    expect(fastJumpLevel(10, 1, 100, 1)).toBe(20);
    expect(fastJumpLevel(14, 1, 100, 1)).toBe(20);
  });

  it("stops at the latest unlocked level on the way", () => {
    expect(fastJumpLevel(10, 1, 100, 17)).toBe(17);
    expect(fastJumpLevel(17, 1, 100, 17)).toBe(20);
    expect(fastJumpLevel(30, -1, 100, 23)).toBe(23);
    expect(fastJumpLevel(23, -1, 100, 23)).toBe(20);
  });

  it("steps back to multiples of 10, then level 1", () => {
    expect(fastJumpLevel(20, -1, 100, 50)).toBe(10);
    expect(fastJumpLevel(14, -1, 100, 50)).toBe(10);
    expect(fastJumpLevel(10, -1, 100, 50)).toBe(1);
  });

  it("wraps at the ends", () => {
    expect(fastJumpLevel(100, 1, 100, 5)).toBe(1);
    expect(fastJumpLevel(1, -1, 100, 5)).toBe(100);
  });
});
