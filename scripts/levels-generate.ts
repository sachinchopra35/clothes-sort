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

/** Levels 101–120: new wardrobe (psychedelic tees, coloured jackets/socks/trunks) plus pets. */
const SPEC_101_BASE = {
  emptyShelves: 2,
  capacity: 5,
  maxStartRun: 2,
  pickStrategy: "nearestTarget" as const,
};
const BAND_101_COZY: Pick<LevelSpec, "attempts" | "scoreBand"> = { attempts: 260, scoreBand: [40, 50] };
const BAND_101_MED: Pick<LevelSpec, "attempts" | "scoreBand"> = { attempts: 280, scoreBand: [47, 55] };
const BAND_101_FULL: Pick<LevelSpec, "attempts" | "scoreBand"> = { attempts: 300, scoreBand: [55, 60] };
const BAND_101_PEAK: Pick<LevelSpec, "attempts" | "scoreBand"> = { attempts: 320, scoreBand: [57, 61] };
const BAND_101_SCRAMBLE: Pick<LevelSpec, "attempts" | "scoreBand"> = { attempts: 340, scoreBand: [35, 45] };
const BAND_101_FLEX: Pick<LevelSpec, "attempts" | "scoreBand"> = { attempts: 280, scoreBand: [42, 54] };

const SPECS_101_120: LevelSpec[] = [
  { ...SPEC_101_BASE, number: 101, seed: 101, ...BAND_101_COZY,
    types: ["psychedelic-tee", "red-jacket", "green-socks", "blue-trunks", "white-tee", "light-blue-jeans"] },
  { ...SPEC_101_BASE, number: 102, seed: 102, ...BAND_101_FLEX,
    types: ["purple-jacket", "blue-jacket", "red-jacket", "yellow-jacket", "black-boots", "orange-scarf"] },
  { ...SPEC_101_BASE, number: 103, seed: 103, ...BAND_101_FULL,
    types: ["crown", "penguin", "sardine", "blue-cap", "pink-socks", "yellow-sun-hat", "green-trunks", "red-trainers"] },
  { ...SPEC_101_BASE, number: 104, seed: 104, ...BAND_101_FLEX,
    types: ["green-socks", "orange-socks", "pink-socks", "purple-socks", "red-trainers", "black-boots"] },
  { ...SPEC_101_BASE, number: 105, seed: 105, ...BAND_101_MED,
    types: ["blue-trunks", "pink-trunks", "green-trunks", "yellow-shorts", "coral-swimsuit", "yellow-sun-hat", "tropical-fish"] },
  { ...SPEC_101_BASE, number: 106, seed: 106, ...BAND_101_FLEX,
    types: ["tie-dye-tee", "purple-jacket", "orange-socks", "red-jeans", "teal-kimono", "blue-cap"] },
  { ...SPEC_101_BASE, number: 107, seed: 107, maxStartRun: 1, ...BAND_101_SCRAMBLE,
    types: ["red-jacket", "blue-jacket", "psychedelic-tee", "green-socks", "pink-trunks", "top-hat"] },
  { ...SPEC_101_BASE, number: 108, seed: 108, ...BAND_101_COZY,
    types: ["penguin", "top-hat", "crown", "sardine", "tropical-fish", "blue-cap"] },
  { ...SPEC_101_BASE, number: 109, seed: 109, ...BAND_101_FULL,
    types: ["yellow-jacket", "psychedelic-tee", "pink-socks", "blue-trunks", "orange-dress", "green-scarf", "black-boots", "red-jeans"] },
  { ...SPEC_101_BASE, number: 110, seed: 110, ...BAND_101_PEAK,
    types: ["purple-jacket", "tie-dye-tee", "green-trunks", "orange-socks", "red-trainers", "light-blue-jeans", "pink-gloves", "crown"] },
  { ...SPEC_101_BASE, number: 111, seed: 111, ...BAND_101_FLEX,
    types: ["psychedelic-tee", "red-tee", "blue-tee", "green-tee", "purple-tee", "white-tee"] },
  { ...SPEC_101_BASE, number: 112, seed: 112, ...BAND_101_MED,
    types: ["blue-jacket", "pink-trunks", "green-socks", "yellow-sun-hat", "red-polka-dress", "sardine", "black-bootcut-jeans"] },
  { ...SPEC_101_BASE, number: 113, seed: 113, ...BAND_101_FULL,
    types: ["red-jacket", "yellow-jacket", "blue-trunks", "orange-socks", "teal-kimono", "coral-swimsuit", "penguin", "white-tee"] },
  { ...SPEC_101_BASE, number: 114, seed: 114, maxStartRun: 1, ...BAND_101_SCRAMBLE,
    types: ["purple-jacket", "green-trunks", "pink-socks", "top-hat", "orange-scarf", "light-blue-jeans"] },
  { ...SPEC_101_BASE, number: 115, seed: 115, ...BAND_101_FULL,
    types: ["psychedelic-tee", "blue-jacket", "orange-socks", "pink-trunks", "crown", "green-scarf", "black-boots", "yellow-sun-hat"] },
  { ...SPEC_101_BASE, number: 116, seed: 116, ...BAND_101_FLEX,
    types: ["tropical-fish", "sardine", "blue-trunks", "coral-swimsuit", "teal-kimono", "yellow-sun-hat"] },
  { ...SPEC_101_BASE, number: 117, seed: 117, ...BAND_101_MED,
    types: ["tie-dye-tee", "red-jacket", "green-socks", "blue-cap", "orange-dress", "black-bootcut-jeans", "penguin"] },
  { ...SPEC_101_BASE, number: 118, seed: 118, ...BAND_101_PEAK,
    types: ["yellow-jacket", "purple-jacket", "pink-socks", "green-trunks", "red-trainers", "light-blue-jeans", "psychedelic-tee", "sardine"] },
  { ...SPEC_101_BASE, number: 119, seed: 119, ...BAND_101_PEAK,
    types: ["blue-jacket", "red-jacket", "orange-socks", "pink-trunks", "tie-dye-tee", "top-hat", "green-scarf", "white-tee"] },
  { ...SPEC_101_BASE, number: 120, seed: 120, ...BAND_101_PEAK,
    types: ["crown", "penguin", "sardine", "psychedelic-tee", "purple-jacket", "green-socks", "blue-trunks", "yellow-sun-hat"] },
];

