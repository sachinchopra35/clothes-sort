import Phaser from "phaser";
import { applyMusicSettings } from "../audio/musicManager";
import { playUiKnock } from "../audio/uiSounds";
import { DESIGN_HEIGHT, DESIGN_WIDTH, MODAL_UI_DEPTH } from "../config/layout";
import {
  PANEL_INSET,
  PANEL_PRIMARY_BTN_H,
  panelContentWidth,
} from "../config/panelLayout";
import {
  getSettings,
  setMusicVolume,
  setSoundVolume,
} from "../state/settings";
import { theme } from "../config/theme";
import { Button } from "./Button";
import { MusicAboutPanel } from "./MusicAboutPanel";
import { MusicTrackPicker } from "./MusicTrackPicker";
import { playModalPopIn } from "./modalPopIn";
import { VolumeSlider } from "./VolumeSlider";

const PANEL_W = 680;
const CX = DESIGN_WIDTH / 2;
const CY = DESIGN_HEIGHT / 2;

/** Offsets from the panel top (design px). */
const TITLE_Y = 86;
const HEADER_EXTRA = 42;
const SOUND_ROW_Y = 166 + HEADER_EXTRA;
const MUSIC_ROW_Y = 316 + HEADER_EXTRA;
/** Matches VolumeSlider: CONTROL_Y + MUTE_H / 2 below the row anchor. */
const MUSIC_SLIDER_BOTTOM = 58;
const SETTINGS_DIVIDER_PAD = 58;
const DIVIDER_Y = MUSIC_ROW_Y + MUSIC_SLIDER_BOTTOM + SETTINGS_DIVIDER_PAD;
const NOW_PLAYING_Y = DIVIDER_Y + SETTINGS_DIVIDER_PAD + 20;
const PICKER_Y = NOW_PLAYING_Y + 72;
/** Lowest point of the picker text block (two piece lines) below PICKER_Y. */
const PICKER_BOTTOM = 112;
const ABOUT_BELOW_PICKER = 8;
/** Nudges the visible row up; touch zone follows (ABOUT_HIT_H unchanged). */
const ABOUT_ROW_LIFT = 28;
/** Generous touch target (visual row is smaller, centered in this zone). */
const ABOUT_LINK_H = 96;
const ABOUT_ABOVE_DONE = 20;
/** Touch zone only; extends past the row into the gaps above and below. */
const ABOUT_HIT_H = 150;
/** Trimmed off the top of the touch zone so it stays clear of the picker arrows. */
const ABOUT_HIT_TOP_TRIM = 34;
const PANEL_H =
  PICKER_Y +
  PICKER_BOTTOM +
  ABOUT_BELOW_PICKER +
  ABOUT_LINK_H -
  ABOUT_ROW_LIFT +
  ABOUT_ABOVE_DONE +
  PANEL_PRIMARY_BTN_H +
  PANEL_INSET;

const INFO_ICON_SIZE = 34;
const SETTINGS_LABEL_FONT_PX = 34;
const INFO_ICON_COLOR = 0xf4a261;

function createInfoIcon(scene: Phaser.Scene, diameter: number, color: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const r = diameter / 2;
  const stroke = Math.max(2, Math.round(diameter * 0.11));
  g.lineStyle(stroke, color, 1);
  g.strokeCircle(0, 0, r - stroke);

  const dotR = Math.max(2, Math.round(diameter * 0.1));
  g.fillStyle(color, 1);
  g.fillCircle(0, -r * 0.38, dotR);

  g.lineStyle(stroke + 1, color, 1);
  g.beginPath();
  g.moveTo(0, -r * 0.12);
  g.lineTo(0, r * 0.38);
  g.strokePath();

  return g;
}

export class SettingsPanel extends Phaser.GameObjects.Container {
  private trackPicker: MusicTrackPicker | null = null;
  private aboutMusicPanel: MusicAboutPanel | null = null;

  constructor(scene: Phaser.Scene, onClose: () => void) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(MODAL_UI_DEPTH);

    const rowW = panelContentWidth(PANEL_W);
    const settings = getSettings();

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

    const title = scene.add.text(CX, panelTop + TITLE_Y, "Settings", {
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

    const divider = scene.add.graphics();
    divider.lineStyle(1, theme.ui.panelStroke, 0.6);
    divider.beginPath();
    divider.moveTo(panelLeft + PANEL_INSET, panelTop + DIVIDER_Y);
    divider.lineTo(panelLeft + PANEL_W - PANEL_INSET, panelTop + DIVIDER_Y);
    divider.strokePath();
    this.add(divider);

    const nowPlayingLabel = scene.add.text(CX, panelTop + NOW_PLAYING_Y, "Now playing", {
      fontFamily: theme.fontFamily,
      fontSize: `${SETTINGS_LABEL_FONT_PX}px`,
      color: theme.ui.textMuted,
    });
    nowPlayingLabel.setOrigin(0.5);
    this.add(nowPlayingLabel);

    this.trackPicker = new MusicTrackPicker(
      scene,
      { x: CX, y: panelTop + PICKER_Y },
      this,
    );

    const aboutY =
      panelTop +
      PICKER_Y +
      PICKER_BOTTOM +
      ABOUT_BELOW_PICKER +
      ABOUT_LINK_H / 2 -
      ABOUT_ROW_LIFT;
    const aboutRow = scene.add.container(CX, aboutY);
    const infoIcon = createInfoIcon(scene, INFO_ICON_SIZE, INFO_ICON_COLOR);
    const aboutLabel = scene.add.text(0, 0, "About the Music", {
      fontFamily: theme.fontFamily,
      fontSize: `${SETTINGS_LABEL_FONT_PX}px`,
      color: theme.ui.textMuted,
    });
    aboutLabel.setOrigin(0, 0.5);
    const aboutGap = 12;
    const aboutRowW = INFO_ICON_SIZE + aboutGap + aboutLabel.width;
    infoIcon.x = -aboutRowW / 2 + INFO_ICON_SIZE / 2;
    aboutLabel.x = -aboutRowW / 2 + INFO_ICON_SIZE + aboutGap;
    aboutRow.add([infoIcon, aboutLabel]);

    this.add(aboutRow);

    const aboutHit = scene.add.zone(
      CX,
      aboutY + ABOUT_HIT_TOP_TRIM / 2,
      rowW,
      ABOUT_HIT_H - ABOUT_HIT_TOP_TRIM,
    );
    aboutHit.setInteractive({ useHandCursor: true });
    aboutHit.on("pointerdown", () => {
      playUiKnock();
      if (this.aboutMusicPanel) return;
      this.aboutMusicPanel = new MusicAboutPanel(scene, () => {
        this.aboutMusicPanel?.destroy();
        this.aboutMusicPanel = null;
      });
    });
    this.add(aboutHit);

    new Button(
      scene,
      {
        x: CX,
        y: panelTop + PANEL_H - PANEL_INSET - PANEL_PRIMARY_BTN_H / 2,
        width: rowW,
        height: PANEL_PRIMARY_BTN_H,
        label: "Done",
        fontSize: theme.fontSize.body,
        onClick: onClose,
      },
      this,
    );

    playModalPopIn(scene, this, backdrop, { pivotX: CX, pivotY: CY });

    this.on(Phaser.GameObjects.Events.DESTROY, () => {
      this.aboutMusicPanel?.destroy();
      this.aboutMusicPanel = null;
    });
  }
}
