import { beforeEach, describe, expect, it, vi } from "vitest";

const { memoryStore } = vi.hoisted(() => {
  const memoryStore = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => memoryStore.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memoryStore.set(key, value);
    },
    removeItem: (key: string) => {
      memoryStore.delete(key);
    },
    clear: () => {
      memoryStore.clear();
    },
  });
  return { memoryStore };
});

import { LEVELS } from "../src/levels/levelData";
import {
  completeLevel,
  isLevelCompleted,
  isLevelUnlocked,
  resetProgressCache,
  unlockLevelAndPrior,
  unlockNextLevel,
} from "../src/state/progress";

describe("progress", () => {
  beforeEach(() => {
    memoryStore.clear();
    resetProgressCache();
  });

  it("persists completed levels in localStorage", () => {
    expect(isLevelCompleted("level-1")).toBe(false);
    completeLevel("level-1");
    expect(isLevelCompleted("level-1")).toBe(true);

    resetProgressCache();
    expect(isLevelCompleted("level-1")).toBe(true);
  });

  it("unlocks the next level after a win", () => {
    const first = LEVELS[0]?.id;
    const second = LEVELS[1]?.id;
    if (!first || !second) return;

    expect(isLevelUnlocked(first)).toBe(true);
    expect(isLevelUnlocked(second)).toBe(false);

    unlockNextLevel(first);
    expect(isLevelUnlocked(second)).toBe(true);

    resetProgressCache();
    expect(isLevelUnlocked(second)).toBe(true);
  });

  it("cheat unlock opens the level and all prior levels", () => {
    const third = LEVELS[2]?.id;
    const fifth = LEVELS[4]?.id;
    if (!third || !fifth) return;

    expect(isLevelUnlocked(third)).toBe(false);
    expect(isLevelUnlocked(fifth)).toBe(false);

    unlockLevelAndPrior(fifth);

    expect(isLevelUnlocked(LEVELS[0]!.id)).toBe(true);
    expect(isLevelUnlocked(LEVELS[1]!.id)).toBe(true);
    expect(isLevelUnlocked(third)).toBe(true);
    expect(isLevelUnlocked(LEVELS[3]!.id)).toBe(true);
    expect(isLevelUnlocked(fifth)).toBe(true);
    const sixth = LEVELS[5]?.id;
    if (sixth) expect(isLevelUnlocked(sixth)).toBe(false);
  });
});