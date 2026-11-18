import { MUSIC_TRACKS } from "../audio/musicCatalog";
import { loadJson, saveJson } from "./storage";

const KEY_SETTINGS = "settings";

export interface GameSettings {
  /** 0–1; 0 = muted. */
  soundVolume: number;
  musicVolume: number;
  musicTrackIndex: number;
}

const DEFAULT_SETTINGS: GameSettings = {
  soundVolume: 1,
  musicVolume: 0.85,
  musicTrackIndex: 0,
};

type StoredSettings = Partial<GameSettings> & {
  soundEnabled?: boolean;
  musicEnabled?: boolean;
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function normalizeStored(raw: StoredSettings): GameSettings {
  let soundVolume = raw.soundVolume;
  if (typeof soundVolume !== "number") {
    soundVolume = raw.soundEnabled === false ? 0 : DEFAULT_SETTINGS.soundVolume;
  }

  let musicVolume = raw.musicVolume;
  if (typeof musicVolume !== "number") {
    musicVolume = raw.musicEnabled === false ? 0 : DEFAULT_SETTINGS.musicVolume;
  }

  let musicTrackIndex = raw.musicTrackIndex ?? DEFAULT_SETTINGS.musicTrackIndex;
  if (!Number.isFinite(musicTrackIndex)) musicTrackIndex = 0;
  musicTrackIndex = Math.max(0, Math.min(MUSIC_TRACKS.length - 1, Math.floor(musicTrackIndex)));

  return {
    soundVolume: clamp01(soundVolume),
    musicVolume: clamp01(musicVolume),
    musicTrackIndex,
  };
}

let cached: GameSettings = normalizeStored(loadJson<StoredSettings>(KEY_SETTINGS, {}));

export function getSettings(): GameSettings {
  return { ...cached };
}

function persist(): void {
  saveJson(KEY_SETTINGS, cached);
}

export function setSoundVolume(volume: number): void {
  cached = { ...cached, soundVolume: clamp01(volume) };
  persist();
}

export function setMusicVolume(volume: number): void {
  cached = { ...cached, musicVolume: clamp01(volume) };
  persist();
}

export function setMusicTrackIndex(index: number): void {
  const max = Math.max(0, MUSIC_TRACKS.length - 1);
  cached = {
    ...cached,
    musicTrackIndex: Math.max(0, Math.min(max, Math.floor(index))),
  };
  persist();
}

/** @deprecated Use soundVolume > 0 */
export function isSoundEnabled(): boolean {
  return cached.soundVolume > 0.001;
}

/** @deprecated Use musicVolume > 0 */
export function isMusicEnabled(): boolean {
  return cached.musicVolume > 0.001;
}