import type { LevelDefinition } from "../levels/levelTypes";
import { createRng, randomInt } from "../levels/lab/rng";
import type { BoardState } from "./boardState";
import {
  applyCompactMove,
  canonicalCompactKey,
  compileBoardState,
  compileLevel,
  decodeShelves,
  encodeShelves,
  isCompactWon,
  isNoOpMove,
  legalCompactMoves,
  type CompactMeta,
  type CompactShelves,
} from "./compactBoard";

export interface SolverMove {
  from: string;
  to: string;
}

export interface LevelAnalysis {
  solvable: boolean;
  /** Every reachable state was explored, so the numbers below are exact. */
  complete: boolean;
  reachableStates: number;
  optimalMoves: number | null;
  /** Reachable states (excluding the win) from which winning is impossible. */
  deadEndStates: number;
  deadEndRatio: number;
  /** Dead ends with no legal move at all. */
  stuckStates: number;
  /** Share of moves from the start position that lead to a dead end. */
  startTrapRate: number;
  /** Average share of losing moves at each step of an optimal solution. */
  pathTrapRate: number;
  /** Average share of losing moves over every still-winnable state. */
  avgTrapRate: number;
  solution: SolverMove[] | null;
}

export const DEFAULT_ANALYSIS_CAP = 3_000_000;
const WIN_KEY = "WIN";

class IntBuffer {
  data = new Int32Array(1024);
  length = 0;

  push(value: number): void {
    if (this.length === this.data.length) {
      const grown = new Int32Array(this.data.length * 2);
      grown.set(this.data);
      this.data = grown;
    }
    this.data[this.length++] = value;
  }
}

export function canonicalStateKey(level: LevelDefinition, state: BoardState): string {
  const { meta } = compileLevel(level);
  const shelves = compileBoardState(meta, state);
  return isCompactWon(shelves) ? WIN_KEY : canonicalCompactKey(meta, shelves);
}

function keyOf(meta: CompactMeta, shelves: CompactShelves): string {
  return isCompactWon(shelves) ? WIN_KEY : canonicalCompactKey(meta, shelves);
}

interface Exploration {
  meta: CompactMeta;
  encoded: string[];
  parent: IntBuffer;
  parentMove: IntBuffer;
  depth: IntBuffer;
  edgeOffsets: IntBuffer;
  edges: IntBuffer;
  winIndex: number;
  complete: boolean;
}

/**
 * Breadth-first exploration over canonical states. Each canonical state keeps the
 * first concrete (shelf-labelled) representative reached, so parent links replay
 * as real shelf-id moves.
 */
function explore(
  level: LevelDefinition,
  cap: number,
  options: { stopAtWin: boolean; recordEdges: boolean },
): Exploration {
  const { meta, start } = compileLevel(level);
  const index = new Map<string, number>();
  const encoded: string[] = [];
  const parent = new IntBuffer();
  const parentMove = new IntBuffer();
  const depth = new IntBuffer();
  const edgeOffsets = new IntBuffer();
  const edges = new IntBuffer();
  let winIndex = -1;

  const add = (shelves: CompactShelves, from: number, move: number, d: number) => {
    const key = keyOf(meta, shelves);
    const existing = index.get(key);
    if (existing !== undefined) return existing;
    const id = encoded.length;
    index.set(key, id);
    encoded.push(encodeShelves(shelves));
    parent.push(from);
    parentMove.push(move);
    depth.push(d);
    if (key === WIN_KEY && winIndex < 0) winIndex = id;
    return id;
  };

  add(start, -1, -1, 0);
  let head = 0;
  let complete = true;

  while (head < encoded.length) {
    if (options.stopAtWin && winIndex >= 0) {
      complete = false;
      break;
    }
    if (encoded.length > cap) {
      complete = false;
      break;
    }
    const current = head++;
    if (options.recordEdges) edgeOffsets.push(edges.length);
    if (current === winIndex) continue;

    const shelves = decodeShelves(encoded[current]!);
    const d = depth.data[current]! + 1;
    for (const move of legalCompactMoves(meta, shelves)) {
      if (isNoOpMove(shelves, move)) continue;
      const next = applyCompactMove(meta, shelves, move);
      const target = add(next, current, move.from * 64 + move.to, d);
      if (options.recordEdges && target !== current) edges.push(target);
    }
  }
  if (options.recordEdges) edgeOffsets.push(edges.length);

  return {
    meta,
    encoded,
    parent,
    parentMove,
    depth,
    edgeOffsets,
    edges,
    winIndex,
    complete,
  };
}

function pathTo(ex: Exploration, target: number): SolverMove[] {
  const moves: SolverMove[] = [];
  for (let i = target; ex.parent.data[i]! >= 0; i = ex.parent.data[i]!) {
    const packed = ex.parentMove.data[i]!;
    moves.push({
      from: ex.meta.shelfIds[Math.floor(packed / 64)]!,
      to: ex.meta.shelfIds[packed % 64]!,
    });
  }
  return moves.reverse();
}

function statePath(ex: Exploration, target: number): number[] {
  const states: number[] = [];
  for (let i = target; i >= 0; i = ex.parent.data[i]!) states.push(i);
  return states.reverse();
}

