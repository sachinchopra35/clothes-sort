import Phaser from "phaser";
import { playUiKnock } from "../audio/uiSounds";
import { GAME_HUD_DEPTH } from "../config/layout";
import { theme } from "../config/theme";

export const BACK_ICON_KEY = "ui-back";
export const RESTART_ICON_KEY = "ui-restart";
export const SETTINGS_ICON_KEY = "ui-settings";

/** Matches UndoButton so all in-game square buttons read as one set. */
const BTN_SIZE = 116;
const BTN_RADIUS = 24;
const ICON_SIZE = 84;
const PRESS_NUDGE = 4;

export class IconButton extends Phaser.GameObjects.Container {
  private readonly bgGfx: Phaser.GameObjects.Graphics;
  private readonly hit: Phaser.GameObjects.Rectangle;
  private pressed = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    iconKey: string,
    onClick: () => void,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.setDepth(GAME_HUD_DEPTH);

    this.bgGfx = scene.add.graphics();
    const icon = scene.add.image(0, 0, iconKey);
    icon.setDisplaySize(ICON_SIZE, ICON_SIZE);

    this.hit = scene.add.rectangle(0, 0, BTN_SIZE, BTN_SIZE, 0xffffff, 0.001);
    this.hit.setInteractive({ useHandCursor: true });
    this.hit.on("pointerdown", () => {
      playUiKnock();
      this.setPressed(true);
    });
    this.hit.on("pointerup", () => {
      if (!this.pressed) return;
      this.setPressed(false);
      onClick();
    });
    this.hit.on("pointerout", () => this.setPressed(false));

    this.add([this.bgGfx, icon, this.hit]);
    this.paint();
  }

  setInputEnabled(enabled: boolean): void {
    if (enabled) {
      this.hit.setInteractive({ useHandCursor: true });
    } else {
      this.hit.disableInteractive();
      this.setPressed(false);
    }
  }

  private setPressed(pressed: boolean): void {
    if (pressed === this.pressed) return;
    this.pressed = pressed;
    this.y += pressed ? PRESS_NUDGE : -PRESS_NUDGE;
    this.paint();
  }

  private paint(): void {
    const g = this.bgGfx;
    const half = BTN_SIZE / 2;
    g.clear();
    g.fillStyle(this.pressed ? theme.ui.buttonFillPressed : theme.ui.buttonFill, 1);
    g.fillRoundedRect(-half, -half, BTN_SIZE, BTN_SIZE, BTN_RADIUS);
    g.lineStyle(3, theme.ui.buttonStroke, 1);
    g.strokeRoundedRect(-half, -half, BTN_SIZE, BTN_SIZE, BTN_RADIUS);
  }
}

export const ICON_BUTTON_SIZE = BTN_SIZE;
