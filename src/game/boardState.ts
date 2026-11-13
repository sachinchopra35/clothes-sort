import type { ClothingId } from "./clothing";
import type { LevelDefinition } from "../levels/levelTypes";

export interface BoardShelf {
  id: string;
  side: "left" | "right";
  capacity: number;
  /** Wall (index 0) → open end (last index). */
  items: ClothingId[];
  cleared: boolean;
}

export interface BoardState {
  levelId: string;
  shelves: BoardShelf[];
}

export interface MoveResult {
  state: BoardState;
  movedCount: number;
  clearedShelfIds: string[];
}

function cloneState(state: BoardState): BoardState {
  return {
    levelId: state.levelId,
    shelves: state.shelves.map((s) => ({
      ...s,
      items: [...s.items],
    })),
  };
}

export function createBoard(level: LevelDefinition): BoardState {
  return {
    levelId: level.id,
    shelves: level.shelves.map((def) => ({
      id: def.id,
      side: def.side,
      capacity: def.capacity,
      items: [...def.items],
      cleared: false,
    })),
  };
}

function shelfById(state: BoardState, id: string): BoardShelf | undefined {
  return state.shelves.find((s) => s.id === id && !s.cleared);
}

/** Contiguous run of the same type at the open end (wall → open). */
export function getMovableGroup(shelf: BoardShelf): {
  type: ClothingId;
  count: number;
} | null {
  if (shelf.cleared || shelf.items.length === 0) return null;
  const openType = shelf.items[shelf.items.length - 1];
  let count = 0;
  for (let i = shelf.items.length - 1; i >= 0; i--) {
    if (shelf.items[i] !== openType) break;
    count++;
  }
  return { type: openType, count };
}

function shelfIsComplete(shelf: BoardShelf): boolean {
  return (
    !shelf.cleared &&
    shelf.items.length === shelf.capacity &&
    shelf.items.every((id) => id === shelf.items[0])
  );
}

function emptyClearedShelves(state: BoardState): string[] {
  const cleared: string[] = [];
  for (const shelf of state.shelves) {
    if (shelf.cleared) continue;
    if (shelfIsComplete(shelf)) {
      shelf.cleared = true;
      cleared.push(shelf.id);
    }
  }
  return cleared;
}

/** After all items are gone, remaining empty shelves clear too. */
function clearRemainingEmpty(state: BoardState): string[] {
  const allItemsCleared = state.shelves.every(
    (s) => s.cleared || s.items.length === 0,
  );
  if (!allItemsCleared) return [];
  const cleared: string[] = [];
  for (const shelf of state.shelves) {
    if (!shelf.cleared && shelf.items.length === 0) {
      shelf.cleared = true;
      cleared.push(shelf.id);
    }
  }
  return cleared;
}

export function canMove(
  state: BoardState,
  fromId: string,
  toId: string,
): boolean {
  if (fromId === toId) return false;
  const from = shelfById(state, fromId);
  const to = shelfById(state, toId);
  if (!from || !to) return false;

  const group = getMovableGroup(from);
  if (!group) return false;

  const space = to.capacity - to.items.length;
  if (space <= 0) return false;

  if (to.items.length === 0) return true;
  return to.items[to.items.length - 1] === group.type;
}

export function applyMove(
  state: BoardState,
  fromId: string,
  toId: string,
): MoveResult | null {
  if (!canMove(state, fromId, toId)) return null;

  const next = cloneState(state);
  const from = shelfById(next, fromId)!;
  const to = shelfById(next, toId)!;
  const group = getMovableGroup(from)!;

  const space = to.capacity - to.items.length;
  const moveCount = Math.min(group.count, space);

  const moving = from.items.splice(from.items.length - moveCount, moveCount);
  to.items.push(...moving);

  const clearedShelfIds = [
    ...emptyClearedShelves(next),
    ...clearRemainingEmpty(next),
  ];

  return { state: next, movedCount: moveCount, clearedShelfIds };
}

export function isWon(state: BoardState): boolean {
  return state.shelves.every((s) => s.cleared);
}

export function stateKey(state: BoardState): string {
  const parts = state.shelves
    .filter((s) => !s.cleared)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((s) => `${s.id}:${s.items.join(",")}`);
  return parts.join("|");
}
