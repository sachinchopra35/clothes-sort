import Phaser from "phaser";
import {
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  SIDE_PANEL_WIDTH,
} from "../config/layout";
import { theme } from "../config/theme";
import { drawWalnutWood } from "./wardrobeWalnutTrim";

const CROWN_HEIGHT = 48;
const PLINTH_HEIGHT = 56;

export function drawWardrobeFrame(g: Phaser.GameObjects.Graphics): void {
  drawWalnutWood(g, 0, 0, SIDE_PANEL_WIDTH, DESIGN_HEIGHT, "vertical", 0x5a31);
  drawWalnutWood(
    g,
    DESIGN_WIDTH - SIDE_PANEL_WIDTH,
    0,
    SIDE_PANEL_WIDTH,
    DESIGN_HEIGHT,
    "vertical",
    0x5a32,
  );

  const innerH = DESIGN_HEIGHT - CROWN_HEIGHT - PLINTH_HEIGHT;
  drawWalnutWood(g, SIDE_PANEL_WIDTH - 12, CROWN_HEIGHT, 12, innerH, "vertical", 0x5a33);
  drawWalnutWood(
    g,
    DESIGN_WIDTH - SIDE_PANEL_WIDTH,
    CROWN_HEIGHT,
    12,
    innerH,
    "vertical",
    0x5a34,
  );

  drawWalnutWood(g, 0, 0, DESIGN_WIDTH, CROWN_HEIGHT, "horizontal", 0xc70e);
  drawWalnutWood(
    g,
    0,
    DESIGN_HEIGHT - PLINTH_HEIGHT,
    DESIGN_WIDTH,
    PLINTH_HEIGHT,
    "horizontal",
    0xc70f,
  );

  g.lineStyle(1, theme.walnutGrainLight, 0.35);
  g.beginPath();
  g.moveTo(0, CROWN_HEIGHT);
  g.lineTo(DESIGN_WIDTH, CROWN_HEIGHT);
  g.strokePath();
}

/** Walnut stiles + crown/plinth drawn above mid-layer content (e.g. menu marquees). */
export class WardrobeFrameOverlay extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);

    const g = scene.add.graphics();
    drawWardrobeFrame(g);
    this.add(g);
  }
}