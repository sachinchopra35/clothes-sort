import type { ClothingId } from "../../game/clothing";
import { analyzeLevel, DEFAULT_ANALYSIS_CAP } from "../../game/solver";
import type { LevelDefinition, ShelfDefinition, ShelfSide } from "../levelTypes";
import { measureLevel, measureLevelFast, type LevelMeasurement } from "./difficulty";
import { createRng, shuffleInPlace } from "./rng";

export interface LevelSpec {
  /** 1-based level number; drives id `level-N` and name `Level N`. */
  number: number;
  types: ClothingId[];
  emptyShelves: number;
  capacity: number;
  /** Longest same-type run allowed on a shelf at the start. */
  maxStartRun: number;
  /** Accept only candidates whose difficulty score falls in [min, max]. */
  scoreBand: [number, number];
  seed: number;
  attempts: number;
  analysisCap?: number;
  /** When true, skip random playouts while searching (full measure after pick in the script). */
  fastScore?: boolean;
  /**
   * nearestTarget — closest to the band midpoint (default).
   * lowestAbovePrevious — smallest score in band that is still above minScoreToBeat.
   */
  pickStrategy?: "nearestTarget" | "lowestAbovePrevious";
  /** Used with lowestAbovePrevious (set by the generate script between levels). */
  minScoreToBeat?: number;
}

export interface GeneratedCandidate {
  level: LevelDefinition;
  measurement: LevelMeasurement;
  seed: number;
}

export interface GenerationReport {
  chosen: GeneratedCandidate | null;
  /** Solvable, fully explored candidates (in or out of band). */
  valid: GeneratedCandidate[];
  rejected: { filtered: number; unsolvable: number; capped: number };
}

/** Deterministic per-attempt seed derived from the spec seed. */
export function attemptSeed(specSeed: number, attempt: number): number {
  return (Math.imul(specSeed ^ 0x9e3779b9, 0x85ebca6b) + attempt * 0x27d4eb2f) >>> 0;
}

function longestRun(items: string[]): number {
  let best = 0;
  let run = 0;
  for (let i = 0; i < items.length; i++) {
    run = i > 0 && items[i] === items[i - 1] ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

function shelfIdsAndSides(total: number): { id: string; side: ShelfSide }[] {
  const out: { id: string; side: ShelfSide }[] = [];
  let left = 0;
  let right = 0;
  for (let i = 0; i < total; i++) {
    if (i % 2 === 0) out.push({ id: `l${++left}`, side: "left" });
    else out.push({ id: `r${++right}`, side: "right" });
  }
  return out;
}

/**
 * Deals every type `capacity` times across full shelves, then appends empty shelves.
 * Shelves alternate left/right in reading order (l1, r1, l2, r2, ...), so the empty
 * shelves land at the bottom of the board, like the Bird Sort levels.
 */
export function dealLevel(spec: LevelSpec, seed: number): LevelDefinition {
  const rng = createRng(seed);
  const pool: ClothingId[] = [];
  for (const type of spec.types) {
    for (let i = 0; i < spec.capacity; i++) pool.push(type);
  }
  shuffleInPlace(rng, pool);

  const filled = spec.types.length;
  const slots = shelfIdsAndSides(filled + spec.emptyShelves);
  const shelves: ShelfDefinition[] = slots.map((slot, i) => ({
    id: slot.id,
    side: slot.side,
    capacity: spec.capacity,
    items: i < filled ? pool.slice(i * spec.capacity, (i + 1) * spec.capacity) : [],
  }));

  return {
    id: `level-${spec.number}`,
    name: `Level ${spec.number}`,
    shelves,
  };
}

export function passesStartFilters(level: LevelDefinition, spec: LevelSpec): boolean {
  return level.shelves.every((shelf) => {
    if (shelf.items.length === 0) return true;
    return longestRun(shelf.items) <= spec.maxStartRun && longestRun(shelf.items) < shelf.capacity;
  });
}

export function generateLevel(spec: LevelSpec): GenerationReport {
  const cap = spec.analysisCap ?? DEFAULT_ANALYSIS_CAP;
  const valid: GeneratedCandidate[] = [];
  const rejected = { filtered: 0, unsolvable: 0, capped: 0 };

  for (let attempt = 0; attempt < spec.attempts; attempt++) {
    const seed = attemptSeed(spec.seed, attempt);
    const level = dealLevel(spec, seed);
    if (!passesStartFilters(level, spec)) {
      rejected.filtered++;
      continue;
    }
    const analysis = analyzeLevel(level, cap);
    if (!analysis.complete) {
      rejected.capped++;
      continue;
    }
    if (!analysis.solvable) {
      rejected.unsolvable++;
      continue;
    }
    valid.push({
      level,
      measurement: spec.fastScore
        ? measureLevelFast(level, analysis)
        : measureLevel(level, analysis),
      seed,
    });
  }

  const [min, max] = spec.scoreBand;
  const inBand = valid.filter(
    (c) => c.measurement.score >= min && c.measurement.score <= max,
  );

  let chosen: GeneratedCandidate | null = null;
  if (spec.pickStrategy === "lowestAbovePrevious") {
    const floor = spec.minScoreToBeat ?? -Infinity;
    const eligible = inBand
      .filter((c) => c.measurement.score > floor)
      .sort((a, b) => a.measurement.score - b.measurement.score || a.seed - b.seed);
    chosen = eligible[0] ?? null;
  } else {
    const target = (min + max) / 2;
    inBand.sort(
      (a, b) =>
        Math.abs(a.measurement.score - target) - Math.abs(b.measurement.score - target) ||
        a.seed - b.seed,
    );
    chosen = inBand[0] ?? null;
  }

  return { chosen, valid, rejected };
}
