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
});