import Phaser from "phaser";
import { applyMusicSettings } from "../audio/musicManager";
import { DESIGN_HEIGHT, DESIGN_WIDTH, MODAL_UI_DEPTH } from "../config/layout";
import {
  PANEL_BUTTON_H,
  PANEL_INSET,
  panelContentWidth,
} from "../config/panelLayout";
import {
  getSettings,
  setMusicVolume,
  setSoundVolume,
} from "../state/settings";
import { theme } from "../config/theme";
import { Button } from "./Button";
import { MusicTrackPicker } from "./MusicTrackPicker";
import { playModalPopIn } from "./modalPopIn";
import { VolumeSlider } from "./VolumeSlider";

const PANEL_W = 680;
const CX = DESIGN_WIDTH / 2;
const CY = DESIGN_HEIGHT / 2;

/** Offsets from the panel top (design px). */
const SOUND_ROW_Y = 166;
const MUSIC_ROW_Y = 316;
const DIVIDER_Y = 400;
const NOW_PLAYING_Y = 440;
const PICKER_Y = 520;
/** Lowest point of the picker text block (two piece lines) below PICKER_Y. */
const PICKER_BOTTOM = 112;
const PICKER_TO_DONE = 36;
const PANEL_H =
  PICKER_Y + PICKER_BOTTOM + PICKER_TO_DONE + PANEL_BUTTON_H + PANEL_INSET;

export class SettingsPanel extends Phaser.GameObjects.Container {
  private trackPicker: MusicTrackPicker | null = null;

  constructor(scene: Phaser.Scene, onClose: () => void) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(MODAL_UI_DEPTH);

    const backdrop = scene.add.rectangle(
      CX,
      CY,
      DESIGN_WIDTH,
      DESIGN_HEIGHT,
      theme.ui.overlayDim,
      0.55,
    );
    backdrop.setInteractive();
    backdrop.on("pointerdown", onClose);
    this.add(backdrop);

    // Swallows taps inside the panel so only taps outside it dismiss.
    const panelBlocker = scene.add.rectangle(CX, CY, PANEL_W, PANEL_H, 0x000000, 0);
    panelBlocker.setInteractive();
    this.add(panelBlocker);

    const panelLeft = CX - PANEL_W / 2;
    const panelTop = CY - PANEL_H / 2;
    const rowW = panelContentWidth(PANEL_W);

    const panel = scene.add.graphics();
    panel.fillStyle(theme.ui.panelFill, 0.97);
    panel.fillRoundedRect(panelLeft, panelTop, PANEL_W, PANEL_H, 24);
    panel.lineStyle(4, theme.ui.panelStroke, 1);
    panel.strokeRoundedRect(panelLeft, panelTop, PANEL_W, PANEL_H, 24);
    this.add(panel);

    const title = scene.add.text(CX, panelTop + 56, "Settings", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.heading,
      color: theme.ui.text,
    });
    title.setOrigin(0.5);
    this.add(title);

    const settings = getSettings();

    new VolumeSlider(
      scene,
      {
        x: CX,
        y: panelTop + SOUND_ROW_Y,
        rowWidth: rowW,
        label: "Sound effects",
        value: settings.soundVolume,
        onChange: (v) => setSoundVolume(v),
      },
      this,
    );

    new VolumeSlider(
      scene,
      {
        x: CX,
        y: panelTop + MUSIC_ROW_Y,
        rowWidth: rowW,
        label: "Music",
        value: settings.musicVolume,
        onChange: (v) => {
          setMusicVolume(v);
          applyMusicSettings();
          this.trackPicker?.refresh();
        },
      },
      this,
    );

    const divider = scene.add.graphics();
    divider.lineStyle(1, theme.ui.panelStroke, 0.6);
    divider.beginPath();
    divider.moveTo(panelLeft + PANEL_INSET, panelTop + DIVIDER_Y);
    divider.lineTo(panelLeft + PANEL_W - PANEL_INSET, panelTop + DIVIDER_Y);
    divider.strokePath();
    this.add(divider);

    const nowPlayingLabel = scene.add.text(CX, panelTop + NOW_PLAYING_Y, "Now playing", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.small,
      color: theme.ui.textMuted,
    });
    nowPlayingLabel.setOrigin(0.5);
    this.add(nowPlayingLabel);

    this.trackPicker = new MusicTrackPicker(
      scene,
      { x: CX, y: panelTop + PICKER_Y },
      this,
    );

    new Button(
      scene,
      {
        x: CX,
        y: panelTop + PANEL_H - PANEL_INSET - PANEL_BUTTON_H / 2,
        width: rowW,
        height: PANEL_BUTTON_H,
        label: "Done",
        fontSize: theme.fontSize.body,
        onClick: onClose,
      },
      this,
    );

    playModalPopIn(scene, this, backdrop, { pivotX: CX, pivotY: CY });
  }
}
