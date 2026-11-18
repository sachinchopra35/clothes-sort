# Game music

1. Drop source **MP3** files in `music/source/`.
2. Add an entry to `music/manifest.json` (`id`, `source` filename, friendly `title`).
3. Run `npm run build:music` (requires **ffmpeg**).

The script loudness-normalises to about **−16 LUFS**, strips cover art video streams, and writes AAC **`.m4a`** files to `public/assets/music/<id>.m4a` for in-app playback.

Do not commit large source MP3s if you prefer; keep them locally and ship only the built `.m4a` assets.