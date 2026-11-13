import { describe, expect, it } from "vitest";
import {
  applyMove,
  canMove,
  createBoard,
  getMovableGroup,
  isWon,
  type BoardShelf,
} from "../src/game/boardState";
import type { ClothingId } from "../src/game/clothing";
import { LEVELS } from "../src/levels/levelData";

describe("getMovableGroup", () => {
  it("takes contiguous open-end items", () => {
    const shelf: BoardShelf = {
      id: "t",
      side: "left",
      capacity: 4,
      items: ["white-tee", "white-tee", "brown-leather-jacket"] as ClothingId[],
      cleared: false,
    };
    expect(getMovableGroup(shelf)).toEqual({ type: "brown-leather-jacket", count: 1 });
    shelf.items = ["white-tee", "white-tee", "white-tee"];
    expect(getMovableGroup(shelf)?.count).toBe(3);
  });
});

describe("moves", () => {
  const board = createBoard({
    id: "t",
    name: "T",
    shelves: [
      {
        id: "a",
        side: "left",
        capacity: 4,
        items: ["white-tee", "white-tee"],
      },
      { id: "b", side: "right", capacity: 4, items: [] },
      {
        id: "c",
        side: "left",
        capacity: 4,
        items: ["brown-leather-jacket"],
      },
    ],
  });

  it("allows move to empty shelf", () => {
    expect(canMove(board, "a", "b")).toBe(true);
    const r = applyMove(board, "a", "b");
    expect(r?.movedCount).toBe(2);
    expect(r?.state.shelves.find((s) => s.id === "b")?.items).toHaveLength(2);
  });

  it("rejects mismatched destination", () => {
    expect(canMove(board, "a", "c")).toBe(false);
  });

  it("clears a full uniform shelf after it fills", () => {
    const small = createBoard({
      id: "t",
      name: "T",
      shelves: [
        {
          id: "a",
          side: "left",
          capacity: 4,
          items: ["white-tee", "white-tee", "white-tee", "white-tee"],
        },
        { id: "b", side: "right", capacity: 4, items: [] },
      ],
    });
    const r = applyMove(small, "a", "b");
    expect(r?.clearedShelfIds).toContain("b");
    expect(r?.state.shelves.find((s) => s.id === "b")?.cleared).toBe(true);
  });

  it("detects win when all shelves cleared", () => {
    const won: ReturnType<typeof createBoard> = {
      levelId: "t",
      shelves: [
        {
          id: "a",
          side: "left",
          capacity: 4,
          items: [],
          cleared: true,
        },
      ],
    };
    expect(isWon(won)).toBe(true);
  });
});

describe("level 1 board", () => {
  it("creates from level data", () => {
    const b = createBoard(LEVELS[0]);
    expect(b.shelves).toHaveLength(3);
  });
});
