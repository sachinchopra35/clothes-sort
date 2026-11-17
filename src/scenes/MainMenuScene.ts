import Phaser from "phaser";
import { SCENE_GAME, SCENE_MENU } from "../config/gameConfig";
import { scaleButtonSize } from "../config/uiButtons";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "../config/layout";
import { theme } from "../config/theme";
import { WardrobeBackground } from "../objects/WardrobeBackground";
import { WardrobeFrameOverlay } from "../objects/wardrobeFrame";
import { getSelectedLevelId, resetProgressCache } from "../state/progress";
import { Button } from "../ui/Button";
import { MenuPlayCard } from "../ui/MenuPlayCard";
import { CheatCodePanel } from "../ui/CheatCodePanel";
import { InstructionsPanel } from "../ui/InstructionsPanel";
import { MenuClothesMarquee } from "../ui/MenuClothesMarquee";
import { SettingsPanel } from "../ui/SettingsPanel";
import {
  fadeInCamera,
  type SceneIntroFadeData,
  startSceneWithFade,
} from "./sceneFade";

/** Vertical bands for the slow scrolling clothes (design px). */
const MENU_MARQUEE_UPPER_TOP = 430;
const MENU_MARQUEE_UPPER_HEIGHT = 330;
const MENU_MARQUEE_LOWER_TOP = 1250;
const MENU_MARQUEE_LOWER_HEIGHT = 340;
export class MainMenuScene extends Phaser.Scene {
  private introFade = false;
  private settingsPanel: SettingsPanel | null = null;
  private instructionsPanel: InstructionsPanel | null = null;
  private cheatPanel: CheatCodePanel | null = null;
  private playCard!: MenuPlayCard;
  private marquees: MenuClothesMarquee[] = [];

  constructor() {
    super(SCENE_MENU);
  }

  init(data: SceneIntroFadeData): void {
    this.introFade = data.introFade ?? false;
  }

  create(): void {
    resetProgressCache();

    new WardrobeBackground(this, { dimOverlay: 0.35, backOnly: true });

    this.marquees = [
      new MenuClothesMarquee(this, {
        bandTop: MENU_MARQUEE_UPPER_TOP,
        bandHeight: MENU_MARQUEE_UPPER_HEIGHT,
        direction: "left",
        clothingOffset: 0,
      }),
      new MenuClothesMarquee(this, {
        bandTop: MENU_MARQUEE_LOWER_TOP,
        bandHeight: MENU_MARQUEE_LOWER_HEIGHT,
        direction: "right",
        clothingOffset: 3,
      }),
    ];

    new WardrobeFrameOverlay(this);

    const title = this.add.text(DESIGN_WIDTH / 2, 268, "Clothes Sort", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.menuTitle,
      color: theme.ui.text,
      stroke: "#5c3d28",
      strokeThickness: 8,
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(DESIGN_WIDTH / 2, 388, "Tidy the wardrobe!", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.menuTagline,
      color: theme.ui.textMuted,
    });
    subtitle.setOrigin(0.5);

    this.playCard = new MenuPlayCard(this, {
      x: DESIGN_WIDTH / 2,
      y: DESIGN_HEIGHT / 2 + 60,
      initialLevelId: getSelectedLevelId(),
      onPlay: () => this.startGame(),
      onLockedTap: (levelId) => this.openCheatCode(levelId),
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

    if (this.introFade) {
      fadeInCamera(this);
      this.introFade = false;
    }
  }

  shutdown(): void {
    for (const m of this.marquees) {
      m.destroy();
    }
    this.marquees = [];
  }

  private startGame(): void {
    if (!this.playCard.isSelectionPlayable()) return;
    const levelId = this.playCard.getSelectedLevelId();
    void startSceneWithFade(this, SCENE_GAME, { levelId });
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
        this.playCard.refresh();
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
