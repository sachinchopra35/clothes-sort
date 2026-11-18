import Phaser from "phaser";
import { SCENE_GAME, SCENE_MENU } from "../config/gameConfig";
import {
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  GAME_HUD_DEPTH,
  TOP_BAR_HEIGHT,
} from "../config/layout";
import { undoAllowanceForLevel } from "../game/undoLimits";
import { theme } from "../config/theme";
import { BoardController } from "../game/BoardController";
import { computeShelfLayout } from "../layout/shelfLayout";
import { getLevelById, getLevelIndex, LEVELS } from "../levels/levelData";
import { ensureMusicPlaying, registerMusicScene } from "../audio/musicManager";
import { playLevelComplete } from "../audio/uiSounds";
import { WardrobeBackground } from "../objects/WardrobeBackground";
import { completeLevel, unlockNextLevel } from "../state/progress";
import { ConfirmPanel } from "../ui/ConfirmPanel";
import {
  BACK_ICON_KEY,
  ICON_BUTTON_SIZE,
  IconButton,
  RESTART_ICON_KEY,
  SETTINGS_ICON_KEY,
} from "../ui/IconButton";
import { SettingsPanel } from "../ui/SettingsPanel";
import { hasSeenUndoIntro, markUndoIntroSeen } from "../state/undoIntro";
import { LevelCompletePanel } from "../ui/LevelCompletePanel";
import { playConfetti } from "../ui/playConfetti";
import { UndoButton } from "../ui/UndoButton";
import { showBriefMessage } from "../ui/BriefMessage";
import { UndoIntroPanel } from "../ui/UndoIntroPanel";
import { Level1Tutorial } from "../ui/Level1Tutorial";
import {
  fadeInCamera,
  type SceneIntroFadeData,
  startSceneWithFade,
} from "./sceneFade";

const HUD_EDGE = 28;
const HUD_GAP = 20;

interface GameSceneData extends SceneIntroFadeData {
  levelId?: string;
}

export class GameScene extends Phaser.Scene {
  private board: BoardController | null = null;
  private levelId = "level-1";
  private introFade = false;
  private completePanel: LevelCompletePanel | null = null;
  private confirmPanel: ConfirmPanel | null = null;
  private backButton: IconButton | null = null;
  private restartButton: IconButton | null = null;
  private settingsButton: IconButton | null = null;
  private settingsPanel: SettingsPanel | null = null;
  private undoButton: UndoButton | null = null;
  private undoIntroPanel: UndoIntroPanel | null = null;
  private tutorial: Level1Tutorial | null = null;

  constructor() {
    super(SCENE_GAME);
  }

  init(data: GameSceneData): void {
    this.levelId = data.levelId ?? "level-1";
    this.introFade = data.introFade ?? false;
  }

  create(): void {
    registerMusicScene(this);
    ensureMusicPlaying();

    this.completePanel?.destroy();
    this.completePanel = null;
    this.confirmPanel?.destroy();
    this.confirmPanel = null;
    this.settingsPanel?.destroy();
    this.settingsPanel = null;
    if (this.board) this.board.onWon = null;
    this.tutorial = null;

    const level = getLevelById(this.levelId);
    if (!level) {
      void startSceneWithFade(this, SCENE_MENU);
      return;
    }

    new WardrobeBackground(this);
    const layout = computeShelfLayout(level.shelves);
    const levelNum = getLevelIndex(this.levelId) + 1;
    const undoAllowance = undoAllowanceForLevel(levelNum);

    this.board = new BoardController(this, level, layout, undoAllowance);
    this.board.onWon = () => this.onLevelWon();
    this.board.onUndoStateChange = (remaining, exhausted) => {
      this.undoButton?.setRemaining(remaining, exhausted);
    };
    this.startTutorialIfNeeded();

    const topBar = this.add.graphics();
    topBar.setDepth(GAME_HUD_DEPTH - 1);
    topBar.fillStyle(theme.crownTrim, 1);
    topBar.fillRect(0, 0, DESIGN_WIDTH, TOP_BAR_HEIGHT);
    topBar.lineStyle(2, theme.plankSeam, 1);
    topBar.lineBetween(0, TOP_BAR_HEIGHT, DESIGN_WIDTH, TOP_BAR_HEIGHT);

    const hudY = TOP_BAR_HEIGHT / 2;
    const edgeX = HUD_EDGE + ICON_BUTTON_SIZE / 2;
    this.backButton = new IconButton(this, edgeX, hudY, BACK_ICON_KEY, () =>
      this.openBackConfirm(),
    );
    this.settingsButton = new IconButton(
      this,
      DESIGN_WIDTH - edgeX,
      hudY,
      SETTINGS_ICON_KEY,
      () => this.openSettings(),
    );
    this.restartButton = new IconButton(
      this,
      DESIGN_WIDTH - edgeX - ICON_BUTTON_SIZE - HUD_GAP,
      hudY,
      RESTART_ICON_KEY,
      () => this.openRestartConfirm(),
    );

    const title = this.add.text(DESIGN_WIDTH / 2, hudY, `Level ${levelNum}`, {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.heading,
      color: theme.ui.text,
    });
    title.setOrigin(0.5);
    title.setDepth(GAME_HUD_DEPTH);

    if (undoAllowance > 0) {
      this.undoButton = new UndoButton(
        this,
        DESIGN_WIDTH / 2,
        DESIGN_HEIGHT - 192,
        () => this.handleUndoTap(),
      );
    }

    if (levelNum === 11 && undoAllowance > 0 && !hasSeenUndoIntro()) {
      this.undoIntroPanel = new UndoIntroPanel(this, () => {
        markUndoIntroSeen();
        this.undoIntroPanel?.destroy();
        this.undoIntroPanel = null;
      });
    }

    if (this.introFade) {
      fadeInCamera(this);
      this.introFade = false;
    }
  }

