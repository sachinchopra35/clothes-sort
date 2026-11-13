import type { LevelDefinition } from "../levels/levelTypes";
import {
  applyMove,
  createBoard,
  getMovableGroup,
  isWon,
  stateKey,
  type BoardState,
} from "./boardState";

export interface SolverMove {
  from: string;
  to: string;
}

function legalMoves(state: BoardState): SolverMove[] {
  const moves: SolverMove[] = [];
  const active = state.shelves.filter((s) => !s.cleared);
  for (const from of active) {
    if (!getMovableGroup(from)) continue;
    for (const to of active) {
      if (from.id === to.id) continue;
      const result = applyMove(state, from.id, to.id);
      if (result) moves.push({ from: from.id, to: to.id });
    }
  }
  return moves;
}

const MAX_STATES = 80_000;

export function solveLevel(level: LevelDefinition): SolverMove[] | null {
  const start = createBoard(level);
  if (isWon(start)) return [];

  const queue: { state: BoardState; path: SolverMove[] }[] = [
    { state: start, path: [] },
  ];
  const seen = new Set<string>([stateKey(start)]);
  let head = 0;

  while (head < queue.length && seen.size < MAX_STATES) {
    const { state, path } = queue[head++]!;
    if (isWon(state)) return path;

    for (const move of legalMoves(state)) {
      const result = applyMove(state, move.from, move.to);
      if (!result) continue;
      const key = stateKey(result.state);
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ state: result.state, path: [...path, move] });
    }
  }

  return null;
}
