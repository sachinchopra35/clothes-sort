import Phaser from "phaser";
import { DESIGN_WIDTH, GAME_HUD_DEPTH, SLOT_SIZE } from "../config/layout";
import { theme } from "../config/theme";
import type { BoardController } from "../game/BoardController";

/** Level 1: the green top starts at the open end of l1 and belongs on r1. */
const PICK_SHELF = "l1";
const DROP_SHELF = "r1";

const HINT_Y = 430;
const HINT_W = 860;
const HINT_PAD = 28;
const ARROW_GAP_ABOVE_ITEM = SLOT_SIZE / 2 + 34;
const BOB_PX = 14;
const FINAL_HINT_MS = 4200;

type Step = "pick" | "drop" | "done";

/**
 * Guided first two moves on level 1. Only the highlighted shelf accepts taps until
 * the first move is made; then a closing hint fades out on its own.
 */
export class Level1Tutorial {
  private readonly scene: Phaser.Scene;
  private readonly board: BoardController;
  private step: Step = "pick";
  private readonly hint: Phaser.GameObjects.Container;
  private readonly hintBg: Phaser.GameObjects.Graphics;
  private readonly hintText: Phaser.GameObjects.Text;
  private readonly arrow: Phaser.GameObjects.Graphics;
  private bob: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, board: BoardController) {
    this.scene = scene;
    this.board = board;

    this.hintBg = scene.add.graphics();
    this.hintText = scene.add.text(0, 0, "", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: theme.ui.text,
      align: "center",
      lineSpacing: 8,
      wordWrap: { width: HINT_W - HINT_PAD * 2 },
    });
    this.hintText.setOrigin(0.5);
    this.hint = scene.add.container(DESIGN_WIDTH / 2, HINT_Y, [this.hintBg, this.hintText]);
    this.hint.setDepth(GAME_HUD_DEPTH);

    this.arrow = scene.add.graphics();
    this.arrow.setDepth(GAME_HUD_DEPTH);
    drawDownArrow(this.arrow);

    board.tapFilter = (id) => {
      if (this.step === "pick") return id === PICK_SHELF;
      if (this.step === "drop") return id === DROP_SHELF;
      return true;
    };
    board.onSelect = (id) => {
      if (this.step === "pick" && id === PICK_SHELF) this.showDrop();
    };
    board.onMove = () => {
      if (this.step === "drop") this.showDone();
    };

    this.showPick();
  }

  destroy(): void {
    this.board.tapFilter = null;
    this.board.onSelect = null;
    this.board.onMove = null;
    this.bob?.remove();
    this.scene.tweens.killTweensOf(this.hint);
    this.hint.destroy();
    this.arrow.destroy();
  }

  private showPick(): void {
    this.step = "pick";
    this.setHint("Tap the green top to pick it up");
    // The open end is the last item on the shelf.
    this.pointAt(PICK_SHELF, this.board.getItemCount(PICK_SHELF) - 1);
  }

  private showDrop(): void {
    this.step = "drop";
    this.setHint("Now tap this shelf to put it with the matching clothes");
    // Point at the free slot it will land in.
    this.pointAt(DROP_SHELF, this.board.getItemCount(DROP_SHELF));
  }

  private showDone(): void {
    this.step = "done";
    this.board.tapFilter = null;
    this.bob?.remove();
    this.bob = null;
    this.arrow.setVisible(false);
    this.setHint("Nice! Keep matching clothes until every shelf is cleared");
    this.scene.tweens.add({
      targets: this.hint,
      alpha: 0,
      delay: FINAL_HINT_MS,
      duration: 400,
      onComplete: () => this.hint.setVisible(false),
    });
  }

  private setHint(message: string): void {
    this.hintText.setText(message);
    const w = HINT_W;
    const h = this.hintText.height + HINT_PAD * 2;
    this.hintBg.clear();
    this.hintBg.fillStyle(theme.ui.panelFill, 0.95);
    this.hintBg.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
    this.hintBg.lineStyle(3, theme.ui.panelStroke, 1);
    this.hintBg.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
  }

  private pointAt(shelfId: string, slotIndex: number): void {
    const pos = this.board.getSlotWorldPosition(shelfId, slotIndex);
    if (!pos) return;
    const tipY = pos.y - ARROW_GAP_ABOVE_ITEM;
    this.bob?.remove();
    this.arrow.setPosition(pos.x, tipY);
    this.arrow.setVisible(true);
    this.bob = this.scene.tweens.add({
      targets: this.arrow,
      y: tipY - BOB_PX,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }
}

/** Chunky downward arrow with its tip at (0, 0), styled like the HUD icons. */
function drawDownArrow(g: Phaser.GameObjects.Graphics): void {
  const shaftW = 30;
  const shaftH = 56;
  const headW = 84;
  const headH = 50;
  const points = [
    new Phaser.Math.Vector2(-shaftW / 2, -headH - shaftH),
    new Phaser.Math.Vector2(shaftW / 2, -headH - shaftH),
    new Phaser.Math.Vector2(shaftW / 2, -headH),
    new Phaser.Math.Vector2(headW / 2, -headH),
    new Phaser.Math.Vector2(0, 0),
    new Phaser.Math.Vector2(-headW / 2, -headH),
    new Phaser.Math.Vector2(-shaftW / 2, -headH),
  ];
  g.fillStyle(0xfff8ef, 1);
  g.fillPoints(points, true);
  g.lineStyle(5, theme.ui.buttonStroke, 1);
  g.strokePoints(points, true);
}
