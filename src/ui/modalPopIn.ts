import Phaser from "phaser";

const POP_MS = 220;
const FADE_MS = 140;
const START_SCALE = 0.9;

export interface ModalPopInOptions {
  pivotX: number;
  pivotY: number;
  /** Left at the root and faded only (default: backdrop). */
  fadeOnly?: Phaser.GameObjects.GameObject[];
  popDuration?: number;
  fadeDuration?: number;
  startScale?: number;
  /** Phaser ease id, e.g. `Back.easeOut` or `Cubic.easeOut`. */
  popEase?: string;
  /** Overshoot for `Back.easeOut` only (default 1.15). */
  backOvershoot?: number;
  onComplete?: () => void;
}

/**
 * Groups modal content (everything except backdrop / fadeOnly) under a pivot,
 * then plays a short fade + scale-in.
 */
export function playModalPopIn(
  scene: Phaser.Scene,
  modal: Phaser.GameObjects.Container,
  backdrop: Phaser.GameObjects.GameObject,
  options: ModalPopInOptions,
): void {
  const {
    pivotX,
    pivotY,
    fadeOnly = [],
    popDuration = POP_MS,
    fadeDuration = FADE_MS,
    startScale = START_SCALE,
    popEase = "Back.easeOut",
    backOvershoot = 1.15,
    onComplete,
  } = options;
  const skip = new Set([backdrop, ...fadeOnly]);

  const popup = scene.add.container(pivotX, pivotY);
  popup.setScale(startScale);
  popup.setAlpha(0);

  const toMove = modal.list.filter((child) => !skip.has(child));
  for (const child of [...toMove]) {
    modal.remove(child, false);
    if ("x" in child && "y" in child && "setPosition" in child) {
      const t = child as unknown as Phaser.GameObjects.Components.Transform;
      t.setPosition(t.x - pivotX, t.y - pivotY);
    }
    popup.add(child);
  }
  modal.add(popup);

  const dim = backdrop as unknown as Phaser.GameObjects.Components.Alpha & {
    alpha: number;
    setAlpha: (a: number) => void;
  };
  const dimAlpha = dim.alpha;
  dim.setAlpha(0);

  scene.tweens.add({
    targets: backdrop,
    alpha: dimAlpha,
    duration: fadeDuration,
    ease: "Quad.Out",
  });

  const popTween: Phaser.Types.Tweens.TweenBuilderConfig = {
    targets: popup,
    scaleX: 1,
    scaleY: 1,
    alpha: 1,
    duration: popDuration,
    ease: popEase,
    onComplete: () => onComplete?.(),
  };
  if (popEase === "Back.easeOut") {
    popTween.easeParams = [backOvershoot];
  }
  scene.tweens.add(popTween);
}