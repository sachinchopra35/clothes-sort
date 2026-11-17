import Phaser from "phaser";
import { LEVELS, getLevelIndex } from "../levels/levelData";
import {
  isLevelCompleted,
  isLevelUnlocked,
  setSelectedLevelId,
} from "../state/progress";
import { scaleButtonSize } from "../config/uiButtons";
import { theme } from "../config/theme";
import { Button } from "./Button";

/** Half-width from center to each arrow button centre */
const ARROW_OFFSET = 270;
const ARROW_SIZE = scaleButtonSize(96, 96).width;
const LABEL_MAX_WIDTH = 520;

export interface LevelPickerOptions {
  x: number;
  y: number;
  initialLevelId: string;
  onChange: (levelId: string) => void;
  onLockedTap?: (levelId: string) => void;
}

export class LevelPicker extends Phaser.GameObjects.Container {
  private levelId: string;
  private levelLabel: Phaser.GameObjects.Text;
  private completeTick: Phaser.GameObjects.Text;
  private lockHint: Phaser.GameObjects.Text;
  private readonly onChange: (levelId: string) => void;
  private readonly onLockedTap?: (levelId: string) => void;

  constructor(
    scene: Phaser.Scene,
    options: LevelPickerOptions,
    parent?: Phaser.GameObjects.Container,
  ) {
    super(scene, options.x, options.y);
    if (parent) {
      parent.add(this);
    } else {
      scene.add.existing(this);
    }

    this.levelId = options.initialLevelId;
    this.onChange = options.onChange;
    this.onLockedTap = options.onLockedTap;

    new Button(
      scene,
      {
        x: -ARROW_OFFSET,
        y: 0,
        width: ARROW_SIZE,
        height: ARROW_SIZE,
        label: "◀",
        fontSize: theme.fontSize.heading,
        onClick: () => this.shift(-1),
      },
      this,
    );

    new Button(
      scene,
      {
        x: ARROW_OFFSET,
        y: 0,
        width: ARROW_SIZE,
        height: ARROW_SIZE,
        label: "▶",
        fontSize: theme.fontSize.heading,
        onClick: () => this.shift(1),
      },
      this,
    );

    this.completeTick = scene.add.text(0, -52, "✓", {
      fontFamily: theme.fontFamily,
      fontSize: "72px",
      color: theme.ui.success,
      stroke: theme.ui.successStroke,
      strokeThickness: 6,
    });
    this.completeTick.setOrigin(0.5);
    this.completeTick.setVisible(false);

    this.levelLabel = scene.add.text(0, 0, "", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.menuLevel,
      color: theme.ui.text,
      align: "center",
      wordWrap: { width: LABEL_MAX_WIDTH },
    });
    this.levelLabel.setOrigin(0.5);

    this.lockHint = scene.add.text(0, 52, "", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.small,
      color: theme.ui.textMuted,
    });
    this.lockHint.setOrigin(0.5);
    this.lockHint.setInteractive({ useHandCursor: true });
    this.lockHint.on("pointerdown", () => {
      if (isLevelUnlocked(this.levelId)) return;
      this.onLockedTap?.(this.levelId);
    });

    this.add([this.completeTick, this.levelLabel, this.lockHint]);
    this.setSize(LABEL_MAX_WIDTH, 200);
    this.refreshLabel();
  }

  getSelectedLevelId(): string {
    return this.levelId;
  }

  isSelectionPlayable(): boolean {
    return isLevelUnlocked(this.levelId);
  }

  refresh(): void {
    this.refreshLabel();
  }

  private shift(delta: number): void {
    let idx = getLevelIndex(this.levelId);
    if (idx < 0) idx = 0;
    idx = (idx + delta + LEVELS.length) % LEVELS.length;
    this.levelId = LEVELS[idx].id;
    setSelectedLevelId(this.levelId);
    this.onChange(this.levelId);
    this.refreshLabel();
  }

  private refreshLabel(): void {
    const idx = getLevelIndex(this.levelId);
    const unlocked = isLevelUnlocked(this.levelId);
    const completed = isLevelCompleted(this.levelId);

    this.levelLabel.setText(`Level ${idx + 1}`);
    this.levelLabel.setColor(unlocked ? theme.ui.text : theme.ui.locked);
    this.completeTick.setVisible(completed);
    this.lockHint.setText(unlocked ? "" : "🔒 Locked");
    if (unlocked) {
      this.lockHint.disableInteractive();
    } else {
      this.lockHint.setInteractive({ useHandCursor: true });
    }
  }
}
