import Phaser from "phaser";
import {
  BOTTOM_MARGIN,
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  GAME_HUD_DEPTH,
  SHELF_PLANK_HEIGHT,
} from "../config/layout";
import { theme } from "../config/theme";
import type { ShelfLayoutEntry } from "../layout/shelfLayout";

const PANEL_W = 940;
const PANEL_PAD_X = 40;
const PANEL_PAD_Y = 32;
const TITLE_FONT_PX = 52;
const BODY_FONT_PX = 46;
const TITLE_TO_BODY = 18;
const BULLET_GAP = 16;
const BULLET_INDENT = 28;
const GAP_INSET = 28;

export interface ShelfBandHintContent {
  title?: string;
  lines: readonly string[];
}

/** Hint panel centred in the gap below the lowest shelf. */
export class ShelfBandHintPanel {
  private readonly container: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    layout: ShelfLayoutEntry[],
    content: ShelfBandHintContent,
  ) {
    const contentW = PANEL_W - PANEL_PAD_X * 2;
    const children: Phaser.GameObjects.GameObject[] = [];
    const leftX = -PANEL_W / 2 + PANEL_PAD_X;
    let y = PANEL_PAD_Y;

    if (content.title) {
      const title = scene.add.text(0, y, content.title, {
        fontFamily: theme.fontFamily,
        fontSize: `${TITLE_FONT_PX}px`,
        color: theme.ui.text,
        align: "center",
      });
      title.setOrigin(0.5, 0);
      children.push(title);
      y += title.height + TITLE_TO_BODY;
    }

    const multiLine = content.lines.length > 1;
    for (const line of content.lines) {
      if (multiLine) {
        const dot = scene.add.circle(
          leftX + 8,
          y + BODY_FONT_PX * 0.52,
          5,
          0xfff8ef,
          0.45,
        );
        const text = scene.add.text(leftX + BULLET_INDENT, y, line, {
          fontFamily: theme.fontFamily,
          fontSize: `${BODY_FONT_PX}px`,
          color: theme.ui.textMuted,
          align: "left",
          wordWrap: { width: contentW - BULLET_INDENT },
        });
        text.setOrigin(0, 0);
        children.push(dot, text);
        y += text.height + BULLET_GAP;
      } else {
        const text = scene.add.text(0, y, line, {
          fontFamily: theme.fontFamily,
          fontSize: `${BODY_FONT_PX}px`,
          color: theme.ui.textMuted,
          align: "center",
          wordWrap: { width: contentW },
        });
        text.setOrigin(0.5, 0);
        children.push(text);
        y += text.height;
      }
    }

    const panelH = y + PANEL_PAD_Y;

    const bg = scene.add.graphics();
    bg.fillStyle(theme.ui.panelFill, 0.88);
    bg.fillRoundedRect(-PANEL_W / 2, 0, PANEL_W, panelH, 20);
    bg.lineStyle(2, theme.ui.panelStroke, 0.85);
    bg.strokeRoundedRect(-PANEL_W / 2, 0, PANEL_W, panelH, 20);
    children.unshift(bg);

    const maxShelfY = layout.reduce((m, e) => Math.max(m, e.y), 0);
    const shelfBottom = maxShelfY + SHELF_PLANK_HEIGHT + 16;
    const screenBottom = DESIGN_HEIGHT - BOTTOM_MARGIN;
    const bandMid =
      (shelfBottom + GAP_INSET + screenBottom - GAP_INSET) / 2;
    const containerY = bandMid - panelH / 2;

    this.container = scene.add.container(DESIGN_WIDTH / 2, containerY, children);
    this.container.setDepth(GAME_HUD_DEPTH - 1);
  }

  destroy(): void {
    this.container.destroy();
  }
}