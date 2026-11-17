import Phaser from "phaser";
import { CLOTHING_DISPLAY_SCALE, SLOT_SIZE } from "../config/layout";
import type { ClothingId } from "../game/clothing";
import { CLOTHING_CATALOG } from "../game/clothing";

/** Moves with less horizontal travel than this are treated as vertical (no tilt). */
const MIN_TILT_HORIZONTAL_PX = 10;
const MAX_MOVE_TILT_DEG = 14;

export class ClothingItem extends Phaser.GameObjects.Container {
  readonly clothingId: ClothingId;
  private readonly image: Phaser.GameObjects.Image;
  private lifted = false;
  private baseY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    clothingId: ClothingId,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.baseY = y;

    this.clothingId = clothingId;
    const key = CLOTHING_CATALOG[clothingId].textureKey;
    this.image = scene.add.image(0, 0, key);
    const scale = (SLOT_SIZE * CLOTHING_DISPLAY_SCALE) / this.image.width;
    this.image.setScale(scale);
    this.add(this.image);
    this.setSize(SLOT_SIZE, SLOT_SIZE);
  }

  setLifted(lift: boolean): void {
    if (this.lifted === lift) return;
    this.lifted = lift;
    this.scene.tweens.killTweensOf(this);
    this.rotation = 0;
    this.scene.tweens.add({
      targets: this,
      y: this.baseY + (lift ? -22 : 0),
      scale: lift ? 1.06 : 1,
      duration: 120,
      ease: "Quad.out",
    });
  }

  animateTo(x: number, y: number, duration = 220): Promise<void> {
    const dx = x - this.x;
    const horizontal =
      Math.abs(dx) >= MIN_TILT_HORIZONTAL_PX
        ? Math.sign(dx)
        : 0;
    const maxTilt =
      horizontal !== 0
        ? horizontal * Phaser.Math.DEG_TO_RAD * MAX_MOVE_TILT_DEG
        : 0;

    this.lifted = false;
    this.scene.tweens.killTweensOf(this);
    this.rotation = 0;
    this.baseY = y;
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        x,
        y,
        scale: 1,
        duration,
        ease: "Quad.out",
        onUpdate: (tween) => {
          if (maxTilt === 0) {
            this.rotation = 0;
            return;
          }
          const envelope = Math.sin(tween.progress * Math.PI);
          this.rotation = maxTilt * envelope;
        },
        onComplete: () => {
          this.rotation = 0;
          resolve();
        },
      });
    });
  }

}
