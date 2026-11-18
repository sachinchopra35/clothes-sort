/**
 * Playback gain on top of the user sliders. Sliders still run 0–1; at max, BGM and SFX
 * are nudged toward each other so normalized tracks don't swamp the synth effects.
 */
const MUSIC_OUTPUT_SCALE = 0.85;
const SFX_OUTPUT_SCALE = 1.15;

export function effectiveMusicPlaybackVolume(musicVolume: number): number {
  return Math.max(0, Math.min(1, musicVolume * MUSIC_OUTPUT_SCALE));
}

export function effectiveSfxGain(soundVolume: number): number {
  return Math.max(0, soundVolume * SFX_OUTPUT_SCALE);
}