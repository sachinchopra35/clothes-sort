/** Undo uses per level attempt (11+ only). */
export function undoAllowanceForLevel(levelNumber: number): number {
  if (levelNumber < 11) return 0;
  if (levelNumber < 21) return 1;
  return 2;
}