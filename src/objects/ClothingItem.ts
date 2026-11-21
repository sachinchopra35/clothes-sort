import Phaser from "phaser";
import { CLOTHING_DISPLAY_SCALE, SLOT_SIZE } from "../config/layout";
import type { ClothingId } from "../game/clothing";
import { CLOTHING_CATALOG } from "../game/clothing";

/** Moves with less horizontal travel than this are treated as vertical (no tilt). */
const MIN_TILT_HORIZONTAL_PX = 10;
const MAX_MOVE_TILT_DEG = 14;
const LIFT_Y = -24;
const LIFT_SCALE = 1.11;
const LIFT_DEPTH_BOOST = 36;
const LIFT_MS = 120;
/** Warm cream; kept very faint so selection reads subconsciously. */
const GLOW_TINT = 0xfff4e6;
const GLOW_ALPHA = 0.14;

export class ClothingItem extends Phaser.GameObjects.Container {
  readonly clothingId: ClothingId;
  private readonly image: Phaser.GameObjects.Image;
  private readonly glowGfx: Phaser.GameObjects.Graphics;
  private readonly glowStrength = { a: 0 };
  private readonly displayScale: number;
  private restingDepth = 0;
  private lifted = false;
  private baseY: number;
  private moveTween: Phaser.Tweens.Tween | null = null;
  private resolveMove: (() => void) | null = null;

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
    this.displayScale = (SLOT_SIZE * CLOTHING_DISPLAY_SCALE) / this.image.width;
    this.image.setScale(this.displayScale);
    this.glowGfx = scene.add.graphics();
    this.add([this.glowGfx, this.image]);
    this.setSize(SLOT_SIZE, SLOT_SIZE);
  }

  private drawSoftGlow(alpha: number): void {
    const g = this.glowGfx;
    g.clear();
    if (alpha < 0.004) return;
    const outerW = SLOT_SIZE * 1.04;
    const outerH = SLOT_SIZE * 0.98;
    const innerW = SLOT_SIZE * 0.84;
    const innerH = SLOT_SIZE * 0.8;
    g.fillStyle(GLOW_TINT, alpha * 0.5);
    g.fillEllipse(0, 2, outerW, outerH);
    g.fillStyle(GLOW_TINT, alpha * 0.35);
    g.fillEllipse(0, 0, innerW, innerH);
  }

  setRestingDepth(depth: number): void {
    this.restingDepth = depth;
    if (!this.lifted) this.setDepth(depth);
  }

  setLifted(lift: boolean): void {
    if (this.lifted === lift) return;
    this.lifted = lift;
    // Mid-flight: let the move land, then apply the lift (killing it would strand the move).
    if (this.moveTween) return;
    this.tweenLift();
  }

  private tweenLift(): void {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.killTweensOf(this.glowStrength);
    this.rotation = 0;
    const lifted = this.lifted;
    this.setDepth(lifted ? this.restingDepth + LIFT_DEPTH_BOOST : this.restingDepth);
    this.scene.tweens.add({
      targets: this,
      y: this.baseY + (lifted ? LIFT_Y : 0),
      scale: lifted ? LIFT_SCALE : 1,
      duration: LIFT_MS,
      ease: "Quad.out",
    });
    this.scene.tweens.add({
      targets: this.glowStrength,
      a: lifted ? GLOW_ALPHA : 0,
      duration: LIFT_MS,
      ease: "Quad.out",
      onUpdate: () => this.drawSoftGlow(this.glowStrength.a),
      onComplete: () => this.drawSoftGlow(this.glowStrength.a),
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
    // Re-moved before landing: settle the previous move's promise so its awaiter continues.
    this.resolveMove?.();
    this.resolveMove = null;
    this.moveTween = null;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.killTweensOf(this.glowStrength);
    this.glowStrength.a = 0;
    this.drawSoftGlow(0);
    this.setDepth(this.restingDepth);
    this.rotation = 0;
    this.baseY = y;
    return new Promise((resolve) => {
      this.resolveMove = resolve;
      this.moveTween = this.scene.tweens.add({
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
          this.moveTween = null;
          this.resolveMove = null;
          if (this.lifted) this.tweenLift();
          resolve();
        },
      });
    });
  }

  destroy(fromScene?: boolean): void {
    this.resolveMove?.();
    this.resolveMove = null;
    this.moveTween = null;
    super.destroy(fromScene);
  }

}
