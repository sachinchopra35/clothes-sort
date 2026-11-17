import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_CLOTHING } from "../src/game/clothing";

describe("clothing catalog", () => {
  for (const item of ALL_CLOTHING) {
    it(`${item.id} has an asset on disk`, () => {
      expect(existsSync(join(__dirname, "../public", item.assetPath))).toBe(true);
    });
  }

  it("uses unique texture keys", () => {
    const keys = ALL_CLOTHING.map((c) => c.textureKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
