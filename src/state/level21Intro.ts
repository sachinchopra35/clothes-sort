import { loadJson, saveJson } from "./storage";

const KEY = "level-21-capacity-intro-seen";

export function hasSeenLevel21Intro(): boolean {
  return loadJson(KEY, false);
}

export function markLevel21IntroSeen(): void {
  saveJson(KEY, true);
}