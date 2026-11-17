/**
 * Writes src/levels/generatedLevels.ts from the spec table below.
 *
 *   npm run levels:generate              — levels 4–10 only (default; does not touch 11+)
 *   npm run levels:generate:more         — append levels 11–20, keeping 4–10 as-is
 *   npm run levels:generate:21           — append levels 21–22 (capacity 5), never rewrites 4–20
 *   npm run levels:generate:23           — append levels 23–40, never rewrites earlier levels
 *   npm run levels:generate:41           — append levels 41–60
 *   npm run levels:generate:61           — append levels 61–80
 *   npm run levels:generate:81           — append levels 81–85 (then :86, :91, :96 for 86–100)
 *   npm run levels:generate -- --all    — full rewrite 4–20 (slow; rarely needed)
 */
import { readFile, writeFile } from "node:fs/promises";
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

const SPEC_21_22_BASE = {
  emptyShelves: 2,
  capacity: 5,
  maxStartRun: 2,
  scoreBand: [46, 52] as [number, number],
  attempts: 150,
  pickStrategy: "nearestTarget" as const,
};

const SPECS_21_22: LevelSpec[] = [
  {
    ...SPEC_21_22_BASE,
    number: 21,
    seed: 21,
    types: [
      "light-blue-jeans",
      "red-jeans",
      "green-tee",
      "orange-dress",
      "green-scarf",
      "pink-gloves",
      "blue-cap",
      "yellow-sun-hat",
    ],
  },
  {
    ...SPEC_21_22_BASE,
    number: 22,
    seed: 22,
    types: [
      "white-tee",
      "purple-tee",
      "teal-kimono",
      "coral-swimsuit",
      "black-boots",
      "red-trainers",
      "blue-cap",
      "orange-dress",
    ],
  },
];

const SPEC_VARIETY_BASE = {
  emptyShelves: 2,
  capacity: 5,
  maxStartRun: 2,
  scoreBand: [44, 58] as [number, number],
  attempts: 180,
  pickStrategy: "nearestTarget" as const,
};

