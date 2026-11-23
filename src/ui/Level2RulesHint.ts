import Phaser from "phaser";
import type { ShelfLayoutEntry } from "../layout/shelfLayout";
import { ShelfBandHintPanel } from "./ShelfBandHintPanel";

const CONTENT = {
  title: "Remember:",
  lines: [
    "Clothes can be moved to an empty shelf",
    "Clothes can be moved next to other clothes of the same kind",
  ],
} as const;

/** Level 2: gentle persistent rules reminder below the lowest shelf. */
export class Level2RulesHint {
  private readonly panel: ShelfBandHintPanel;

  constructor(scene: Phaser.Scene, layout: ShelfLayoutEntry[]) {
    this.panel = new ShelfBandHintPanel(scene, layout, CONTENT);
  }

  destroy(): void {
    this.panel.destroy();
  }
}