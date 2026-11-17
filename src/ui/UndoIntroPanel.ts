import Phaser from "phaser";
import { DESIGN_HEIGHT, DESIGN_WIDTH, MODAL_UI_DEPTH } from "../config/layout";
import { PANEL_BUTTON_H, PANEL_INSET, panelContentWidth } from "../config/panelLayout";
import { theme } from "../config/theme";
import { Button } from "./Button";

const PANEL_W = 640;
const PANEL_H = 420;

export class UndoIntroPanel extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, onDismiss: () => void) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(MODAL_UI_DEPTH);

    const cx = DESIGN_WIDTH / 2;
    const cy = DESIGN_HEIGHT / 2;
    const panelLeft = cx - PANEL_W / 2;
    const panelTop = cy - PANEL_H / 2;
    const contentW = panelContentWidth(PANEL_W);

    const backdrop = scene.add.rectangle(
      cx,
      cy,
      DESIGN_WIDTH,
      DESIGN_HEIGHT,
      theme.ui.overlayDim,
      0.55,
    );
    backdrop.setInteractive();
    this.add(backdrop);

    const panel = scene.add.graphics();
    panel.fillStyle(theme.ui.panelFill, 0.97);
    panel.fillRoundedRect(panelLeft, panelTop, PANEL_W, PANEL_H, 24);
    panel.lineStyle(4, theme.ui.panelStroke, 1);
    panel.strokeRoundedRect(panelLeft, panelTop, PANEL_W, PANEL_H, 24);
    this.add(panel);

    const title = scene.add.text(cx, panelTop + 56, "Undo unlocked!", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.heading,
      color: theme.ui.text,
      align: "center",
    });
    title.setOrigin(0.5);
    this.add(title);

    const body = scene.add.text(
      cx,
      panelTop + 128,
      "From Level 11 you can undo your last move. Look for the arrow button at the bottom of the screen—the small number shows how many undos you have this level.",
      {
        fontFamily: theme.fontFamily,
        fontSize: theme.fontSize.body,
        color: theme.ui.textMuted,
        align: "center",
        lineSpacing: 10,
        wordWrap: { width: contentW },
      },
    );
    body.setOrigin(0.5, 0);
    this.add(body);

    const btnY = panelTop + PANEL_H - PANEL_INSET - PANEL_BUTTON_H / 2;
    new Button(
      scene,
      {
        x: cx,
        y: btnY,
        width: contentW,
        height: PANEL_BUTTON_H,
        label: "Got it",
        fontSize: theme.fontSize.body,
        onClick: onDismiss,
      },
      this,
    );
  }
}