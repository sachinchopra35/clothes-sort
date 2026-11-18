import { getSettings } from "../state/settings";

type AudioSessionType = "auto" | "playback" | "ambient";

interface WebKitAudioSession {
  type: AudioSessionType;
}

/**
 * WebKit's Audio Session API (iOS 16.4+, also inside the Capacitor web view).
 * "playback" ignores the silent switch; "auto" restores the default (silent switch respected).
 */
export function applySilentModeSetting(enabled = getSettings().playInSilentMode): void {
  if (typeof navigator === "undefined") return;
  const session = (navigator as Navigator & { audioSession?: WebKitAudioSession }).audioSession;
  if (!session) return;
  try {
    session.type = enabled ? "playback" : "auto";
  } catch {
    /* unsupported value on this WebKit build */
  }
}
