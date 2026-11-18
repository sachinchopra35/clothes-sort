import Phaser from "phaser";
import { DESIGN_HEIGHT, DESIGN_WIDTH, MODAL_UI_DEPTH } from "../config/layout";
import { PANEL_BUTTON_H, PANEL_INSET, panelContentWidth } from "../config/panelLayout";
import { theme } from "../config/theme";
import { Button } from "./Button";
import { playModalPopIn } from "./modalPopIn";

const PANEL_W = 640;
const PANEL_H_MIN = 420;
const TITLE_TOP = 56;
const HEADER_BLOCK = 104;
const BODY_ABOVE_BUTTON = 32;

const UNDO_INTRO_BODY =
  "From Level 11 you can undo your last move. Look for the arrow button at the bottom of the screen.";

export class UndoIntroPanel extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, onDismiss: () => void) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(MODAL_UI_DEPTH);

    const cx = DESIGN_WIDTH / 2;
    const contentW = panelContentWidth(PANEL_W);
    const bodyStyle = {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: theme.ui.textMuted,
      align: "center" as const,
      lineSpacing: 10,
      wordWrap: { width: contentW },
    };

    const measure = scene.add.text(0, 0, UNDO_INTRO_BODY, bodyStyle);
    const bodyH = measure.height;
    measure.destroy();

    const footerH = PANEL_INSET + PANEL_BUTTON_H;
    const panelH = Math.max(
      PANEL_H_MIN,
      HEADER_BLOCK + bodyH + BODY_ABOVE_BUTTON + footerH,
    );
    const cy = DESIGN_HEIGHT / 2;
    const panelLeft = cx - PANEL_W / 2;
    const panelTop = cy - panelH / 2;

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
    panel.fillRoundedRect(panelLeft, panelTop, PANEL_W, panelH, 24);
    panel.lineStyle(4, theme.ui.panelStroke, 1);
    panel.strokeRoundedRect(panelLeft, panelTop, PANEL_W, panelH, 24);
    this.add(panel);

    const title = scene.add.text(cx, panelTop + TITLE_TOP, "Undo unlocked!", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.heading,
      color: theme.ui.text,
      align: "center",
    });
    title.setOrigin(0.5);
    this.add(title);

    const btnY = panelTop + panelH - PANEL_INSET - PANEL_BUTTON_H / 2;
    const bodyBottom = btnY - PANEL_BUTTON_H / 2 - BODY_ABOVE_BUTTON;

    const body = scene.add.text(cx, panelTop + HEADER_BLOCK, UNDO_INTRO_BODY, bodyStyle);
    body.setOrigin(0.5, 0);
    this.add(body);

    if (body.y + body.height > bodyBottom) {
      body.setY(bodyBottom - body.height);
    }

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

    playModalPopIn(scene, this, backdrop, { pivotX: cx, pivotY: cy });
  }
}