/**
 * Levels 121–140: coloured caps, scarves, fish and striped tees plus new Fluent items.
 * 121 is all caps (5 per shelf); from 122 every shelf holds 6, which is what lets the
 * scores climb past the ~60 ceiling of 8 types × 5. Breathers at 128 and 134.
 */
const SPEC_121_BASE = {
  emptyShelves: 2,
  capacity: 6,
  maxStartRun: 2,
  pickStrategy: "nearestTarget" as const,
};
const band = (min: number, max: number, attempts = 200): Pick<LevelSpec, "attempts" | "scoreBand"> => ({
  attempts,
  scoreBand: [min, max],
});

const SPECS_121_140: LevelSpec[] = [
  { ...SPEC_121_BASE, number: 121, seed: 121, ...band(65, 69, 400),
    types: ["red-cap", "green-cap", "yellow-cap", "pink-cap", "purple-cap", "orange-cap", "black-cap", "white-cap"] },
  { ...SPEC_121_BASE, number: 122, seed: 122, ...band(59, 63),
    types: ["navy-stripe-tee", "red-cap", "teal-scarf", "clownfish", "high-heels", "light-blue-jeans", "orange-dress", "green-socks"] },
  { ...SPEC_121_BASE, number: 123, seed: 123, ...band(60, 64),
    types: ["bumblebee-tee", "purple-cap", "pink-scarf", "goldfish", "pink-bikini", "backpack", "blue-jacket", "black-boots"] },
  { ...SPEC_121_BASE, number: 124, seed: 124, ...band(61, 64),
    types: ["sailor-tee", "orange-cap", "yellow-scarf", "neon-fish", "sari", "hiking-boots", "red-jeans", "handbag"] },
  { ...SPEC_121_BASE, number: 125, seed: 125, ...band(61, 65),
    types: ["cherry-tee", "green-cap", "light-blue-scarf", "royal-fish", "red-sari", "navy-backpack", "flip-flops", "pink-trunks"] },
  { ...SPEC_121_BASE, number: 126, seed: 126, ...band(62, 65),
    types: ["rebel-tee", "yellow-cap", "red-scarf", "lagoon-fish", "graduation-cap", "blowfish", "coral-swimsuit", "light-blue-jeans"] },
  { ...SPEC_121_BASE, number: 127, seed: 127, ...band(62, 66),
    types: ["candy-tee", "black-cap", "teal-scarf", "trout", "high-heels", "backpack", "purple-jacket", "orange-socks"] },
  { ...SPEC_121_BASE, number: 128, seed: 128, ...band(44, 52),
    types: ["forest-tee", "pink-cap", "yellow-scarf", "salmon", "pink-gloves", "flip-flops", "teal-kimono"] },
  { ...SPEC_121_BASE, number: 129, seed: 129, ...band(63, 66),
    types: ["navy-stripe-tee", "white-cap", "pink-scarf", "clownfish", "sari", "hiking-boots", "red-jacket", "blue-trunks"] },
  { ...SPEC_121_BASE, number: 130, seed: 130, ...band(63, 67),
    types: ["bumblebee-tee", "red-cap", "light-blue-scarf", "neon-fish", "handbag", "red-sari", "crown", "black-bootcut-jeans"] },
  { ...SPEC_121_BASE, number: 131, seed: 131, ...band(64, 67, 250),
    types: ["sailor-tee", "purple-cap", "red-scarf", "goldfish", "navy-backpack", "pink-bikini", "yellow-jacket", "red-trainers"] },
  { ...SPEC_121_BASE, number: 132, seed: 132, ...band(64, 68, 250),
    types: ["cherry-tee", "orange-cap", "teal-scarf", "royal-fish", "graduation-cap", "purple-jacket", "penguin", "green-trunks"] },
  { ...SPEC_121_BASE, number: 133, seed: 133, ...band(65, 68, 250),
    types: ["rebel-tee", "green-cap", "yellow-scarf", "lagoon-fish", "blowfish", "high-heels", "sari", "light-blue-jeans"] },
  { ...SPEC_121_BASE, number: 134, seed: 134, ...band(46, 54),
    types: ["candy-tee", "yellow-cap", "pink-scarf", "trout", "backpack", "flip-flops", "orange-dress"] },
  { ...SPEC_121_BASE, number: 135, seed: 135, ...band(65, 69, 250),
    types: ["forest-tee", "black-cap", "light-blue-scarf", "salmon", "hiking-boots", "handbag", "pink-jacket", "psychedelic-tee"] },
  { ...SPEC_121_BASE, number: 136, seed: 136, ...band(60, 64),
    types: ["clownfish", "neon-fish", "royal-fish", "lagoon-fish", "goldfish", "trout", "salmon", "blowfish"] },
  { ...SPEC_121_BASE, number: 137, seed: 137, ...band(66, 69, 300),
    types: ["navy-stripe-tee", "pink-cap", "red-scarf", "neon-fish", "red-sari", "navy-backpack", "top-hat", "purple-socks"] },
  { ...SPEC_121_BASE, number: 138, seed: 138, ...band(66, 70, 300),
    types: ["sailor-tee", "white-cap", "yellow-scarf", "clownfish", "pink-bikini", "graduation-cap", "tie-dye-tee", "red-trainers"] },
  { ...SPEC_121_BASE, number: 139, seed: 139, ...band(67, 70, 300),
    types: ["bumblebee-tee", "red-cap", "teal-scarf", "royal-fish", "sari", "coral-swimsuit", "black-boots", "dark-green-jacket"] },
  { ...SPEC_121_BASE, number: 140, seed: 1400, ...band(68.8, 74, 300),
    types: ["psychedelic-tee", "purple-cap", "pink-scarf", "lagoon-fish", "high-heels", "crown", "backpack", "cherry-tee"] },
];

