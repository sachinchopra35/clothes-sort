import Phaser from "phaser";
import { playUiKnock } from "../audio/uiSounds";
import { theme } from "../config/theme";

/** Renders arrows/glyphs bolder than Fredoka (iOS system / UI symbol fonts). */
const TRAILING_GLYPH_FONT =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI Symbol", "Apple Symbols", sans-serif';

export interface ButtonOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  fontSize?: string;
  /** Extra character after the label, drawn in {@link TRAILING_GLYPH_FONT}. */
  trailingGlyph?: string;
  trailingFont?: string;
  onClick: () => void;
}

const MAX_TAP_TRAVEL = 64;
const GLYPH_GAP = 10;
const GLYPH_SIZE_SCALE = 1.18;

/** A cancelled touch, or one that travelled like a swipe, isn't a tap. */
export function isSwipeOrCancel(pointer: Phaser.Input.Pointer): boolean {
  if (pointer.wasCanceled) return true;
  return (
    Phaser.Math.Distance.Between(pointer.downX, pointer.downY, pointer.upX, pointer.upY) >
    MAX_TAP_TRAVEL
  );
}

function parsePx(size: string): number {
  return Number.parseInt(size, 10) || 36;
}

function layoutLabelRow(
  label: Phaser.GameObjects.Text,
  glyph: Phaser.GameObjects.Text | null,
  gap: number,
): void {
  if (!glyph) {
    label.setX(0);
    return;
  }
  const total = label.width + gap + glyph.width;
  label.setX(-total / 2 + label.width / 2);
  glyph.setX(total / 2 - glyph.width / 2);
}

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text;
  private glyphText: Phaser.GameObjects.Text | null = null;
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
    const glyphFont = options.trailingFont ?? TRAILING_GLYPH_FONT;

    this.bg = scene.add.graphics();
    this.labelText = scene.add.text(0, 0, options.label, {
      fontFamily: theme.fontFamily,
      fontSize: `${fontPx}px`,
      color: theme.ui.text,
      align: "center",
      wordWrap: { width: innerW, useAdvancedWrap: true },
    });
    this.labelText.setOrigin(0.5);

    if (options.trailingGlyph) {
      this.glyphText = scene.add.text(0, 0, options.trailingGlyph, {
        fontFamily: glyphFont,
        fontSize: `${Math.round(fontPx * GLYPH_SIZE_SCALE)}px`,
        color: theme.ui.text,
      });
      this.glyphText.setOrigin(0.5);
    }

    const contentWidth = () => {
      const g = this.glyphText?.width ?? 0;
      return this.labelText.width + (this.glyphText ? GLYPH_GAP + g : 0);
    };

    while ((contentWidth() > innerW || this.labelText.height > innerH) && fontPx > 18) {
      fontPx -= 2;
      this.labelText.setFontSize(fontPx);
      this.labelText.setWordWrapWidth(innerW, true);
      if (this.glyphText) {
        this.glyphText.setFontSize(Math.round(fontPx * GLYPH_SIZE_SCALE));
      }
    }

    layoutLabelRow(this.labelText, this.glyphText, GLYPH_GAP);

    this.hitZone = scene.add.zone(0, 0, options.width, options.height);
    this.hitZone.setInteractive({ useHandCursor: true });

    const parts: Phaser.GameObjects.GameObject[] = [this.bg, this.labelText];
    if (this.glyphText) parts.push(this.glyphText);
    parts.push(this.hitZone);
    this.add(parts);
    this.redraw(options.width, options.height, false);

    this.hitZone.on("pointerdown", () => {
      playUiKnock();
      this.redraw(this.btnW, this.btnH, true);
      if (this.pressNudge === 0) {
        this.y += 4;
        this.pressNudge = 4;
      }
    });
    this.hitZone.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      const wasPressed = this.pressNudge !== 0;
      this.releasePress();
      // iOS cancels the touch when the home-swipe takes over; Phaser reports that as pointerup.
      if (!wasPressed || isSwipeOrCancel(pointer)) return;
      options.onClick();
    });
    this.hitZone.on("pointerout", () => this.releasePress());
  }

  setLabel(label: string): void {
    this.labelText.setText(label);
    layoutLabelRow(this.labelText, this.glyphText, GLYPH_GAP);
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