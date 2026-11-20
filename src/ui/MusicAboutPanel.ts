import Phaser from "phaser";
import { playUiKnock } from "../audio/uiSounds";
import { CLOTHING_CATALOG } from "../game/clothing";
import {
  CLOTHING_DISPLAY_SCALE,
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  MODAL_UI_DEPTH,
  SLOT_SIZE,
} from "../config/layout";
import {
  PANEL_BUTTON_H,
  PANEL_INSET,
  panelContentWidth,
} from "../config/panelLayout";
import { theme } from "../config/theme";
import { openExternalUrl } from "../util/openUrl";
import { Button } from "./Button";
import { playModalPopIn } from "./modalPopIn";

const PANEL_W = DESIGN_WIDTH - 96;
/** Tall sheet on phone — more room for the essay before scrolling. */
const PANEL_VERTICAL_MARGIN = 72;
const PANEL_H = DESIGN_HEIGHT - PANEL_VERTICAL_MARGIN * 2;
const PANEL_TOP = PANEL_VERTICAL_MARGIN;
const CX = DESIGN_WIDTH / 2;
const PANEL_PIVOT_Y = PANEL_TOP + PANEL_H / 2;
const PADDING = 44;
const ICON_SIZE = Math.round(SLOT_SIZE * CLOTHING_DISPLAY_SCALE);
const ICON_GAP_ABOVE = 16;
const ICON_GAP_BELOW = 24;
const ICONS_Y = 124 + ICON_SIZE / 2 + ICON_GAP_ABOVE;
const HEADER = ICONS_Y + ICON_SIZE / 2 + 32 + ICON_GAP_BELOW;
const FOOTER = PANEL_INSET + PANEL_BUTTON_H + 28;
const SCROLL_HINT_RESERVE = 68;
const BODY_FONT_PX = 40;
const LINE_HEIGHT = 56;
const PARAGRAPH_GAP = 40;
const LINK_COLOR = "#f4a261";
const LINK_COLOR_NUM = 0xf4a261;
const TAP_SLOP = 16;

type Segment = { text: string; url?: string };
type LinkRect = { x: number; y: number; w: number; h: number; url: string };

const SPOTIFY_NICE_PIANO =
  "https://open.spotify.com/playlist/6WhNmkdCOfD9BPYrxobqOL?si=b26ace6b8b87422a";
const YOUTUBE_CONCERT =
  "https://youtu.be/Nw-0orix0ok?si=KTCouEEkkOiYjWik";
const SPOTIFY_RACH2 =
  "https://open.spotify.com/playlist/314FAXYaMohCozMeyIASX2?si=d5ee2920735c4ed7";

const PARAGRAPHS: Segment[][] = [
  [{ text: "I think piano music is seriously good for the soul." }],
  [
    {
      text: "But how comes so many of us don’t listen to it? Maybe people might think it’s too posh or too complicated. I disagree, I just think it’s all really lovely music.",
    },
  ],
  [
    {
      text: "I’d love to get more people to give it a chance, especially since it’s brought so much joy to me personally. That’s why I recorded all these pieces to put them in the Clothes Sort soundtrack.",
    },
  ],
  [
    { text: "If you like the vibe of the music in this game, there’s lots more in my " },
    { text: "Nice Piano playlist on Spotify", url: SPOTIFY_NICE_PIANO },
  ],
  [
    { text: "If you want to hear me play some crazier stuff, you can " },
    { text: "watch my latest concert on YouTube", url: YOUTUBE_CONCERT },
  ],
  [
    { text: "And finally, if you’d like to hear my favourite piece of piano music, check out " },
    { text: "Rachmaninoff’s Piano Concerto No. 2 on Spotify", url: SPOTIFY_RACH2 },
    {
      text: ". The first 3 minutes are thunderous and chaotic, then the rest of it contains such nice, lush, and satisfying music.",
    },
  ],
  [{ text: "Enjoy!" }],
];

export class MusicAboutPanel extends Phaser.GameObjects.Container {
  private wheelHandler?: (
    pointer: Phaser.Input.Pointer,
    over: Phaser.GameObjects.GameObject[],
    deltaX: number,
    deltaY: number,
  ) => void;

