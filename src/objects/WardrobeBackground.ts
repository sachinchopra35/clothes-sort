import Phaser from "phaser";
import {
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  SIDE_PANEL_WIDTH,
} from "../config/layout";
import { theme, WARDROBE_SHOW_GRAIN } from "../config/theme";

const PLANK_SEAM_EVERY = 180;
const CROWN_HEIGHT = 48;
const PLINTH_HEIGHT = 56;

export type WardrobeBackgroundOptions = {
  showGrain?: boolean;
  dimOverlay?: number;
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

    this.draw(options.showGrain ?? WARDROBE_SHOW_GRAIN);

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

  private draw(showGrain: boolean): void {
    const g = this.gfx;
    g.clear();

    this.drawBackWall(g);
    if (showGrain) this.drawGrain(g);
    this.drawPlankSeams(g);
    this.drawSidePanels(g);
    this.drawCrownAndPlinth(g);
  }

  private drawBackWall(g: Phaser.GameObjects.Graphics): void {
    const steps = 32;
    const wallLeft = SIDE_PANEL_WIDTH;
    const wallWidth = DESIGN_WIDTH - SIDE_PANEL_WIDTH * 2;
    const wallTop = CROWN_HEIGHT;
    const wallHeight = DESIGN_HEIGHT - CROWN_HEIGHT - PLINTH_HEIGHT;

    const top = Phaser.Display.Color.IntegerToColor(theme.backWallTop);
    const bottom = Phaser.Display.Color.IntegerToColor(theme.backWallBottom);

    for (let i = 0; i < steps; i++) {
      const t0 = i / steps;
      const t1 = (i + 1) / steps;
      const c0 = Phaser.Display.Color.Interpolate.ColorWithColor(
        top,
        bottom,
        steps,
        i,
      );
      const color = Phaser.Display.Color.GetColor(c0.r, c0.g, c0.b);
      const y0 = wallTop + t0 * wallHeight;
      const y1 = wallTop + t1 * wallHeight;
      g.fillStyle(color, 1);
      g.fillRect(wallLeft, y0, wallWidth, y1 - y0 + 1);
    }
  }

  private drawPlankSeams(g: Phaser.GameObjects.Graphics): void {
    const wallLeft = SIDE_PANEL_WIDTH;
    const wallRight = DESIGN_WIDTH - SIDE_PANEL_WIDTH;
    const wallTop = CROWN_HEIGHT;
    const wallBottom = DESIGN_HEIGHT - PLINTH_HEIGHT;

    g.lineStyle(2, theme.plankSeam, 0.35);
    for (let x = wallLeft + PLANK_SEAM_EVERY; x < wallRight; x += PLANK_SEAM_EVERY) {
      g.beginPath();
      g.moveTo(x, wallTop);
      g.lineTo(x, wallBottom);
      g.strokePath();
    }
  }

  private drawGrain(g: Phaser.GameObjects.Graphics): void {
    const wallLeft = SIDE_PANEL_WIDTH + 20;
    const wallRight = DESIGN_WIDTH - SIDE_PANEL_WIDTH - 20;
    const wallTop = CROWN_HEIGHT + 40;
    const wallBottom = DESIGN_HEIGHT - PLINTH_HEIGHT - 40;

    g.lineStyle(1, theme.grainLine, 0.08);
    let y = wallTop;
    let phase = 0;
    while (y < wallBottom) {
      g.beginPath();
      let x = wallLeft;
      g.moveTo(x, y);
      while (x < wallRight) {
        phase += 0.15;
        x += 40;
        const wobble = Math.sin(phase) * 6;
        g.lineTo(x, y + wobble);
      }
      g.strokePath();
      y += 48;
      phase += 0.4;
    }
  }

  private drawSidePanels(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(theme.sidePanel, 1);
    g.fillRect(0, 0, SIDE_PANEL_WIDTH, DESIGN_HEIGHT);
    g.fillRect(DESIGN_WIDTH - SIDE_PANEL_WIDTH, 0, SIDE_PANEL_WIDTH, DESIGN_HEIGHT);

    g.fillStyle(theme.sidePanelShadow, 0.25);
    g.fillRect(SIDE_PANEL_WIDTH - 12, CROWN_HEIGHT, 12, DESIGN_HEIGHT - CROWN_HEIGHT - PLINTH_HEIGHT);
    g.fillRect(
      DESIGN_WIDTH - SIDE_PANEL_WIDTH,
      CROWN_HEIGHT,
      12,
      DESIGN_HEIGHT - CROWN_HEIGHT - PLINTH_HEIGHT,
    );
  }

  private drawCrownAndPlinth(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(theme.crownTrim, 1);
    g.fillRect(0, 0, DESIGN_WIDTH, CROWN_HEIGHT);
    g.fillStyle(theme.bottomPlinth, 1);
    g.fillRect(0, DESIGN_HEIGHT - PLINTH_HEIGHT, DESIGN_WIDTH, PLINTH_HEIGHT);

    g.lineStyle(2, theme.plankSeam, 0.5);
    g.beginPath();
    g.moveTo(0, CROWN_HEIGHT);
    g.lineTo(DESIGN_WIDTH, CROWN_HEIGHT);
    g.strokePath();
  }
}