/** Levels 141–160: coloured Club Penguin pals, gentle climb from 140. */
const SPEC_141_BASE = SPEC_121_BASE;

const SPECS_141_160: LevelSpec[] = [
  { ...SPEC_141_BASE, number: 141, seed: 141, ...band(67, 71, 250),
    types: ["orange-penguin", "blue-penguin", "green-penguin", "red-penguin", "yellow-penguin", "pink-penguin", "teal-penguin", "purple-penguin"] },
  { ...SPEC_141_BASE, number: 142, seed: 142, ...band(65, 69, 250),
    types: ["red-penguin", "navy-stripe-tee", "teal-scarf", "clownfish", "red-sari", "navy-backpack", "purple-jacket", "light-blue-jeans"] },
  { ...SPEC_141_BASE, number: 143, seed: 143, ...band(65.5, 69.5, 250),
    types: ["green-cap", "pink-scarf", "royal-fish", "sari", "high-heels", "graduation-cap", "yellow-penguin", "orange-socks"] },
  { ...SPEC_141_BASE, number: 144, seed: 144, ...band(66, 70, 250),
    types: ["sailor-tee", "purple-cap", "red-scarf", "goldfish", "pink-bikini", "hiking-boots", "crown", "blue-penguin"] },
  { ...SPEC_141_BASE, number: 145, seed: 145, ...band(66.5, 70.5, 250),
    types: ["cherry-tee", "orange-cap", "light-blue-scarf", "neon-fish", "handbag", "flip-flops", "red-jacket", "penguin"] },
  { ...SPEC_141_BASE, number: 146, seed: 146, ...band(67, 70.5, 250),
    types: ["rebel-tee", "black-cap", "yellow-scarf", "lagoon-fish", "blowfish", "backpack", "teal-kimono", "pink-penguin"] },
  { ...SPEC_141_BASE, number: 147, seed: 147, ...band(67.2, 70.8, 250),
    types: ["candy-tee", "white-cap", "teal-scarf", "trout", "red-sari", "coral-swimsuit", "black-boots", "red-penguin"] },
  { ...SPEC_141_BASE, number: 148, seed: 148, ...band(48, 56),
    types: ["forest-tee", "yellow-cap", "pink-scarf", "salmon", "pink-gloves", "flip-flops", "green-penguin", "teal-penguin"] },
  { ...SPEC_141_BASE, number: 149, seed: 149, ...band(67.5, 71, 250),
    types: ["bumblebee-tee", "red-cap", "navy-scarf", "clownfish", "navy-backpack", "yellow-jacket", "top-hat", "purple-penguin"] },
  { ...SPEC_141_BASE, number: 150, seed: 150, ...band(68, 71.2, 250),
    types: ["psychedelic-tee", "green-cap", "purple-scarf", "royal-fish", "sari", "high-heels", "pink-trunks", "orange-penguin"] },
  { ...SPEC_141_BASE, number: 151, seed: 151, ...band(66, 69.5, 250),
    types: ["navy-stripe-tee", "pink-cap", "brown-scarf", "neon-fish", "hiking-boots", "handbag", "tie-dye-tee", "blue-penguin"] },
  { ...SPEC_141_BASE, number: 152, seed: 152, ...band(66.5, 70, 250),
    types: ["sailor-tee", "orange-cap", "red-scarf", "goldfish", "pink-bikini", "graduation-cap", "dark-green-jacket", "yellow-penguin"] },
  { ...SPEC_141_BASE, number: 153, seed: 153, ...band(67, 70.5, 250),
    types: ["cherry-tee", "purple-cap", "light-blue-scarf", "lagoon-fish", "red-sari", "backpack", "red-trainers", "green-penguin"] },
  { ...SPEC_141_BASE, number: 154, seed: 154, ...band(50, 57),
    types: ["candy-tee", "yellow-cap", "green-scarf", "trout", "flip-flops", "pink-gloves", "teal-penguin", "orange-dress"] },
  { ...SPEC_141_BASE, number: 155, seed: 155, ...band(67.5, 71, 250),
    types: ["rebel-tee", "black-cap", "pink-scarf", "blowfish", "navy-backpack", "sardine", "charcoal-jacket", "red-penguin"] },
  { ...SPEC_141_BASE, number: 156, seed: 156, ...band(68, 72, 250),
    types: ["white-tee", "red-tee", "blue-tee", "green-tee", "purple-tee", "orange-scarf", "red-cap", "penguin"] },
  { ...SPEC_141_BASE, number: 157, seed: 157, ...band(66.5, 70, 300),
    types: ["forest-tee", "white-cap", "teal-scarf", "clownfish", "sari", "high-heels", "crown", "pink-penguin"] },
  { ...SPEC_141_BASE, number: 158, seed: 158, ...band(67, 70.5, 300),
    types: ["bumblebee-tee", "red-cap", "yellow-scarf", "royal-fish", "hiking-boots", "purple-jacket", "black-bootcut-jeans", "purple-penguin"] },
  { ...SPEC_141_BASE, number: 159, seed: 159, ...band(67.5, 71, 300),
    types: ["psychedelic-tee", "green-cap", "navy-scarf", "neon-fish", "red-sari", "graduation-cap", "blue-trunks", "orange-penguin"] },
  { ...SPEC_141_BASE, number: 160, seed: 1400, ...band(68.8, 72, 400),
    types: ["psychedelic-tee", "purple-cap", "pink-scarf", "lagoon-fish", "high-heels", "crown", "backpack", "cherry-tee"] },
];

