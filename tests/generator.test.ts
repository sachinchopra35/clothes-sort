import { describe, expect, it } from "vitest";
import {
  dealLevel,
  generateLevel,
  passesStartFilters,
  type LevelSpec,
} from "../src/levels/lab/generator";
import { createRng } from "../src/levels/lab/rng";

const spec: LevelSpec = {
  number: 42,
  types: ["white-tee", "light-blue-jeans", "black-bootcut-jeans", "red-polka-dress"],
  emptyShelves: 2,
  capacity: 4,
  maxStartRun: 2,
  scoreBand: [0, 1000],
  seed: 99,
  attempts: 8,
};

describe("rng", () => {
  it("is deterministic per seed", () => {
    const a = createRng(7);
    const b = createRng(7);
    const c = createRng(8);
    const seqA = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(seqA);
    expect([c(), c(), c()]).not.toEqual(seqA);
  });
});

describe("dealLevel", () => {
  it("deals every type exactly capacity times plus empty shelves", () => {
    const lvl = dealLevel(spec, 1234);
    expect(lvl.id).toBe("level-42");
    expect(lvl.shelves).toHaveLength(spec.types.length + spec.emptyShelves);
    expect(lvl.shelves.filter((s) => s.items.length === 0)).toHaveLength(2);
    const counts = new Map<string, number>();
    for (const s of lvl.shelves) {
      for (const item of s.items) counts.set(item, (counts.get(item) ?? 0) + 1);
    }
    expect([...counts.keys()].sort()).toEqual([...spec.types].sort());
    for (const n of counts.values()) expect(n).toBe(spec.capacity);
  });

  it("alternates sides with unique ids", () => {
    const lvl = dealLevel(spec, 5);
    expect(lvl.shelves.map((s) => s.id)).toEqual(["l1", "r1", "l2", "r2", "l3", "r3"]);
    expect(lvl.shelves.map((s) => s.side)).toEqual([
      "left", "right", "left", "right", "left", "right",
    ]);
  });

  it("is deterministic per seed", () => {
    expect(dealLevel(spec, 77)).toEqual(dealLevel(spec, 77));
    expect(dealLevel(spec, 77)).not.toEqual(dealLevel(spec, 78));
  });
});

describe("passesStartFilters", () => {
  it("rejects long starting runs", () => {
    const lvl = dealLevel(spec, 1);
    lvl.shelves[0]!.items = ["white-tee", "white-tee", "white-tee", "red-polka-dress"];
    expect(passesStartFilters(lvl, spec)).toBe(false);
    expect(passesStartFilters(lvl, { ...spec, maxStartRun: 3 })).toBe(true);
  });
});

describe("generateLevel", () => {
  it("is reproducible and only returns solvable, fully explored levels", () => {
    const first = generateLevel(spec);
    const second = generateLevel(spec);
    expect(first.chosen).not.toBeNull();
    expect(second.chosen?.level).toEqual(first.chosen?.level);
    for (const c of first.valid) {
      expect(c.measurement.analysis.complete).toBe(true);
      expect(c.measurement.analysis.solvable).toBe(true);
    }
  });

  it("returns nothing when the band is impossible", () => {
    const report = generateLevel({ ...spec, scoreBand: [500, 600] });
    expect(report.chosen).toBeNull();
  });
});
