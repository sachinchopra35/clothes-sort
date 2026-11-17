import { describe, expect, it } from "vitest";
import { undoAllowanceForLevel } from "../src/game/undoLimits";

describe("undoAllowanceForLevel", () => {
  it("gives no undos below level 11", () => {
    expect(undoAllowanceForLevel(10)).toBe(0);
  });

  it("scales allowance at 11 and 21", () => {
    expect(undoAllowanceForLevel(11)).toBe(1);
    expect(undoAllowanceForLevel(20)).toBe(1);
    expect(undoAllowanceForLevel(21)).toBe(2);
    expect(undoAllowanceForLevel(40)).toBe(2);
    expect(undoAllowanceForLevel(41)).toBe(2);
    expect(undoAllowanceForLevel(99)).toBe(2);
  });
});