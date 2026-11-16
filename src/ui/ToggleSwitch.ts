import Phaser from "phaser";
import { playUiKnock } from "../audio/uiSounds";
import { theme } from "../config/theme";

export interface ToggleSwitchOptions {
  x: number;
  y: number;
  rowWidth: number;
  label: string;
  value: boolean;
  onChange: (enabled: boolean) => void;
}

const TRACK_W = 118;
const TRACK_H = 58;
const KNOB_R = 23;
const KNOB_MARGIN = 6;

export class ToggleSwitch extends Phaser.GameObjects.Container {
  private enabled: boolean;
  private readonly onChange: (enabled: boolean) => void;
  private track: Phaser.GameObjects.Graphics;
  private knob: Phaser.GameObjects.Graphics;
  private readonly trackLeft: number;

  constructor(
    scene: Phaser.Scene,
    options: ToggleSwitchOptions,
    parent?: Phaser.GameObjects.Container,
  ) {
    super(scene, options.x, options.y);
    if (parent) {
      parent.add(this);
    } else {
      scene.add.existing(this);
    }

    this.enabled = options.value;
    this.onChange = options.onChange;
    this.trackLeft = options.rowWidth / 2 - TRACK_W - 8;

    const labelMaxW = Math.max(120, options.rowWidth - TRACK_W - 32);
    const labelText = scene.add.text(-options.rowWidth / 2 + 8, 0, options.label, {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: theme.ui.text,
      wordWrap: { width: labelMaxW, useAdvancedWrap: true },
    });
    labelText.setOrigin(0, 0.5);

    this.track = scene.add.graphics();
    this.knob = scene.add.graphics();

    const hitZone = scene.add.zone(0, 0, options.rowWidth, 84);
    hitZone.setInteractive({ useHandCursor: true });

    this.add([labelText, this.track, this.knob, hitZone]);
    this.draw();

    hitZone.on("pointerdown", () => {
      playUiKnock();
      this.enabled = !this.enabled;
      this.draw();
      this.onChange(this.enabled);
    });
  }

  setValue(value: boolean): void {
    this.enabled = value;
    this.draw();
  }

  private draw(): void {
    const tx = this.trackLeft;

    this.track.clear();
    this.track.fillStyle(
      this.enabled ? theme.ui.buttonFill : 0x5a4638,
      1,
    );
    this.track.fillRoundedRect(tx, -TRACK_H / 2, TRACK_W, TRACK_H, TRACK_H / 2);
    this.track.lineStyle(2, theme.ui.buttonStroke, 0.85);
    this.track.strokeRoundedRect(tx, -TRACK_H / 2, TRACK_W, TRACK_H, TRACK_H / 2);

    const knobX = this.enabled
      ? tx + TRACK_W - KNOB_MARGIN - KNOB_R
      : tx + KNOB_MARGIN + KNOB_R;

    this.knob.clear();
    this.knob.fillStyle(0xfff8ef, 1);
    this.knob.fillCircle(knobX, 0, KNOB_R);
    this.knob.lineStyle(2, theme.ui.buttonStroke, 0.4);
    this.knob.strokeCircle(knobX, 0, KNOB_R);
  }
}
