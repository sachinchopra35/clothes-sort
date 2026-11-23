import { GENERATED_LEVELS } from "./generatedLevels";
import type { LevelDefinition } from "./levelTypes";

/**
 * Clothing stand-ins for Bird Sort bird colours.
 * blue → light-blue-jeans, brown bird → green jacket, gray-crest → black jeans,
 * red/yellow → white tee, orange → red polka dress.
 *
 * Left shelves: items listed wall → open (same as birds left-to-right on branch).
 * Right shelves: items listed wall → open (reverse of birds left-to-right on branch).
 */
const C = {
  jb: "light-blue-jeans" as const,
  jk: "black-bootcut-jeans" as const,
  jkt: "brown-leather-jacket" as const,
  tee: "white-tee" as const,
  dr: "red-polka-dress" as const,
};

/** Levels 1-3 copy Bird Sort 2; later levels come from scripts/levels-generate.ts. */
const HANDCRAFTED_LEVELS: LevelDefinition[] = [
  {
    id: "level-1",
    name: "Level 1",
    shelves: [
      {
        id: "l1",
        side: "left",
        capacity: 4,
        items: ["red-tee", "red-tee", "light-blue-jeans"],
      },
      {
        id: "l2",
        side: "left",
        capacity: 4,
        items: ["red-tee", "red-tee"],
      },
      {
        id: "r1",
        side: "right",
        capacity: 4,
        items: ["light-blue-jeans", "light-blue-jeans", "light-blue-jeans"],
      },
    ],
  },
  {
    id: "level-2",
    name: "Level 2",
    shelves: [
      {
        id: "l1",
        side: "left",
        capacity: 4,
        items: [C.jb, C.jkt, C.jk, C.jb],
      },
      {
        id: "r1",
        side: "right",
        capacity: 4,
        items: [C.jk, C.jkt, C.jk, C.tee],
      },
      {
        id: "l2",
        side: "left",
        capacity: 4,
        items: [C.tee, C.tee, C.jkt, C.jkt],
      },
      {
        id: "r2",
        side: "right",
        capacity: 4,
        items: [C.jb, C.jb, C.jk, C.tee],
      },
      { id: "l3", side: "left", capacity: 4, items: [] },
      { id: "r3", side: "right", capacity: 4, items: [] },
    ],
  },
  {
    id: "level-3",
    name: "Level 3",
    shelves: [
      {
        id: "l1",
        side: "left",
        capacity: 4,
        items: [C.jkt, C.dr, C.dr, C.jb],
      },
      {
        id: "r1",
        side: "right",
        capacity: 4,
        items: [C.jkt, C.jkt, C.dr, C.jb],
      },
      {
        id: "l2",
        side: "left",
        capacity: 4,
        items: [C.jk, C.jk, C.jk, C.jb],
      },
      {
        id: "r2",
        side: "right",
        capacity: 4,
        items: [C.dr, C.jb, C.jkt, C.jk],
      },
      { id: "l3", side: "left", capacity: 4, items: [] },
      { id: "r3", side: "right", capacity: 4, items: [] },
    ],
  },
];

export const LEVELS: LevelDefinition[] = [...HANDCRAFTED_LEVELS, ...GENERATED_LEVELS];

export function getLevelById(id: string): LevelDefinition | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getLevelIndex(id: string): number {
  return LEVELS.findIndex((l) => l.id === id);
}

export function typesInLevel(level: LevelDefinition): string[] {
  const counts = new Map<string, number>();
  for (const shelf of level.shelves) {
    for (const item of shelf.items) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }
  return [...counts.keys()];
}
