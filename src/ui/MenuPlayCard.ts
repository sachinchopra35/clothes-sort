import Phaser from "phaser";
import { scaleButtonSize } from "../config/uiButtons";
import { PANEL_INSET, panelContentWidth } from "../config/panelLayout";
import { theme } from "../config/theme";
import { Button } from "./Button";
import { LevelPicker } from "./LevelPicker";

const PANEL_W = 840;
const PANEL_H = 448;
const PANEL_RADIUS = 28;

export interface MenuPlayCardOptions {
  x: number;
  y: number;
  initialLevelId: string;
  onPlay: () => void;
  onLockedTap?: (levelId: string) => void;
}

export class MenuPlayCard extends Phaser.GameObjects.Container {
  private readonly picker: LevelPicker;

  constructor(scene: Phaser.Scene, options: MenuPlayCardOptions) {
    super(scene, options.x, options.y);
    scene.add.existing(this);

    const halfW = PANEL_W / 2;
    const halfH = PANEL_H / 2;
    const contentW = panelContentWidth(PANEL_W);

    const panel = scene.add.graphics();
    panel.fillStyle(theme.ui.panelFill, 0.9);
    panel.fillRoundedRect(-halfW, -halfH, PANEL_W, PANEL_H, PANEL_RADIUS);
    panel.lineStyle(4, theme.ui.panelStroke, 1);
    panel.strokeRoundedRect(-halfW, -halfH, PANEL_W, PANEL_H, PANEL_RADIUS);
    this.add(panel);

    this.picker = new LevelPicker(
      scene,
      {
        x: 0,
        y: -98,
        initialLevelId: options.initialLevelId,
        onChange: () => {},
        onLockedTap: options.onLockedTap,
      },
      this,
    );

    const divider = scene.add.graphics();
    divider.lineStyle(2, theme.ui.panelStroke, 0.45);
    divider.beginPath();
    divider.moveTo(-contentW / 2, 8);
    divider.lineTo(contentW / 2, 8);
    divider.strokePath();
    this.add(divider);

    const play = scaleButtonSize(420, 120);
    new Button(
      scene,
      {
        x: 0,
        y: halfH - PANEL_INSET - play.height / 2,
        width: play.width,
        height: play.height,
        label: "Play",
        fontSize: theme.fontSize.heading,
        onClick: options.onPlay,
      },
      this,
    );
  }

  getSelectedLevelId(): string {
    return this.picker.getSelectedLevelId();
  }

  isSelectionPlayable(): boolean {
    return this.picker.isSelectionPlayable();
  }

  refresh(): void {
    this.picker.refresh();
  }
}