const SPECS_23_40: LevelSpec[] = [
  {
    ...SPEC_VARIETY_BASE,
    number: 23,
    seed: 23,
    types: [
      "red-tee",
      "white-tee",
      "green-tee",
      "yellow-shorts",
      "purple-socks",
      "pink-gloves",
      "light-blue-jeans",
      "orange-scarf",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 24,
    seed: 24,
    types: [
      "light-blue-jeans",
      "black-bootcut-jeans",
      "red-jeans",
      "brown-leather-jacket",
      "white-tee",
      "red-polka-dress",
      "yellow-shorts",
      "purple-socks",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 25,
    seed: 25,
    attempts: 220,
    scoreBand: [18, 36] as [number, number],
    types: ["white-tee", "green-tee", "purple-tee", "blue-tee", "red-tee"],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 26,
    seed: 26,
    types: [
      "black-boots",
      "red-trainers",
      "coral-swimsuit",
      "teal-kimono",
      "blue-cap",
      "orange-dress",
      "purple-tee",
      "green-scarf",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 27,
    seed: 27,
    types: [
      "orange-scarf",
      "green-scarf",
      "brown-leather-jacket",
      "black-bootcut-jeans",
      "red-tee",
      "blue-tee",
      "yellow-sun-hat",
      "yellow-shorts",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 28,
    seed: 28,
    attempts: 220,
    scoreBand: [30, 50] as [number, number],
    types: ["red-polka-dress", "orange-dress", "pink-gloves", "blue-cap", "green-tee", "red-jeans"],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 29,
    seed: 29,
    types: [
      "blue-cap",
      "yellow-sun-hat",
      "pink-gloves",
      "green-scarf",
      "red-jeans",
      "green-tee",
      "purple-socks",
      "coral-swimsuit",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 30,
    seed: 30,
    types: [
      "teal-kimono",
      "coral-swimsuit",
      "white-tee",
      "purple-tee",
      "black-boots",
      "red-trainers",
      "orange-scarf",
      "light-blue-jeans",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 31,
    seed: 31,
    types: [
      "purple-socks",
      "yellow-shorts",
      "blue-tee",
      "red-tee",
      "pink-gloves",
      "orange-dress",
      "black-bootcut-jeans",
      "blue-cap",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 32,
    seed: 32,
    attempts: 220,
    scoreBand: [30, 50] as [number, number],
    types: [
      "light-blue-jeans",
      "black-bootcut-jeans",
      "red-jeans",
      "white-tee",
      "blue-tee",
      "green-tee",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 33,
    seed: 33,
    types: [
      "pink-gloves",
      "red-trainers",
      "blue-cap",
      "green-tee",
      "orange-dress",
      "light-blue-jeans",
      "green-scarf",
      "brown-leather-jacket",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 34,
    seed: 34,
    attempts: 220,
    scoreBand: [28, 48] as [number, number],
    types: [
      "white-tee",
      "green-tee",
      "purple-tee",
      "blue-tee",
      "red-polka-dress",
      "orange-dress",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 35,
    seed: 35,
    types: [
      "white-tee",
      "brown-leather-jacket",
      "light-blue-jeans",
      "black-bootcut-jeans",
      "red-polka-dress",
      "yellow-shorts",
      "purple-socks",
      "orange-scarf",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 36,
    seed: 36,
    types: [
      "red-tee",
      "red-jeans",
      "teal-kimono",
      "coral-swimsuit",
      "yellow-sun-hat",
      "black-boots",
      "pink-gloves",
      "green-scarf",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 37,
    seed: 37,
    attempts: 220,
    scoreBand: [30, 50] as [number, number],
    types: ["red-trainers", "black-boots", "purple-tee", "blue-tee", "red-tee", "orange-scarf"],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 38,
    seed: 38,
    types: [
      "purple-tee",
      "blue-tee",
      "green-tee",
      "white-tee",
      "red-trainers",
      "black-boots",
      "teal-kimono",
      "yellow-sun-hat",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 39,
    seed: 39,
    types: [
      "red-tee",
      "orange-dress",
      "teal-kimono",
      "yellow-sun-hat",
      "pink-gloves",
      "red-jeans",
      "yellow-shorts",
      "orange-scarf",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 40,
    seed: 40,
    types: [
      "blue-tee",
      "red-tee",
      "coral-swimsuit",
      "blue-cap",
      "black-boots",
      "green-scarf",
      "brown-leather-jacket",
      "purple-socks",
    ],
  },
];

const BAND_LIGHT: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 220,
  scoreBand: [18, 36] as [number, number],
};
const BAND_COZY: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 220,
  scoreBand: [28, 48] as [number, number],
};
const BAND_MED: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 220,
  scoreBand: [30, 52] as [number, number],
};

/** Themed variety for levels 41–60 (capacity 5, flat difficulty). */
const SPECS_41_60: LevelSpec[] = [
  {
    ...SPEC_VARIETY_BASE,
    number: 41,
    seed: 41,
    ...BAND_MED,
    types: [
      "red-trainers",
      "black-boots",
      "yellow-shorts",
      "purple-socks",
      "white-tee",
      "green-tee",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 42,
    seed: 42,
    ...BAND_MED,
    types: [
      "coral-swimsuit",
      "teal-kimono",
      "yellow-sun-hat",
      "orange-scarf",
      "green-scarf",
      "light-blue-jeans",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 43,
    seed: 43,
    ...BAND_LIGHT,
    types: ["white-tee", "green-tee", "purple-tee", "blue-tee", "red-tee"],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 44,
    seed: 44,
    ...BAND_COZY,
    types: [
      "light-blue-jeans",
      "black-bootcut-jeans",
      "red-jeans",
      "blue-tee",
      "white-tee",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 45,
    seed: 45,
    ...BAND_MED,
    types: [
      "brown-leather-jacket",
      "red-polka-dress",
      "black-boots",
      "green-scarf",
      "white-tee",
      "orange-scarf",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 46,
    seed: 46,
    ...BAND_COZY,
    types: ["red-polka-dress", "orange-dress", "teal-kimono", "coral-swimsuit", "pink-gloves"],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 47,
    seed: 47,
    ...BAND_MED,
    types: [
      "blue-cap",
      "yellow-sun-hat",
      "pink-gloves",
      "orange-scarf",
      "purple-socks",
      "green-tee",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 48,
    seed: 48,
    ...BAND_COZY,
    types: ["yellow-shorts", "purple-socks", "coral-swimsuit", "red-tee", "blue-cap", "orange-scarf"],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 49,
    seed: 49,
    ...BAND_MED,
    types: [
      "red-trainers",
      "black-boots",
      "blue-cap",
      "red-tee",
      "black-bootcut-jeans",
      "purple-socks",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 50,
    seed: 50,
    types: [
      "teal-kimono",
      "coral-swimsuit",
      "green-scarf",
      "orange-dress",
      "purple-tee",
      "pink-gloves",
      "yellow-sun-hat",
      "red-polka-dress",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 51,
    seed: 51,
    types: [
      "white-tee",
      "brown-leather-jacket",
      "light-blue-jeans",
      "red-polka-dress",
      "yellow-shorts",
      "orange-scarf",
      "purple-socks",
      "black-bootcut-jeans",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 52,
    seed: 52,
    ...BAND_COZY,
    types: ["orange-scarf", "green-scarf", "green-tee", "blue-tee", "purple-tee", "red-tee"],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 53,
    seed: 53,
    ...BAND_MED,
    types: [
      "pink-gloves",
      "yellow-sun-hat",
      "teal-kimono",
      "light-blue-jeans",
      "white-tee",
      "orange-dress",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 54,
    seed: 54,
    ...BAND_LIGHT,
    types: ["blue-cap", "yellow-sun-hat", "blue-tee", "green-tee", "white-tee"],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 55,
    seed: 55,
    ...BAND_MED,
    types: [
      "red-tee",
      "red-jeans",
      "red-trainers",
      "red-polka-dress",
      "orange-dress",
      "black-bootcut-jeans",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 56,
    seed: 56,
    types: [
      "blue-tee",
      "blue-cap",
      "light-blue-jeans",
      "teal-kimono",
      "purple-socks",
      "green-scarf",
      "white-tee",
      "coral-swimsuit",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 57,
    seed: 57,
    types: [
      "brown-leather-jacket",
      "green-tee",
      "green-scarf",
      "yellow-shorts",
      "black-bootcut-jeans",
      "pink-gloves",
      "yellow-sun-hat",
      "red-jeans",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 58,
    seed: 58,
    ...BAND_COZY,
    types: ["black-boots", "red-trainers", "purple-socks", "orange-scarf", "red-tee", "blue-tee"],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 59,
    seed: 59,
    types: [
      "teal-kimono",
      "coral-swimsuit",
      "red-jeans",
      "purple-tee",
      "blue-cap",
      "yellow-shorts",
      "pink-gloves",
      "orange-scarf",
    ],
  },
  {
    ...SPEC_VARIETY_BASE,
    number: 60,
    seed: 60,
    types: [
      "red-tee",
      "teal-kimono",
      "black-boots",
      "yellow-sun-hat",
      "green-scarf",
      "red-polka-dress",
      "red-trainers",
      "blue-tee",
    ],
  },
];

const SPEC_61_80_BASE = {
  emptyShelves: 2,
  capacity: 5,
  maxStartRun: 2,
  attempts: 250,
  pickStrategy: "nearestTarget" as const,
};

/** ~one step harder than 41–60; bands vary for fun mix (not strictly progressive). */
const BAND_61_COZY: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 240,
  scoreBand: [36, 46] as [number, number],
};
const BAND_61_MED: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 260,
  scoreBand: [44, 52] as [number, number],
};
const BAND_61_FULL: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 280,
  scoreBand: [52, 58] as [number, number],
};
const BAND_61_PEAK: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 300,
  scoreBand: [54, 58] as [number, number],
};
/** Tighter scramble (maxStartRun 1); scores sit lower but play tougher. */
const BAND_61_SCRAMBLE: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 320,
  scoreBand: [32, 42] as [number, number],
};

/** Levels 61–80: themed variety, capacity 5, slightly tougher score targets. */
const SPECS_61_80: LevelSpec[] = [
  {
    ...SPEC_61_80_BASE,
    number: 61,
    seed: 61,
    ...BAND_61_MED,
    types: ["red-tee", "white-tee", "green-tee", "blue-tee", "purple-tee", "yellow-shorts"],
  },
  {
    ...SPEC_61_80_BASE,
    number: 62,
    seed: 62,
    ...BAND_61_MED,
    types: [
      "light-blue-jeans",
      "black-bootcut-jeans",
      "red-jeans",
      "brown-leather-jacket",
      "white-tee",
      "purple-socks",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 63,
    seed: 63,
    ...BAND_61_COZY,
    types: ["red-trainers", "black-boots", "purple-socks", "yellow-shorts", "blue-cap", "orange-scarf"],
  },
  {
    ...SPEC_61_80_BASE,
    number: 64,
    seed: 64,
    ...BAND_61_MED,
    types: ["red-polka-dress", "orange-dress", "teal-kimono", "pink-gloves", "black-boots", "green-scarf"],
  },
  {
    ...SPEC_61_80_BASE,
    number: 65,
    seed: 65,
    ...BAND_61_COZY,
    types: ["coral-swimsuit", "yellow-sun-hat", "yellow-shorts", "red-trainers", "blue-tee", "orange-scarf"],
  },
  {
    ...SPEC_61_80_BASE,
    number: 66,
    seed: 66,
    maxStartRun: 1,
    ...BAND_61_SCRAMBLE,
    types: [
      "brown-leather-jacket",
      "green-scarf",
      "orange-scarf",
      "pink-gloves",
      "purple-socks",
      "black-boots",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 67,
    seed: 67,
    ...BAND_61_COZY,
    types: [
      "red-tee",
      "red-jeans",
      "red-trainers",
      "red-polka-dress",
      "orange-dress",
      "black-bootcut-jeans",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 68,
    seed: 68,
    ...BAND_61_COZY,
    types: ["blue-tee", "blue-cap", "light-blue-jeans", "teal-kimono", "white-tee", "purple-socks"],
  },
  {
    ...SPEC_61_80_BASE,
    number: 69,
    seed: 69,
    ...BAND_61_MED,
    types: [
      "blue-cap",
      "yellow-sun-hat",
      "pink-gloves",
      "purple-tee",
      "green-tee",
      "orange-scarf",
      "yellow-shorts",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 70,
    seed: 70,
    maxStartRun: 1,
    ...BAND_61_SCRAMBLE,
    types: [
      "brown-leather-jacket",
      "green-scarf",
      "light-blue-jeans",
      "white-tee",
      "purple-socks",
      "orange-dress",
      "red-trainers",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 71,
    seed: 71,
    ...BAND_61_FULL,
    types: [
      "white-tee",
      "brown-leather-jacket",
      "light-blue-jeans",
      "red-polka-dress",
      "yellow-shorts",
      "orange-scarf",
      "purple-socks",
      "black-bootcut-jeans",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 72,
    seed: 72,
    ...BAND_61_FULL,
    types: [
      "teal-kimono",
      "coral-swimsuit",
      "green-scarf",
      "orange-dress",
      "purple-tee",
      "pink-gloves",
      "yellow-sun-hat",
      "red-polka-dress",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 73,
    seed: 73,
    ...BAND_61_COZY,
    types: [
      "purple-tee",
      "purple-socks",
      "red-polka-dress",
      "teal-kimono",
      "pink-gloves",
      "blue-cap",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 74,
    seed: 74,
    ...BAND_61_FULL,
    types: [
      "orange-dress",
      "orange-scarf",
      "red-tee",
      "yellow-shorts",
      "green-tee",
      "black-boots",
      "red-trainers",
      "blue-tee",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 75,
    seed: 75,
    maxStartRun: 1,
    ...BAND_61_SCRAMBLE,
    types: [
      "black-boots",
      "black-bootcut-jeans",
      "brown-leather-jacket",
      "white-tee",
      "green-scarf",
      "purple-socks",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 76,
    seed: 76,
    ...BAND_61_COZY,
    types: [
      "yellow-sun-hat",
      "yellow-shorts",
      "red-tee",
      "green-tee",
      "orange-scarf",
      "purple-socks",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 77,
    seed: 77,
    ...BAND_61_FULL,
    types: [
      "red-polka-dress",
      "teal-kimono",
      "green-scarf",
      "orange-scarf",
      "pink-gloves",
      "blue-cap",
      "light-blue-jeans",
      "red-jeans",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 78,
    seed: 78,
    ...BAND_61_FULL,
    types: [
      "red-trainers",
      "black-boots",
      "purple-socks",
      "blue-cap",
      "yellow-shorts",
      "white-tee",
      "green-tee",
      "orange-scarf",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 79,
    seed: 79,
    ...BAND_61_PEAK,
    types: [
      "brown-leather-jacket",
      "green-scarf",
      "orange-scarf",
      "pink-gloves",
      "purple-socks",
      "yellow-sun-hat",
      "teal-kimono",
      "coral-swimsuit",
    ],
  },
  {
    ...SPEC_61_80_BASE,
    number: 80,
    seed: 80,
    ...BAND_61_PEAK,
    types: [
      "red-tee",
      "teal-kimono",
      "black-boots",
      "yellow-sun-hat",
      "green-scarf",
      "red-polka-dress",
      "red-trainers",
      "blue-tee",
    ],
  },
];

const SPEC_81_100_BASE = {
  emptyShelves: 2,
  capacity: 5,
  maxStartRun: 2,
  attempts: 260,
  pickStrategy: "nearestTarget" as const,
};

/** Slight bump over 61–80 bands. */
const BAND_81_COZY: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 260,
  scoreBand: [38, 48] as [number, number],
};
const BAND_81_MED: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 280,
  scoreBand: [46, 54] as [number, number],
};
const BAND_81_FULL: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 300,
  scoreBand: [54, 60] as [number, number],
};
const BAND_81_PEAK: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 320,
  scoreBand: [56, 60] as [number, number],
};
const BAND_81_SCRAMBLE: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 340,
  scoreBand: [34, 44] as [number, number],
};
/** When a type lineup rarely hits the med band (color-themed sets). */
const BAND_81_FLEX: Pick<LevelSpec, "attempts" | "scoreBand"> = {
  attempts: 280,
  scoreBand: [40, 52] as [number, number],
};

const SPECS_81_100: LevelSpec[] = [
  {
    ...SPEC_81_100_BASE,
    number: 81,
    seed: 81,
    ...BAND_81_COZY,
    types: ["green-tee", "green-scarf", "teal-kimono", "yellow-shorts", "white-tee", "purple-socks"],
  },
  {
    ...SPEC_81_100_BASE,
    number: 82,
    seed: 82,
    ...BAND_81_COZY,
    types: ["red-trainers", "yellow-shorts", "purple-socks", "blue-cap", "white-tee", "orange-scarf"],
  },
  {
    ...SPEC_81_100_BASE,
    number: 83,
    seed: 83,
    ...BAND_81_FLEX,
    types: [
      "brown-leather-jacket",
      "black-bootcut-jeans",
      "light-blue-jeans",
      "red-jeans",
      "black-boots",
      "white-tee",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 84,
    seed: 84,
    ...BAND_81_COZY,
    types: [
      "red-polka-dress",
      "orange-dress",
      "pink-gloves",
      "purple-tee",
      "yellow-sun-hat",
      "black-boots",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 85,
    seed: 85,
    ...BAND_81_FULL,
    types: [
      "coral-swimsuit",
      "teal-kimono",
      "red-tee",
      "light-blue-jeans",
      "orange-scarf",
      "purple-socks",
      "blue-cap",
      "yellow-sun-hat",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 86,
    seed: 86,
    ...BAND_81_FLEX,
    types: ["blue-tee", "blue-cap", "light-blue-jeans", "teal-kimono", "purple-socks", "white-tee"],
  },
  {
    ...SPEC_81_100_BASE,
    number: 87,
    seed: 87,
    ...BAND_81_MED,
    types: [
      "brown-leather-jacket",
      "pink-gloves",
      "orange-scarf",
      "green-scarf",
      "yellow-sun-hat",
      "red-trainers",
      "blue-tee",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 88,
    seed: 88,
    ...BAND_81_FULL,
    types: [
      "red-trainers",
      "black-boots",
      "purple-socks",
      "blue-cap",
      "yellow-sun-hat",
      "pink-gloves",
      "orange-scarf",
      "white-tee",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 89,
    seed: 89,
    maxStartRun: 1,
    ...BAND_81_SCRAMBLE,
    types: [
      "orange-scarf",
      "green-scarf",
      "brown-leather-jacket",
      "purple-socks",
      "yellow-shorts",
      "black-boots",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 90,
    seed: 90,
    ...BAND_81_COZY,
    types: ["teal-kimono", "coral-swimsuit", "yellow-sun-hat", "yellow-shorts", "orange-scarf", "red-trainers"],
  },
  {
    ...SPEC_81_100_BASE,
    number: 91,
    seed: 91,
    ...BAND_81_FULL,
    types: [
      "white-tee",
      "red-tee",
      "green-tee",
      "blue-tee",
      "purple-tee",
      "yellow-shorts",
      "orange-scarf",
      "light-blue-jeans",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 92,
    seed: 92,
    ...BAND_81_FULL,
    types: [
      "brown-leather-jacket",
      "black-bootcut-jeans",
      "green-scarf",
      "purple-socks",
      "red-polka-dress",
      "orange-dress",
      "black-boots",
      "pink-gloves",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 93,
    seed: 93,
    ...BAND_81_FLEX,
    types: ["purple-tee", "purple-socks", "pink-gloves", "red-polka-dress", "orange-dress", "blue-cap"],
  },
  {
    ...SPEC_81_100_BASE,
    number: 94,
    seed: 94,
    ...BAND_81_FULL,
    types: [
      "yellow-sun-hat",
      "yellow-shorts",
      "orange-dress",
      "orange-scarf",
      "green-tee",
      "red-tee",
      "coral-swimsuit",
      "red-trainers",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 95,
    seed: 95,
    ...BAND_81_MED,
    types: [
      "brown-leather-jacket",
      "green-scarf",
      "orange-scarf",
      "red-jeans",
      "teal-kimono",
      "blue-cap",
      "white-tee",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 96,
    seed: 96,
    maxStartRun: 1,
    ...BAND_81_SCRAMBLE,
    types: [
      "black-bootcut-jeans",
      "black-boots",
      "brown-leather-jacket",
      "purple-socks",
      "green-tee",
      "red-trainers",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 97,
    seed: 97,
    ...BAND_81_PEAK,
    types: [
      "teal-kimono",
      "coral-swimsuit",
      "green-scarf",
      "orange-scarf",
      "red-polka-dress",
      "pink-gloves",
      "yellow-sun-hat",
      "black-boots",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 98,
    seed: 98,
    ...BAND_81_PEAK,
    types: [
      "light-blue-jeans",
      "red-jeans",
      "black-bootcut-jeans",
      "blue-tee",
      "blue-cap",
      "purple-socks",
      "orange-scarf",
      "red-trainers",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 99,
    seed: 99,
    ...BAND_81_PEAK,
    types: [
      "red-tee",
      "red-jeans",
      "red-trainers",
      "red-polka-dress",
      "teal-kimono",
      "green-scarf",
      "yellow-shorts",
      "purple-socks",
    ],
  },
  {
    ...SPEC_81_100_BASE,
    number: 100,
    seed: 100,
    ...BAND_81_PEAK,
    types: [
      "brown-leather-jacket",
      "orange-dress",
      "black-boots",
      "yellow-sun-hat",
      "green-tee",
      "purple-tee",
      "coral-swimsuit",
      "orange-scarf",
    ],
  },
];

function specsInRange(from: number, to: number): LevelSpec[] {
  return SPECS_81_100.filter((s) => s.number >= from && s.number <= to);
}

const APPEND_BATCHES: Record<number, LevelSpec[]> = {
  21: SPECS_21_22,
  23: SPECS_23_40,
  41: SPECS_41_60,
  61: SPECS_61_80,
  81: specsInRange(81, 85),
  86: specsInRange(86, 90),
  91: specsInRange(91, 95),
  96: specsInRange(96, 100),
};

type Mode = "4-10" | "11-20" | "append" | "all";

function parseAppendFrom(): number | null {
  const arg = process.argv.find((a) => /^--from=\d+$/.test(a));
  if (!arg) return null;
  const n = Number.parseInt(arg.split("=")[1]!, 10);
  return Number.isFinite(n) && APPEND_BATCHES[n] ? n : null;
}

function parseMode(): Mode {
  const args = process.argv.slice(2);
  if (parseAppendFrom() !== null) return "append";
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
  const monotonicScores = Number.isFinite(floors.full);

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
      if (monotonicScores && m.score <= floorFull) {
        throw new Error(
          `Level ${spec.number}: full score ${m.score.toFixed(1)} is not above ${floorFull.toFixed(1)}`,
        );
      }
    }

    const a = m.analysis;
    level.solution = a.solution!;
    if (monotonicScores) {
      floorFull = m.score;
      floorFast = measureLevelFast(level, a).score;
    }

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

if (mode === "append") {
  const from = parseAppendFrom()!;
  const batch = APPEND_BATCHES[from]!;
  const existing = await readFile(OUT, "utf8");
  const have = new Set(GENERATED_LEVELS.map((l) => levelNumber(l.id)));
  const todo = batch.filter((s) => !have.has(s.number));
  if (todo.length === 0) {
    console.log(`Append batch from ${from}: all levels already exist.`);
    process.exit(0);
  }
  console.log(`Appending levels ${todo.map((s) => s.number).join(", ")}; earlier levels untouched`);
  const { blocks } = await runSpecs(todo, { full: -Infinity, fast: -Infinity });
  const closeAt = existing.lastIndexOf("\n];");
  if (closeAt < 0) throw new Error("Could not find end of GENERATED_LEVELS array");
  const next = `${existing.slice(0, closeAt)}\n${blocks.join("\n")}${existing.slice(closeAt)}`;
  await writeFile(OUT, next, "utf8");
  console.log(`Appended ${blocks.length} levels to ${OUT}`);
  process.exit(0);
}

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
