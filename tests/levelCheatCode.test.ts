import { describe, expect, it } from "vitest";
import {
  cheatCodeForLevelNumber,
  verifyLevelCheatCode,
} from "../src/game/levelCheatCode";

describe("levelCheatCode", () => {
  it("builds clothes + level number", () => {
    expect(cheatCodeForLevelNumber(3)).toBe("cleanclothes3");
    expect(cheatCodeForLevelNumber(19)).toBe("cleanclothes19");
  });

  it("accepts matching codes case-insensitively", () => {
    expect(verifyLevelCheatCode("level-3", "cleanclothes3")).toBe(true);
    expect(verifyLevelCheatCode("level-3", "  CLEANCLOTHES3  ")).toBe(true);
    expect(verifyLevelCheatCode("level-3", "cleanclothes2")).toBe(false);
  });
});