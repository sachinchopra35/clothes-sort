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
const SPEED_PX_PER_SEC = 13;
const ITEM_SPACING = 148;
const EDGE_PAD = 80;

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
  private readonly speed: number;
  private readonly onUpdate = (_time: number, delta: number) => this.tick(delta);

  constructor(scene: Phaser.Scene, options: MenuClothesMarqueeOptions) {
    super(scene, 0, 0);
    scene.add.existing(this);

    const { bandTop, bandHeight, direction } = options;
    const clothingOffset = options.clothingOffset ?? 0;
    this.speed = direction === "left" ? -SPEED_PX_PER_SEC : SPEED_PX_PER_SEC;

    const maskShape = scene.make.graphics({ x: 0, y: 0 }, false);
    maskShape.fillStyle(0xffffff, 1);
    const playWidth = DESIGN_WIDTH - SIDE_PANEL_WIDTH * 2;
    maskShape.fillRect(SIDE_PANEL_WIDTH, bandTop, playWidth, bandHeight);
    const mask = maskShape.createGeometryMask();
    this.setMask(mask);

    const centerY = bandTop + bandHeight / 2;
    const count = Math.ceil((DESIGN_WIDTH + EDGE_PAD * 2) / ITEM_SPACING) + 3;
    let x = -EDGE_PAD;

    for (let i = 0; i < count; i++) {
      const id = CLOTHING_IDS[(clothingOffset + i) % CLOTHING_IDS.length]!;
      const key = CLOTHING_CATALOG[id].textureKey;
      const img = scene.add.image(x, centerY, key);
      img.setScale(ITEM_SCALE);
      const tilt = Phaser.Math.Between(-7, 7);
      img.setRotation(Phaser.Math.DEG_TO_RAD * tilt);
      img.setAlpha(0.9);
      this.add(img);
      this.items.push(img);
      x += ITEM_SPACING;
    }

    scene.events.on(Phaser.Scenes.Events.UPDATE, this.onUpdate);
  }

  private tick(delta: number): void {
    const dx = this.speed * (delta / 1000);
    const leftBound = -EDGE_PAD - 40;
    const rightBound = DESIGN_WIDTH + EDGE_PAD + 40;

    for (const img of this.items) {
      img.x += dx;
    }

    if (this.speed < 0) {
      for (const img of this.items) {
        if (img.x < leftBound) {
          let rightmost = -Infinity;
          for (const other of this.items) {
            rightmost = Math.max(rightmost, other.x);
          }
          img.x = rightmost + ITEM_SPACING;
        }
      }
    } else {
      for (const img of this.items) {
        if (img.x > rightBound) {
          let leftmost = Infinity;
          for (const other of this.items) {
            leftmost = Math.min(leftmost, other.x);
          }
          img.x = leftmost - ITEM_SPACING;
        }
      }
    }
  }

  destroy(fromScene?: boolean): void {
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.onUpdate);
    super.destroy(fromScene);
  }
}