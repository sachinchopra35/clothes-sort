import Phaser from "phaser";
import {
  CLOTHING_DISPLAY_SCALE,
  DESIGN_WIDTH,
  SIDE_PANEL_WIDTH,
  SLOT_SIZE,
} from "../config/layout";
import { CLOTHING_CATALOG, CLOTHING_IDS } from "../game/clothing";

const TEXTURE_PX = 192;
const ITEM_SCALE = ((SLOT_SIZE * CLOTHING_DISPLAY_SCALE) / TEXTURE_PX) * 0.86;
/** Idle drift (px/s) — +35% from the original 20 px/s. */
const SPEED_PX_PER_SEC = 27;
const ITEM_SPACING = 148;
const EDGE_PAD = 80;
/** High sanity ceiling only (design px/s; 1080 = 1 screen width). */
const MAX_FLICK_SPEED = 9000;
/**
 * Exponential momentum decay time constant (ms).
 * Matches iOS UIScrollView.DecelerationRate.normal (~500 ms: -1 / ln(0.998)).
 */
const FLICK_DECAY_MS = 480;
/** Recent pointer history window used to compute release velocity (ms). */
const VELOCITY_WINDOW_MS = 90;
/** If the finger rested longer than this before lifting, treat as a stop, not a flick (ms). */
const STOP_PAUSE_MS = 100;
/** Minimum opposite movement (design px) that resets velocity history on a reversal. */
const DIRECTION_FLIP_PX = 8;

interface DragSample {
  x: number;
  t: number;
}

export type MarqueeDirection = "left" | "right";

export interface MenuClothesMarqueeOptions {
  bandTop: number;
  bandHeight: number;
  direction: MarqueeDirection;
  /** Offset into CLOTHING_IDS so upper/lower strips differ. */
  clothingOffset?: number;
}

function pointerTimestamp(pointer: Phaser.Input.Pointer): number {
  return pointer.time > 0 ? pointer.time : performance.now();
}

export class MenuClothesMarquee extends Phaser.GameObjects.Container {
  private readonly items: Phaser.GameObjects.Image[] = [];
  private readonly baseSpeed: number;
  private readonly loopLength: number;
  private readonly centerY: number;
  private scrollPos = 0;
  private flickSpeed = 0;
  private dragging = false;
  private activePointerId: number | null = null;
  private lastPointerX = 0;
  private dragDirection = 0;
  private samples: DragSample[] = [];
  private readonly hitZone: Phaser.GameObjects.Zone;
  private readonly onUpdate = (_time: number, delta: number) => this.tick(delta);
  private readonly onScenePointerMove = (pointer: Phaser.Input.Pointer) =>
    this.handlePointerMove(pointer);
  private readonly onScenePointerUp = (pointer: Phaser.Input.Pointer) =>
    this.handlePointerUp(pointer);

