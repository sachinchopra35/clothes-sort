import Phaser from "phaser";
import { playUiKnock } from "../audio/uiSounds";
import { theme } from "../config/theme";

export interface ButtonOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  fontSize?: string;
  onClick: () => void;
}

function parsePx(size: string): number {
  return Number.parseInt(size, 10) || 36;
}

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text;
  private hitZone: Phaser.GameObjects.Zone;
  private readonly btnW: number;
  private readonly btnH: number;
  private pressNudge = 0;

  constructor(
    scene: Phaser.Scene,
    options: ButtonOptions,
    parent?: Phaser.GameObjects.Container,
  ) {
    super(scene, options.x, options.y);
    if (parent) {
      parent.add(this);
    } else {
      scene.add.existing(this);
    }

    this.btnW = options.width;
    this.btnH = options.height;
    const innerW = Math.max(48, options.width - 28);
    const innerH = Math.max(32, options.height - 16);
    let fontPx = parsePx(options.fontSize ?? theme.fontSize.body);

    this.bg = scene.add.graphics();
    this.labelText = scene.add.text(0, 0, options.label, {
      fontFamily: theme.fontFamily,
      fontSize: `${fontPx}px`,
      color: theme.ui.text,
      align: "center",
      wordWrap: { width: innerW, useAdvancedWrap: true },
    });
    this.labelText.setOrigin(0.5);

    while (
      (this.labelText.width > innerW || this.labelText.height > innerH) &&
      fontPx > 18
    ) {
      fontPx -= 2;
      this.labelText.setFontSize(fontPx);
      this.labelText.setWordWrapWidth(innerW, true);
    }

    this.hitZone = scene.add.zone(0, 0, options.width, options.height);
    this.hitZone.setInteractive({ useHandCursor: true });

    this.add([this.bg, this.labelText, this.hitZone]);
    this.redraw(options.width, options.height, false);

    this.hitZone.on("pointerdown", () => {
      playUiKnock();
      this.redraw(this.btnW, this.btnH, true);
      if (this.pressNudge === 0) {
        this.y += 4;
        this.pressNudge = 4;
      }
    });
    this.hitZone.on("pointerup", () => {
      this.releasePress();
      options.onClick();
    });
    this.hitZone.on("pointerout", () => this.releasePress());
  }

  setInputEnabled(enabled: boolean): void {
    if (enabled) {
      this.hitZone.setInteractive({ useHandCursor: true });
    } else {
      this.hitZone.disableInteractive();
      this.releasePress();
    }
  }

  private releasePress(): void {
    this.redraw(this.btnW, this.btnH, false);
    if (this.pressNudge !== 0) {
      this.y -= this.pressNudge;
      this.pressNudge = 0;
    }
  }

  private redraw(w: number, h: number, pressed: boolean): void {
    this.bg.clear();
    const fill = pressed ? theme.ui.buttonFillPressed : theme.ui.buttonFill;
    const radius = Math.min(20, h / 2);
    this.bg.fillStyle(fill, 1);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
    this.bg.lineStyle(3, theme.ui.buttonStroke, 1);
    this.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
  }
}
