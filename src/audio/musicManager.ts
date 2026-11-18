import Phaser from "phaser";
import { MUSIC_TRACKS } from "./musicCatalog";
import { getSettings, setMusicTrackIndex } from "../state/settings";

type BgmSound = Phaser.Sound.BaseSound & {
  setVolume?(volume: number): void;
};

let sceneRef: Phaser.Scene | null = null;
let current: BgmSound | null = null;
let currentIndex = -1;
let unlocked = false;

function effectiveMusicVolume(): number {
  return getSettings().musicVolume;
}

function shouldPlay(): boolean {
  return effectiveMusicVolume() > 0.001;
}

function detachCurrent(): void {
  current?.stop();
  current?.destroy();
  current = null;
  currentIndex = -1;
}

function onTrackEnded(): void {
  if (!sceneRef || !shouldPlay()) return;
  const next = (currentIndex + 1) % MUSIC_TRACKS.length;
  playIndex(next, true);
}

export function registerMusicScene(scene: Phaser.Scene): void {
  sceneRef = scene;
}

export function unlockMusicFromGesture(): void {
  if (unlocked) return;
  unlocked = true;
  const scene = sceneRef;
  if (!scene || !scene.sound.locked) return;
  scene.sound.unlock();
}

export function applyMusicSettings(): void {
  const vol = effectiveMusicVolume();
  if (current?.setVolume) {
    current.setVolume(vol);
  }
  if (!shouldPlay()) {
    current?.pause();
    return;
  }
  const settings = getSettings();
  if (current && currentIndex === settings.musicTrackIndex && current.isPaused) {
    current.resume();
    if (current.setVolume) current.setVolume(vol);
    return;
  }
  if (!current || currentIndex !== settings.musicTrackIndex) {
    playIndex(settings.musicTrackIndex, false);
    return;
  }
  if (current.isPaused) {
    current.resume();
  }
}

function playIndex(index: number, persistIndex: boolean): void {
  const scene = sceneRef;
  if (!scene || MUSIC_TRACKS.length === 0) return;

  const track = MUSIC_TRACKS[index];
  if (!track) return;

  detachCurrent();

  const sound = scene.sound.add(track.audioKey, {
    volume: effectiveMusicVolume(),
    loop: false,
  }) as BgmSound;

  sound.once(Phaser.Sound.Events.COMPLETE, onTrackEnded);
  current = sound;
  currentIndex = index;

  if (persistIndex) {
    setMusicTrackIndex(index);
  }

  if (shouldPlay()) {
    if (scene.sound.locked) return;
    sound.play();
  }
}

export function ensureMusicPlaying(): void {
  if (!shouldPlay()) return;
  const settings = getSettings();
  if (!current || currentIndex !== settings.musicTrackIndex) {
    playIndex(settings.musicTrackIndex, false);
    return;
  }
  if (!current.isPlaying && !current.isPaused) {
    current.play();
  }
}

export function playNextTrack(): void {
  const next = (getSettings().musicTrackIndex + 1) % MUSIC_TRACKS.length;
  playIndex(next, true);
}

export function playPreviousTrack(): void {
  const n = MUSIC_TRACKS.length;
  const prev = (getSettings().musicTrackIndex - 1 + n) % n;
  playIndex(prev, true);
}

export function getPlayingTrackIndex(): number {
  return getSettings().musicTrackIndex;
}

export function getPlayingTrackTitle(): string {
  return MUSIC_TRACKS[getSettings().musicTrackIndex]?.title ?? "";
}

export function stopMusic(): void {
  detachCurrent();
}