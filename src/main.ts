import Phaser from "phaser";
import { createGameConfig } from "./config/gameConfig";
import { applySilentModeSetting } from "./audio/audioSession";

applySilentModeSetting();

const config = createGameConfig("game-container");
new Phaser.Game(config);
