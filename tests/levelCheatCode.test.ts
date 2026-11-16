import { describe, expect, it } from "vitest";
import {
  cheatCodeForLevelNumber,
  verifyLevelCheatCode,
} from "../src/game/levelCheatCode";

describe("levelCheatCode", () => {
  it("builds clothes + level number", () => {
    expect(cheatCodeForLevelNumber(3)).toBe("clothes3");
    expect(cheatCodeForLevelNumber(19)).toBe("clothes19");
  });

  it("accepts matching codes case-insensitively", () => {
    expect(verifyLevelCheatCode("level-3", "clothes3")).toBe(true);
    expect(verifyLevelCheatCode("level-3", "  CLOTHES3  ")).toBe(true);
    expect(verifyLevelCheatCode("level-3", "clothes2")).toBe(false);
  });
});