/**
 * Level lab analyzer.
 *
 *   npm run levels:analyze
 *     Exact solver metrics and difficulty score for every level in LEVELS.
 *
 *   npm run levels:analyze -- --sample <types> <emptyShelves> <deals> [maxStartRun]
 *     Deals random levels of that size and summarises how they play, to calibrate
 *     the generator's difficulty bands.
 */
import type { ClothingId } from "../src/game/clothing";
import { analyzeLevel } from "../src/game/solver";
import { LEVELS } from "../src/levels/levelData";
import { measureLevel } from "../src/levels/lab/difficulty";
import {
  attemptSeed,
  dealLevel,
  passesStartFilters,
  type LevelSpec,
} from "../src/levels/lab/generator";

function analyzeAll(): void {
  const rows = LEVELS.map((level) => {
    const t0 = performance.now();
    const m = measureLevel(level);
    const a = m.analysis;
    return {
      level: level.name,
      types: m.typeCount,
      shelves: level.shelves.length,
      empty: m.emptyShelves,
      solvable: a.solvable,
      complete: a.complete,
      states: a.reachableStates,
      optimal: a.optimalMoves,
      deadEnd: a.deadEndRatio.toFixed(3),
      startTrap: a.startTrapRate.toFixed(2),
      avgTrap: a.avgTrapRate.toFixed(3),
      randomWin: m.randomWinRate.toFixed(3),
      score: m.score.toFixed(1),
      ms: Math.round(performance.now() - t0),
    };
  });
  console.table(rows);
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return NaN;
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]!;
}

function sample(types: number, empty: number, deals: number, maxStartRun: number): void {
  const spec: LevelSpec = {
    number: 0,
    types: Array.from({ length: types }, (_, i) => `t${i}` as ClothingId),
    emptyShelves: empty,
    capacity: 4,
    maxStartRun,
    scoreBand: [0, Infinity],
    seed: 777,
    attempts: deals,
  };

  let filtered = 0;
  let unsolvable = 0;
  let capped = 0;
  const states: number[] = [];
  const scores: number[] = [];
  const optimal: number[] = [];
  const deadEnd: number[] = [];
  const pathTrap: number[] = [];
  const randomWin: number[] = [];
  const ms: number[] = [];

  for (let i = 0; i < deals; i++) {
    const level = dealLevel(spec, attemptSeed(spec.seed, i));
    if (!passesStartFilters(level, spec)) {
      filtered++;
      continue;
    }
    const t0 = performance.now();
    const a = analyzeLevel(level);
    ms.push(performance.now() - t0);
    states.push(a.reachableStates);
    if (!a.complete) {
      capped++;
      continue;
    }
    if (!a.solvable) {
      unsolvable++;
      continue;
    }
    const m = measureLevel(level, a);
    scores.push(m.score);
    optimal.push(a.optimalMoves!);
    deadEnd.push(a.deadEndRatio);
    pathTrap.push(a.avgTrapRate);
    randomWin.push(m.randomWinRate);
  }

  for (const arr of [states, scores, optimal, deadEnd, pathTrap, randomWin, ms]) {
    arr.sort((x, y) => x - y);
  }
  const summary = (arr: number[], digits = 1) =>
    `min ${arr[0]?.toFixed(digits)}  p25 ${quantile(arr, 0.25).toFixed(digits)}  ` +
    `median ${quantile(arr, 0.5).toFixed(digits)}  p75 ${quantile(arr, 0.75).toFixed(digits)}  ` +
    `max ${arr[arr.length - 1]?.toFixed(digits)}`;

  console.log(
    `\n${types} types, ${empty} empty shelves, ${deals} deals (max start run ${maxStartRun})`,
  );
  console.log(
    `  filtered ${filtered}, unsolvable ${unsolvable}, capped ${capped}, solvable ${scores.length}`,
  );
  console.log(`  states   ${summary(states, 0)}`);
  console.log(`  ms       ${summary(ms, 0)}`);
  console.log(`  optimal  ${summary(optimal, 0)}`);
  console.log(`  deadEnd  ${summary(deadEnd, 3)}`);
  console.log(`  avgTrap  ${summary(pathTrap, 3)}`);
  console.log(`  randWin  ${summary(randomWin, 3)}`);
  console.log(`  score    ${summary(scores, 1)}`);
}

const args = process.argv.slice(2);
if (args[0] === "--sample") {
  sample(
    Number(args[1] ?? 5),
    Number(args[2] ?? 2),
    Number(args[3] ?? 30),
    Number(args[4] ?? 3),
  );
} else {
  analyzeAll();
}