  constructor(scene: Phaser.Scene, onClose: () => void) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setDepth(MODAL_UI_DEPTH + 100);

    const backdrop = scene.add.rectangle(
      CX,
      DESIGN_HEIGHT / 2,
      DESIGN_WIDTH,
      DESIGN_HEIGHT,
      theme.ui.overlayDim,
      0.55,
    );
    backdrop.setInteractive();
    backdrop.on("pointerdown", onClose);
    this.add(backdrop);

    const panelLeft = CX - PANEL_W / 2;

    const panel = scene.add.graphics();
    panel.fillStyle(theme.ui.panelFill, 0.97);
    panel.fillRoundedRect(panelLeft, PANEL_TOP, PANEL_W, PANEL_H, 24);
    panel.lineStyle(4, theme.ui.panelStroke, 1);
    panel.strokeRoundedRect(panelLeft, PANEL_TOP, PANEL_W, PANEL_H, 24);
    this.add(panel);

    const title = scene.add.text(CX, PANEL_TOP + 52, "About the Music", {
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize.heading,
      color: theme.ui.text,
    });
    title.setOrigin(0.5);
    this.add(title);

    const teeKey = CLOTHING_CATALOG["red-tee"].textureKey;
    const iconsY = PANEL_TOP + ICONS_Y;
    const iconGap = 36;
    const tee = scene.add.image(CX - (ICON_SIZE + iconGap) / 2, iconsY, teeKey);
    tee.setDisplaySize(ICON_SIZE, ICON_SIZE);
    this.add(tee);

    const notes = scene.add.text(CX + (ICON_SIZE + iconGap) / 2, iconsY, "🎵", {
      fontFamily: theme.fontFamily,
      fontSize: `${Math.round(ICON_SIZE * 0.85)}px`,
    });
    notes.setOrigin(0.5);
    this.add(notes);

    const textWidth = PANEL_W - PADDING * 2;
    const viewTop = PANEL_TOP + HEADER;
    const viewHeightFull = PANEL_H - HEADER - FOOTER;
    const textX = panelLeft + PADDING;

    const scrollContent = scene.add.container(textX, viewTop);
    this.add(scrollContent);

    const linkRects: LinkRect[] = [];
    const underline = scene.add.graphics();
    let cursorY = 0;

    const style = (color: string): Phaser.Types.GameObjects.Text.TextStyle => ({
      fontFamily: theme.fontFamily,
      fontSize: `${BODY_FONT_PX}px`,
      color,
    });
    const spaceW = (() => {
      const t = scene.add.text(0, 0, "a a", style(theme.ui.text));
      const t2 = scene.add.text(0, 0, "aa", style(theme.ui.text));
      const w = t.width - t2.width;
      t.destroy();
      t2.destroy();
      return w;
    })();

    // Word-by-word flow so links stay inline with the sentence.
    for (const paragraph of PARAGRAPHS) {
      const tokens: { word: string; url?: string; spaceBefore: boolean }[] = [];
      let pendingSpace = false;
      for (const seg of paragraph) {
        for (const part of seg.text.split(/(\s+)/)) {
          if (part === "") continue;
          if (/^\s+$/.test(part)) {
            pendingSpace = true;
            continue;
          }
          tokens.push({ word: part, url: seg.url, spaceBefore: pendingSpace });
          pendingSpace = false;
        }
      }

      let x = 0;
      let prevUrl: string | undefined;
      tokens.forEach((tok, idx) => {
        const label = scene.add.text(0, 0, tok.word, style(tok.url ? LINK_COLOR : theme.ui.text));
        const gap = idx > 0 && tok.spaceBefore ? spaceW : 0;
        let wx = x + gap;
        let wrapped = false;
        if (idx > 0 && wx + label.width > textWidth) {
          cursorY += LINE_HEIGHT;
          wx = 0;
          wrapped = true;
        }
        label.setPosition(wx, cursorY);
        scrollContent.add(label);
        if (tok.url) {
          const continuesLink = prevUrl === tok.url && !wrapped && gap > 0;
          const startX = continuesLink ? wx - gap : wx;
          const uy = cursorY + BODY_FONT_PX + 6;
          underline.lineStyle(3, LINK_COLOR_NUM, 1);
          underline.lineBetween(startX, uy, wx + label.width, uy);
          linkRects.push({
            x: startX - 4,
            y: cursorY - 8,
            w: wx + label.width - startX + 8,
            h: LINE_HEIGHT,
            url: tok.url,
          });
        }
        x = wx + label.width;
        prevUrl = tok.url;
      });
      cursorY += LINE_HEIGHT + PARAGRAPH_GAP;
    }
    scrollContent.add(underline);

