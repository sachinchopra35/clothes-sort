import Phaser from "phaser";
import { SCENE_BOOT, SCENE_MENU } from "../config/gameConfig";
import { ALL_CLOTHING } from "../game/clothing";
import { fadeOutCamera } from "./sceneFade";
import { LoadingScreen } from "../ui/LoadingScreen";

const SVG_RENDER = 192;
const HOLD_AFTER_LOAD_MS = 280;
const FADE_OUT_MS = 480;

async function ensureFredokaFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await document.fonts.load('600 92px "Fredoka"');
  await document.fonts.load('600 72px "Fredoka"');
  await document.fonts.load('500 64px "Fredoka"');
  await document.fonts.load('500 48px "Fredoka"');
  await document.fonts.load('500 46px "Fredoka"');
  await document.fonts.ready;
}

export class BootScene extends Phaser.Scene {
  private loadingScreen: LoadingScreen | null = null;

  constructor() {
    super(SCENE_BOOT);
  }

  preload(): void {
    for (const item of ALL_CLOTHING) {
      this.load.svg(item.textureKey, item.assetPath, {
        width: SVG_RENDER,
        height: SVG_RENDER,
      });
    }
  }

  create(): void {
    this.loadingScreen = new LoadingScreen(this);

    void (async () => {
      await Promise.all([
        ensureFredokaFonts(),
        this.loadingScreen!.run(),
      ]);
      await this.delay(HOLD_AFTER_LOAD_MS);
      await fadeOutCamera(this, FADE_OUT_MS);
      this.loadingScreen?.destroy();
      this.loadingScreen = null;
      this.scene.start(SCENE_MENU, { introFade: true });
    })();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.time.delayedCall(ms, () => resolve());
    });
  }

}