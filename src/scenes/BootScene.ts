import Phaser from "phaser";
import { SCENE_MENU } from "../config/gameConfig";
import { ALL_CLOTHING } from "../game/clothing";

const SVG_RENDER = 192;

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
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
    void (async () => {
      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.load('600 72px "Fredoka"');
        await document.fonts.load('500 48px "Fredoka"');
        await document.fonts.ready;
      }
      this.scene.start(SCENE_MENU);
    })();
  }
}
