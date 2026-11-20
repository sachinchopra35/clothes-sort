import { describe, expect, it } from "vitest";
import { computeShelfHitSlops } from "../src/layout/shelfHitSlop";
import type { ShelfLayoutEntry } from "../src/layout/shelfLayout";

function entry(id: string, side: "left" | "right", y: number): ShelfLayoutEntry {
  const x = side === "left" ? 72 : 554;
  return {
    definition: { id, side, capacity: 4, items: [] },
    x,
    y,
    width: 454,
    side,
  };
}

describe("computeShelfHitSlops", () => {
  it("gives larger slop on sparse layouts than crowded ones", () => {
    const sparse = computeShelfHitSlops([entry("a", "left", 400), entry("b", "right", 514)]);
    const crowded = computeShelfHitSlops(
      Array.from({ length: 10 }, (_, i) =>
        entry(`l${i}`, i % 2 === 0 ? "left" : "right", 400 + Math.floor(i / 2) * 228),
      ),
    );
    const sparseA = sparse.get("a")!;
    const crowdedL = crowded.get("l0")!;
    expect(sparseA.above + sparseA.open).toBeGreaterThan(crowdedL.above + crowdedL.open);
  });
});