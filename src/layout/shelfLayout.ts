import type { LayoutConfig } from "../config/layout";
import {
  DEFAULT_LAYOUT_CONFIG as layoutDefaults,
  DESIGN_WIDTH,
  SIDE_PANEL_WIDTH,
  shelfZoneBounds,
} from "../config/layout";
import type { ShelfDefinition } from "../levels/levelTypes";

export interface ShelfLayoutEntry {
  definition: ShelfDefinition;
  x: number;
  y: number;
  width: number;
  side: ShelfDefinition["side"];
}

function shelvesForSide(
  shelves: ShelfDefinition[],
  side: ShelfDefinition["side"],
): ShelfDefinition[] {
  return shelves.filter((s) => s.side === side);
}

function columnBlockHeight(count: number, rowStep: number): number {
  if (count <= 1) return 0;
  return (count - 1) * rowStep;
}

/**
 * Places shelves in left/right columns with fixed row spacing, a clear top band,
 * and room for floor decor. Right column is staggered by half a row step.
 */
export function computeShelfLayout(
  shelves: ShelfDefinition[],
  config: LayoutConfig = layoutDefaults,
): ShelfLayoutEntry[] {
  const zone = shelfZoneBounds(config);
  const shelfWidth = Math.floor(zone.width * config.shelfWidthRatio);
  const rowStep = config.shelfRowStep;
  const stagger = rowStep / 2;

  const leftShelves = shelvesForSide(shelves, "left");
  const rightShelves = shelvesForSide(shelves, "right");

  const leftBlock = columnBlockHeight(leftShelves.length, rowStep);
  const rightBlock =
    rightShelves.length > 0
      ? stagger + columnBlockHeight(rightShelves.length, rowStep)
      : 0;
  const blockHeight = Math.max(leftBlock, rightBlock, 0);

  const startY = zone.y + Math.max(0, (zone.height - blockHeight) / 2);
  const entries: ShelfLayoutEntry[] = [];

  const placeColumn = (
    columnShelves: ShelfDefinition[],
    side: ShelfDefinition["side"],
    yOffset: number,
  ) => {
    const x =
      side === "left"
        ? SIDE_PANEL_WIDTH
        : DESIGN_WIDTH - SIDE_PANEL_WIDTH - shelfWidth;

    columnShelves.forEach((definition, index) => {
      const y = startY + yOffset + index * rowStep;
      entries.push({
        definition,
        x,
        y,
        width: shelfWidth,
        side,
      });
    });
  };

  placeColumn(leftShelves, "left", 0);
  placeColumn(rightShelves, "right", stagger);

  return entries;
}
