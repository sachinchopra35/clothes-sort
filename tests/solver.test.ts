import { describe, expect, it } from "vitest";
import {
  applyMove,
  canMove,
  createBoard,
  isWon,
  type BoardState,
} from "../src/game/boardState";
import {
  applyCompactMove,
  compileBoardState,
  compileLevel,
  isCompactWon,
  legalCompactMoves,
} from "../src/game/compactBoard";
import { analyzeLevel, canonicalStateKey, solveLevel } from "../src/game/solver";
import { createRng, randomInt } from "../src/levels/lab/rng";
import { LEVELS } from "../src/levels/levelData";
import type { LevelDefinition } from "../src/levels/levelTypes";

const A = "white-tee" as const;
const B = "light-blue-jeans" as const;

function level(shelves: LevelDefinition["shelves"]): LevelDefinition {
  return { id: "test", name: "Test", shelves };
}

describe("canonical state key", () => {
  it("ignores which shelf holds which contents", () => {
    const lvl = level([
      { id: "l1", side: "left", capacity: 4, items: [A, B] },
      { id: "l2", side: "left", capacity: 4, items: [] },
      { id: "r1", side: "right", capacity: 4, items: [B, B, A] },
    ]);
    const s1 = createBoard(lvl);
    const s2: BoardState = {
      ...s1,
      shelves: [
        { ...s1.shelves[0]!, items: [B, B, A] },
        { ...s1.shelves[1]!, items: [A, B] },
        { ...s1.shelves[2]!, items: [] },
      ],
    };
    expect(canonicalStateKey(lvl, s1)).toBe(canonicalStateKey(lvl, s2));
  });

  it("distinguishes different contents", () => {
    const lvl = level([
      { id: "l1", side: "left", capacity: 4, items: [A, B] },
      { id: "r1", side: "right", capacity: 4, items: [B, A] },
    ]);
    const s1 = createBoard(lvl);
    const s2: BoardState = {
      ...s1,
      shelves: [
        { ...s1.shelves[0]!, items: [B, A] },
        { ...s1.shelves[1]!, items: [B, A] },
      ],
    };
    expect(canonicalStateKey(lvl, s1)).not.toBe(canonicalStateKey(lvl, s2));
  });
});

describe("compact engine mirrors boardState rules", () => {
  for (const lvl of LEVELS) {
    it(`${lvl.id}: legal moves and results match over random walks`, () => {
      const { meta } = compileLevel(lvl);
      const rng = createRng(42);
      for (let walk = 0; walk < 30; walk++) {
        let state = createBoard(lvl);
        for (let step = 0; step < 60 && !isWon(state); step++) {
          const compact = compileBoardState(meta, state);
          const compactMoves = legalCompactMoves(meta, compact)
            .map((m) => `${meta.shelfIds[m.from]}>${meta.shelfIds[m.to]}`)
            .sort();
          const ruleMoves: string[] = [];
          for (const from of meta.shelfIds) {
            for (const to of meta.shelfIds) {
              if (canMove(state, from, to)) ruleMoves.push(`${from}>${to}`);
            }
          }
          expect(compactMoves).toEqual(ruleMoves.sort());
          if (ruleMoves.length === 0) break;

          const pick = legalCompactMoves(meta, compact)[
            randomInt(rng, compactMoves.length)
          ]!;
          const next = applyMove(
            state,
            meta.shelfIds[pick.from]!,
            meta.shelfIds[pick.to]!,
          )!;
          const compactNext = applyCompactMove(meta, compact, pick);
          expect(compileBoardState(meta, next.state)).toEqual(compactNext);
          expect(isWon(next.state)).toBe(isCompactWon(compactNext));
          state = next.state;
        }
      }
    });
  }
});

describe("analyzeLevel", () => {
  it("proves a deadlocked board unsolvable", () => {
    const lvl = level([
      { id: "l1", side: "left", capacity: 2, items: [A, B] },
      { id: "r1", side: "right", capacity: 2, items: [B, A] },
    ]);
    const a = analyzeLevel(lvl);
    expect(a.complete).toBe(true);
    expect(a.solvable).toBe(false);
    expect(a.reachableStates).toBe(1);
    expect(a.stuckStates).toBe(1);
    expect(solveLevel(lvl)).toBeNull();
  });

  it("finds the optimal length on a hand-solved board", () => {
    // [A,B] [B,A] [] : B to empty, A onto A (clears), B onto B (clears, win) = 3 moves.
    const lvl = level([
      { id: "l1", side: "left", capacity: 2, items: [A, B] },
      { id: "r1", side: "right", capacity: 2, items: [B, A] },
      { id: "l2", side: "left", capacity: 2, items: [] },
    ]);
    const a = analyzeLevel(lvl);
    expect(a.complete).toBe(true);
    expect(a.solvable).toBe(true);
    expect(a.optimalMoves).toBe(3);
    expect(a.deadEndStates).toBe(0);
  });

  it("finds level 1's two-move solution", () => {
    const a = analyzeLevel(LEVELS[0]!);
    expect(a.optimalMoves).toBe(2);
  });

  it("returns solutions that replay under the game rules", () => {
    for (const lvl of LEVELS) {
      const moves = solveLevel(lvl)!;
      let state = createBoard(lvl);
      for (const m of moves) state = applyMove(state, m.from, m.to)!.state;
      expect(isWon(state)).toBe(true);
    }
  });
});