/** Levels 161–180: nostalgic early wardrobe (mostly 1–60 staples). */
const SPEC_161_BASE = SPEC_121_BASE;

const SPECS_161_180: LevelSpec[] = [
  { ...SPEC_161_BASE, number: 161, seed: 161, ...band(66, 69),
    types: ["white-tee", "brown-leather-jacket", "light-blue-jeans", "black-bootcut-jeans", "red-polka-dress", "yellow-shorts", "purple-socks", "orange-scarf"] },
  { ...SPEC_161_BASE, number: 162, seed: 162, ...band(66.2, 69.5),
    types: ["green-tee", "blue-tee", "red-jeans", "pink-gloves", "blue-cap", "green-scarf", "black-boots", "red-trainers"] },
  { ...SPEC_161_BASE, number: 163, seed: 163, ...band(66.5, 70),
    types: ["purple-tee", "brown-leather-jacket", "yellow-sun-hat", "teal-kimono", "coral-swimsuit", "purple-socks", "orange-dress", "light-blue-jeans"] },
  { ...SPEC_161_BASE, number: 164, seed: 164, ...band(67, 70.2),
    types: ["red-tee", "white-tee", "black-bootcut-jeans", "red-polka-dress", "yellow-shorts", "orange-scarf", "pink-gloves", "red-trainers"] },
  { ...SPEC_161_BASE, number: 165, seed: 165, ...band(48, 56),
    types: ["green-tee", "blue-cap", "green-scarf", "yellow-shorts", "purple-socks", "pink-gloves", "teal-kimono", "red-trainers"] },
  { ...SPEC_161_BASE, number: 166, seed: 166, ...band(67, 70.5),
    types: ["brown-leather-jacket", "light-blue-jeans", "red-tee", "purple-tee", "black-boots", "yellow-sun-hat", "coral-swimsuit", "orange-scarf"] },
  { ...SPEC_161_BASE, number: 167, seed: 167, ...band(66, 69.5),
    types: ["white-tee", "red-jeans", "red-polka-dress", "purple-socks", "green-scarf", "blue-cap", "teal-kimono", "black-bootcut-jeans"] },
  { ...SPEC_161_BASE, number: 168, seed: 168, ...band(67.5, 71),
    types: ["green-tee", "brown-leather-jacket", "yellow-shorts", "orange-scarf", "pink-gloves", "black-boots", "red-trainers", "blue-tee"] },
  { ...SPEC_161_BASE, number: 169, seed: 169, ...band(67.8, 71.2),
    types: ["purple-tee", "light-blue-jeans", "red-polka-dress", "yellow-sun-hat", "purple-socks", "green-scarf", "coral-swimsuit", "white-tee"] },
  { ...SPEC_161_BASE, number: 170, seed: 170, ...band(68, 71.5),
    types: ["red-tee", "brown-leather-jacket", "black-bootcut-jeans", "orange-scarf", "blue-cap", "pink-gloves", "teal-kimono", "red-trainers"] },
  { ...SPEC_161_BASE, number: 171, seed: 171, ...band(66, 69.5, 250),
    types: ["white-tee", "red-jeans", "yellow-shorts", "green-scarf", "black-boots", "purple-socks", "yellow-sun-hat", "green-tee"] },
  { ...SPEC_161_BASE, number: 172, seed: 172, ...band(68.2, 71.2, 250),
    types: ["blue-tee", "brown-leather-jacket", "light-blue-jeans", "red-polka-dress", "orange-scarf", "pink-gloves", "coral-swimsuit", "red-trainers"] },
  { ...SPEC_161_BASE, number: 173, seed: 173, ...band(66, 69.8, 250),
    types: ["purple-tee", "black-bootcut-jeans", "orange-dress", "purple-socks", "blue-cap", "green-scarf", "teal-kimono", "black-boots"] },
  { ...SPEC_161_BASE, number: 174, seed: 174, ...band(66, 69.8, 250),
    types: ["red-tee", "brown-leather-jacket", "yellow-shorts", "orange-scarf", "pink-gloves", "red-trainers", "white-tee", "light-blue-jeans"] },
  { ...SPEC_161_BASE, number: 175, seed: 175, ...band(50, 57),
    types: ["green-tee", "blue-tee", "red-polka-dress", "yellow-sun-hat", "green-scarf", "purple-socks", "teal-kimono", "blue-cap"] },
  { ...SPEC_161_BASE, number: 176, seed: 176, ...band(69, 72, 250),
    types: ["white-tee", "red-jeans", "brown-leather-jacket", "coral-swimsuit", "orange-scarf", "black-boots", "pink-gloves", "purple-tee"] },
  { ...SPEC_161_BASE, number: 177, seed: 177, ...band(66, 70, 250),
    types: ["blue-tee", "light-blue-jeans", "red-polka-dress", "yellow-shorts", "purple-socks", "green-scarf", "red-trainers", "black-bootcut-jeans"] },
  { ...SPEC_161_BASE, number: 178, seed: 178, ...band(66, 70, 250),
    types: ["green-tee", "brown-leather-jacket", "orange-dress", "blue-cap", "pink-gloves", "yellow-sun-hat", "teal-kimono", "orange-scarf"] },
  { ...SPEC_161_BASE, number: 179, seed: 179, ...band(66.5, 70.2, 250),
    types: ["red-tee", "purple-tee", "black-bootcut-jeans", "red-jeans", "green-scarf", "purple-socks", "coral-swimsuit", "black-boots"] },
  { ...SPEC_161_BASE, number: 180, seed: 180, ...band(68, 71.5, 300),
    types: ["white-tee", "brown-leather-jacket", "light-blue-jeans", "red-polka-dress", "yellow-shorts", "orange-scarf", "red-trainers", "pink-gloves"] },
];

