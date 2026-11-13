import { LEVELS } from "../levels/levelData";
import { loadJson, saveJson } from "./storage";

const KEY_SELECTED = "selected-level-id";
const KEY_UNLOCKED = "unlocked-level-ids";

/** When true, all levels are selectable (PoC testing). */
export const DEV_UNLOCK_ALL = true;

interface ProgressState {
  selectedLevelId: string;
  unlockedLevelIds: string[];
}

function defaultUnlocked(): string[] {
  return LEVELS.length > 0 ? [LEVELS[0].id] : [];
}

function readState(): ProgressState {
  return {
    selectedLevelId: loadJson(KEY_SELECTED, LEVELS[0]?.id ?? "level-1"),
    unlockedLevelIds: loadJson(KEY_UNLOCKED, defaultUnlocked()),
  };
}

let cached = readState();

export function getSelectedLevelId(): string {
  return cached.selectedLevelId;
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

export function resetProgressCache(): void {
  cached = readState();
}
