import manifest from "../../music/manifest.json";

export type RecordingLicense =
  | "pending"
  | "public-domain"
  | "cc0"
  | "cc-by-4.0"
  | (string & {});

export interface MusicAttributionRecord {
  id: string;
  title: string;
  musopenUrl: string;
  recordingLicense: RecordingLicense;
  attribution: string;
}

type ManifestTrack = (typeof manifest.tracks)[number];

export function getMusicAttributions(): MusicAttributionRecord[] {
  return manifest.tracks.map((track: ManifestTrack) => ({
    id: track.id,
    title: track.title,
    musopenUrl: track.musopenUrl ?? "",
    recordingLicense: (track.recordingLicense ?? "pending") as RecordingLicense,
    attribution: track.attribution ?? "",
  }));
}

/** Plain-text block suitable for a support page or in-app credits sheet. */
export function formatMusicCreditsPlain(): string {
  const lines = [
    "Background music — recordings from Musopen (musopen.org):",
    "",
  ];
  for (const t of getMusicAttributions()) {
    const parts = [t.title];
    if (t.musopenUrl) parts.push(t.musopenUrl);
    if (t.attribution) parts.push(t.attribution);
    lines.push(`• ${parts.join(" — ")}`);
  }
  return lines.join("\n");
}

export function isAttributionCompleteForRelease(): boolean {
  return getMusicAttributions().every(
    (t) =>
      t.recordingLicense !== "pending" &&
      t.musopenUrl.trim().length > 0 &&
      (t.recordingLicense !== "cc-by-4.0" || t.attribution.trim().length > 0),
  );
}