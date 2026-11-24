import Phaser from "phaser";
import { theme } from "../config/theme";
import { Button } from "./Button";

export interface VolumeSliderOptions {
  x: number;
  y: number;
  rowWidth: number;
  label: string;
  value: number;
  onChange: (volume: number) => void;
}

const TRACK_H = 14;
const KNOB_R = 24;
const LABEL_Y = -40;
const CONTROL_Y = 26;
const MUTE_W = 168;
const MUTE_H = 64;
const MUTE_GAP = 52;
const DEFAULT_UNMUTE = 0.85;

/** Label on top; draggable track with mute button on the right. Value is 0–1. */
export class VolumeSlider extends Phaser.GameObjects.Container {
  private value: number;
  private lastAudible: number;
  private readonly onChange: (volume: number) => void;
  private readonly track: Phaser.GameObjects.Graphics;
  private readonly fill: Phaser.GameObjects.Graphics;
  private readonly knob: Phaser.GameObjects.Graphics;
  private readonly muteButton: Button;
  private readonly trackLeft: number;
  private readonly trackW: number;
  private dragging = false;
  private readonly onPointerMove: (pointer: Phaser.Input.Pointer) => void;
  private readonly onPointerUp: () => void;

  constructor(
    scene: Phaser.Scene,
    options: VolumeSliderOptions,
    parent?: Phaser.GameObjects.Container,
  ) {
    super(scene, options.x, options.y);
    if (parent) {
      parent.add(this);
    } else {
      scene.add.existing(this);
    }

    this.value = Phaser.Math.Clamp(options.value, 0, 1);
    this.lastAudible = this.value > 0.001 ? this.value : DEFAULT_UNMUTE;
    this.onChange = options.onChange;

    const left = -options.rowWidth / 2;
    const right = options.rowWidth / 2;
    this.trackLeft = left + 4;
    const muteCenterX = right - MUTE_W / 2;
    this.trackW = muteCenterX - MUTE_W / 2 - MUTE_GAP - this.trackLeft;

    const labelText = scene.add.text(left + 4, LABEL_Y, options.label, {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: theme.ui.text,
    });
    labelText.setOrigin(0, 0.5);
    this.add(labelText);

    this.muteButton = new Button(
      scene,
      {
        x: muteCenterX,
        y: CONTROL_Y,
        width: MUTE_W,
        height: MUTE_H,
        label: "Mute",
        fontSize: "34px",
        onClick: () => this.toggleMute(),
      },
      this,
    );

    this.track = scene.add.graphics();
    this.fill = scene.add.graphics();
    this.knob = scene.add.graphics();

    const hitZone = scene.add.zone(
      this.trackLeft + this.trackW / 2,
      CONTROL_Y,
      this.trackW + KNOB_R * 2,
      80,
    );
    hitZone.setInteractive({ useHandCursor: true });

    this.add([this.track, this.fill, this.knob, hitZone]);
    this.draw();

    // Pop-in reparents and scales this container, so map through the full world
    // transform (Container.pointToContainer drops parent transforms).
    const local = new Phaser.Math.Vector2();
    const setFromPointer = (pointer: Phaser.Input.Pointer) => {
      this.getWorldTransformMatrix().applyInverse(pointer.worldX, pointer.worldY, local);
      this.setValue((local.x - this.trackLeft) / this.trackW, true);
    };

    this.onPointerMove = (pointer: Phaser.Input.Pointer) => {
      if (!this.dragging || !pointer.isDown) return;
      setFromPointer(pointer);
    };

    this.onPointerUp = () => {
      this.dragging = false;
      scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove);
    };

    hitZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.dragging = true;
      setFromPointer(pointer);
      scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove);
      scene.input.once(Phaser.Input.Events.POINTER_UP, this.onPointerUp);
    });

    this.on(Phaser.GameObjects.Events.DESTROY, () => {
      scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove);
      scene.input.off(Phaser.Input.Events.POINTER_UP, this.onPointerUp);
    });
  }

  setValue(value: number, notify: boolean): void {
    const next = Phaser.Math.Clamp(value, 0, 1);
    if (Math.abs(next - this.value) < 0.002) return;
    this.value = next;
    if (next > 0.001) this.lastAudible = next;
    this.draw();
    if (notify) this.onChange(this.value);
  }

  getValue(): number {
    return this.value;
  }

  private toggleMute(): void {
    this.setValue(this.value > 0.001 ? 0 : this.lastAudible, true);
  }

  private draw(): void {
    const tx = this.trackLeft;
    const ty = CONTROL_Y - TRACK_H / 2;

    this.track.clear();
    this.track.fillStyle(0x5a4638, 1);
    this.track.fillRoundedRect(tx, ty, this.trackW, TRACK_H, TRACK_H / 2);
    this.track.lineStyle(2, theme.ui.buttonStroke, 0.45);
    this.track.strokeRoundedRect(tx, ty, this.trackW, TRACK_H, TRACK_H / 2);

    this.fill.clear();
    if (this.value > 0.01) {
      this.fill.fillStyle(theme.ui.buttonFill, 1);
      this.fill.fillRoundedRect(
        tx,
        ty,
        Math.max(TRACK_H, this.trackW * this.value),
        TRACK_H,
        TRACK_H / 2,
      );
    }

    const knobX = tx + this.trackW * this.value;
    this.knob.clear();
    this.knob.fillStyle(0xfff8ef, 1);
    this.knob.fillCircle(knobX, CONTROL_Y, KNOB_R);
    this.knob.lineStyle(2, theme.ui.buttonStroke, 0.4);
    this.knob.strokeCircle(knobX, CONTROL_Y, KNOB_R);

    this.muteButton.setLabel(this.value > 0.001 ? "Mute" : "Unmute");
  }
}
