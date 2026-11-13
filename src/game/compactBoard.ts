import type { LevelDefinition } from "../levels/levelTypes";
import type { BoardState } from "./boardState";

/**
 * Index-based mirror of the rules in boardState.ts, used by the solver and level lab.
 * Must stay rule-for-rule identical to applyMove / canMove (see tests/solver.test.ts).
 */

export interface CompactMeta {
  shelfIds: string[];
  capacities: number[];
  /** Type index → clothing id. */
  types: string[];
  uniformCapacity: boolean;
}

/** Shelf contents wall → open as type indices; null once the shelf has cleared. */
export type CompactShelves = (number[] | null)[];

export interface CompactMove {
  from: number;
  to: number;
  count: number;
}

const TYPE_CHARS = "abcdefghijklmnopqrstuvwxyz";

export function compileLevel(level: LevelDefinition): {
  meta: CompactMeta;
  start: CompactShelves;
} {
  const types: string[] = [];
  const typeIndex = new Map<string, number>();
  const start: CompactShelves = level.shelves.map((shelf) =>
    shelf.items.map((item) => {
      let idx = typeIndex.get(item);
      if (idx === undefined) {
        idx = types.length;
        types.push(item);
        typeIndex.set(item, idx);
      }
      return idx;
    }),
  );
  const capacities = level.shelves.map((s) => s.capacity);
  return {
    meta: {
      shelfIds: level.shelves.map((s) => s.id),
      capacities,
      types,
      uniformCapacity: capacities.every((c) => c === capacities[0]),
    },
    start,
  };
}

export function compileBoardState(
  meta: CompactMeta,
  state: BoardState,
): CompactShelves {
  const typeIndex = new Map(meta.types.map((t, i) => [t, i]));
  return meta.shelfIds.map((id) => {
    const shelf = state.shelves.find((s) => s.id === id);
    if (!shelf || shelf.cleared) return null;
    return shelf.items.map((item) => typeIndex.get(item)!);
  });
}

function openGroup(items: number[]): { type: number; count: number } | null {
  if (items.length === 0) return null;
  const type = items[items.length - 1]!;
  let count = 0;
  for (let i = items.length - 1; i >= 0 && items[i] === type; i--) count++;
  return { type, count };
}

export function legalCompactMoves(
  meta: CompactMeta,
  shelves: CompactShelves,
): CompactMove[] {
  const moves: CompactMove[] = [];
  for (let from = 0; from < shelves.length; from++) {
    const src = shelves[from];
    if (!src) continue;
    const group = openGroup(src);
    if (!group) continue;
    for (let to = 0; to < shelves.length; to++) {
      if (to === from) continue;
      const dst = shelves[to];
      if (!dst) continue;
      const space = meta.capacities[to]! - dst.length;
      if (space <= 0) continue;
      if (dst.length > 0 && dst[dst.length - 1] !== group.type) continue;
      moves.push({ from, to, count: Math.min(group.count, space) });
    }
  }
  return moves;
}

/** True when the move only relabels which shelf holds a lone group (same canonical state). */
export function isNoOpMove(shelves: CompactShelves, move: CompactMove): boolean {
  const src = shelves[move.from]!;
  const dst = shelves[move.to]!;
  return dst.length === 0 && move.count === src.length;
}

function shelfComplete(items: number[], capacity: number): boolean {
  if (items.length !== capacity || items.length === 0) return false;
  const t = items[0];
  return items.every((x) => x === t);
}

export function applyCompactMove(
  meta: CompactMeta,
  shelves: CompactShelves,
  move: CompactMove,
): CompactShelves {
  const next = shelves.slice();
  const src = shelves[move.from]!.slice();
  const moving = src.splice(src.length - move.count, move.count);
  const dst = shelves[move.to]!.concat(moving);
  next[move.from] = src;
  next[move.to] = dst;

  for (let i = 0; i < next.length; i++) {
    const s = next[i];
    if (s && shelfComplete(s, meta.capacities[i]!)) next[i] = null;
  }
  if (next.every((s) => s === null || s.length === 0)) {
    for (let i = 0; i < next.length; i++) next[i] = null;
  }
  return next;
}

export function isCompactWon(shelves: CompactShelves): boolean {
  return shelves.every((s) => s === null);
}

/**
 * Shelf order and side never affect the rules, so states that differ only by which
 * shelf holds which contents are equivalent.
 */
export function canonicalCompactKey(
  meta: CompactMeta,
  shelves: CompactShelves,
): string {
  const parts: string[] = [];
  for (let i = 0; i < shelves.length; i++) {
    const s = shelves[i];
    if (!s) continue;
    let str = meta.uniformCapacity ? "" : `${meta.capacities[i]}:`;
    for (const t of s) str += TYPE_CHARS[t];
    parts.push(str);
  }
  parts.sort();
  return parts.join("|");
}

/** Positional encoding (keeps shelf identity) so states can be stored as strings. */
export function encodeShelves(shelves: CompactShelves): string {
  let out = "";
  for (let i = 0; i < shelves.length; i++) {
    if (i > 0) out += "|";
    const s = shelves[i];
    if (!s) {
      out += "#";
      continue;
    }
    for (const t of s) out += TYPE_CHARS[t];
  }
  return out;
}

export function decodeShelves(encoded: string): CompactShelves {
  return encoded.split("|").map((part) => {
    if (part === "#") return null;
    const items: number[] = [];
    for (let i = 0; i < part.length; i++) items.push(part.charCodeAt(i) - 97);
    return items;
  });
}
