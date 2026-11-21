# App Store materials — Clothes Sort

Copy, legal pages, and submission checklists for the iOS App Store listing.

| File | Purpose |
|------|---------|
| [checklist.md](checklist.md) | Step-by-step: what to submit where |
| [listing.md](listing.md) | App Store Connect fields (name, description, keywords, etc.) |
| [privacy-policy.md](privacy-policy.md) | Host at a public URL — required by Apple |
| [support.md](support.md) | Host at a public URL — required by Apple |
| [review-notes.md](review-notes.md) | Paste into App Review Notes when submitting |

## Publishing privacy & support pages (GitHub Pages)

The live site is **`docs/index.html`** in this repo. Walkthrough: **[docs/github-pages-setup.md](../../docs/github-pages-setup.md)**.

**URLs for App Store Connect** (use the **same** link for Privacy Policy and Support):

```text
https://sachinchopra35.github.io/clothes-sort/
```

Keep [privacy-policy.md](privacy-policy.md) and [support.md](support.md) in sync with `docs/index.html` when you edit them.

**Go-live now:** [GO-LIVE.md](GO-LIVE.md) — ordered checklist + `npm run release:prep`.

Update *Last updated* in the privacy policy when you publish changes.

## Git

These files are **tracked in git** on purpose. No secrets — support email is public. Version control records what you submitted with each release.

## Bundle ID

`com.sachinchopra35.clothessort` — must match `capacitor.config.ts` and Xcode **Signing & Capabilities**.

## App icon

`npm run build:icon` → Xcode asset catalog / App Store icon from `design/app-icon.svg`.

## Music credits

When Musopen links are filled in `music/manifest.json`, run `npm run music:attribution` and merge `music/support-credits.snippet.md` into [support.md](support.md) and the hosted page.