import Phaser from "phaser";
import { createGameConfig } from "./config/gameConfig";

const config = createGameConfig("game-container");
new Phaser.Game(config);
