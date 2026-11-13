import Phaser from "phaser";
import { LEVELS, getLevelIndex } from "../levels/levelData";
import { isLevelUnlocked, setSelectedLevelId } from "../state/progress";
import { theme } from "../config/theme";
import { Button } from "./Button";

/** Half-width from center to each arrow button centre */
const ARROW_OFFSET = 380;
const ARROW_SIZE = 96;
const LABEL_MAX_WIDTH = 520;

export interface LevelPickerOptions {
  x: number;
  y: number;
  initialLevelId: string;
  onChange: (levelId: string) => void;
}

export class LevelPicker extends Phaser.GameObjects.Container {
  private levelId: string;
  private levelLabel: Phaser.GameObjects.Text;
  private lockHint: Phaser.GameObjects.Text;
  private readonly onChange: (levelId: string) => void;

  constructor(scene: Phaser.Scene, options: LevelPickerOptions) {
    super(scene, options.x, options.y);
    scene.add.existing(this);

    this.levelId = options.initialLevelId;
    this.onChange = options.onChange;

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

    this.levelLabel = scene.add.text(0, 8, "", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.heading,
      color: theme.ui.text,
      align: "center",
      wordWrap: { width: LABEL_MAX_WIDTH },
    });
    this.levelLabel.setOrigin(0.5);

    this.lockHint = scene.add.text(0, 72, "", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.small,
      color: theme.ui.textMuted,
    });
    this.lockHint.setOrigin(0.5);

    this.add([this.levelLabel, this.lockHint]);
    this.setSize(LABEL_MAX_WIDTH, 160);
    this.refreshLabel();
  }

  getSelectedLevelId(): string {
    return this.levelId;
  }

  isSelectionPlayable(): boolean {
    return isLevelUnlocked(this.levelId);
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

    this.levelLabel.setText(`Level ${idx + 1}`);
    this.levelLabel.setColor(unlocked ? theme.ui.text : theme.ui.locked);
    this.lockHint.setText(unlocked ? "" : "🔒 Locked");
  }
}
