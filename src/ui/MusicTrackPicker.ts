import Phaser from "phaser";
import { playNextTrack, playPreviousTrack } from "../audio/musicManager";
import { MUSIC_TRACKS } from "../audio/musicCatalog";
import { getSettings } from "../state/settings";
import { scaleButtonSize } from "../config/uiButtons";
import { theme } from "../config/theme";
import { Button } from "./Button";

const ARROW_OFFSET = 250;
const ARROW_SIZE = scaleButtonSize(96, 96).width;
/** Text must stay clear of the arrow buttons on both sides. */
const LABEL_MAX_WIDTH = 2 * (ARROW_OFFSET - ARROW_SIZE / 2) - 32;
const ARROW_Y = 24;
const COMPOSER_TO_PIECE = 6;

export interface MusicTrackPickerOptions {
  x: number;
  y: number;
}

/** "Chopin — Nocturne 1" → composer line + piece line(s). */
function splitTitle(title: string): { composer: string; piece: string } {
  const sep = title.match(/\s+[—–-]\s+/);
  if (!sep || sep.index === undefined) return { composer: "", piece: title };
  return {
    composer: title.slice(0, sep.index),
    piece: title.slice(sep.index + sep[0].length),
  };
}

export class MusicTrackPicker extends Phaser.GameObjects.Container {
  private readonly composerText: Phaser.GameObjects.Text;
  private readonly pieceText: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    options: MusicTrackPickerOptions,
    parent?: Phaser.GameObjects.Container,
  ) {
    super(scene, options.x, options.y);
    if (parent) {
      parent.add(this);
    } else {
      scene.add.existing(this);
    }

    new Button(
      scene,
      {
        x: -ARROW_OFFSET,
        y: ARROW_Y,
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
        y: ARROW_Y,
        width: ARROW_SIZE,
        height: ARROW_SIZE,
        label: "▶",
        fontSize: theme.fontSize.heading,
        onClick: () => this.shift(1),
      },
      this,
    );

    this.composerText = scene.add.text(0, 0, "", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: theme.ui.textMuted,
      align: "center",
      wordWrap: { width: LABEL_MAX_WIDTH, useAdvancedWrap: true },
    });
    this.composerText.setOrigin(0.5, 0);

    this.pieceText = scene.add.text(0, 0, "", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.body,
      color: theme.ui.text,
      align: "center",
      lineSpacing: 4,
      wordWrap: { width: LABEL_MAX_WIDTH, useAdvancedWrap: true },
    });
    this.pieceText.setOrigin(0.5, 0);

    this.add([this.composerText, this.pieceText]);
    this.refresh();
  }

  refresh(): void {
    const title = MUSIC_TRACKS[getSettings().musicTrackIndex]?.title ?? "";
    const { composer, piece } = splitTitle(title);
    this.composerText.setText(composer);
    this.pieceText.setText(piece);

    const composerH = composer ? this.composerText.height + COMPOSER_TO_PIECE : 0;
    const top = ARROW_Y - (composerH + this.pieceText.height) / 2;
    this.composerText.setY(top);
    this.pieceText.setY(top + composerH);

    this.setAlpha(getSettings().musicVolume <= 0.001 ? 0.45 : 1);
  }

  private shift(delta: number): void {
    if (MUSIC_TRACKS.length === 0) return;
    if (delta < 0) playPreviousTrack();
    else playNextTrack();
    this.refresh();
  }
}
