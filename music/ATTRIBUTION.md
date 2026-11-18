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
| Chopin — Nocturne 1 | _TBD_ | _Fill in from Musopen recording page_ | — |
| Chopin — Nocturne 2 | _TBD_ | _Fill in from Musopen recording page_ | — |
| Chopin — Tristesse | _TBD_ | _Fill in from Musopen recording page_ | — |
| Beethoven — Sonata 1, Adagio | _TBD_ | _Fill in from Musopen recording page_ | — |
| Bach — Goldberg Variation 22 | _TBD_ | _Fill in from Musopen recording page_ | — |

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

Instrumental background music is provided by recordings from [Musopen](https://musopen.org). Recordings used in this app are public domain or CC0 on Musopen.


_(Links will appear here after you fill `musopenUrl` in the manifest and re-run `npm run music:attribution`.)_
```
