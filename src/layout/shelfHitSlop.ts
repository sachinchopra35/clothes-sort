import { SHELF_ROW_STEP, SHELF_PLANK_HEIGHT, SLOT_SIZE } from "../config/layout";
import type { ShelfLayoutEntry } from "./shelfLayout";

export interface ShelfHitSlop {
  /** Toward wardrobe stile. */
  wall: number;
  /** Toward centre of play area (open end). */
  open: number;
  /** Above the clothes stack. */
  above: number;
  /** Below the plank. */
  below: number;
}

const MIN_GAP_BETWEEN_ZONES = 10;
/** Base hit band (matches legacy Shelf before extra slop). */
const CORE_HIT_H = SLOT_SIZE + SHELF_PLANK_HEIGHT + 40;
const CORE_HIT_HALF = CORE_HIT_H / 2;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Forgiving tap targets when shelves are sparse; tightens as columns fill up
 * and when another shelf is nearby (same column or opposite).
 */
export function computeShelfHitSlops(
  entries: ShelfLayoutEntry[],
  rowStep = SHELF_ROW_STEP,
): Map<string, ShelfHitSlop> {
  const n = entries.length;
  const crowded = clamp((n - 4) / (10 - 4), 0, 1);

  const maxOpen = lerp(52, 16, crowded);
  const maxAbove = lerp(72, 28, crowded);
  const maxBelow = lerp(44, 22, crowded);
  const maxWall = lerp(24, 10, crowded);

  const leftCol = entries.find((e) => e.side === "left");
  const rightCol = entries.find((e) => e.side === "right");
  const centerGap =
    leftCol && rightCol ? rightCol.x - (leftCol.x + leftCol.width) : Infinity;

  const out = new Map<string, ShelfHitSlop>();

  for (const entry of entries) {
    let open = maxOpen;
    let wall = maxWall;
    let above = maxAbove;
    let below = maxBelow;

    if (Number.isFinite(centerGap)) {
      open = Math.min(open, Math.max(8, (centerGap - MIN_GAP_BETWEEN_ZONES) / 2));
    }

    for (const other of entries) {
      if (other.definition.id === entry.definition.id) continue;

      if (other.side === entry.side) {
        const dy = other.y - entry.y;
        if (dy > 0) {
          const room = (dy - MIN_GAP_BETWEEN_ZONES) / 2 - CORE_HIT_HALF;
          below = Math.min(below, room);
        } else if (dy < 0) {
          const room = (-dy - MIN_GAP_BETWEEN_ZONES) / 2 - CORE_HIT_HALF;
          above = Math.min(above, room);
        }
      } else {
        const dy = Math.abs(other.y - entry.y);
        if (dy < rowStep * 0.85) {
          const tighten = lerp(1, 0.55, crowded);
          open = Math.min(open, maxOpen * tighten);
        }
      }
    }

    above = clamp(above, 12, maxAbove);
    below = clamp(below, 10, maxBelow);
    open = clamp(open, 8, maxOpen);
    wall = clamp(wall, 6, maxWall);

    out.set(entry.definition.id, { wall, open, above, below });
  }

  return out;
}