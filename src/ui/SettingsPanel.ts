import Phaser from "phaser";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../config/layout";
import {
  PANEL_BUTTON_H,
  PANEL_INSET,
  panelContentWidth,
} from "../config/panelLayout";
import { getSettings, setMusicEnabled, setSoundEnabled } from "../state/settings";
import { theme } from "../config/theme";
import { Button } from "./Button";
import { ToggleSwitch } from "./ToggleSwitch";

const PANEL_W = 680;
const PANEL_H = 440;
const CX = DESIGN_WIDTH / 2;
const CY = DESIGN_HEIGHT / 2;

export class SettingsPanel extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, onClose: () => void) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(1000);

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

    new ToggleSwitch(
      scene,
      {
        x: CX,
        y: CY - 44,
        rowWidth: rowW,
        label: "Sound effects",
        value: settings.soundEnabled,
        onChange: (enabled) => setSoundEnabled(enabled),
      },
      this,
    );

    new ToggleSwitch(
      scene,
      {
        x: CX,
        y: CY + 56,
        rowWidth: rowW,
        label: "Music",
        value: settings.musicEnabled,
        onChange: (enabled) => setMusicEnabled(enabled),
      },
      this,
    );

    const divider = scene.add.graphics();
    divider.lineStyle(1, theme.ui.panelStroke, 0.6);
    divider.beginPath();
    divider.moveTo(panelLeft + PANEL_INSET, CY - 10);
    divider.lineTo(panelLeft + PANEL_W - PANEL_INSET, CY - 10);
    divider.strokePath();
    this.add(divider);

    const doneY = panelTop + PANEL_H - PANEL_INSET - PANEL_BUTTON_H / 2;

    new Button(
      scene,
      {
        x: CX,
        y: doneY,
        width: rowW,
        height: PANEL_BUTTON_H,
        label: "Done",
        fontSize: theme.fontSize.body,
        onClick: onClose,
      },
      this,
    );
  }
}
