import { describe, expect, it } from "vitest";
import { LEVELS } from "../src/levels/levelData";
import { GENERATED_LEVELS } from "../src/levels/generatedLevels";
import { applyMove, createBoard, isWon } from "../src/game/boardState";
import { analyzeLevel } from "../src/game/solver";
import { measureLevel } from "../src/levels/lab/difficulty";
import { CLOTHING_IDS } from "../src/game/clothing";

function isShelfStartCleared(
  items: string[],
  capacity: number,
): boolean {
  return (
    items.length === capacity &&
    items.length > 0 &&
    items.every((id) => id === items[0])
  );
}

describe("level definitions", () => {
  it("are numbered level-1..level-N in order", () => {
    LEVELS.forEach((level, i) => {
      expect(level.id).toBe(`level-${i + 1}`);
      expect(level.name).toBe(`Level ${i + 1}`);
    });
  });

  for (const level of LEVELS) {
    it(`${level.id} has valid inventory`, () => {
      const capacity = level.shelves[0]?.capacity ?? 4;
      const counts = new Map<string, number>();
      const ids = new Set<string>();
      for (const shelf of level.shelves) {
        expect(ids.has(shelf.id)).toBe(false);
        ids.add(shelf.id);
        expect(shelf.items.length).toBeLessThanOrEqual(shelf.capacity);
        expect(isShelfStartCleared(shelf.items, shelf.capacity)).toBe(false);
        for (const item of shelf.items) {
          expect(CLOTHING_IDS).toContain(item);
          counts.set(item, (counts.get(item) ?? 0) + 1);
        }
      }
      for (const [, n] of counts) {
        expect(n).toBe(capacity);
      }
      createBoard(level);
    });

    it(`${level.id} is proven solvable by exhaustive search`, () => {
      const analysis = analyzeLevel(level);
      expect(analysis.complete).toBe(true);
      expect(analysis.solvable).toBe(true);
    });

    if (level.solution) {
      it(`${level.id} stored solution wins under the game rules`, () => {
        let state = createBoard(level);
        for (const move of level.solution!) {
          const result = applyMove(state, move.from, move.to);
          expect(result, `illegal move ${move.from} -> ${move.to}`).not.toBeNull();
          state = result!.state;
        }
        expect(isWon(state)).toBe(true);
      });
    }
  }

  it("every generated level ships with a solution", () => {
    for (const level of GENERATED_LEVELS) {
      expect(level.solution?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("generated levels get strictly harder", () => {
    const scores = GENERATED_LEVELS.map((level) => measureLevel(level).score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThan(scores[i - 1]!);
    }
  });
});
