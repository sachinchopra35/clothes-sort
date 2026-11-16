import Phaser from "phaser";
import { playUiKnock } from "../audio/uiSounds";
import { verifyLevelCheatCode } from "../game/levelCheatCode";
import { DESIGN_HEIGHT, DESIGN_WIDTH, MODAL_UI_DEPTH } from "../config/layout";
import {
  PANEL_BUTTON_H,
  PANEL_INSET,
  panelContentWidth,
} from "../config/panelLayout";
import { unlockLevel } from "../state/progress";
import { theme } from "../config/theme";
import { Button } from "./Button";

const PANEL_W = 640;
const PANEL_H = 520;
const BTN_GAP = 20;
const INPUT_H = 72;

export interface CheatCodePanelOptions {
  levelId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function canvasOffset(scene: Phaser.Scene): DOMRect {
  return scene.game.canvas.getBoundingClientRect();
}

function pointInPanel(
  x: number,
  y: number,
  panelLeft: number,
  panelTop: number,
): boolean {
  return (
    x >= panelLeft &&
    x <= panelLeft + PANEL_W &&
    y >= panelTop &&
    y <= panelTop + PANEL_H
  );
}

export class CheatCodePanel extends Phaser.GameObjects.Container {
  private readonly inputEl: HTMLInputElement;
  private readonly resizeHandler: () => void;
  private readonly focusInput: () => void;
  private errorText: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, options: CheatCodePanelOptions) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(MODAL_UI_DEPTH);

    const cx = DESIGN_WIDTH / 2;
    const cy = DESIGN_HEIGHT / 2;
    const panelLeft = cx - PANEL_W / 2;
    const panelTop = cy - PANEL_H / 2;
    const contentW = panelContentWidth(PANEL_W);
    const halfW = (contentW - BTN_GAP) / 2;
    const inputDesignY = panelTop + 318;
    const inputTop = inputDesignY - INPUT_H / 2;

    const close = () => {
      playUiKnock();
      options.onCancel();
    };

    const backdrop = scene.add.rectangle(
      cx,
      cy,
      DESIGN_WIDTH,
      DESIGN_HEIGHT,
      theme.ui.overlayDim,
      0.55,
    );
    backdrop.setInteractive();
    backdrop.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointInPanel(pointer.x, pointer.y, panelLeft, panelTop)) return;
      close();
    });
    this.add(backdrop);

    const panelBlocker = scene.add.rectangle(
      cx,
      cy,
      PANEL_W,
      PANEL_H,
      0x000000,
      0,
    );
    panelBlocker.setInteractive();
    this.add(panelBlocker);

    const panel = scene.add.graphics();
    panel.fillStyle(theme.ui.panelFill, 0.97);
    panel.fillRoundedRect(panelLeft, panelTop, PANEL_W, PANEL_H, 24);
    panel.lineStyle(4, theme.ui.panelStroke, 1);
    panel.strokeRoundedRect(panelLeft, panelTop, PANEL_W, PANEL_H, 24);
    this.add(panel);

    const title = scene.add.text(cx, panelTop + 56, "Locked level", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.heading,
      color: theme.ui.text,
      align: "center",
    });
    title.setOrigin(0.5);
    this.add(title);

    const body = scene.add.text(
      cx,
      panelTop + 124,
      "Do you have the cheat code for this level?",
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

    const inputLabel = scene.add.text(cx, inputTop - 24, "Enter code", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: theme.ui.text,
      align: "center",
    });
    inputLabel.setOrigin(0.5, 1);
    this.add(inputLabel);

    const container = document.getElementById("game-container") ?? document.body;
    this.inputEl = document.createElement("input");
    this.inputEl.type = "text";
    this.inputEl.autocomplete = "off";
    this.inputEl.autocapitalize = "off";
    this.inputEl.spellcheck = false;
    this.inputEl.enterKeyHint = "go";
    this.inputEl.placeholder = "";
    this.inputEl.setAttribute("inputmode", "text");
    container.appendChild(this.inputEl);

    const applyInputLayout = () => {
      const rect = canvasOffset(scene);
      const scaleX = rect.width / DESIGN_WIDTH;
      const scaleY = rect.height / DESIGN_HEIGHT;
      const w = contentW * scaleX;
      const h = INPUT_H * scaleY;
      const left = rect.left + (cx - contentW / 2) * scaleX;
      const top = rect.top + (inputDesignY - INPUT_H / 2) * scaleY;
      Object.assign(this.inputEl.style, {
        position: "fixed",
        left: `${left}px`,
        top: `${top}px`,
        width: `${w}px`,
        height: `${h}px`,
        zIndex: "10000",
        pointerEvents: "auto",
        fontFamily: theme.fontFamily.replace(/"/g, ""),
        fontSize: `${Math.round(28 * Math.min(scaleX, scaleY))}px`,
        textAlign: "center",
        color: theme.ui.text,
        background: "#3d2a1c",
        border: `3px solid ${theme.ui.panelStroke}`,
        borderRadius: "12px",
        outline: "none",
        padding: "0 12px",
      });
    };

    applyInputLayout();
    this.resizeHandler = () => applyInputLayout();
    scene.scale.on("resize", this.resizeHandler);

    this.focusInput = () => {
      try {
        this.inputEl.focus({ preventScroll: true });
      } catch {
        /* ignore */
      }
    };

    this.inputEl.addEventListener("mousedown", (e) => e.stopPropagation());

    const tryUnlock = () => {
      const attempt = this.inputEl.value;
      if (!verifyLevelCheatCode(options.levelId, attempt)) {
        this.errorText?.setText("That code didn't work. Try again!");
        this.inputEl.select();
        playUiKnock();
        this.focusInput();
        return;
      }
      unlockLevel(options.levelId);
      playUiKnock();
      options.onSuccess();
    };

    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        tryUnlock();
      }
    });

    const btnY = panelTop + PANEL_H - PANEL_INSET - PANEL_BUTTON_H / 2;
    const leftX = cx - BTN_GAP / 2 - halfW / 2;
    const rightX = cx + BTN_GAP / 2 + halfW / 2;

    this.errorText = scene.add.text(cx, inputDesignY + INPUT_H / 2 + 16, "", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.small,
      color: "#f4a261",
      align: "center",
      wordWrap: { width: contentW },
    });
    this.errorText.setOrigin(0.5, 0);
    this.add(this.errorText);

    new Button(
      scene,
      {
        x: leftX,
        y: btnY,
        width: halfW,
        height: PANEL_BUTTON_H,
        label: "Never mind",
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
        height: PANEL_BUTTON_H,
        label: "Unlock",
        fontSize: theme.fontSize.body,
        onClick: tryUnlock,
      },
      this,
    );

    scene.input.once("pointerup", () => {
      this.focusInput();
    });
    requestAnimationFrame(() => this.focusInput());
    scene.time.delayedCall(120, () => this.focusInput());
    scene.time.delayedCall(280, () => this.focusInput());
  }

  destroy(fromScene?: boolean): void {
    this.scene.scale.off("resize", this.resizeHandler);
    this.inputEl.remove();
    super.destroy(fromScene);
  }
}