  constructor(scene: Phaser.Scene, options: MenuClothesMarqueeOptions) {
    super(scene, 0, 0);
    scene.add.existing(this);

    const { bandTop, bandHeight, direction } = options;
    const clothingOffset = options.clothingOffset ?? 0;
    this.baseSpeed = direction === "left" ? -SPEED_PX_PER_SEC : SPEED_PX_PER_SEC;

    const maskShape = scene.make.graphics({ x: 0, y: 0 }, false);
    maskShape.fillStyle(0xffffff, 1);
    const playWidth = DESIGN_WIDTH - SIDE_PANEL_WIDTH * 2;
    maskShape.fillRect(SIDE_PANEL_WIDTH, bandTop, playWidth, bandHeight);
    const mask = maskShape.createGeometryMask();
    this.setMask(mask);

    this.centerY = bandTop + bandHeight / 2;
    const count = Math.ceil((DESIGN_WIDTH + EDGE_PAD * 2) / ITEM_SPACING) + 4;

    for (let i = 0; i < count; i++) {
      const id = CLOTHING_IDS[(clothingOffset + i) % CLOTHING_IDS.length]!;
      const key = CLOTHING_CATALOG[id].textureKey;
      const img = scene.add.image(0, this.centerY, key);
      img.setScale(ITEM_SCALE);
      const tilt = Phaser.Math.Between(-7, 7);
      img.setRotation(Phaser.Math.DEG_TO_RAD * tilt);
      img.setAlpha(0.9);
      this.add(img);
      this.items.push(img);
    }

    this.loopLength = this.items.length * ITEM_SPACING;
    this.layoutItems();

    this.hitZone = scene.add.zone(
      SIDE_PANEL_WIDTH + playWidth / 2,
      this.centerY,
      playWidth,
      bandHeight,
    );
    this.hitZone.setInteractive();
    this.add(this.hitZone);

    this.hitZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const now = pointerTimestamp(pointer);
      this.dragging = true;
      this.activePointerId = pointer.id;
      this.flickSpeed = 0;
      this.lastPointerX = pointer.x;
      this.dragDirection = 0;
      this.samples = [{ x: pointer.x, t: now }];
    });

    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onScenePointerMove);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onScenePointerUp);
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onScenePointerUp);

    scene.events.on(Phaser.Scenes.Events.UPDATE, this.onUpdate);
  }

  private recordSample(x: number, t: number, dx: number): void {
    const dir = Math.sign(dx);
    if (
      dir !== 0 &&
      this.dragDirection !== 0 &&
      dir !== this.dragDirection &&
      Math.abs(dx) >= DIRECTION_FLIP_PX
    ) {
      const prev = this.samples[this.samples.length - 1];
      this.samples = prev ? [prev, { x, t }] : [{ x, t }];
      this.dragDirection = dir;
    } else {
      if (dir !== 0 && Math.abs(dx) >= DIRECTION_FLIP_PX) {
        this.dragDirection = dir;
      }
      this.samples.push({ x, t });
    }

    const cutoff = t - VELOCITY_WINDOW_MS * 2;
    while (this.samples.length > 2 && this.samples[0]!.t < cutoff) {
      this.samples.shift();
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.dragging || pointer.id !== this.activePointerId) return;
    if (!pointer.isDown) {
      this.handlePointerUp(pointer);
      return;
    }
    const dx = pointer.x - this.lastPointerX;
    if (dx === 0) return;

    this.scrollPos += dx;
    this.layoutItems();
    this.lastPointerX = pointer.x;
    this.recordSample(pointer.x, pointerTimestamp(pointer), dx);
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (!this.dragging || pointer.id !== this.activePointerId) return;

    const upTime = pointerTimestamp(pointer);
    const finalDx = pointer.x - this.lastPointerX;
    if (finalDx !== 0) {
      this.scrollPos += finalDx;
      this.layoutItems();
      this.lastPointerX = pointer.x;
      this.recordSample(pointer.x, upTime, finalDx);
    }

    this.dragging = false;
    this.activePointerId = null;
    this.flickSpeed = this.computeReleaseVelocity(upTime);
    this.samples = [];
  }

  private computeReleaseVelocity(upTime: number): number {
    if (this.samples.length < 2) return 0;
    const newest = this.samples[this.samples.length - 1]!;
    if (upTime - newest.t > STOP_PAUSE_MS) return 0;

    const windowStart = newest.t - VELOCITY_WINDOW_MS;
    let oldest = this.samples[0]!;
    for (const s of this.samples) {
      if (s.t >= windowStart) {
        oldest = s;
        break;
      }
    }
    if (oldest === newest) {
      oldest = this.samples[this.samples.length - 2]!;
    }

    const dtMs = Math.max(newest.t - oldest.t, 8);
    const rawVx = ((newest.x - oldest.x) / dtMs) * 1000;
    return Phaser.Math.Clamp(rawVx, -MAX_FLICK_SPEED, MAX_FLICK_SPEED);
  }

  /** Place every sprite on the infinite loop so the row always covers the band. */
  private layoutItems(): void {
    const scrollMod =
      ((this.scrollPos % this.loopLength) + this.loopLength) % this.loopLength;
    const minX = -EDGE_PAD - ITEM_SPACING;
    const maxX = DESIGN_WIDTH + EDGE_PAD + ITEM_SPACING;

    for (let i = 0; i < this.items.length; i++) {
      let x = i * ITEM_SPACING + scrollMod;
      while (x < minX) x += this.loopLength;
      while (x > maxX) x -= this.loopLength;
      this.items[i]!.x = x;
    }
  }

  private tick(delta: number): void {
    if (!this.dragging) {
      const dtSec = delta / 1000;
      const tauSec = FLICK_DECAY_MS / 1000;
      const factor = Math.exp(-dtSec / tauSec);
      const flickDelta = this.flickSpeed * tauSec * (1 - factor);
      this.flickSpeed *= factor;
      if (Math.abs(this.flickSpeed) < 0.5) {
        this.flickSpeed = 0;
      }
      this.scrollPos += this.baseSpeed * dtSec + flickDelta;
    }
    this.layoutItems();
  }

  destroy(fromScene?: boolean): void {
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.onUpdate);
    this.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.onScenePointerMove);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onScenePointerUp);
    this.scene.input.off(
      Phaser.Input.Events.POINTER_UP_OUTSIDE,
      this.onScenePointerUp,
    );
    this.hitZone.removeAllListeners();
    super.destroy(fromScene);
  }
}
