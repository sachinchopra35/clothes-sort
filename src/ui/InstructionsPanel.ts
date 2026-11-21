import Phaser from "phaser";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../config/layout";
import {
  PANEL_INSET,
  PANEL_PRIMARY_BTN_H,
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
const TITLE_Y = 52;
const TITLE_TO_BODY = 44;
const HEADER = TITLE_Y + 56 + TITLE_TO_BODY;
const FOOTER = PANEL_INSET + PANEL_PRIMARY_BTN_H + 28;
/** Cleared between the scroll clip and the “read more” hint when content scrolls. */
const SCROLL_HINT_RESERVE = 68;
const INSTRUCTION_FONT = "42px";
const BODY_LINE_SPACING = 20;
const PARA_GAP = 52;
/** Tight gap from a lead-in line into its bullet list. */
const PARA_TO_BULLETS = 10;
const BULLET_GAP = 14;
const BULLET_R = 7;
const BULLET_TEXT_INDENT = 34;
const BULLET_COLOR = 0xfff8ef;

type InstructionBlock =
  | { kind: "para"; text: string }
  | { kind: "bullets"; items: string[] };

const INSTRUCTION_BLOCKS: InstructionBlock[] = [
  { kind: "para", text: "Tap a shelf to pick up the clothes at its open end." },
  { kind: "para", text: "Tap another shelf to place them:" },
  {
    kind: "bullets",
    items: [
      "The new shelf must already show the same type",
      "Or, the new shelf must be empty",
    ],
  },
  { kind: "para", text: "When the shelves are full of matching clothes, you win!" },
];

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

    const title = scene.add.text(CX, PANEL_TOP + TITLE_Y, "How to play", {
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

    const bodyStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: theme.fontFamily,
      fontSize: INSTRUCTION_FONT,
      color: theme.ui.text,
      align: "left",
      lineSpacing: BODY_LINE_SPACING,
      wordWrap: { width: textWidth },
    };
    const bulletTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      ...bodyStyle,
      wordWrap: { width: textWidth - BULLET_TEXT_INDENT },
    };

    const scrollContent = scene.add.container(textX, viewTop);
    let cursorY = 0;

    const addPara = (text: string, gapAfter: number) => {
      const block = scene.add.text(0, cursorY, text, bodyStyle);
      block.setOrigin(0, 0);
      scrollContent.add(block);
      cursorY += block.height + gapAfter;
    };

    const addBullets = (items: string[], gapAfterList: number) => {
      items.forEach((item, index) => {
        const line = scene.add.text(BULLET_TEXT_INDENT, cursorY, item, bulletTextStyle);
        line.setOrigin(0, 0);
        const bulletY = cursorY + 22;
        const dot = scene.add.graphics();
        dot.fillStyle(BULLET_COLOR, 1);
        dot.fillCircle(BULLET_R + 5, bulletY, BULLET_R);
        scrollContent.add(dot);
        scrollContent.add(line);
        const gap = index < items.length - 1 ? BULLET_GAP : gapAfterList;
        cursorY += line.height + gap;
      });
    };

    for (let i = 0; i < INSTRUCTION_BLOCKS.length; i++) {
      const block = INSTRUCTION_BLOCKS[i];
      const next = INSTRUCTION_BLOCKS[i + 1];
      if (block.kind === "para") {
        const gapAfter = next?.kind === "bullets" ? PARA_TO_BULLETS : PARA_GAP;
        addPara(block.text, gapAfter);
      } else {
        addBullets(block.items, PARA_GAP);
      }
    }

    const bodyHeight = cursorY - PARA_GAP;

    const scrollable = bodyHeight > viewHeightFull + 4;
    const viewHeight = scrollable
      ? viewHeightFull - SCROLL_HINT_RESERVE
      : viewHeightFull;

    this.add(scrollContent);

    const maskGraphics = scene.add.graphics();
    maskGraphics.setVisible(false);
    maskGraphics.fillStyle(0xffffff);
    maskGraphics.fillRect(textX, viewTop, textWidth, viewHeight);
    scrollContent.setMask(maskGraphics.createGeometryMask());

    const maxScroll = Math.max(0, bodyHeight - viewHeight);
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

    const btnY = PANEL_TOP + PANEL_H - PANEL_INSET - PANEL_PRIMARY_BTN_H / 2;
    const btnW = panelContentWidth(PANEL_W);

    if (scrollable) {
      const hint = scene.add.text(
        CX,
        btnY - PANEL_PRIMARY_BTN_H / 2 - 40,
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
        height: PANEL_PRIMARY_BTN_H,
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
