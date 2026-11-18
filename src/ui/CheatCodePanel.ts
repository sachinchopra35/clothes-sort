import Phaser from "phaser";
import { playUiKnock } from "../audio/uiSounds";
import { verifyLevelCheatCode } from "../game/levelCheatCode";
import { getLevelIndex } from "../levels/levelData";
import { DESIGN_HEIGHT, DESIGN_WIDTH, MODAL_UI_DEPTH } from "../config/layout";
import {
  PANEL_BUTTON_H,
  PANEL_INSET,
  panelContentWidth,
} from "../config/panelLayout";
import { unlockLevelAndPrior } from "../state/progress";
import { theme } from "../config/theme";
import { Button } from "./Button";
import { playModalPopIn } from "./modalPopIn";

const PANEL_W = 640;
const BTN_GAP = 20;
const INPUT_H = 104;
const INPUT_FONT_DESIGN = 44;
/** Space for one-line validation copy between the input and button row. */
const ERROR_LINE_H = 36;
const TITLE_TO_BODY = 20;
const BODY_TO_LABEL = 32;
const LABEL_TO_INPUT = 14;
const INPUT_TO_ERROR = 8;
const ERROR_TO_BUTTONS = 4;

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
  panelH: number,
): boolean {
  return (
    x >= panelLeft &&
    x <= panelLeft + PANEL_W &&
    y >= panelTop &&
    y <= panelTop + panelH
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
    const contentW = panelContentWidth(PANEL_W);
    const halfW = (contentW - BTN_GAP) / 2;

    const title = scene.add.text(cx, 0, "Locked level", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.heading,
      color: theme.ui.text,
      align: "center",
    });
    title.setOrigin(0.5, 0);

    const levelNum = getLevelIndex(options.levelId) + 1;
    const body = scene.add.text(
      cx,
      0,
      levelNum > 0
        ? `Do you have the cheat code for level ${levelNum}?`
        : "Do you have the cheat code for this level?",
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

    const inputLabel = scene.add.text(cx, 0, "Enter code", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: theme.ui.text,
      align: "center",
    });
    inputLabel.setOrigin(0.5, 0);

    // Stack top-down from measured heights so long copy grows the panel instead of overlapping.
    const panelH =
      PANEL_INSET +
      title.height +
      TITLE_TO_BODY +
      body.height +
      BODY_TO_LABEL +
      inputLabel.height +
      LABEL_TO_INPUT +
      INPUT_H +
      INPUT_TO_ERROR +
      ERROR_LINE_H +
      ERROR_TO_BUTTONS +
      PANEL_BUTTON_H +
      PANEL_INSET;
    const panelLeft = cx - PANEL_W / 2;
    const panelTop = cy - panelH / 2;

    let y = panelTop + PANEL_INSET;
    title.setY(y);
    y += title.height + TITLE_TO_BODY;
    body.setY(y);
    y += body.height + BODY_TO_LABEL;
    inputLabel.setY(y);
    y += inputLabel.height + LABEL_TO_INPUT;
    const inputDesignY = y + INPUT_H / 2;
    y += INPUT_H + INPUT_TO_ERROR;
    const errorY = y;
    y += ERROR_LINE_H + ERROR_TO_BUTTONS;
    const btnY = y + PANEL_BUTTON_H / 2;

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
      if (pointInPanel(pointer.x, pointer.y, panelLeft, panelTop, panelH)) return;
      close();
    });
    this.add(backdrop);

    const panelBlocker = scene.add.rectangle(cx, cy, PANEL_W, panelH, 0x000000, 0);
    panelBlocker.setInteractive();
    this.add(panelBlocker);

    const panel = scene.add.graphics();
    panel.fillStyle(theme.ui.panelFill, 0.97);
    panel.fillRoundedRect(panelLeft, panelTop, PANEL_W, panelH, 24);
    panel.lineStyle(4, theme.ui.panelStroke, 1);
    panel.strokeRoundedRect(panelLeft, panelTop, PANEL_W, panelH, 24);
    this.add(panel);

    this.add([title, body, inputLabel]);

    const container = document.getElementById("game-container") ?? document.body;
    this.inputEl = document.createElement("input");
    this.inputEl.type = "text";
    this.inputEl.autocomplete = "off";
    this.inputEl.autocapitalize = "characters";
    this.inputEl.spellcheck = false;
    this.inputEl.enterKeyHint = "go";
    this.inputEl.placeholder = "";
    this.inputEl.setAttribute("inputmode", "text");
    this.inputEl.style.textTransform = "uppercase";
    this.inputEl.addEventListener("input", () => {
      const start = this.inputEl.selectionStart;
      const end = this.inputEl.selectionEnd;
      this.inputEl.value = this.inputEl.value.toUpperCase();
      if (start != null && end != null) {
        this.inputEl.setSelectionRange(start, end);
      }
    });
    container.appendChild(this.inputEl);

    const applyInputLayout = () => {
      const rect = canvasOffset(scene);
      const scaleX = rect.width / DESIGN_WIDTH;
      const scaleY = rect.height / DESIGN_HEIGHT;
      const w = contentW * scaleX;
      const uiScale = Math.min(scaleX, scaleY);
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
        fontSize: `${Math.round(INPUT_FONT_DESIGN * uiScale)}px`,
        fontWeight: "600",
        letterSpacing: `${Math.round(2 * uiScale)}px`,
        textAlign: "center",
        color: theme.ui.text,
        background: "#3d2a1c",
        border: `${Math.max(3, Math.round(4 * uiScale))}px solid ${theme.ui.panelStroke}`,
        borderRadius: "14px",
        outline: "none",
        padding: `0 ${Math.round(16 * uiScale)}px`,
        boxSizing: "border-box",
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
      unlockLevelAndPrior(options.levelId);
      playUiKnock();
      options.onSuccess();
    };

    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        tryUnlock();
      }
    });

    const leftX = cx - BTN_GAP / 2 - halfW / 2;
    const rightX = cx + BTN_GAP / 2 + halfW / 2;

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

    this.errorText = scene.add.text(cx, errorY, "", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.small,
      color: "#f4a261",
      align: "center",
      wordWrap: { width: contentW },
    });
    this.errorText.setOrigin(0.5, 0);
    this.add(this.errorText);

    this.inputEl.style.opacity = "0";
    this.inputEl.style.transition = "opacity 140ms ease-out";

    const revealInput = () => {
      this.inputEl.style.opacity = "1";
      this.focusInput();
    };

    playModalPopIn(scene, this, backdrop, {
      pivotX: cx,
      pivotY: cy,
      onComplete: revealInput,
    });

    scene.input.once("pointerup", () => this.focusInput());
  }

  destroy(fromScene?: boolean): void {
    this.scene.scale.off("resize", this.resizeHandler);
    this.inputEl.remove();
    super.destroy(fromScene);
  }
}