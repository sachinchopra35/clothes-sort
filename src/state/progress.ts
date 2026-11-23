import { LEVELS, getLevelIndex } from "../levels/levelData";
import { hasWarmSession, markWarmSession } from "./appSession";
import { loadJson, saveJson } from "./storage";

const KEY_SELECTED = "selected-level-id";
const KEY_UNLOCKED = "unlocked-level-ids";
const KEY_COMPLETED = "completed-level-ids";

/** When true, all levels are selectable (PoC testing). */
export const DEV_UNLOCK_ALL = false;

interface ProgressState {
  selectedLevelId: string;
  unlockedLevelIds: string[];
  completedLevelIds: string[];
}

function defaultUnlocked(): string[] {
  return LEVELS.length > 0 ? [LEVELS[0].id] : [];
}

function readState(): ProgressState {
  return {
    selectedLevelId: loadJson(KEY_SELECTED, LEVELS[0]?.id ?? "level-1"),
    unlockedLevelIds: loadJson(KEY_UNLOCKED, defaultUnlocked()),
    completedLevelIds: loadJson(KEY_COMPLETED, [] as string[]),
  };
}

let cached = readState();

export function getSelectedLevelId(): string {
  return cached.selectedLevelId;
}

/** First incomplete level in order; last level if the player cleared everything. */
export function getResumeLevelId(): string {
  for (const level of LEVELS) {
    if (!isLevelCompleted(level.id)) {
      return level.id;
    }
  }
  return LEVELS[LEVELS.length - 1]?.id ?? "level-1";
}

/**
 * Level for the menu picker. After a cold start (e.g. app swiped away), jumps to the
 * earliest incomplete level; while the session is warm, keeps the last selected level.
 */
export function getMenuLevelId(): string {
  if (hasWarmSession()) {
    const exists = LEVELS.some((l) => l.id === cached.selectedLevelId);
    if (exists) {
      markWarmSession();
      return cached.selectedLevelId;
    }
  }
  const resume = getResumeLevelId();
  setSelectedLevelId(resume);
  markWarmSession();
  return resume;
}

export function setSelectedLevelId(id: string): void {
  cached.selectedLevelId = id;
  saveJson(KEY_SELECTED, id);
}

export function getUnlockedLevelIds(): string[] {
  if (DEV_UNLOCK_ALL) return LEVELS.map((l) => l.id);
  return [...cached.unlockedLevelIds];
}

export function isLevelUnlocked(levelId: string): boolean {
  if (DEV_UNLOCK_ALL) return true;
  return cached.unlockedLevelIds.includes(levelId);
}

export function unlockLevel(levelId: string): void {
  if (!cached.unlockedLevelIds.includes(levelId)) {
    cached.unlockedLevelIds.push(levelId);
    saveJson(KEY_UNLOCKED, cached.unlockedLevelIds);
  }
}

/** Unlock this level and every earlier level (cheat codes). */
export function unlockLevelAndPrior(levelId: string): void {
  const idx = getLevelIndex(levelId);
  if (idx < 0) return;
  let changed = false;
  for (let i = 0; i <= idx; i++) {
    const id = LEVELS[i]!.id;
    if (!cached.unlockedLevelIds.includes(id)) {
      cached.unlockedLevelIds.push(id);
      changed = true;
    }
  }
  if (changed) {
    saveJson(KEY_UNLOCKED, cached.unlockedLevelIds);
  }
}

/** Unlock the level after the one the player just finished. */
export function unlockNextLevel(completedLevelId: string): void {
  const idx = getLevelIndex(completedLevelId);
  if (idx < 0 || idx >= LEVELS.length - 1) return;
  unlockLevel(LEVELS[idx + 1].id);
}

export function getCompletedLevelIds(): string[] {
  return [...cached.completedLevelIds];
}

export function isLevelCompleted(levelId: string): boolean {
  return cached.completedLevelIds.includes(levelId);
}

export function completeLevel(levelId: string): void {
  if (!cached.completedLevelIds.includes(levelId)) {
    cached.completedLevelIds.push(levelId);
    saveJson(KEY_COMPLETED, cached.completedLevelIds);
  }
}

export function resetProgressCache(): void {
  cached = readState();
}
