import {
  analyzeLevel,
  playoutSuccessRate,
  type LevelAnalysis,
} from "../../game/solver";
import type { LevelDefinition } from "../levelTypes";

export interface LevelMeasurement {
  analysis: LevelAnalysis;
  randomWinRate: number;
  typeCount: number;
  emptyShelves: number;
  score: number;
}

const PLAYOUT_GAMES = 400;
const PLAYOUT_SEED = 1234;

/**
 * One number for "how hard does this feel". Weights:
 * - optimal solution length: more steps to plan
 * - average trap rate: how often a single slip makes the level unwinnable
 * - dead-end ratio: how much of the board's state space is a lost cause
 * - random win rate: how forgiving the level is to unplanned play
 */
export function difficultyScore(
  analysis: LevelAnalysis,
  randomWinRate: number,
): number {
  const optimal = analysis.optimalMoves ?? 0;
  return (
    optimal * 1.0 +
    analysis.avgTrapRate * 40 +
    analysis.deadEndRatio * 15 +
    (1 - randomWinRate) * 20
  );
}

/** Same weights as difficultyScore but skips random playouts (for fast level search). */
export function measureLevelFast(
  level: LevelDefinition,
  analysis: LevelAnalysis,
): LevelMeasurement {
  const types = new Set(level.shelves.flatMap((s) => s.items));
  const randomWinRate = 0;
  return {
    analysis,
    randomWinRate,
    typeCount: types.size,
    emptyShelves: level.shelves.filter((s) => s.items.length === 0).length,
    score:
      (analysis.optimalMoves ?? 0) * 1.0 +
      analysis.avgTrapRate * 40 +
      analysis.deadEndRatio * 15,
  };
}

export function measureLevel(
  level: LevelDefinition,
  analysis: LevelAnalysis = analyzeLevel(level),
  playoutGames: number = PLAYOUT_GAMES,
): LevelMeasurement {
  const randomWinRate =
    playoutGames > 0
      ? playoutSuccessRate(level, playoutGames, PLAYOUT_SEED)
      : 0;
  const types = new Set(level.shelves.flatMap((s) => s.items));
  return {
    analysis,
    randomWinRate,
    typeCount: types.size,
    emptyShelves: level.shelves.filter((s) => s.items.length === 0).length,
    score:
      playoutGames > 0
        ? difficultyScore(analysis, randomWinRate)
        : measureLevelFast(level, analysis).score,
  };
}
