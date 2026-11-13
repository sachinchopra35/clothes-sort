import type { Types } from "phaser";
import { DESIGN_HEIGHT, DESIGN_WIDTH } from "./layout";
import { BootScene } from "../scenes/BootScene";
import { MainMenuScene } from "../scenes/MainMenuScene";
import { GameScene } from "../scenes/GameScene";

export const SCENE_BOOT = "BootScene";
export const SCENE_MENU = "MainMenuScene";
export const SCENE_GAME = "GameScene";

export function createGameConfig(parent: string): Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    backgroundColor: "#2a2118",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, MainMenuScene, GameScene],
    render: {
      antialias: true,
      pixelArt: false,
    },
  };
}
