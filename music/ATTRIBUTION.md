# Music attribution

Source of truth: `music/manifest.json` (`musopenUrl`, `recordingLicense`, `attribution`).
Regenerate this file after edits:

```bash
npm run music:attribution
```

Before App Store submission, run:

```bash
npm run music:attribution:check
```

## Summary

Background music in **Clothes Sort** uses recordings from [Musopen](https://musopen.org).
Only tracks whose **recording** is public domain, CC0, or CC BY (with credit) are shipped.
Compositions may be public domain; the **recording licence** on each Musopen page is what matters.

## Tracks

| In-app title | Musopen | Recording licence | Credit line |
|--------------|---------|-------------------|-------------|
| Chopin — Nocturne No. 2 | — | Original performance (app developer) | Performed and recorded by Sachin Chopra |
| Bach — Prelude in C major | — | Original performance (app developer) | Performed and recorded by Sachin Chopra |
| Satie — Gymnopédie No. 1 | — | Original performance (app developer) | Performed and recorded by Sachin Chopra |
| Debussy — Arabesque No. 1 | — | Original performance (app developer) | Performed and recorded by Sachin Chopra |
| Chopin — Prelude in E minor | — | Original performance (app developer) | Performed and recorded by Sachin Chopra |
| Debussy — Clair de lune | — | Original performance (app developer) | Performed and recorded by Sachin Chopra |
| Mendelssohn — Shepherd's Complaint | — | Original performance (app developer) | Performed and recorded by Sachin Chopra |
| Bach — French Suite No. 5, Sarabande | — | Original performance (app developer) | Performed and recorded by Sachin Chopra |
| Bach — French Suite No. 1, Sarabande | — | Original performance (app developer) | Performed and recorded by Sachin Chopra |

### `recordingLicense` values (in manifest)

| Value | Meaning |
|-------|---------|
| `public-domain` | Recording marked public domain on Musopen |
| `cc0` | CC0 1.0 |
| `cc-by-4.0` | CC BY 4.0 — set `attribution` to the credit Musopen shows |
| `pending` | Not documented yet (do not ship new tracks in this state) |

## Support page snippet

Paste the block below into the public support / credits section (also written to `music/support-credits.snippet.md`):


```markdown
### Music

Background piano music: original performances recorded for this app.

- **Chopin — Nocturne No. 2** — Performed and recorded by Sachin Chopra
- **Bach — Prelude in C major** — Performed and recorded by Sachin Chopra
- **Satie — Gymnopédie No. 1** — Performed and recorded by Sachin Chopra
- **Debussy — Arabesque No. 1** — Performed and recorded by Sachin Chopra
- **Chopin — Prelude in E minor** — Performed and recorded by Sachin Chopra
- **Debussy — Clair de lune** — Performed and recorded by Sachin Chopra
- **Mendelssohn — Shepherd's Complaint** — Performed and recorded by Sachin Chopra
- **Bach — French Suite No. 5, Sarabande** — Performed and recorded by Sachin Chopra
- **Bach — French Suite No. 1, Sarabande** — Performed and recorded by Sachin Chopra
```
