import { loadJson, saveJson } from "./storage";

const KEY_SETTINGS = "settings";

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
};

let cached: GameSettings = loadJson(KEY_SETTINGS, DEFAULT_SETTINGS);

export function getSettings(): GameSettings {
  return { ...cached };
}

export function setSoundEnabled(enabled: boolean): void {
  cached = { ...cached, soundEnabled: enabled };
  saveJson(KEY_SETTINGS, cached);
}

export function setMusicEnabled(enabled: boolean): void {
  cached = { ...cached, musicEnabled: enabled };
  saveJson(KEY_SETTINGS, cached);
}