    const bodyHeight = cursorY - PARAGRAPH_GAP;

    const scrollable = bodyHeight > viewHeightFull + 4;
    const viewHeight = scrollable
      ? viewHeightFull - SCROLL_HINT_RESERVE
      : viewHeightFull;

    const maskGraphics = scene.add.graphics();
    maskGraphics.setVisible(false);
    maskGraphics.fillStyle(0xffffff);
    maskGraphics.fillRect(textX, viewTop, textWidth, viewHeight);
    scrollContent.setMask(maskGraphics.createGeometryMask());

    const maxScroll = Math.max(0, bodyHeight - viewHeight);
    let scrollOffset = 0;
    const scrollHomeY = viewTop - PANEL_PIVOT_Y;

    const applyScroll = (next: number) => {
      scrollOffset = Phaser.Math.Clamp(next, 0, maxScroll);
      scrollContent.y = scrollHomeY - scrollOffset;
    };

    const scrollZone = scene.add.zone(
      textX + textWidth / 2,
      viewTop + viewHeight / 2,
      textWidth,
      viewHeight,
    );
    scrollZone.setInteractive();
    this.add(scrollZone);

    let dragStartY = 0;
    let scrollStart = 0;

    scrollZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      dragStartY = pointer.y;
      scrollStart = scrollOffset;
    });

    scrollZone.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;
      applyScroll(scrollStart - (pointer.y - dragStartY));
    });

    const local = new Phaser.Math.Vector2();
    scrollZone.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (Math.abs(pointer.y - dragStartY) > TAP_SLOP) return;
      scrollContent.getWorldTransformMatrix().applyInverse(pointer.worldX, pointer.worldY, local);
      const hit = linkRects.find(
        (r) => local.x >= r.x && local.x <= r.x + r.w && local.y >= r.y && local.y <= r.y + r.h,
      );
      if (!hit) return;
      playUiKnock();
      openExternalUrl(hit.url);
    });

    this.wheelHandler = (_p, _over, _dx, deltaY) => {
      applyScroll(scrollOffset + deltaY * 0.35);
    };
    scene.input.on("wheel", this.wheelHandler);

    const btnY = PANEL_TOP + PANEL_H - PANEL_INSET - PANEL_BUTTON_H / 2;
    const btnW = panelContentWidth(PANEL_W);

    if (scrollable) {
      const hint = scene.add.text(
        CX,
        btnY - PANEL_BUTTON_H / 2 - 40,
        "Swipe up or down to read more",
        {
          fontFamily: theme.fontFamily,
          fontSize: theme.fontSize.small,
          color: theme.ui.textMuted,
          align: "center",
          wordWrap: { width: btnW },
        },
      );
      hint.setOrigin(0.5, 1);
      this.add(hint);
    }

    new Button(
      scene,
      {
        x: CX,
        y: btnY,
        width: btnW,
        height: PANEL_BUTTON_H,
        label: "Done",
        fontSize: theme.fontSize.body,
        onClick: onClose,
      },
      this,
    );

    this.on(Phaser.GameObjects.Events.DESTROY, () => {
      if (this.wheelHandler) {
        scene.input.off("wheel", this.wheelHandler);
      }
      maskGraphics.destroy();
    });

    playModalPopIn(scene, this, backdrop, {
      pivotX: CX,
      pivotY: PANEL_PIVOT_Y,
    });
  }
}