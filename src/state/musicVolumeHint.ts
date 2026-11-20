import { loadJson, saveJson } from "./storage";

const KEY = "music-volume-hint-seen";

export function hasSeenMusicVolumeHint(): boolean {
  return loadJson(KEY, false);
}

export function markMusicVolumeHintSeen(): void {
  saveJson(KEY, true);
}