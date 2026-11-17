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
/** Pixels per second — intentionally very slow. */
const SPEED_PX_PER_SEC = 20;
const ITEM_SPACING = 148;
const EDGE_PAD = 80;
/** Swipe flick cap (px/s). */
const MAX_FLICK_SPEED = 720;
/** How quickly extra speed from a swipe returns to the natural drift (ms time constant). */
const FLICK_DECAY_MS = 2400;
/** Smooth pointer velocity while dragging (0–1). */
const DRAG_VEL_SMOOTH = 0.28;

export type MarqueeDirection = "left" | "right";

export interface MenuClothesMarqueeOptions {
  bandTop: number;
  bandHeight: number;
  direction: MarqueeDirection;
  /** Offset into CLOTHING_IDS so upper/lower strips differ. */
  clothingOffset?: number;
}

export class MenuClothesMarquee extends Phaser.GameObjects.Container {
  private readonly items: Phaser.GameObjects.Image[] = [];
  private readonly baseSpeed: number;
  private readonly loopLength: number;
  private readonly centerY: number;
  private scrollPos = 0;
  private flickSpeed = 0;
  private dragging = false;
  private lastPointerX = 0;
  private lastMoveAt = 0;
  private smoothedDragVel = 0;
  private readonly hitZone: Phaser.GameObjects.Zone;
  private readonly onUpdate = (_time: number, delta: number) => this.tick(delta);

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
      this.dragging = true;
      this.flickSpeed = 0;
      this.lastPointerX = pointer.x;
      this.lastMoveAt = pointer.time;
      this.smoothedDragVel = 0;
    });

    this.hitZone.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.dragging || !pointer.isDown) return;
      const dx = pointer.x - this.lastPointerX;
      if (dx !== 0) {
        this.scrollPos += dx;
        this.layoutItems();
        const dt = Math.max(pointer.time - this.lastMoveAt, 1);
        const instant = (dx / dt) * 1000;
        this.smoothedDragVel = Phaser.Math.Linear(
          this.smoothedDragVel,
          instant,
          DRAG_VEL_SMOOTH,
        );
        this.lastPointerX = pointer.x;
        this.lastMoveAt = pointer.time;
      }
    });

    const endDrag = () => {
      if (!this.dragging) return;
      this.dragging = false;
      this.flickSpeed = Phaser.Math.Clamp(
        this.smoothedDragVel,
        -MAX_FLICK_SPEED,
        MAX_FLICK_SPEED,
      );
    };

    this.hitZone.on("pointerup", endDrag);

    scene.events.on(Phaser.Scenes.Events.UPDATE, this.onUpdate);
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
      const decay = 1 - Math.exp(-delta / FLICK_DECAY_MS);
      this.flickSpeed = Phaser.Math.Linear(this.flickSpeed, 0, decay);
      this.scrollPos += (this.baseSpeed + this.flickSpeed) * (delta / 1000);
    }
    this.layoutItems();
  }

  destroy(fromScene?: boolean): void {
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.onUpdate);
    this.hitZone.removeAllListeners();
    super.destroy(fromScene);
  }
}