/** Levels 181–200: new wardrobe, themed parade, hard finale. */
const SPECS_181_200: LevelSpec[] = [
  { ...SPEC_161_BASE, number: 181, seed: 181, ...band(66, 69.5, 250),
    types: ["red-cap", "teal-scarf", "navy-stripe-tee", "clownfish", "orange-penguin", "navy-backpack", "pink-bikini", "graduation-cap"] },
  { ...SPEC_161_BASE, number: 182, seed: 182, ...band(66.2, 70, 250),
    types: ["purple-cap", "pink-scarf", "cherry-tee", "goldfish", "blue-penguin", "red-sari", "high-heels", "hiking-boots"] },
  { ...SPEC_161_BASE, number: 183, seed: 183, ...band(66.5, 70.2, 250),
    types: ["green-cap", "light-blue-scarf", "sailor-tee", "neon-fish", "yellow-penguin", "handbag", "flip-flops", "blue-jacket"] },
  { ...SPEC_161_BASE, number: 184, seed: 184, ...band(67, 70.5, 250),
    types: ["black-cap", "yellow-scarf", "bumblebee-tee", "royal-fish", "pink-penguin", "backpack", "sari", "green-trunks"] },
  { ...SPEC_161_BASE, number: 185, seed: 185, ...band(67.2, 70.8, 250),
    types: ["white-cap", "red-scarf", "rebel-tee", "lagoon-fish", "teal-penguin", "coral-swimsuit", "blowfish", "orange-socks"] },
  { ...SPEC_161_BASE, number: 186, seed: 186, ...band(67.5, 71, 250),
    types: ["orange-cap", "brown-scarf", "candy-tee", "trout", "red-penguin", "navy-backpack", "purple-jacket", "pink-trunks"] },
  { ...SPEC_161_BASE, number: 187, seed: 187, ...band(67.8, 71.2, 250),
    types: ["pink-cap", "navy-scarf", "forest-tee", "salmon", "purple-penguin", "high-heels", "tie-dye-tee", "light-blue-trunks"] },
  { ...SPEC_161_BASE, number: 188, seed: 188, ...band(66, 69.5, 250),
    types: ["yellow-cap", "purple-scarf", "psychedelic-tee", "tropical-fish", "orange-penguin", "graduation-cap", "red-sari", "burgundy-trunks"] },
  { ...SPEC_161_BASE, number: 189, seed: 189, ...band(68.2, 71.8, 250),
    types: ["red-cap", "teal-scarf", "navy-stripe-tee", "clownfish", "green-penguin", "handbag", "sardine", "yellow-jacket"] },
  { ...SPEC_161_BASE, number: 190, seed: 190, ...band(66.5, 70, 300),
    types: ["purple-cap", "pink-scarf", "sailor-tee", "neon-fish", "blue-penguin", "pink-bikini", "hiking-boots", "charcoal-jacket"] },
  { ...SPEC_161_BASE, number: 191, seed: 191, ...band(64, 68, 250),
    types: ["white-tee", "red-tee", "blue-tee", "green-tee", "purple-tee", "orange-scarf", "pink-gloves", "yellow-shorts"] },
  { ...SPEC_161_BASE, number: 192, seed: 192, ...band(68, 72, 250),
    types: ["navy-stripe-tee", "sailor-tee", "bumblebee-tee", "cherry-tee", "rebel-tee", "candy-tee", "forest-tee", "psychedelic-tee"] },
  { ...SPEC_161_BASE, number: 193, seed: 193, ...band(64, 67.5, 250),
    types: ["red-jacket", "blue-jacket", "yellow-jacket", "purple-jacket", "orange-jacket", "navy-jacket", "pink-jacket", "charcoal-jacket"] },
  { ...SPEC_161_BASE, number: 194, seed: 194, ...band(63, 66.5, 250),
    types: ["green-trunks", "blue-trunks", "pink-trunks", "light-blue-trunks", "burgundy-trunks", "yellow-shorts", "coral-swimsuit", "pink-bikini"] },
  { ...SPEC_161_BASE, number: 195, seed: 195, ...band(63, 66.5, 250),
    types: ["red-polka-dress", "orange-dress", "green-dress", "blue-dress", "purple-dress", "light-blue-dress", "black-dress", "dark-brown-dress"] },
  { ...SPEC_161_BASE, number: 196, seed: 196, ...band(62, 66, 250),
    types: ["clownfish", "neon-fish", "royal-fish", "lagoon-fish", "goldfish", "trout", "salmon", "blowfish"] },
  { ...SPEC_161_BASE, number: 197, seed: 197, ...band(62, 66, 250),
    types: ["orange-penguin", "blue-penguin", "green-penguin", "red-penguin", "yellow-penguin", "pink-penguin", "teal-penguin", "purple-penguin"] },
  { ...SPEC_161_BASE, number: 198, seed: 198, ...band(66, 70, 300),
    types: ["psychedelic-tee", "red-cap", "orange-penguin", "clownfish", "purple-jacket", "navy-backpack", "red-sari", "graduation-cap"] },
  { ...SPEC_161_BASE, number: 199, seed: 199, ...band(68.5, 72, 350),
    types: ["tie-dye-tee", "teal-scarf", "royal-fish", "pink-penguin", "yellow-jacket", "handbag", "coral-swimsuit", "top-hat"] },
  { ...SPEC_161_BASE, number: 200, seed: 2000, ...band(68.5, 72.5, 400),
    types: ["crown", "light-blue-dress", "penguin", "neon-fish", "backpack", "navy-backpack", "purple-jacket", "rebel-tee"] },
];