/** Shortest solution as shelf-id moves, or null if none was found within the cap. */
export function solveLevel(
  level: LevelDefinition,
  cap = DEFAULT_ANALYSIS_CAP,
): SolverMove[] | null {
  const ex = explore(level, cap, { stopAtWin: true, recordEdges: false });
  return ex.winIndex >= 0 ? pathTo(ex, ex.winIndex) : null;
}

/** Exhaustive analysis of every state reachable from the level's start. */
export function analyzeLevel(
  level: LevelDefinition,
  cap = DEFAULT_ANALYSIS_CAP,
): LevelAnalysis {
  const ex = explore(level, cap, { stopAtWin: false, recordEdges: true });
  const n = ex.complete ? ex.encoded.length : ex.edgeOffsets.length - 1;
  const solvable = ex.winIndex >= 0;

  // Reverse adjacency over expanded states, then BFS back from the win.
  const good = new Uint8Array(ex.encoded.length);
  if (solvable) {
    const indeg = new Int32Array(ex.encoded.length + 1);
    for (let s = 0; s < n; s++) {
      for (let e = ex.edgeOffsets.data[s]!; e < ex.edgeOffsets.data[s + 1]!; e++) {
        indeg[ex.edges.data[e] + 1]++;
      }
    }
    for (let i = 1; i < indeg.length; i++) indeg[i] += indeg[i - 1];
    const revOffsets = indeg.slice();
    const rev = new Int32Array(ex.edges.length);
    const fill = indeg.slice(0, ex.encoded.length);
    for (let s = 0; s < n; s++) {
      for (let e = ex.edgeOffsets.data[s]!; e < ex.edgeOffsets.data[s + 1]!; e++) {
        const t = ex.edges.data[e]!;
        rev[fill[t]++] = s;
      }
    }
    const queue = [ex.winIndex];
    good[ex.winIndex] = 1;
    for (let q = 0; q < queue.length; q++) {
      const t = queue[q]!;
      for (let r = revOffsets[t]!; r < revOffsets[t + 1]!; r++) {
        const s = rev[r]!;
        if (!good[s]) {
          good[s] = 1;
          queue.push(s);
        }
      }
    }
  }

  let deadEndStates = 0;
  let stuckStates = 0;
  for (let s = 0; s < n; s++) {
    if (s === ex.winIndex || good[s]) continue;
    deadEndStates++;
    if (ex.edgeOffsets.data[s] === ex.edgeOffsets.data[s + 1]) stuckStates++;
  }
  const nonWin = Math.max(1, n - (solvable ? 1 : 0));

  const trapRateAt = (s: number): number => {
    const from = ex.edgeOffsets.data[s]!;
    const to = ex.edgeOffsets.data[s + 1]!;
    if (to === from) return 1;
    let bad = 0;
    for (let e = from; e < to; e++) if (!good[ex.edges.data[e]!]) bad++;
    return bad / (to - from);
  };

  let pathTrapRate = 1;
  let avgTrapRate = 1;
  if (solvable) {
    const path = statePath(ex, ex.winIndex).slice(0, -1);
    pathTrapRate =
      path.reduce((sum, s) => sum + trapRateAt(s), 0) / Math.max(1, path.length);
    let total = 0;
    let count = 0;
    for (let s = 0; s < n; s++) {
      if (s === ex.winIndex || !good[s]) continue;
      total += trapRateAt(s);
      count++;
    }
    avgTrapRate = count > 0 ? total / count : 0;
  }

  return {
    solvable,
    complete: ex.complete,
    reachableStates: ex.encoded.length,
    optimalMoves: solvable ? ex.depth.data[ex.winIndex]! : null,
    deadEndStates,
    deadEndRatio: deadEndStates / nonWin,
    stuckStates,
    startTrapRate: trapRateAt(0),
    pathTrapRate,
    avgTrapRate,
    solution: solvable ? pathTo(ex, ex.winIndex) : null,
  };
}

/**
 * Random play (uniform over meaningful moves, avoiding undoing the previous move
 * unless it is the only option).
 * Returns the share of games won within maxSteps.
 */
export function playoutSuccessRate(
  level: LevelDefinition,
  games: number,
  seed: number,
  maxSteps = 400,
): number {
  const { meta, start } = compileLevel(level);
  const rng = createRng(seed);
  let wins = 0;

  for (let g = 0; g < games; g++) {
    let shelves = start;
    let last: { from: number; to: number } | null = null;
    for (let step = 0; step < maxSteps; step++) {
      if (isCompactWon(shelves)) break;
      const meaningful = legalCompactMoves(meta, shelves).filter(
        (m) => !isNoOpMove(shelves, m),
      );
      const fresh = meaningful.filter(
        (m) => !(last && m.from === last.to && m.to === last.from),
      );
      const options = fresh.length > 0 ? fresh : meaningful;
      if (options.length === 0) break;
      const move = options[randomInt(rng, options.length)]!;
      shelves = applyCompactMove(meta, shelves, move);
      last = move;
    }
    if (isCompactWon(shelves)) wins++;
  }
  return wins / games;
}
