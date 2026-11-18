import manifest from "../../music/manifest.json";

export interface MusicTrackDef {
  id: string;
  title: string;
  assetPath: string;
  audioKey: string;
}

export const MUSIC_TRACKS: MusicTrackDef[] = manifest.tracks.map((track) => ({
  id: track.id,
  title: track.title,
  assetPath: `assets/music/${track.id}.m4a`,
  audioKey: `music-${track.id}`,
}));