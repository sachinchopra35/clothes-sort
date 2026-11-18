/**
 * Fast-arrow target (1-based level numbers). Stops are level 1, every multiple of 10,
 * the last level, and the latest unlocked level. Wraps at either end.
 */
export function fastJumpLevel(
  current: number,
  direction: 1 | -1,
  totalLevels: number,
  latestUnlocked: number,
): number {
  const stops = new Set<number>([1, totalLevels]);
  for (let n = 10; n <= totalLevels; n += 10) stops.add(n);
  if (latestUnlocked >= 1 && latestUnlocked <= totalLevels) stops.add(latestUnlocked);
  const sorted = [...stops].sort((a, b) => a - b);

  if (direction > 0) {
    return sorted.find((n) => n > current) ?? sorted[0]!;
  }
  return [...sorted].reverse().find((n) => n < current) ?? sorted[sorted.length - 1]!;
}
