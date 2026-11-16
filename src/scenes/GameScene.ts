import Phaser from "phaser";
import { SCENE_GAME, SCENE_MENU } from "../config/gameConfig";
import { DESIGN_WIDTH, GAME_HUD_DEPTH, TOP_BAR_HEIGHT } from "../config/layout";
import { scaleButtonSize } from "../config/uiButtons";
import { theme } from "../config/theme";
import { BoardController } from "../game/BoardController";
import { computeShelfLayout } from "../layout/shelfLayout";
import { getLevelById, getLevelIndex, LEVELS } from "../levels/levelData";
import { WardrobeBackground } from "../objects/WardrobeBackground";
import { completeLevel, unlockNextLevel } from "../state/progress";
import { Button } from "../ui/Button";
import { ConfirmPanel } from "../ui/ConfirmPanel";
import { LevelCompletePanel } from "../ui/LevelCompletePanel";

interface GameSceneData {
  levelId?: string;
}

export class GameScene extends Phaser.Scene {
  private board: BoardController | null = null;
  private levelId = "level-1";
  private completePanel: LevelCompletePanel | null = null;
  private confirmPanel: ConfirmPanel | null = null;
  private backButton: Button | null = null;
  private restartButton: Button | null = null;

  constructor() {
    super(SCENE_GAME);
  }

  create(data: GameSceneData): void {
    this.levelId = data.levelId ?? "level-1";
    this.completePanel?.destroy();
    this.completePanel = null;
    this.confirmPanel?.destroy();
    this.confirmPanel = null;
    if (this.board) this.board.onWon = null;

    const level = getLevelById(this.levelId);
    if (!level) {
      this.scene.start(SCENE_MENU);
      return;
    }

    new WardrobeBackground(this);
    const layout = computeShelfLayout(level.shelves);

    this.board = new BoardController(this, level, layout);
    this.board.onWon = () => this.onLevelWon();

    const topBar = this.add.graphics();
    topBar.setDepth(GAME_HUD_DEPTH - 1);
    topBar.fillStyle(theme.crownTrim, 1);
    topBar.fillRect(0, 0, DESIGN_WIDTH, TOP_BAR_HEIGHT);
    topBar.lineStyle(2, theme.plankSeam, 1);
    topBar.lineBetween(0, TOP_BAR_HEIGHT, DESIGN_WIDTH, TOP_BAR_HEIGHT);

    const hudY = TOP_BAR_HEIGHT / 2;
    const hud = scaleButtonSize(184, 92);
    const hudWide = scaleButtonSize(228, 92);
    this.backButton = new Button(this, {
      x: 28 + hud.width / 2,
      y: hudY,
      width: hud.width,
      height: hud.height,
      label: "Back",
      fontSize: theme.fontSize.body,
      onClick: () => this.openBackConfirm(),
    });
    this.backButton.setDepth(GAME_HUD_DEPTH);

    this.restartButton = new Button(this, {
      x: DESIGN_WIDTH - 28 - hudWide.width / 2,
      y: hudY,
      width: hudWide.width,
      height: hudWide.height,
      label: "Restart",
      fontSize: theme.fontSize.body,
      onClick: () => this.openRestartConfirm(),
    });
    this.restartButton.setDepth(GAME_HUD_DEPTH);

    const levelNum = getLevelIndex(this.levelId) + 1;
    const title = this.add.text(DESIGN_WIDTH / 2, hudY, `Level ${levelNum}`, {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.heading,
      color: theme.ui.text,
    });
    title.setOrigin(0.5);
    title.setDepth(GAME_HUD_DEPTH);
  }

  private openBackConfirm(): void {
    if (this.completePanel || this.confirmPanel) return;

    this.backButton?.setInputEnabled(false);
    this.restartButton?.setInputEnabled(false);

    this.confirmPanel = new ConfirmPanel(this, {
      title: "Leave level?",
      message: "You will lose your progress on this level.",
      cancelLabel: "Keep playing",
      confirmLabel: "Main menu",
      onCancel: () => this.closeConfirmPanel(),
      onConfirm: () => {
        this.closeConfirmPanel();
        this.scene.start(SCENE_MENU);
      },
    });
  }

  private openRestartConfirm(): void {
    if (this.completePanel || this.confirmPanel) return;

    this.backButton?.setInputEnabled(false);
    this.restartButton?.setInputEnabled(false);

    this.confirmPanel = new ConfirmPanel(this, {
      title: "Restart level?",
      message: "You will lose your progress on this level.",
      cancelLabel: "Keep playing",
      confirmLabel: "Restart",
      onCancel: () => this.closeConfirmPanel(),
      onConfirm: () => {
        this.closeConfirmPanel();
        this.restartLevel();
      },
    });
  }

  private closeConfirmPanel(): void {
    this.confirmPanel?.destroy();
    this.confirmPanel = null;
    if (!this.completePanel) {
      this.backButton?.setInputEnabled(true);
      this.restartButton?.setInputEnabled(true);
    }
  }

  private restartLevel(): void {
    const level = getLevelById(this.levelId);
    if (!level || !this.board) return;
    const layout = computeShelfLayout(level.shelves);
    this.board.restart(level, layout);
    this.board.onWon = () => this.onLevelWon();
  }

  private onLevelWon(): void {
    if (this.completePanel) return;
    completeLevel(this.levelId);
    unlockNextLevel(this.levelId);

    const idx = getLevelIndex(this.levelId);
    const hasNext = idx >= 0 && idx < LEVELS.length - 1;

    this.backButton?.setInputEnabled(false);
    this.restartButton?.setInputEnabled(false);

    this.completePanel = new LevelCompletePanel(this, {
      hasNextLevel: hasNext,
      onNext: () => {
        const next = LEVELS[idx + 1];
        if (next) this.scene.restart({ levelId: next.id });
      },
      onMenu: () => this.scene.start(SCENE_MENU),
    });
  }
}