  private handleUndoTap(): void {
    if (!this.board) return;
    if (this.board.areUndosExhausted()) {
      showBriefMessage(this, "You've run out of undos for this level");
      return;
    }
    if (!this.board.hasMovesToUndo()) {
      showBriefMessage(this, "No moves to undo");
      return;
    }
    if (!this.board.canAttemptUndo()) return;
    this.board.tryUndo();
  }

  private openBackConfirm(): void {
    if (this.isModalOpen()) return;

    this.setHudEnabled(false);

    this.confirmPanel = new ConfirmPanel(this, {
      title: "Leave level?",
      message: "You will lose your progress on this level.",
      cancelLabel: "Keep playing",
      confirmLabel: "Main menu",
      onCancel: () => this.closeConfirmPanel(),
      onConfirm: () => {
        this.closeConfirmPanel();
        void startSceneWithFade(this, SCENE_MENU);
      },
    });
  }

  private openRestartConfirm(): void {
    if (this.isModalOpen()) return;

    this.setHudEnabled(false);

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
    if (!this.completePanel) this.setHudEnabled(true);
  }

  private openSettings(): void {
    if (this.isModalOpen()) return;
    this.setHudEnabled(false);
    this.settingsPanel = new SettingsPanel(this, () => {
      this.settingsPanel?.destroy();
      this.settingsPanel = null;
      if (!this.completePanel) this.setHudEnabled(true);
    });
  }

  private isModalOpen(): boolean {
    return Boolean(this.completePanel || this.confirmPanel || this.settingsPanel);
  }

  private setHudEnabled(enabled: boolean): void {
    this.backButton?.setInputEnabled(enabled);
    this.restartButton?.setInputEnabled(enabled);
    this.settingsButton?.setInputEnabled(enabled);
  }

  private startTutorialIfNeeded(): void {
    this.tutorial?.destroy();
    this.tutorial = null;
    if (this.board && getLevelIndex(this.levelId) === 0) {
      this.tutorial = new Level1Tutorial(this, this.board);
    }
  }

  private restartLevel(): void {
    const level = getLevelById(this.levelId);
    if (!level || !this.board) return;
    const layout = computeShelfLayout(level.shelves);
    this.board.restart(level, layout);
    this.board.onWon = () => this.onLevelWon();
    this.board.onUndoStateChange = (remaining, exhausted) => {
      this.undoButton?.setRemaining(remaining, exhausted);
    };
    this.startTutorialIfNeeded();
  }

  private onLevelWon(): void {
    if (this.completePanel) return;
    completeLevel(this.levelId);
    unlockNextLevel(this.levelId);

    const idx = getLevelIndex(this.levelId);
    const hasNext = idx >= 0 && idx < LEVELS.length - 1;

    this.setHudEnabled(false);

    this.completePanel = new LevelCompletePanel(this, {
      levelNumber: idx + 1,
      hasNextLevel: hasNext,
      onNext: () => {
        const next = LEVELS[idx + 1];
        if (next) this.scene.restart({ levelId: next.id });
      },
      onMenu: () => void startSceneWithFade(this, SCENE_MENU),
    });

    playLevelComplete();
    requestAnimationFrame(() => {
      playConfetti();
    });
  }
}
