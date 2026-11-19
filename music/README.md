# Game music

1. Drop source **WAV** or **MP3** files in `music/source/` (see `source` filenames in `manifest.json`).
2. Add an entry to `music/manifest.json` (`id`, `source`, friendly `title`, plus attribution fields below).
3. Run `npm run build:music` (requires **ffmpeg**).

The script loudness-normalises to about **−16 LUFS**, strips cover art video streams, and writes AAC **`.m4a`** files to `public/assets/music/<id>.m4a` for in-app playback.

**Do not commit WAV/MP3 masters** — they are gitignored. Keep them in `music/source/` on your machine only; commit the built `public/assets/music/*.m4a` files.

## Attribution (required before App Store)

For each track in `manifest.json`, set:

| Field | What to put |
|-------|-------------|
| `musopenUrl` | Full URL of the **recording** page on Musopen |
| `recordingLicense` | `public-domain`, `cc0`, or `cc-by-4.0` (not the composition — the **recording** line on that page) |
| `attribution` | Empty for PD/CC0; for `cc-by-4.0`, paste Musopen’s performer/source credit |

Then run:

```bash
npm run music:attribution
```

That refreshes [`ATTRIBUTION.md`](ATTRIBUTION.md) and [`support-credits.snippet.md`](support-credits.snippet.md) for your GitHub Pages support page.

Before submission:

```bash
npm run music:attribution:check
```

See also [`../docs/release-steps.md`](../docs/release-steps.md) step 1.