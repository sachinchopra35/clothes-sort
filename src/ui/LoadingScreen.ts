import Phaser from "phaser";
import { CLOTHING_DISPLAY_SCALE, DESIGN_HEIGHT, DESIGN_WIDTH, SLOT_SIZE } from "../config/layout";
import { CLOTHING_CATALOG, type ClothingId } from "../game/clothing";
import { theme } from "../config/theme";
import { WardrobeBackground } from "../objects/WardrobeBackground";

export const LOADING_SPLASH_MS = 4500;

const BAR_W = 560;
const BAR_H = 42;
const BAR_RADIUS = 21;
const BAR_INSET = 5;

const CLOTHING_TEXTURE_PX = 192;

/** Splash clothing sits in a looser ring around the title — not hugging screen edges. */
const DECOR_SCALE = 1.78;

const DECOR: { id: ClothingId; x: number; y: number; rotationDeg: number; scale?: number }[] = [
  { id: "red-polka-dress", x: 318, y: 560, rotationDeg: -13 },
  { id: "brown-leather-jacket", x: 762, y: 598, rotationDeg: 15 },
  { id: "purple-socks", x: 332, y: 1368, rotationDeg: 11 },
  { id: "white-tee", x: 748, y: 1332, rotationDeg: -17 },
];

function clothingDisplayScale(extra = 1): number {
  return ((SLOT_SIZE * CLOTHING_DISPLAY_SCALE) / CLOTHING_TEXTURE_PX) * extra * DECOR_SCALE;
}

export class LoadingScreen extends Phaser.GameObjects.Container {
  private readonly barFillGfx: Phaser.GameObjects.Graphics;
  private readonly drawBarFill: (width: number) => void;
  private running: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    const bg = new WardrobeBackground(scene, { dimOverlay: 0.22 });
    this.add(bg);

    const cx = DESIGN_WIDTH / 2;
    const titleY = DESIGN_HEIGHT / 2 - 48;
    const barY = DESIGN_HEIGHT / 2 + 100;

    for (const d of DECOR) {
      const key = CLOTHING_CATALOG[d.id].textureKey;
      const img = scene.add.image(d.x, d.y, key);
      img.setScale(clothingDisplayScale(d.scale ?? 1));
      img.setRotation(Phaser.Math.DEG_TO_RAD * d.rotationDeg);
      img.setAlpha(0.92);
      this.add(img);
    }

    const title = scene.add.text(cx, titleY, "Clothes Sort", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.title,
      color: theme.ui.text,
      stroke: "#5c3d28",
      strokeThickness: 6,
    });
    title.setOrigin(0.5);
    this.add(title);

    const barLeft = cx - BAR_W / 2;
    const track = scene.add.graphics();
    track.fillStyle(theme.ui.panelFill, 1);
    track.fillRoundedRect(barLeft, barY - BAR_H / 2, BAR_W, BAR_H, BAR_RADIUS);
    track.lineStyle(3, theme.ui.panelStroke, 1);
    track.strokeRoundedRect(barLeft, barY - BAR_H / 2, BAR_W, BAR_H, BAR_RADIUS);
    this.add(track);

    const fillLeft = barLeft + BAR_INSET;
    const fillTop = barY - BAR_H / 2 + BAR_INSET;
    const fillHeight = BAR_H - BAR_INSET * 2;
    const fillRadius = BAR_RADIUS - BAR_INSET;

    this.barFillGfx = scene.add.graphics();
    this.drawBarFill = (width: number) => {
      this.barFillGfx.clear();
      if (width <= 0.5) return;
      const r = Math.min(fillRadius, width / 2);
      this.barFillGfx.fillStyle(theme.ui.buttonFill, 1);
      this.barFillGfx.fillRoundedRect(fillLeft, fillTop, width, fillHeight, r);
    };
    this.drawBarFill(0);
    this.add(this.barFillGfx);

    const loadingLabel = scene.add.text(cx, barY + BAR_H / 2 + 36, "Loading…", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: theme.ui.textMuted,
    });
    loadingLabel.setOrigin(0.5);
    this.add(loadingLabel);

    scene.add.existing(this);
  }

  /** Shows the splash and resolves after `durationMs` (default 4.5s). */
  run(durationMs = LOADING_SPLASH_MS): Promise<void> {
    const fillW = BAR_W - BAR_INSET * 2;
    const progress = { width: 0 };
    return new Promise((resolve) => {
      this.running = this.scene.tweens.add({
        targets: progress,
        width: fillW,
        duration: durationMs,
        ease: "Sine.inOut",
        onUpdate: () => this.drawBarFill(progress.width),
        onComplete: () => {
          this.drawBarFill(fillW);
          this.running = null;
          resolve();
        },
      });
    });
  }

  destroy(fromScene?: boolean): void {
    this.running?.stop();
    this.running = null;
    super.destroy(fromScene);
  }
}