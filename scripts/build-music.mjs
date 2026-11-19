/**
 * Normalise loudness (EBU R128 ~−16 LUFS) and encode AAC .m4a for in-app playback.
 *
 * Put source WAV/MP3 in music/source/ (see music/manifest.json).
 * Writes public/assets/music/<id>.m4a
 *
 * Requires ffmpeg on PATH. Run: npm run build:music
 */
import { execFileSync, spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  unlinkSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "music/manifest.json");
const sourceDir = join(root, "music/source");
const outDir = join(root, "public/assets/music");
const legacyMp3Dir = outDir;

const TARGET_LUFS = -16;
const TRUE_PEAK = -1.5;
const LRA = 11;

function ffmpegOk() {
  const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  return r.status === 0;
}

function measureLoudnorm(input) {
  const cmd = [
    "-hide_banner",
    "-nostats",
    "-vn",
    "-i",
    input,
    "-af",
    `loudnorm=I=${TARGET_LUFS}:TP=${TRUE_PEAK}:LRA=${LRA}:print_format=json`,
    "-f",
    "null",
    "-",
  ];
  const child = spawnSync("ffmpeg", cmd, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  const log = `${child.stdout ?? ""}\n${child.stderr ?? ""}`;
  const jsonMatch = log.match(/\{[\s\S]*?\}/);
  if (!jsonMatch) throw new Error(`loudnorm measure failed for ${input}`);
  return JSON.parse(jsonMatch[0]);
}

function encodeTrack(input, output, measured) {
  const {
    input_i,
    input_tp,
    input_lra,
    input_thresh,
    target_offset,
  } = measured;
  const filter =
    `loudnorm=I=${TARGET_LUFS}:TP=${TRUE_PEAK}:LRA=${LRA}:` +
    `measured_I=${input_i}:measured_TP=${input_tp}:measured_LRA=${input_lra}:` +
    `measured_thresh=${input_thresh}:offset=${target_offset}:linear=true`;
  execFileSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-y",
      "-vn",
      "-i",
      input,
      "-af",
      filter,
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      "-movflags",
      "+faststart",
      output,
    ],
    { stdio: "inherit" },
  );
}

if (!ffmpegOk()) {
  console.error("ffmpeg not found. Install ffmpeg, then rerun npm run build:music");
  process.exit(1);
}

mkdirSync(sourceDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const sources = new Set(manifest.tracks.map((t) => t.source));

if (existsSync(legacyMp3Dir)) {
  for (const name of readdirSync(legacyMp3Dir)) {
    if (!name.toLowerCase().endsWith(".mp3")) continue;
    if (!sources.has(name)) {
      console.warn(`Skipping unknown MP3 in public/assets/music: ${name}`);
      continue;
    }
    const dest = join(sourceDir, name);
    const src = join(legacyMp3Dir, name);
    if (!existsSync(dest)) {
      try {
        renameSync(src, dest);
        console.log(`Moved ${name} → music/source/`);
      } catch {
        copyFileSync(src, dest);
        unlinkSync(src);
        console.log(`Copied ${name} → music/source/ (removed public copy)`);
      }
    }
  }
}

for (const track of manifest.tracks) {
  const input = join(sourceDir, track.source);
  if (!existsSync(input)) {
    console.error(`Missing source: ${input}`);
    process.exit(1);
  }
  const output = join(outDir, `${track.id}.m4a`);
  console.log(`\n=== ${track.title} ===`);
  const measured = measureLoudnorm(input);
  encodeTrack(input, output, measured);
  console.log(`Wrote ${output}`);
}

console.log(`\nDone. ${manifest.tracks.length} track(s) in ${outDir}`);