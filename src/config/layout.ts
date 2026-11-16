export const DESIGN_WIDTH = 1080;
export const DESIGN_HEIGHT = 1920;

/** In-game HUD (top bar buttons, level title). */
export const GAME_HUD_DEPTH = 10_001;

/** Modals that must sit above gameplay and the in-game HUD. */
export const MODAL_UI_DEPTH = 20_000;

/** Width of side wardrobe panels (shelves attach here). */
export const SIDE_PANEL_WIDTH = 72;

/** Play area below top bar / above bottom margin. */
export const TOP_BAR_HEIGHT = 140;
export const BOTTOM_MARGIN = 80;

/** Clear space under the top bar before the first shelf row. */
export const SHELF_ZONE_TOP_INSET = 200;

/** Floor space reserved for plinth + decorative dog pile (not gameplay). */
export const FLOOR_DECOR_HEIGHT = 360;

/** Fixed vertical distance between shelf rows in the same column. */
export const SHELF_ROW_STEP = 228;
export const HORIZONTAL_PLAY_MARGIN = 24;

export const SHELF_DEPTH = 28;
export const SHELF_PLANK_HEIGHT = 22;
export const SHELF_BRACKET_WIDTH = 16;
export const SHELF_WIDTH_RATIO = 0.44;

/** Legacy alias — layout uses SHELF_ROW_STEP for shelf rows. */
export const SHELF_ROW_GAP = SHELF_ROW_STEP;

/**
 * Clothing on a shelf: wall (index 0) → open end (last index).
 * Items overlap along the shelf; open-end slots use higher depth (drawn in front).
 */
export const SLOT_SIZE = 122;
/** Center-to-center spacing along the shelf (less than SLOT_SIZE → overlap). */
export const SLOT_PITCH = 58;
/** @deprecated Use SLOT_PITCH; kept for tests that referenced gap. */
export const SLOT_GAP = SLOT_PITCH;
/** Display scale relative to SLOT_SIZE (game sprites, not hit box). */
export const CLOTHING_DISPLAY_SCALE = 1.02;

/** Phaser depth for a clothing sprite on a shelf (open end = front). */
export function clothingDepthOnShelf(shelfY: number, slotIndex: number): number {
  return shelfY + 20 + slotIndex * 4;
}

export interface LayoutConfig {
  designWidth: number;
  designHeight: number;
  sidePanelWidth: number;
  topBarHeight: number;
  bottomMargin: number;
  horizontalPlayMargin: number;
  shelfWidthRatio: number;
  shelfRowGap: number;
  shelfZoneTopInset: number;
  floorDecorHeight: number;
  shelfRowStep: number;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  designWidth: DESIGN_WIDTH,
  designHeight: DESIGN_HEIGHT,
  sidePanelWidth: SIDE_PANEL_WIDTH,
  topBarHeight: TOP_BAR_HEIGHT,
  bottomMargin: BOTTOM_MARGIN,
  horizontalPlayMargin: HORIZONTAL_PLAY_MARGIN,
  shelfWidthRatio: SHELF_WIDTH_RATIO,
  shelfRowGap: SHELF_ROW_GAP,
  shelfZoneTopInset: SHELF_ZONE_TOP_INSET,
  floorDecorHeight: FLOOR_DECOR_HEIGHT,
  shelfRowStep: SHELF_ROW_STEP,
};

export function playAreaBounds(config: LayoutConfig = DEFAULT_LAYOUT_CONFIG): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const x = config.horizontalPlayMargin;
  const y = config.topBarHeight;
  const width = config.designWidth - config.horizontalPlayMargin * 2;
  const height =
    config.designHeight - config.topBarHeight - config.bottomMargin;
  return { x, y, width, height };
}

/** Vertical band where shelves are placed (clear top, floor decor at bottom). */
export function shelfZoneBounds(config: LayoutConfig = DEFAULT_LAYOUT_CONFIG): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const area = playAreaBounds(config);
  const y = area.y + config.shelfZoneTopInset;
  const height = area.height - config.shelfZoneTopInset - config.floorDecorHeight;
  return { x: area.x, y, width: area.width, height: Math.max(height, 0) };
}
