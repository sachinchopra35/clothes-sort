/**
 * Writes src/levels/generatedLevels.ts from the spec table below.
 *
 *   npm run levels:generate              — levels 4–10 only (default; does not touch 11+)
 *   npm run levels:generate:more         — append levels 11–20, keeping 4–10 as-is
 *   npm run levels:generate -- --all    — full rewrite 4–20 (slow; rarely needed)
 */
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ClothingId } from "../src/game/clothing";
import { measureLevel, measureLevelFast } from "../src/levels/lab/difficulty";
import { generateLevel, type LevelSpec } from "../src/levels/lab/generator";
import { GENERATED_LEVELS } from "../src/levels/generatedLevels";
import type { LevelDefinition } from "../src/levels/levelTypes";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../src/levels/generatedLevels.ts");

const BASE: ClothingId[] = [
  "white-tee",
  "brown-leather-jacket",
  "light-blue-jeans",
  "black-bootcut-jeans",
  "red-polka-dress",
];
const WITH_SHORTS: ClothingId[] = [...BASE, "yellow-shorts"];
const WITH_SOCKS: ClothingId[] = [...WITH_SHORTS, "purple-socks"];
const WITH_SCARF: ClothingId[] = [...WITH_SOCKS, "orange-scarf"];

const SPECS_4_10: LevelSpec[] = [
  { number: 4, types: BASE, emptyShelves: 2, capacity: 4, maxStartRun: 3, scoreBand: [12, 14], seed: 4, attempts: 200 },
  { number: 5, types: BASE, emptyShelves: 2, capacity: 4, maxStartRun: 3, scoreBand: [16, 19], seed: 5, attempts: 200 },
  { number: 6, types: WITH_SHORTS, emptyShelves: 2, capacity: 4, maxStartRun: 3, scoreBand: [21, 24], seed: 6, attempts: 200 },
  { number: 7, types: WITH_SHORTS, emptyShelves: 2, capacity: 4, maxStartRun: 2, scoreBand: [26, 29], seed: 7, attempts: 300 },
  { number: 8, types: WITH_SOCKS, emptyShelves: 2, capacity: 4, maxStartRun: 2, scoreBand: [31, 34], seed: 8, attempts: 300 },
  { number: 9, types: WITH_SOCKS, emptyShelves: 2, capacity: 4, maxStartRun: 2, scoreBand: [36, 39], seed: 9, attempts: 400 },
  { number: 10, types: WITH_SCARF, emptyShelves: 2, capacity: 4, maxStartRun: 2, scoreBand: [41, 45], seed: 10, attempts: 300 },
];

const SPECS_11_20: LevelSpec[] = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((n) => ({
  number: n,
  types: WITH_SCARF,
  emptyShelves: 2,
  capacity: 4,
  maxStartRun: 2,
  scoreBand: [0, 80] as [number, number],
  seed: n,
  attempts: 250,
  pickStrategy: "lowestAbovePrevious" as const,
  fastScore: true,
}));

type Mode = "4-10" | "11-20" | "all";

function parseMode(): Mode {
  const args = process.argv.slice(2);
  if (args.includes("--all")) return "all";
  if (args.includes("--more") || args.includes("--from=11")) return "11-20";
  return "4-10";
}

function formatLevel(level: LevelDefinition, header: string): string {
  const shelves = level.shelves
    .map(
      (s) =>
        `      { id: ${JSON.stringify(s.id)}, side: ${JSON.stringify(s.side)}, capacity: ${s.capacity}, items: ${JSON.stringify(s.items)} },`,
    )
    .join("\n");
  const solution = (level.solution ?? [])
    .map((m) => `{ from: ${JSON.stringify(m.from)}, to: ${JSON.stringify(m.to)} }`)
    .join(", ");
  return [
    `  // ${header}`,
    "  {",
    `    id: ${JSON.stringify(level.id)},`,
    `    name: ${JSON.stringify(level.name)},`,
    "    shelves: [",
    shelves,
    "    ],",
    `    solution: [${solution}],`,
    "  },",
  ].join("\n");
}

function levelNumber(id: string): number {
  return Number.parseInt(id.replace("level-", ""), 10);
}

