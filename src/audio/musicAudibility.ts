import { getMusicPlaybackSnapshot } from "./musicManager";
import { getSettings } from "../state/settings";

/**
 * True when the user has music enabled in-app but playback is probably inaudible
 * (hardware mute / system volume, or audio not actually playing).
 */
export function isMusicLikelyInaudible(): boolean {
  if (getSettings().musicVolume <= 0.001) return false;

  const snap = getMusicPlaybackSnapshot();
  if (snap.audioLocked) return false;
  if (!snap.shouldPlay) return false;
  if (snap.betweenTracks) return false;
  if (snap.isPaused) return false;
  if (snap.isPlaying) return false;
  if (!snap.trackLoaded) return false;

  // Track is loaded but not playing — typical when the device is muted or system volume is down.
  return true;
}