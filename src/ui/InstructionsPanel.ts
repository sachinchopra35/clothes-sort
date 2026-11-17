import Phaser from "phaser";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../config/layout";
import {
  PANEL_BUTTON_H,
  PANEL_INSET,
  panelContentWidth,
} from "../config/panelLayout";
import { theme } from "../config/theme";
import { Button } from "./Button";
import { playModalPopIn } from "./modalPopIn";

const PANEL_W = DESIGN_WIDTH - 96;
const PANEL_H = 1020;
const PANEL_TOP = Math.round((DESIGN_HEIGHT - PANEL_H) / 2);
const CX = DESIGN_WIDTH / 2;
const PANEL_PIVOT_Y = PANEL_TOP + PANEL_H / 2;
const PADDING = 40;
const HEADER = 92;
const FOOTER = PANEL_INSET + PANEL_BUTTON_H + 28;
/** Cleared between the scroll clip and the “read more” hint when content scrolls. */
const SCROLL_HINT_RESERVE = 68;
const INSTRUCTION_FONT = "42px";
/** Extra space between wrapped lines (on top of font size). */
const BODY_LINE_SPACING = 20;

const INSTRUCTIONS = [
  "Tap a shelf to pick up the clothes at its open end.",
  "You only take matching items in a row (for example several white tees together).",
  "Tap another shelf to place them:",
  "  • An empty shelf is always OK",
  "  • Or the open end must already show the same type",
  "Tap the same shelf again to put them back down.",
  "When a shelf is full and every item matches, it slides away.",
  "Win by clearing every shelf!",
].join("\n");

export class InstructionsPanel extends Phaser.GameObjects.Container {
  private wheelHandler?: (
    pointer: Phaser.Input.Pointer,
    over: Phaser.GameObjects.GameObject[],
    deltaX: number,
    deltaY: number,
  ) => void;

  constructor(scene: Phaser.Scene, onClose: () => void) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(1000);

    const backdrop = scene.add.rectangle(
      CX,
      DESIGN_HEIGHT / 2,
      DESIGN_WIDTH,
      DESIGN_HEIGHT,
      theme.ui.overlayDim,
      0.55,
    );
    backdrop.setInteractive();
    backdrop.on("pointerdown", onClose);
    this.add(backdrop);

    const panelLeft = CX - PANEL_W / 2;

    const panel = scene.add.graphics();
    panel.fillStyle(theme.ui.panelFill, 0.97);
    panel.fillRoundedRect(panelLeft, PANEL_TOP, PANEL_W, PANEL_H, 24);
    panel.lineStyle(4, theme.ui.panelStroke, 1);
    panel.strokeRoundedRect(panelLeft, PANEL_TOP, PANEL_W, PANEL_H, 24);
    this.add(panel);

    const title = scene.add.text(CX, PANEL_TOP + 52, "How to play", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.heading,
      color: theme.ui.text,
    });
    title.setOrigin(0.5);
    this.add(title);

    const textWidth = PANEL_W - PADDING * 2;
    const viewTop = PANEL_TOP + HEADER;
    const viewHeightFull = PANEL_H - HEADER - FOOTER;
    const textX = panelLeft + PADDING;

    const body = scene.add.text(0, 0, INSTRUCTIONS, {
      fontFamily: theme.fontFamily,
      fontSize: INSTRUCTION_FONT,
      color: theme.ui.text,
      align: "left",
      lineSpacing: BODY_LINE_SPACING,
      wordWrap: { width: textWidth },
    });

    const scrollable = body.height > viewHeightFull + 4;
    const viewHeight = scrollable
      ? viewHeightFull - SCROLL_HINT_RESERVE
      : viewHeightFull;

    const scrollContent = scene.add.container(textX, viewTop);
    scrollContent.add(body);
    this.add(scrollContent);

    const maskGraphics = scene.add.graphics();
    maskGraphics.setVisible(false);
    maskGraphics.fillStyle(0xffffff);
    maskGraphics.fillRect(textX, viewTop, textWidth, viewHeight);
    scrollContent.setMask(maskGraphics.createGeometryMask());

    const maxScroll = Math.max(0, body.height - viewHeight);
    let scrollOffset = 0;
    /** Local Y inside the pop-in container (see modalPopIn). */
    const scrollHomeY = viewTop - PANEL_PIVOT_Y;

    const applyScroll = (next: number) => {
      scrollOffset = Phaser.Math.Clamp(next, 0, maxScroll);
      scrollContent.y = scrollHomeY - scrollOffset;
    };

    const scrollZone = scene.add.zone(
      textX + textWidth / 2,
      viewTop + viewHeight / 2,
      textWidth,
      viewHeight,
    );
    scrollZone.setInteractive();
    this.add(scrollZone);

    let dragStartY = 0;
    let scrollStart = 0;

    scrollZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      dragStartY = pointer.y;
      scrollStart = scrollOffset;
    });

    scrollZone.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;
      applyScroll(scrollStart - (pointer.y - dragStartY));
    });

    this.wheelHandler = (_p, _over, _dx, deltaY) => {
      applyScroll(scrollOffset + deltaY * 0.35);
    };
    scene.input.on("wheel", this.wheelHandler);

    const btnY = PANEL_TOP + PANEL_H - PANEL_INSET - PANEL_BUTTON_H / 2;
    const btnW = panelContentWidth(PANEL_W);

    if (scrollable) {
      const hint = scene.add.text(
        CX,
        btnY - PANEL_BUTTON_H / 2 - 40,
        "Swipe up or down to read more",
        {
          fontFamily: theme.fontFamily,
          fontSize: theme.fontSize.small,
          color: theme.ui.textMuted,
          align: "center",
          wordWrap: { width: btnW },
        },
      );
      hint.setOrigin(0.5, 1);
      this.add(hint);
    }

    new Button(
      scene,
      {
        x: CX,
        y: btnY,
        width: btnW,
        height: PANEL_BUTTON_H,
        label: "Got it",
        fontSize: theme.fontSize.body,
        onClick: onClose,
      },
      this,
    );

    this.on(Phaser.GameObjects.Events.DESTROY, () => {
      if (this.wheelHandler) {
        scene.input.off("wheel", this.wheelHandler);
      }
      maskGraphics.destroy();
    });

    playModalPopIn(scene, this, backdrop, {
      pivotX: CX,
      pivotY: PANEL_PIVOT_Y,
    });
  }
}
