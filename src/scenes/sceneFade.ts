import Phaser from "phaser";

export const SCENE_FADE_OUT_MS = 420;
export const SCENE_FADE_IN_MS = 500;

export type SceneIntroFadeData = {
  introFade?: boolean;
};

export function fadeOutCamera(
  scene: Phaser.Scene,
  ms: number = SCENE_FADE_OUT_MS,
): Promise<void> {
  return new Promise((resolve) => {
    const cam = scene.cameras.main;
    cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => resolve());
    cam.fadeOut(ms, 0, 0, 0);
  });
}

export function fadeInCamera(
  scene: Phaser.Scene,
  ms: number = SCENE_FADE_IN_MS,
): void {
  scene.cameras.main.fadeIn(ms, 0, 0, 0);
}

export async function startSceneWithFade(
  scene: Phaser.Scene,
  key: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  await fadeOutCamera(scene);
  scene.scene.start(key, { ...data, introFade: true });
}