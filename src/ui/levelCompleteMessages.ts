const LEVEL_COMPLETE_SUBTITLES = [
  "All tidy!",
  "Well played!",
  "All clothes sorted.",
  "All clothes in order.",
  "Looking good!",
  "Wardrobe wizard!",
  "Sorted to perfection!",
  "Everything in its place.",
] as const;

export function pickLevelCompleteSubtitle(): string {
  const i = Math.floor(Math.random() * LEVEL_COMPLETE_SUBTITLES.length);
  return LEVEL_COMPLETE_SUBTITLES[i] ?? LEVEL_COMPLETE_SUBTITLES[0];
}