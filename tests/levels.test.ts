import { describe, expect, it } from "vitest";
import { LEVELS } from "../src/levels/levelData";
import { createBoard } from "../src/game/boardState";
import { solveLevel } from "../src/game/solver";

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
  for (const level of LEVELS) {
    it(`${level.id} has valid inventory`, () => {
      const capacity = level.shelves[0]?.capacity ?? 4;
      const counts = new Map<string, number>();
      for (const shelf of level.shelves) {
        expect(shelf.items.length).toBeLessThanOrEqual(shelf.capacity);
        expect(isShelfStartCleared(shelf.items, shelf.capacity)).toBe(false);
        for (const item of shelf.items) {
          counts.set(item, (counts.get(item) ?? 0) + 1);
        }
      }
      for (const [, n] of counts) {
        expect(n).toBe(capacity);
      }
      createBoard(level);
    });

    it(`${level.id} is solvable`, () => {
      const solution = solveLevel(level);
      expect(solution).not.toBeNull();
    });
  }
});
