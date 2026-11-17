import { loadJson, saveJson } from "./storage";

const KEY = "undo-feature-intro-seen";

export function hasSeenUndoIntro(): boolean {
  return loadJson(KEY, false);
}

export function markUndoIntroSeen(): void {
  saveJson(KEY, true);
}