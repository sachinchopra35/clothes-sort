import { describe, expect, it } from "vitest";
import { MUSIC_TRACKS } from "../src/audio/musicCatalog";

describe("music catalog", () => {
  it("lists at least one track with friendly titles", () => {
    expect(MUSIC_TRACKS.length).toBeGreaterThan(0);
    for (const track of MUSIC_TRACKS) {
      expect(track.title.length).toBeGreaterThan(3);
      expect(track.assetPath).toMatch(/\.m4a$/);
      expect(track.audioKey).toMatch(/^music-/);
    }
  });
});