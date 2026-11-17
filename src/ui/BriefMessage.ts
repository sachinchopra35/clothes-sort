import Phaser from "phaser";
import { DESIGN_HEIGHT, DESIGN_WIDTH, GAME_HUD_DEPTH } from "../config/layout";
import { theme } from "../config/theme";

const PAD_X = 28;
const PAD_Y = 16;

export function showBriefMessage(scene: Phaser.Scene, message: string): void {
  const cx = DESIGN_WIDTH / 2;
  const y = DESIGN_HEIGHT - 300;

  const label = scene.add.text(0, 0, message, {
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize.body,
    color: theme.ui.text,
    align: "center",
  });
  label.setOrigin(0.5);

  const w = label.width + PAD_X * 2;
  const h = label.height + PAD_Y * 2;
  const bg = scene.add.graphics();
  bg.fillStyle(theme.ui.panelFill, 0.94);
  bg.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
  bg.lineStyle(2, theme.ui.panelStroke, 1);
  bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);

  const root = scene.add.container(cx, y, [bg, label]);
  root.setDepth(GAME_HUD_DEPTH + 2);
  root.setAlpha(0);

  scene.tweens.add({
    targets: root,
    alpha: 1,
    y: y - 8,
    duration: 180,
    ease: "Quad.out",
  });

  scene.time.delayedCall(1500, () => {
    scene.tweens.add({
      targets: root,
      alpha: 0,
      duration: 320,
      ease: "Quad.in",
      onComplete: () => root.destroy(true),
    });
  });
}