function specsInRange(from: number, to: number): LevelSpec[] {
  return [
    ...SPECS_81_100,
    ...SPECS_101_120,
    ...SPECS_121_140,
    ...SPECS_141_160,
    ...SPECS_161_180,
    ...SPECS_181_200,
  ].filter((s) => s.number >= from && s.number <= to);
}

function findLevelSpec(n: number): LevelSpec | undefined {
  return specsInRange(121, 200).find((s) => s.number === n);
}

function removeLevelBlock(source: string, levelNum: number): string {
  const start = source.indexOf(`  // Level ${levelNum}:`);
  if (start < 0) throw new Error(`Could not find level ${levelNum} in ${OUT}`);
  const next = source.indexOf(`  // Level ${levelNum + 1}:`, start);
  const end = next >= 0 ? next : source.lastIndexOf("\n];");
  if (end < 0) throw new Error(`Could not find splice point after level ${levelNum}`);
  return source.slice(0, start) + source.slice(end);
}

function insertLevelBlock(source: string, beforeLevel: number, block: string): string {
  const pos = source.indexOf(`  // Level ${beforeLevel}:`);
  if (pos < 0) throw new Error(`Could not find level ${beforeLevel} for insert`);
  return `${source.slice(0, pos)}${block}\n${source.slice(pos)}`;
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
  101: specsInRange(101, 105),
  106: specsInRange(106, 110),
  111: specsInRange(111, 115),
  116: specsInRange(116, 120),
  121: specsInRange(121, 125),
  126: specsInRange(126, 130),
  131: specsInRange(131, 135),
  136: specsInRange(136, 140),
  141: specsInRange(141, 145),
  146: specsInRange(146, 150),
  151: specsInRange(151, 155),
  156: specsInRange(156, 160),
  161: specsInRange(161, 165),
  166: specsInRange(166, 170),
  171: specsInRange(171, 175),
  176: specsInRange(176, 180),
  181: specsInRange(181, 185),
  186: specsInRange(186, 190),
  191: specsInRange(191, 195),
  196: specsInRange(196, 200),
};

type Mode = "4-10" | "11-20" | "append" | "replace" | "all";

function parseReplaceLevel(): number | null {
  const arg = process.argv.find((a) => /^--replace=\d+$/.test(a));
  if (!arg) return null;
  const n = Number.parseInt(arg.split("=")[1]!, 10);
  return Number.isFinite(n) && findLevelSpec(n) ? n : null;
}

function parseAppendFrom(): number | null {
  const arg = process.argv.find((a) => /^--from=\d+$/.test(a));
  if (!arg) return null;
  const n = Number.parseInt(arg.split("=")[1]!, 10);
  return Number.isFinite(n) && APPEND_BATCHES[n] ? n : null;
}

function parseMode(): Mode {
  const args = process.argv.slice(2);
  if (parseReplaceLevel() !== null) return "replace";
  if (parseAppendFrom() !== null) return "append";
  if (args.includes("--all")) return "all";
  if (args.includes("--more") || args.includes("--from=11")) return "11-20";
  return "4-10";
}

/**
 * Levels 1–100 were solved with a single green jacket type; each level shows it in
 * one colour instead (cycled through levels that have jackets). A one-for-one type swap
 * leaves the puzzle unchanged. Levels 2–3 live in levelData.ts.
 */
const JACKET_COLOUR_BY_LEVEL: Readonly<Record<number, ClothingId>> = {
  4: "brown-leather-jacket",
  5: "purple-jacket",
  6: "orange-jacket",
  7: "navy-jacket",
  8: "yellow-jacket",
  9: "pink-jacket",
  10: "dark-green-jacket",
  11: "charcoal-jacket",
  12: "blue-jacket",
  13: "red-jacket",
  14: "brown-leather-jacket",
  15: "purple-jacket",
  16: "orange-jacket",
  17: "navy-jacket",
  18: "yellow-jacket",
  19: "pink-jacket",
  20: "dark-green-jacket",
  24: "charcoal-jacket",
  27: "blue-jacket",
  33: "red-jacket",
  35: "brown-leather-jacket",
  40: "purple-jacket",
  45: "orange-jacket",
  51: "navy-jacket",
  57: "yellow-jacket",
  62: "pink-jacket",
  66: "dark-green-jacket",
  70: "charcoal-jacket",
  71: "blue-jacket",
  75: "red-jacket",
  79: "brown-leather-jacket",
  83: "purple-jacket",
  87: "orange-jacket",
  89: "navy-jacket",
  92: "yellow-jacket",
  95: "pink-jacket",
  96: "dark-green-jacket",
  100: "charcoal-jacket",
};

