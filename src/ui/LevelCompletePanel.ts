import Phaser from "phaser";
import { DESIGN_HEIGHT, DESIGN_WIDTH, MODAL_UI_DEPTH } from "../config/layout";
import { PANEL_INSET, panelContentWidth } from "../config/panelLayout";
import { theme } from "../config/theme";
import { pickLevelCompleteSubtitle } from "./levelCompleteMessages";
import { Button } from "./Button";
import { playModalPopIn } from "./modalPopIn";

const PANEL_W = 680;
const PANEL_H = 508;
const LEVEL_BTN_H = 116;
const BTN_GAP = 20;
const SUBTITLE_FONT_PX = 42;

export interface LevelCompletePanelOptions {
  levelNumber: number;
  hasNextLevel: boolean;
  onNext: () => void;
  /** Final level: fills the slot where “Next Level” would be; usually confetti. */
  onGameComplete?: () => void;
  onMenu: () => void;
}

export class LevelCompletePanel extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, options: LevelCompletePanelOptions) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(MODAL_UI_DEPTH);

    const cx = DESIGN_WIDTH / 2;
    const cy = DESIGN_HEIGHT / 2;
    const panelLeft = cx - PANEL_W / 2;
    const panelTop = cy - PANEL_H / 2;
    const btnW = panelContentWidth(PANEL_W);

    const backdrop = scene.add.rectangle(
      cx,
      cy,
      DESIGN_WIDTH,
      DESIGN_HEIGHT,
      theme.ui.overlayDim,
      0.5,
    );
    backdrop.setInteractive();
    this.add(backdrop);

    const panel = scene.add.graphics();
    panel.fillStyle(theme.ui.panelFill, 0.97);
    panel.fillRoundedRect(panelLeft, panelTop, PANEL_W, PANEL_H, 24);
    panel.lineStyle(4, theme.ui.panelStroke, 1);
    panel.strokeRoundedRect(panelLeft, panelTop, PANEL_W, PANEL_H, 24);
    this.add(panel);

    const title = scene.add.text(
      cx,
      panelTop + 56,
      `Level ${options.levelNumber} complete`,
      {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.heading,
      color: theme.ui.text,
      align: "center",
      wordWrap: { width: btnW },
      },
    );
    title.setOrigin(0.5, 0);
    this.add(title);

    const subtitle = scene.add.text(cx, panelTop + 120, pickLevelCompleteSubtitle(), {
      fontFamily: theme.fontFamily,
      fontSize: `${SUBTITLE_FONT_PX}px`,
      color: theme.ui.textMuted,
      align: "center",
      wordWrap: { width: btnW },
    });
    subtitle.setOrigin(0.5, 0);
    this.add(subtitle);

    const mainMenuY = panelTop + PANEL_H - PANEL_INSET - LEVEL_BTN_H / 2;

    const primaryButtonY = mainMenuY - LEVEL_BTN_H - BTN_GAP;

    if (options.hasNextLevel) {
      new Button(
        scene,
        {
          x: cx,
          y: primaryButtonY,
          width: btnW,
          height: LEVEL_BTN_H,
          label: "Next Level",
          fontSize: theme.fontSize.body,
          trailingGlyph: "→",
          onClick: options.onNext,
        },
        this,
      );
    } else {
      new Button(
        scene,
        {
          x: cx,
          y: primaryButtonY,
          width: btnW,
          height: LEVEL_BTN_H,
          label: "Game Complete!!",
          fontSize: theme.fontSize.body,
          onClick: () => options.onGameComplete?.(),
        },
        this,
      );
    }

    new Button(
      scene,
      {
        x: cx,
        y: mainMenuY,
        width: btnW,
        height: LEVEL_BTN_H,
        label: "Main Menu",
        fontSize: theme.fontSize.body,
        onClick: options.onMenu,
      },
      this,
    );

    playModalPopIn(scene, this, backdrop, { pivotX: cx, pivotY: cy });
  }
}
