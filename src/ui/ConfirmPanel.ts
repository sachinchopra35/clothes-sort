import Phaser from "phaser";
import { DESIGN_HEIGHT, DESIGN_WIDTH, MODAL_UI_DEPTH } from "../config/layout";
import { PANEL_INSET, panelContentWidth } from "../config/panelLayout";
import { theme } from "../config/theme";
import { Button } from "./Button";
import { playModalPopIn } from "./modalPopIn";

const PANEL_W = 640;
const PANEL_H = 424;
const CONFIRM_BTN_H = 116;
const BTN_GAP = 20;
/** Clear band between body copy and the button row. */
const BODY_ABOVE_BUTTONS = 40;

export interface ConfirmPanelOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export class ConfirmPanel extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, options: ConfirmPanelOptions) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(MODAL_UI_DEPTH);

    const cx = DESIGN_WIDTH / 2;
    const cy = DESIGN_HEIGHT / 2;
    const panelLeft = cx - PANEL_W / 2;
    const panelTop = cy - PANEL_H / 2;
    const contentW = panelContentWidth(PANEL_W);
    const halfW = (contentW - BTN_GAP) / 2;

    const close = () => options.onCancel();

    const backdrop = scene.add.rectangle(
      cx,
      cy,
      DESIGN_WIDTH,
      DESIGN_HEIGHT,
      theme.ui.overlayDim,
      0.55,
    );
    backdrop.setInteractive();
    backdrop.on("pointerdown", close);
    this.add(backdrop);

    const panelHit = scene.add.rectangle(
      cx,
      cy,
      PANEL_W,
      PANEL_H,
      0xffffff,
      0.001,
    );
    panelHit.setInteractive();
    this.add(panelHit);

    const panel = scene.add.graphics();
    panel.fillStyle(theme.ui.panelFill, 0.97);
    panel.fillRoundedRect(panelLeft, panelTop, PANEL_W, PANEL_H, 24);
    panel.lineStyle(4, theme.ui.panelStroke, 1);
    panel.strokeRoundedRect(panelLeft, panelTop, PANEL_W, PANEL_H, 24);
    this.add(panel);

    const title = scene.add.text(cx, panelTop + 56, options.title, {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.heading,
      color: theme.ui.text,
      align: "center",
      wordWrap: { width: contentW },
    });
    title.setOrigin(0.5);
    this.add(title);

    const btnY = panelTop + PANEL_H - PANEL_INSET - CONFIRM_BTN_H / 2;
    const bodyBottom = btnY - CONFIRM_BTN_H / 2 - BODY_ABOVE_BUTTONS;

    const body = scene.add.text(cx, panelTop + 120, options.message, {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: theme.ui.textMuted,
      align: "center",
      lineSpacing: 10,
      wordWrap: { width: contentW },
    });
    body.setOrigin(0.5, 0);
    if (body.y + body.height > bodyBottom) {
      body.y = Math.max(panelTop + 108, bodyBottom - body.height);
    }
    this.add(body);
    const leftX = cx - BTN_GAP / 2 - halfW / 2;
    const rightX = cx + BTN_GAP / 2 + halfW / 2;

    new Button(
      scene,
      {
        x: leftX,
        y: btnY,
        width: halfW,
        height: CONFIRM_BTN_H,
        label: options.cancelLabel ?? "Cancel",
        fontSize: theme.fontSize.body,
        onClick: close,
      },
      this,
    );

    new Button(
      scene,
      {
        x: rightX,
        y: btnY,
        width: halfW,
        height: CONFIRM_BTN_H,
        label: options.confirmLabel,
        fontSize: theme.fontSize.body,
        onClick: () => options.onConfirm(),
      },
      this,
    );

    playModalPopIn(scene, this, backdrop, { pivotX: cx, pivotY: cy });
  }
}