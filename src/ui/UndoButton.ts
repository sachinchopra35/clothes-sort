import Phaser from "phaser";
import { playUiKnock } from "../audio/uiSounds";
import { GAME_HUD_DEPTH } from "../config/layout";
import { theme } from "../config/theme";

const BTN_SIZE = 116;
const BTN_RADIUS = 24;
const BADGE_R = 22;

export class UndoButton extends Phaser.GameObjects.Container {
  private readonly bgGfx: Phaser.GameObjects.Graphics;
  private readonly iconText: Phaser.GameObjects.Text;
  private readonly badgeBg: Phaser.GameObjects.Graphics;
  private readonly badge: Phaser.GameObjects.Text;
  private clickable = true;
  private readonly onClick: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onClick: () => void,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setDepth(GAME_HUD_DEPTH);
    this.onClick = onClick;

    const hit = scene.add.rectangle(
      0,
      0,
      BTN_SIZE,
      BTN_SIZE,
      0xffffff,
      0.001,
    );
    hit.setInteractive({ useHandCursor: true });
    hit.on("pointerdown", () => {
      if (!this.clickable) return;
      playUiKnock();
      this.onClick();
    });
    this.add(hit);

    this.bgGfx = scene.add.graphics();
    this.add(this.bgGfx);

    this.iconText = scene.add.text(0, 10, "↩", {
      fontFamily: theme.fontFamily,
      fontSize: "78px",
      color: theme.ui.text,
      stroke: "#a85f34",
      strokeThickness: 7,
    });
    this.iconText.setOrigin(0.5);
    this.add(this.iconText);

    const badgeX = BTN_SIZE / 2 - 6;
    const badgeY = -BTN_SIZE / 2 + 6;
    this.badgeBg = scene.add.graphics();
    this.badgeBg.fillStyle(theme.ui.buttonFill, 1);
    this.badgeBg.fillCircle(badgeX, badgeY, BADGE_R);
    this.badgeBg.lineStyle(2, theme.ui.buttonStroke, 1);
    this.badgeBg.strokeCircle(badgeX, badgeY, BADGE_R);
    this.add(this.badgeBg);

    this.badge = scene.add.text(badgeX, badgeY, "0", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.small,
      color: theme.ui.text,
    });
    this.badge.setOrigin(0.5);
    this.add(this.badge);

    this.paint(false);
    this.setRemaining(0);
  }

  /** @param exhausted all undos used for this level */
  setRemaining(count: number, exhausted = false): void {
    this.clickable = true;
    this.badge.setText(String(count));
    this.badgeBg.setVisible(count > 0);
    this.badge.setVisible(count > 0);
    this.paint(exhausted);
    this.setAlpha(exhausted ? 0.42 : 1);
  }

  private paint(exhausted: boolean): void {
    const g = this.bgGfx;
    g.clear();
    const half = BTN_SIZE / 2;
    const fill = exhausted ? theme.ui.buttonFillPressed : theme.ui.buttonFill;

    g.fillStyle(fill, 1);
    g.fillRoundedRect(-half, -half, BTN_SIZE, BTN_SIZE, BTN_RADIUS);
    g.lineStyle(3, theme.ui.buttonStroke, 1);
    g.strokeRoundedRect(-half, -half, BTN_SIZE, BTN_SIZE, BTN_RADIUS);

    if (exhausted) {
      this.iconText.setColor("#d4b896");
      this.iconText.setStroke("#5c3d28", 5);
    } else {
      this.iconText.setColor(theme.ui.text);
      this.iconText.setStroke("#8b4f28", 7);
    }
    this.iconText.setAlpha(1);
  }
}