import Phaser from "phaser";
import { theme } from "../config/theme";

const BACK_WALL_SEED = 0x776f6f64;

/** Deterministic RNG for stable wood pattern across loads. */
function createRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerpColor(a: number, b: number, t: number): number {
  const ca = Phaser.Display.Color.IntegerToColor(a);
  const cb = Phaser.Display.Color.IntegerToColor(b);
  const c = Phaser.Display.Color.Interpolate.ColorWithColor(ca, cb, 1, Phaser.Math.Clamp(t, 0, 1));
  return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
}

const PLANK_BASES = [
  theme.backPlankA,
  theme.backPlankB,
  theme.backPlankC,
  theme.backPlankD,
] as const;

/**
 * Teak-style horizontal plank back wall (warm grain, board variation).
 * Does not draw side trim — caller keeps crown / plinth / side panels.
 */
export function drawTeakBackWall(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  showGrain: boolean,
): void {
  const rng = createRng(BACK_WALL_SEED);
  let cursorY = y;
  let plankIndex = 0;

  while (cursorY < y + height) {
    const plankH = 118 + Math.floor(rng() * 62);
    const y0 = cursorY;
    const y1 = Math.min(y + height, y0 + plankH);
    const h = y1 - y0;
    if (h < 4) break;

    const base = PLANK_BASES[plankIndex % PLANK_BASES.length]!;
    const shade = 0.96 + rng() * 0.06;
    const tint = lerpColor(base, theme.backPlankDeep, (1 - shade) * 0.35);

    const stripCount = Math.max(3, Math.floor(h / 14));
    for (let s = 0; s < stripCount; s++) {
      const t0 = s / stripCount;
      const t1 = (s + 1) / stripCount;
      const bandShade =
        0.98 + Math.sin(plankIndex * 1.7 + t0 * 5) * 0.02 + (rng() - 0.5) * 0.015;
      const bandColor = lerpColor(tint, theme.backPlankLight, bandShade * 0.12);
      const sy = y0 + t0 * h;
      const sh = t1 * h - t0 * h + 1;
      g.fillStyle(bandColor, 1);
      g.fillRect(x, sy, width, sh);
    }

    if (showGrain) {
      drawPlankGrain(g, x, y0, width, h, plankIndex, rng);
    }

    if (rng() < 0.1) {
      const knotX = x + 40 + rng() * (width - 120);
      const knotY = y0 + h * (0.25 + rng() * 0.5);
      const knotR = 8 + rng() * 14;
      g.fillStyle(theme.backPlankDeep, 0.06 + rng() * 0.05);
      g.fillEllipse(knotX, knotY, knotR * 1.2, knotR);
    }

    g.fillStyle(theme.backPlankSeam, 0.1);
    g.fillRect(x, y1 - 1, width, 1);

    cursorY = y1;
    plankIndex += 1;
  }

  g.fillStyle(theme.backVignette, 0.04);
  g.fillRect(x, y, width, height * 0.06);
  g.fillStyle(theme.backVignette, 0.05);
  g.fillRect(x, y + height * 0.94, width, height * 0.06);
}

function drawPlankGrain(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  plankIndex: number,
  rng: () => number,
): void {
  const lines = 3 + Math.floor(rng() * 3);
  const phase = plankIndex * 2.1 + rng() * 4;

  for (let i = 0; i < lines; i++) {
    const gy = y + ((i + 1) / (lines + 1)) * height;
    const alpha = 0.02 + rng() * 0.025;
    const dark = rng() < 0.12;
    g.lineStyle(1, dark ? theme.backGrainDark : theme.backGrain, alpha);

    g.beginPath();
    let px = x + 6;
    g.moveTo(px, gy);
    const wavePhase = phase + i * 0.8;
    while (px < x + width - 6) {
      px += 14 + rng() * 18;
      const wobble =
        Math.sin(px * 0.018 + wavePhase) * (1.2 + rng() * 2.5) +
        Math.cos(px * 0.006 + plankIndex) * 1.5;
      g.lineTo(px, gy + wobble);
    }
    g.strokePath();
  }

  if (rng() < 0.28) {
    const streakX = x + width * (0.15 + rng() * 0.7);
    g.lineStyle(1, theme.backGrainDark, 0.02);
    g.beginPath();
    g.moveTo(streakX, y + 4);
    g.lineTo(streakX + (rng() - 0.5) * 30, y + height - 4);
    g.strokePath();
  }
}