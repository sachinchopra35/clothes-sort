import { describe, expect, it } from "vitest";
import manifest from "../music/manifest.json";
import {
  getMusicAttributions,
  isAttributionCompleteForRelease,
} from "../src/audio/musicAttribution";

describe("musicAttribution", () => {
  it("manifest tracks define attribution fields", () => {
    for (const track of manifest.tracks) {
      expect(track).toHaveProperty("musopenUrl");
      expect(track).toHaveProperty("recordingLicense");
      expect(track).toHaveProperty("attribution");
    }
    expect(getMusicAttributions().length).toBe(manifest.tracks.length);
  });

  it.skipIf(!process.env.MUSIC_ATTRIBUTION_STRICT)(
    "all tracks are release-ready when MUSIC_ATTRIBUTION_STRICT=1",
    () => {
      expect(isAttributionCompleteForRelease()).toBe(true);
    },
  );
});