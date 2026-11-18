import Phaser from "phaser";
import { applyMusicSettings } from "../audio/musicManager";
import { DESIGN_HEIGHT, DESIGN_WIDTH, MODAL_UI_DEPTH } from "../config/layout";
import {
  PANEL_BUTTON_H,
  PANEL_INSET,
  panelContentWidth,
} from "../config/panelLayout";
import { applySilentModeSetting } from "../audio/audioSession";
import {
  getSettings,
  setMusicVolume,
  setPlayInSilentMode,
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
/** Bottom edge of the music slider row (its mute button) below the panel top. */
const MUSIC_ROW_BOTTOM = MUSIC_ROW_Y + 26 + 32;
const SLIDER_TO_TOGGLE = 40;
const TOGGLE_BTN_W = 168;
const TOGGLE_BTN_H = 64;
const TOGGLE_LABEL_GAP = 28;
const TOGGLE_TO_DIVIDER = 32;
const DIVIDER_TO_NOW_PLAYING = 40;
const NOW_PLAYING_TO_PICKER = 80;
/** Lowest point of the picker text block (two piece lines) below the picker centre. */
const PICKER_BOTTOM = 112;
const PICKER_TO_DONE = 36;

export class SettingsPanel extends Phaser.GameObjects.Container {
  private trackPicker: MusicTrackPicker | null = null;

  constructor(scene: Phaser.Scene, onClose: () => void) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(MODAL_UI_DEPTH);

    const rowW = panelContentWidth(PANEL_W);
    const settings = getSettings();

    // Measure the toggle label first; every row below it is placed from its real height.
    const toggleLabel = scene.add.text(0, 0, "Play sound when iPhone is on silent", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.small,
      color: theme.ui.text,
      lineSpacing: 6,
      wordWrap: { width: rowW - TOGGLE_BTN_W - TOGGLE_LABEL_GAP },
    });
    toggleLabel.setOrigin(0, 0.5);
    const toggleRowH = Math.max(TOGGLE_BTN_H, toggleLabel.height);
    const toggleRowTop = MUSIC_ROW_BOTTOM + SLIDER_TO_TOGGLE;
    const toggleY = toggleRowTop + toggleRowH / 2;
    const dividerY = toggleRowTop + toggleRowH + TOGGLE_TO_DIVIDER;
    const nowPlayingY = dividerY + DIVIDER_TO_NOW_PLAYING;
    const pickerY = nowPlayingY + NOW_PLAYING_TO_PICKER;
    const PANEL_H = pickerY + PICKER_BOTTOM + PICKER_TO_DONE + PANEL_BUTTON_H + PANEL_INSET;

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

    const rowLeft = CX - rowW / 2;
    let silentOn = settings.playInSilentMode;
    const toggleButton = new Button(
      scene,
      {
        x: rowLeft + TOGGLE_BTN_W / 2,
        y: panelTop + toggleY,
        width: TOGGLE_BTN_W,
        height: TOGGLE_BTN_H,
        label: silentOn ? "On" : "Off",
        fontSize: theme.fontSize.small,
        onClick: () => {
          silentOn = !silentOn;
          setPlayInSilentMode(silentOn);
          applySilentModeSetting(silentOn);
          toggleButton.setLabel(silentOn ? "On" : "Off");
        },
      },
      this,
    );
    toggleLabel.setPosition(rowLeft + TOGGLE_BTN_W + TOGGLE_LABEL_GAP, panelTop + toggleY);
    this.add(toggleLabel);

    const divider = scene.add.graphics();
    divider.lineStyle(1, theme.ui.panelStroke, 0.6);
    divider.beginPath();
    divider.moveTo(panelLeft + PANEL_INSET, panelTop + dividerY);
    divider.lineTo(panelLeft + PANEL_W - PANEL_INSET, panelTop + dividerY);
    divider.strokePath();
    this.add(divider);

    const nowPlayingLabel = scene.add.text(CX, panelTop + nowPlayingY, "Now playing", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.small,
      color: theme.ui.textMuted,
    });
    nowPlayingLabel.setOrigin(0.5);
    this.add(nowPlayingLabel);

    this.trackPicker = new MusicTrackPicker(
      scene,
      { x: CX, y: panelTop + pickerY },
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
