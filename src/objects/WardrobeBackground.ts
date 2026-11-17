import Phaser from "phaser";
import {
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  SIDE_PANEL_WIDTH,
} from "../config/layout";
import { theme, WARDROBE_SHOW_GRAIN } from "../config/theme";
import { drawWardrobeFrame } from "./wardrobeFrame";
import { drawTeakBackWall } from "./wardrobeWoodBack";

const CROWN_HEIGHT = 48;
const PLINTH_HEIGHT = 56;

export type WardrobeBackgroundOptions = {
  showGrain?: boolean;
  dimOverlay?: number;
  /** Teak center only; draw {@link WardrobeFrameOverlay} on top of mid-layer UI. */
  backOnly?: boolean;
};

export class WardrobeBackground extends Phaser.GameObjects.Container {
  private gfx: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    options: WardrobeBackgroundOptions = {},
  ) {
    super(scene, 0, 0);
    scene.add.existing(this);

    this.gfx = scene.add.graphics();
    this.add(this.gfx);

    this.draw(
      options.showGrain ?? WARDROBE_SHOW_GRAIN,
      options.backOnly ?? false,
    );

    const dim = options.dimOverlay;
    if (dim != null && dim > 0) {
      const overlay = scene.add.rectangle(
        DESIGN_WIDTH / 2,
        DESIGN_HEIGHT / 2,
        DESIGN_WIDTH,
        DESIGN_HEIGHT,
        theme.ui.overlayDim,
        dim,
      );
      this.add(overlay);
    }
  }

  private draw(showGrain: boolean, backOnly: boolean): void {
    const g = this.gfx;
    g.clear();

    this.drawBackWall(g, showGrain);
    if (!backOnly) {
      drawWardrobeFrame(g);
    }
  }

  private drawBackWall(g: Phaser.GameObjects.Graphics, showGrain: boolean): void {
    const wallLeft = SIDE_PANEL_WIDTH;
    const wallWidth = DESIGN_WIDTH - SIDE_PANEL_WIDTH * 2;
    const wallTop = CROWN_HEIGHT;
    const wallHeight = DESIGN_HEIGHT - CROWN_HEIGHT - PLINTH_HEIGHT;

    drawTeakBackWall(g, wallLeft, wallTop, wallWidth, wallHeight, showGrain);
  }

}
