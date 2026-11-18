import Phaser from "phaser";
import { playShelfSlideWhoosh } from "../audio/uiSounds";
import {
  SHELF_BRACKET_WIDTH,
  SHELF_DEPTH,
  SHELF_PLANK_HEIGHT,
  SHELF_WALL_INSET,
  SLOT_SIZE,
  slotPitchForShelf,
} from "../config/layout";
import { theme } from "../config/theme";
import type { ShelfSide } from "../levels/levelTypes";

export interface ShelfOptions {
  id: string;
  x: number;
  y: number;
  width: number;
  side: ShelfSide;
  capacity: number;
}

export class Shelf extends Phaser.GameObjects.Container {
  readonly shelfId: string;
  readonly side: ShelfSide;
  readonly capacity: number;
  readonly shelfWidth: number;
  private readonly plankGfx: Phaser.GameObjects.Graphics;
  private readonly hitZone: Phaser.GameObjects.Zone;
  private homeX: number;

  constructor(scene: Phaser.Scene, options: ShelfOptions) {
    super(scene, options.x, options.y);
    scene.add.existing(this);
    this.homeX = options.x;

    this.shelfId = options.id;
    this.side = options.side;
    this.capacity = options.capacity;
    this.shelfWidth = options.width;

    this.plankGfx = scene.add.graphics();
    this.add(this.plankGfx);
    this.drawShelf(options.width, options.side);

    const hitH = SLOT_SIZE + SHELF_PLANK_HEIGHT + 40;
    this.hitZone = scene.add.zone(
      options.width / 2,
      -SLOT_SIZE / 2,
      options.width,
      hitH,
    );
    this.hitZone.setInteractive({ useHandCursor: true });
    this.add(this.hitZone);
  }

  setTapHandler(handler: () => void): void {
    this.hitZone.off("pointerdown");
    this.hitZone.on("pointerdown", handler);
  }

  private drawShelf(width: number, side: ShelfSide): void {
    const g = this.plankGfx;
    const plankY = 0;
    const shadowOffset = 6;

    g.clear();
    g.fillStyle(theme.shelfShadow, 0.15);
    g.fillRoundedRect(4, plankY + shadowOffset, width, SHELF_PLANK_HEIGHT + 4, 4);

    g.fillStyle(theme.shelfWood, 1);
    g.fillRoundedRect(0, plankY, width, SHELF_PLANK_HEIGHT, 4);

    g.fillStyle(theme.shelfFrontEdge, 1);
    const frontH = 6;
    g.fillRect(0, plankY + SHELF_PLANK_HEIGHT - frontH, width, frontH);

    const bracketX = side === "left" ? -SHELF_BRACKET_WIDTH : width;
    g.fillStyle(theme.shelfBracket, 1);
    g.fillRect(bracketX, plankY + 2, SHELF_BRACKET_WIDTH, SHELF_DEPTH);

    g.lineStyle(1, theme.plankSeam, 0.4);
    g.strokeRoundedRect(0, plankY, width, SHELF_PLANK_HEIGHT, 4);
  }

  /** Local position for item at slot index (0 = wardrobe wall). */
  getSlotLocalPosition(index: number): { x: number; y: number } {
    const pitch = slotPitchForShelf(this.shelfWidth, this.capacity);
    const slotY = -SLOT_SIZE / 2 - 10;
    const x =
      this.side === "left"
        ? SHELF_WALL_INSET + SLOT_SIZE / 2 + index * pitch
        : this.shelfWidth -
          SHELF_WALL_INSET -
          SLOT_SIZE / 2 -
          index * pitch;

    return { x, y: slotY };
  }

  getSlotWorldPosition(index: number): { x: number; y: number } {
    const local = this.getSlotLocalPosition(index);
    const out = new Phaser.Math.Vector2();
    this.getWorldTransformMatrix().transformPoint(local.x, local.y, out);
    return { x: out.x, y: out.y };
  }

  shake(): void {
    // Restart from home so a shake during a shake can't leave the shelf offset.
    this.scene.tweens.killTweensOf(this);
    this.x = this.homeX;
    this.scene.tweens.add({
      targets: this,
      x: this.homeX + 14,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.x = this.homeX;
      },
    });
  }

  resetFromSlide(homeX: number): void {
    this.scene.tweens.killTweensOf(this);
    this.homeX = homeX;
    this.x = homeX;
    this.setAlpha(1);
    this.setVisible(true);
    this.setActive(true);
  }

  slideOut(companions: Phaser.GameObjects.GameObject[] = []): Promise<void> {
    const targetX =
      this.side === "left" ? this.x - 700 : this.x + 700;
    const deltaX = targetX - this.x;
    const duration = 480;

    playShelfSlideWhoosh(this.side);

    return new Promise((resolve) => {
      let remaining = 1 + companions.length;
      const onOneComplete = () => {
        remaining -= 1;
        if (remaining === 0) resolve();
      };

      this.scene.tweens.add({
        targets: this,
        x: targetX,
        alpha: 0,
        duration,
        ease: "Quad.in",
        onComplete: () => {
          this.setVisible(false);
          this.setActive(false);
          onOneComplete();
        },
      });

      for (const companion of companions) {
        this.scene.tweens.add({
          targets: companion,
          x: `+=${deltaX}`,
          alpha: 0,
          duration,
          ease: "Quad.in",
          onComplete: onOneComplete,
        });
      }
    });
  }
}
