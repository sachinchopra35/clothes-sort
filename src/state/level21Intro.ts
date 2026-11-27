import { loadJson, saveJson } from "./storage";

const KEY = "level-21-capacity-intro-seen";

export function hasSeenLevel21Intro(): boolean {
  return loadJson(KEY, false);
}

export function markLevel21IntroSeen(): void {
  saveJson(KEY, true);
}

const KEY_121_SIX = "level-121-capacity-6-intro-seen";
const KEY_122_LEGACY = "level-122-capacity-intro-seen";

export function hasSeenLevel121SixIntro(): boolean {
  return loadJson(KEY_121_SIX, false) || loadJson(KEY_122_LEGACY, false);
}

export function markLevel121SixIntroSeen(): void {
  saveJson(KEY_121_SIX, true);
}