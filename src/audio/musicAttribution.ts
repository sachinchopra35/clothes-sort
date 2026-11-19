import manifest from "../../music/manifest.json";

export type RecordingLicense =
  | "pending"
  | "original"
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

type ManifestTrack = (typeof manifest.tracks)[number] & { musopenUrl?: string };

export function getMusicAttributions(): MusicAttributionRecord[] {
  return manifest.tracks.map((track: ManifestTrack) => ({
    id: track.id,
    title: track.title,
    musopenUrl: track.musopenUrl?.trim() ?? "",
    recordingLicense: (track.recordingLicense ?? "pending") as RecordingLicense,
    attribution: track.attribution ?? "",
  }));
}

/** Plain-text block suitable for a support page or in-app credits sheet. */
export function formatMusicCreditsPlain(): string {
  const lines = ["Background music:", ""];
  for (const t of getMusicAttributions()) {
    const parts = [t.title];
    if (t.recordingLicense === "original") {
      parts.push(t.attribution || "Performed and recorded by Sachin Chopra");
    } else if (t.musopenUrl) {
      parts.push(t.musopenUrl);
      if (t.attribution) parts.push(t.attribution);
    }
    lines.push(`• ${parts.join(" — ")}`);
  }
  return lines.join("\n");
}

export function isAttributionCompleteForRelease(): boolean {
  return getMusicAttributions().every((t) => {
    if (t.recordingLicense === "pending") return false;
    if (t.recordingLicense === "original") return t.attribution.trim().length > 0;
    if (t.recordingLicense === "cc-by-4.0") {
      return t.musopenUrl.trim().length > 0 && t.attribution.trim().length > 0;
    }
    return t.musopenUrl.trim().length > 0;
  });
}