/** Levels 13–100: purple socks shown in a cycle of colours (same one-for-one swap). */
const SOCKS_COLOUR_BY_LEVEL: Readonly<Record<number, ClothingId>> = {
  13: "green-socks",
  15: "yellow-socks",
  16: "blue-socks",
  18: "red-socks",
  19: "brown-socks",
  23: "black-white-socks",
  24: "orange-socks",
  29: "pink-socks",
  31: "green-socks",
  35: "yellow-socks",
  40: "blue-socks",
  41: "red-socks",
  47: "brown-socks",
  48: "black-white-socks",
  49: "orange-socks",
  51: "pink-socks",
  56: "green-socks",
  58: "yellow-socks",
  62: "blue-socks",
  63: "red-socks",
  66: "brown-socks",
  68: "black-white-socks",
  70: "orange-socks",
  71: "pink-socks",
  73: "green-socks",
  75: "yellow-socks",
  76: "blue-socks",
  78: "red-socks",
  79: "brown-socks",
  81: "black-white-socks",
  82: "orange-socks",
  85: "pink-socks",
  86: "green-socks",
  88: "yellow-socks",
  89: "blue-socks",
  92: "red-socks",
  93: "brown-socks",
  96: "black-white-socks",
  98: "orange-socks",
  99: "pink-socks",
};

/** Levels 20–100: some yellow swim shorts shown as other trunks colours (burgundy from 40). */
const TRUNKS_COLOUR_BY_LEVEL: Readonly<Record<number, ClothingId>> = {
  20: "light-blue-trunks",
  24: "pink-trunks",
  31: "light-blue-trunks",
  39: "pink-trunks",
  41: "burgundy-trunks",
  51: "light-blue-trunks",
  59: "pink-trunks",
  63: "burgundy-trunks",
  69: "light-blue-trunks",
  74: "pink-trunks",
  78: "burgundy-trunks",
  82: "light-blue-trunks",
  90: "pink-trunks",
  94: "burgundy-trunks",
};

/** Levels 11+: some red polka dresses shown as plain green, blue or purple dresses. */
const DRESS_COLOUR_BY_LEVEL: Readonly<Record<number, ClothingId>> = {
  11: "green-dress",
  12: "blue-dress",
  15: "purple-dress",
  17: "green-dress",
  18: "blue-dress",
  24: "purple-dress",
  28: "green-dress",
  34: "blue-dress",
  45: "purple-dress",
  46: "green-dress",
  50: "blue-dress",
  55: "purple-dress",
  60: "green-dress",
  64: "blue-dress",
  71: "purple-dress",
  72: "green-dress",
  73: "blue-dress",
  80: "purple-dress",
  84: "green-dress",
  92: "blue-dress",
  97: "purple-dress",
  99: "green-dress",
  112: "blue-dress",
};

/** After level 27: occasional plain-dress recolour (swap one dress colour on that level). */
const POST_27_DRESS_SWAP: Readonly<
  Record<number, { readonly from: ClothingId; readonly with: ClothingId }>
> = {
  31: { from: "orange-dress", with: "black-dress" },
  39: { from: "orange-dress", with: "light-blue-dress" },
  53: { from: "orange-dress", with: "black-dress" },
  60: { from: "green-dress", with: "light-blue-dress" },
  70: { from: "orange-dress", with: "light-blue-dress" },
  84: { from: "green-dress", with: "black-dress" },
  94: { from: "orange-dress", with: "black-dress" },
  109: { from: "orange-dress", with: "light-blue-dress" },
  117: { from: "orange-dress", with: "black-dress" },
};

/** Orange / green scarf recolours (puzzle unchanged; per-level type swap). */
const ORANGE_SCARF_COLOUR_BY_LEVEL: Readonly<Record<number, ClothingId>> = {
  10: "navy-scarf",
  13: "purple-scarf",
  16: "brown-scarf",
  19: "navy-scarf",
  23: "purple-scarf",
  35: "brown-scarf",
  39: "navy-scarf",
  42: "purple-scarf",
  48: "purple-scarf",
  52: "navy-scarf",
  58: "brown-scarf",
  63: "navy-scarf",
  66: "purple-scarf",
  69: "purple-scarf",
  74: "brown-scarf",
  78: "navy-scarf",
  85: "purple-scarf",
  90: "brown-scarf",
  94: "navy-scarf",
  100: "purple-scarf",
};

const GREEN_SCARF_COLOUR_BY_LEVEL: Readonly<Record<number, ClothingId>> = {
  12: "navy-scarf",
  18: "purple-scarf",
  26: "brown-scarf",
  27: "navy-scarf",
  33: "navy-scarf",
  40: "purple-scarf",
  45: "brown-scarf",
  56: "brown-scarf",
  60: "navy-scarf",
  70: "purple-scarf",
  75: "brown-scarf",
  77: "brown-scarf",
  79: "navy-scarf",
  81: "navy-scarf",
  87: "purple-scarf",
  89: "brown-scarf",
  95: "navy-scarf",
  97: "purple-scarf",
  99: "purple-scarf",
};

