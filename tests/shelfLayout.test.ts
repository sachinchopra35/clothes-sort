import { describe, expect, it } from "vitest";
import { computeShelfLayout } from "../src/layout/shelfLayout";
import {
  DEFAULT_LAYOUT_CONFIG,
  SHELF_ROW_STEP,
  SHELF_WALL_INSET,
  SHELF_ZONE_TOP_INSET,
  SLOT_SIZE,
  slotPitchForShelf,
  playAreaBounds,
  shelfZoneBounds,
} from "../src/config/layout";
import type { ShelfDefinition } from "../src/levels/levelTypes";
import { LEVELS } from "../src/levels/levelData";

describe("computeShelfLayout", () => {
  it("splits shelves into left and right columns", () => {
    const layout = computeShelfLayout(LEVELS[0].shelves);
    const left = layout.filter((e) => e.side === "left");
    const right = layout.filter((e) => e.side === "right");
    expect(left).toHaveLength(2);
    expect(right).toHaveLength(1);
  });

  it("keeps the first shelf below the top clear band", () => {
    const layout = computeShelfLayout(LEVELS[0].shelves);
    const zone = shelfZoneBounds();
    const area = playAreaBounds();
    const left = layout
      .filter((e) => e.side === "left")
      .sort((a, b) => a.y - b.y)[0];
    expect(left.y).toBeGreaterThanOrEqual(area.y + SHELF_ZONE_TOP_INSET);
    expect(left.y).toBeGreaterThanOrEqual(zone.y);
  });

  it("uses fixed row step within a column", () => {
    const shelves: ShelfDefinition[] = [
      { id: "l1", side: "left", capacity: 4, items: [] },
      { id: "l2", side: "left", capacity: 4, items: [] },
    ];
    const layout = computeShelfLayout(shelves);
    const left = layout.filter((e) => e.side === "left").sort((a, b) => a.y - b.y);
    expect(left[1].y - left[0].y).toBe(SHELF_ROW_STEP);
  });

  it("staggers right column by half a row step", () => {
    const shelves: ShelfDefinition[] = [
      { id: "l1", side: "left", capacity: 4, items: [] },
      { id: "r1", side: "right", capacity: 4, items: [] },
    ];
    const layout = computeShelfLayout(shelves);
    const left = layout.find((e) => e.side === "left")!;
    const right = layout.find((e) => e.side === "right")!;
    expect(right.y - left.y).toBeCloseTo(SHELF_ROW_STEP / 2, 0);
  });

  it("keeps every level's shelves inside the shelf zone", () => {
    const zone = shelfZoneBounds();
    for (const level of LEVELS) {
      for (const entry of computeShelfLayout(level.shelves)) {
        expect(entry.y, level.id).toBeGreaterThanOrEqual(zone.y);
        expect(entry.y, level.id).toBeLessThanOrEqual(zone.y + zone.height);
      }
    }
  });

  it("keeps a full 5-item shelf row clear of the opposite column", () => {
    const layout = computeShelfLayout(LEVELS[0].shelves);
    const left = layout.find((e) => e.side === "left")!;
    const right = layout.find((e) => e.side === "right")!;
    const span =
      SHELF_WALL_INSET + SLOT_SIZE + 4 * slotPitchForShelf(left.width, 5);
    expect(left.x + span).toBeLessThan(right.x);
  });

  it("anchors shelves to side panels", () => {
    const layout = computeShelfLayout(LEVELS[0].shelves);
    const left = layout.find((e) => e.side === "left")!;
    const right = layout.find((e) => e.side === "right")!;
    expect(left.x).toBe(DEFAULT_LAYOUT_CONFIG.sidePanelWidth);
    expect(right.x + right.width).toBe(
      DEFAULT_LAYOUT_CONFIG.designWidth - DEFAULT_LAYOUT_CONFIG.sidePanelWidth,
    );
  });
});