async function runSpecs(
  specs: LevelSpec[],
  floors: { full: number; fast: number },
): Promise<{ blocks: string[]; levels: LevelDefinition[] }> {
  const blocks: string[] = [];
  const levels: LevelDefinition[] = [];
  let floorFull = floors.full;
  let floorFast = floors.fast;

  for (const spec of specs) {
    const t0 = performance.now();
    const beat = spec.fastScore ? floorFast : floorFull;
    const report = generateLevel({ ...spec, minScoreToBeat: beat });
    const secs = ((performance.now() - t0) / 1000).toFixed(1);
    const { filtered, unsolvable, capped } = report.rejected;

    let level: LevelDefinition;
    let seed: number;
    let m: ReturnType<typeof measureLevel>;

    if (spec.fastScore && spec.pickStrategy === "lowestAbovePrevious") {
      const eligible = report.valid
        .filter((c) => c.measurement.score > floorFast)
        .sort((a, b) => a.measurement.score - b.measurement.score || a.seed - b.seed);
      let picked: (typeof eligible)[number] | null = null;
      for (const c of eligible) {
        const full = measureLevel(c.level, c.measurement.analysis);
        if (full.score > floorFull) {
          m = full;
          picked = c;
          break;
        }
      }
      if (!picked) {
        const scores = eligible.map((c) => c.measurement.score);
        throw new Error(
          `Level ${spec.number}: no full-score step up (fast floor ${floorFast.toFixed(1)}, ` +
            `full floor ${floorFull.toFixed(1)}, valid ${report.valid.length}, ` +
            `fast-eligible ${eligible.length})`,
        );
      }
      level = picked.level;
      seed = picked.seed;
    } else {
      if (!report.chosen) {
        const scores = report.valid.map((c) => c.measurement.score).sort((a, b) => a - b);
        throw new Error(
          `Level ${spec.number}: no candidate (need score > ${beat.toFixed(1)}, ` +
            `valid ${report.valid.length}, range ${scores[0]?.toFixed(1)}-${scores.at(-1)?.toFixed(1)})`,
        );
      }
      level = report.chosen.level;
      seed = report.chosen.seed;
      m = measureLevel(level, report.chosen.measurement.analysis);
      if (m.score <= floorFull) {
        throw new Error(
          `Level ${spec.number}: full score ${m.score.toFixed(1)} is not above ${floorFull.toFixed(1)}`,
        );
      }
    }

    const a = m.analysis;
    level.solution = a.solution!;
    floorFull = m.score;
    floorFast = measureLevelFast(level, a).score;

    const header =
      `Level ${spec.number}: ${m.typeCount} types, ${level.shelves.length} shelves, seed ${seed}. ` +
      `Optimal ${a.optimalMoves} moves, ${a.reachableStates} states, dead-end ${a.deadEndRatio.toFixed(3)}, ` +
      `avg trap ${a.avgTrapRate.toFixed(3)}, random win ${m.randomWinRate.toFixed(2)}, score ${m.score.toFixed(1)}.`;
    blocks.push(formatLevel(level, header));
    levels.push(level);

    console.log(
      `Level ${spec.number}: score ${m.score.toFixed(1)}, optimal ${a.optimalMoves}, ` +
        `random win ${m.randomWinRate.toFixed(2)}, valid ${report.valid.length}/${spec.attempts}, ` +
        `rejected filtered ${filtered} / unsolvable ${unsolvable} / capped ${capped}, ${secs}s`,
    );
  }

  return { blocks, levels };
}

const mode = parseMode();

let prefixBlocks: string[] = [];
let prefixLevels: LevelDefinition[] = [];
let floors = { full: -Infinity, fast: -Infinity };

if (mode === "11-20") {
  const keep = GENERATED_LEVELS.filter((l) => levelNumber(l.id) <= 10);
  if (keep.length < 7) {
    throw new Error("Need levels 4–10 in generatedLevels.ts before running --more");
  }
  prefixLevels = keep;
  const last = keep[keep.length - 1]!;
  const a = measureLevel(last).analysis;
  floors = {
    full: measureLevel(last).score,
    fast: measureLevelFast(last, a).score,
  };
  console.log(
    `Keeping levels 4–10; continuing from level 10 scores full ${floors.full.toFixed(1)} / fast ${floors.fast.toFixed(1)}`,
  );
}

if (mode === "4-10") {
  console.log("Generating levels 4–10 only (use npm run levels:generate:more for 11–20)");
}

if (mode === "all") {
  console.log("Full regenerate 4–20 (slow)");
}

const specs =
  mode === "4-10"
    ? SPECS_4_10
    : mode === "11-20"
      ? SPECS_11_20
      : [...SPECS_4_10, ...SPECS_11_20];

const { blocks, levels } = await runSpecs(specs, floors);
const allLevels = [...prefixLevels, ...levels];

if (mode === "11-20") {
  prefixBlocks = prefixLevels.map((level) => {
    const n = levelNumber(level.id);
    const m = measureLevel(level);
    const a = m.analysis;
    const header =
      `Level ${n}: ${m.typeCount} types, ${level.shelves.length} shelves (kept). ` +
      `Optimal ${a.optimalMoves} moves, score ${m.score.toFixed(1)}.`;
    return formatLevel(level, header);
  });
}

const file = `// Generated by scripts/levels-generate.ts. Do not edit by hand: change the spec table and re-run
// \`npm run levels:generate\` (4-10) or \`npm run levels:generate:more\` (11-20). Every level was exhaustively searched.
import type { LevelDefinition } from "./levelTypes";

export const GENERATED_LEVELS: LevelDefinition[] = [
${[...prefixBlocks, ...blocks].join("\n")}
];
`;

await writeFile(OUT, file, "utf8");
console.log(`Wrote ${allLevels.length} levels to ${OUT}`);
