import Phaser from "phaser";
import { SCENE_GAME, SCENE_MENU } from "../config/gameConfig";
import { scaleButtonSize } from "../config/uiButtons";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../config/layout";
import { theme } from "../config/theme";
import { WardrobeBackground } from "../objects/WardrobeBackground";
import { getSelectedLevelId, resetProgressCache } from "../state/progress";
import { Button } from "../ui/Button";
import { LevelPicker } from "../ui/LevelPicker";
import { CheatCodePanel } from "../ui/CheatCodePanel";
import { InstructionsPanel } from "../ui/InstructionsPanel";
import { SettingsPanel } from "../ui/SettingsPanel";

export class MainMenuScene extends Phaser.Scene {
  private settingsPanel: SettingsPanel | null = null;
  private instructionsPanel: InstructionsPanel | null = null;
  private cheatPanel: CheatCodePanel | null = null;
  private picker!: LevelPicker;

  constructor() {
    super(SCENE_MENU);
  }

  create(): void {
    resetProgressCache();

    new WardrobeBackground(this, { dimOverlay: 0.35 });

    const title = this.add.text(DESIGN_WIDTH / 2, 280, "Clothes Sort", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.title,
      color: theme.ui.text,
      stroke: "#5c3d28",
      strokeThickness: 6,
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(DESIGN_WIDTH / 2, 380, "Tidy the wardrobe", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: theme.ui.textMuted,
    });
    subtitle.setOrigin(0.5);

    this.picker = new LevelPicker(this, {
      x: DESIGN_WIDTH / 2,
      y: DESIGN_HEIGHT / 2 - 40,
      initialLevelId: getSelectedLevelId(),
      onChange: () => {},
      onLockedTap: (levelId) => this.openCheatCode(levelId),
    });

    const play = scaleButtonSize(420, 120);
    new Button(this, {
      x: DESIGN_WIDTH / 2,
      y: DESIGN_HEIGHT / 2 + 200,
      width: play.width,
      height: play.height,
      label: "Play",
      fontSize: theme.fontSize.heading,
      onClick: () => this.startGame(),
    });

    const secondary = scaleButtonSize(320, 88);
    new Button(this, {
      x: DESIGN_WIDTH / 2,
      y: DESIGN_HEIGHT - 268,
      width: secondary.width,
      height: secondary.height,
      label: "How to play",
      fontSize: theme.fontSize.body,
      onClick: () => this.openInstructions(),
    });

    new Button(this, {
      x: DESIGN_WIDTH / 2,
      y: DESIGN_HEIGHT - 160,
      width: secondary.width,
      height: secondary.height,
      label: "Settings",
      fontSize: theme.fontSize.body,
      onClick: () => this.openSettings(),
    });
  }

  private startGame(): void {
    if (!this.picker.isSelectionPlayable()) return;
    const levelId = this.picker.getSelectedLevelId();
    this.scene.start(SCENE_GAME, { levelId });
  }

  private openCheatCode(levelId: string): void {
    if (
      this.cheatPanel ||
      this.instructionsPanel ||
      this.settingsPanel
    ) {
      return;
    }
    this.cheatPanel = new CheatCodePanel(this, {
      levelId,
      onCancel: () => this.closeCheatCode(),
      onSuccess: () => {
        this.closeCheatCode();
        this.picker.refresh();
      },
    });
  }

  private closeCheatCode(): void {
    this.cheatPanel?.destroy();
    this.cheatPanel = null;
  }

  private openInstructions(): void {
    if (this.instructionsPanel || this.settingsPanel || this.cheatPanel) return;
    this.instructionsPanel = new InstructionsPanel(this, () => {
      this.instructionsPanel?.destroy();
      this.instructionsPanel = null;
    });
  }

  private openSettings(): void {
    if (this.settingsPanel || this.instructionsPanel || this.cheatPanel) return;
    this.settingsPanel = new SettingsPanel(this, () => {
      this.settingsPanel?.destroy();
      this.settingsPanel = null;
    });
  }
}
