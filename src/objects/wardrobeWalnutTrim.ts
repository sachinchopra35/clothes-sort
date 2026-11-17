import Phaser from "phaser";
import { theme } from "../config/theme";

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
  const c = Phaser.Display.Color.Interpolate.ColorWithColor(
    ca,
    cb,
    1,
    Phaser.Math.Clamp(t, 0, 1),
  );
  return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
}

export type WalnutGrainAxis = "vertical" | "horizontal";

/** Dark walnut trim with subtle grain (frames / side stiles). */
export function drawWalnutWood(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  axis: WalnutGrainAxis,
  seed: number,
): void {
  const rng = createRng(seed);
  const steps = axis === "vertical" ? Math.max(6, Math.floor(width / 6)) : Math.max(6, Math.floor(height / 6));
  const long = axis === "vertical" ? height : width;
  const short = axis === "vertical" ? width : height;

  for (let i = 0; i < steps; i++) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const swirl = Math.sin((i + seed) * 0.7) * 0.5 + 0.5;
    const base = lerpColor(theme.walnutA, theme.walnutB, swirl * 0.35 + rng() * 0.15);
    const band = lerpColor(base, theme.walnutHighlight, 0.08 + (rng() - 0.5) * 0.06);

    if (axis === "vertical") {
      const x0 = x + t0 * width;
      const x1 = x + t1 * width;
      g.fillStyle(band, 1);
      g.fillRect(x0, y, x1 - x0 + 1, height);
    } else {
      const y0 = y + t0 * height;
      const y1 = y + t1 * height;
      g.fillStyle(band, 1);
      g.fillRect(x, y0, width, y1 - y0 + 1);
    }
  }

  const grainLines = Math.floor(long / 55) + 4;
  for (let i = 0; i < grainLines; i++) {
    const along = long * ((i + 0.5) / grainLines) + (rng() - 0.5) * 18;
    const alpha = 0.05 + rng() * 0.05;
    g.lineStyle(1, rng() < 0.3 ? theme.walnutGrainLight : theme.walnutGrain, alpha);

    g.beginPath();
    if (axis === "vertical") {
      const gx = x + short * (0.2 + rng() * 0.6);
      g.moveTo(gx, y + 4);
      let py = y + 4;
      while (py < y + height - 4) {
        py += 22 + rng() * 20;
        const wobble = (rng() - 0.5) * 10;
        g.lineTo(gx + wobble, py);
      }
      g.strokePath();
    } else {
      const gy = y + along;
      g.moveTo(x + 4, gy);
      let px = x + 4;
      while (px < x + width - 4) {
        px += 24 + rng() * 22;
        const wobble = Math.sin(px * 0.02 + i) * 2.5 + (rng() - 0.5) * 2;
        g.lineTo(px, gy + wobble);
      }
      g.strokePath();
    }
  }

  if (axis === "vertical") {
    g.fillStyle(theme.walnutShadow, 0.28);
    g.fillRect(x + width - Math.min(10, short * 0.35), y, Math.min(10, short * 0.35), height);
  } else {
    g.fillStyle(theme.walnutShadow, 0.15);
    g.fillRect(x, y, width, Math.min(6, short * 0.2));
  }
}