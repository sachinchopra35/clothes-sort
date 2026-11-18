import { getLevelIndex } from "../levels/levelData";

export function cheatCodeForLevelNumber(levelNumber: number): string {
  return `cleanclothes${levelNumber}`;
}

export function verifyLevelCheatCode(levelId: string, attempt: string): boolean {
  const idx = getLevelIndex(levelId);
  if (idx < 0) return false;
  const expected = cheatCodeForLevelNumber(idx + 1);
  return attempt.trim().toLowerCase() === expected;
}