/** Level 27: dress-themed wardrobe (puzzle unchanged; one-for-one type swap). */
const LEVEL_27_THEME: Readonly<Partial<Record<ClothingId, ClothingId>>> = {
  "orange-scarf": "red-polka-dress",
  "navy-scarf": "orange-dress",
  "red-tee": "green-dress",
  "yellow-sun-hat": "blue-dress",
  "black-bootcut-jeans": "purple-dress",
  "yellow-shorts": "light-blue-dress",
  "blue-tee": "black-dress",
  "blue-jacket": "dark-brown-dress",
};

function recolourLevelItems(items: readonly ClothingId[], n: number): ClothingId[] {
  const jacket = JACKET_COLOUR_BY_LEVEL[n] ?? "brown-leather-jacket";
  const socks = SOCKS_COLOUR_BY_LEVEL[n] ?? "purple-socks";
  const trunks = TRUNKS_COLOUR_BY_LEVEL[n] ?? "yellow-shorts";
  const dress = DRESS_COLOUR_BY_LEVEL[n] ?? "red-polka-dress";
  const orangeScarf = ORANGE_SCARF_COLOUR_BY_LEVEL[n] ?? "orange-scarf";
  const greenScarf = GREEN_SCARF_COLOUR_BY_LEVEL[n] ?? "green-scarf";
  const recoloured = items.map((id) => {
    if (id === "brown-leather-jacket") return jacket;
    if (id === "purple-socks") return socks;
    if (id === "yellow-shorts") return trunks;
    if (id === "red-polka-dress") return dress;
    if (id === "orange-scarf") return orangeScarf;
    if (id === "green-scarf") return greenScarf;
    return id;
  });
  let out =
    n === 27 ? recoloured.map((id) => LEVEL_27_THEME[id] ?? id) : recoloured;
  if (n > 27) {
    const swap = POST_27_DRESS_SWAP[n];
    if (swap) {
      out = out.map((id) => (id === swap.from ? swap.with : id));
    }
  }
  return out;
}

/**
 * Same-garment levels: each distinct type (in first-appearance order across shelves)
 * becomes palette[i]. Applied after the per-level recolours above.
 */
const SAME_GARMENT_LEVELS: Readonly<Record<number, readonly ClothingId[]>> = {
  54: ["orange-scarf", "green-scarf", "navy-scarf", "purple-scarf", "brown-scarf"],
  68: ["green-socks", "yellow-socks", "blue-socks", "red-socks", "black-white-socks", "orange-socks"],
  82: ["white-tee", "red-tee", "green-tee", "blue-tee", "purple-tee", "psychedelic-tee"],
  96: ["red-jacket", "blue-jacket", "yellow-jacket", "purple-jacket", "orange-jacket", "dark-green-jacket"],
  156: [
    "navy-stripe-tee",
    "sailor-tee",
    "bumblebee-tee",
    "cherry-tee",
    "rebel-tee",
    "candy-tee",
    "forest-tee",
    "tie-dye-tee",
  ],
  191: [
    "white-tee",
    "red-tee",
    "green-tee",
    "blue-tee",
    "purple-tee",
    "orange-tee",
    "yellow-tee",
    "black-tee",
  ],
  192: [
    "navy-stripe-tee",
    "sailor-tee",
    "bumblebee-tee",
    "cherry-tee",
    "rebel-tee",
    "candy-tee",
    "forest-tee",
    "tie-dye-tee",
  ],
};

function recolourLevelShelves(shelves: readonly (readonly ClothingId[])[], n: number): ClothingId[][] {
  const recoloured = shelves.map((items) => recolourLevelItems(items, n));
  const palette = SAME_GARMENT_LEVELS[n];
  if (!palette) return recoloured;
  const order = [...new Set(recoloured.flat())];
  if (order.length > palette.length) {
    throw new Error(`Level ${n}: ${order.length} types but same-garment palette has ${palette.length}`);
  }
  const map = new Map(order.map((id, i) => [id, palette[i]!]));
  return recoloured.map((items) => items.map((id) => map.get(id)!));
}

function formatLevel(level: LevelDefinition, header: string): string {
  const n = levelNumber(level.id);
  const shelfItems = recolourLevelShelves(
    level.shelves.map((s) => s.items),
    n,
  );
  const shelves = level.shelves
    .map(
      (s, i) =>
        `      { id: ${JSON.stringify(s.id)}, side: ${JSON.stringify(s.side)}, capacity: ${s.capacity}, items: ${JSON.stringify(shelfItems[i])} },`,
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

if (mode === "replace") {
  const levelNum = parseReplaceLevel()!;
  const spec = findLevelSpec(levelNum)!;
  const existing = await readFile(OUT, "utf8");
  console.log(`Replacing level ${levelNum} only; all other levels untouched`);
  const stripped = removeLevelBlock(existing, levelNum);
  const { blocks } = await runSpecs([spec], { full: -Infinity, fast: -Infinity });
  if (blocks.length !== 1) throw new Error(`Expected one level block, got ${blocks.length}`);
  const next =
    levelNum < 200
      ? insertLevelBlock(stripped, levelNum + 1, blocks[0]!)
      : (() => {
          const closeAt = stripped.lastIndexOf("\n];");
          if (closeAt < 0) throw new Error("Could not find end of GENERATED_LEVELS array");
          return `${stripped.slice(0, closeAt)}\n${blocks[0]!}${stripped.slice(closeAt)}`;
        })();
  await writeFile(OUT, next, "utf8");
  console.log(`Replaced level ${levelNum} in ${OUT}`);
  process.exit(0);
}

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
