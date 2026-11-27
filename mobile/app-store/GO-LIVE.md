# Clothes Sort — App Store go-live (March 2026)

One-page order of operations. Details: [checklist.md](checklist.md), [release-steps.md](../../docs/release-steps.md).

**Bundle ID:** `com.sachinchopra35.clothessort`  
**Privacy + Support URL:** `https://sachinchopra35.github.io/clothes-sort/`  
**SKU (suggestion):** `clothes-sort-2026`

---

## ✅ Already done in the repo (verify before upload)

- [x] Game: 200 levels, tests pass (`npm test`)
- [x] Music: original recordings in manifest; `npm run music:attribution:check` passes
- [x] Support + privacy copy; `docs/index.html` for GitHub Pages
- [x] `ITSAppUsesNonExemptEncryption` = NO in `ios/App/App/Info.plist`
- [x] Xcode **MARKETING_VERSION** = `1.0.0`, **CURRENT_PROJECT_VERSION** = `1`
- [x] Store listing draft: [listing.md](listing.md)
- [x] Review notes: [review-notes.md](review-notes.md) (paste into Connect; set build number)
- [x] `npm run release:prep` — test, web build, music check, icon, `cap copy ios`

---

## 1. You — Apple account & Connect setup (one-time)

1. Paid **Apple Developer** membership active.
2. [App Store Connect](https://appstoreconnect.apple.com) → **Agreements, Tax, and Banking** — no blocking banners.
3. **Business / trader status** (EU): declare as individual non-trader if that fits your situation.
4. **Certificates, Identifiers & Profiles** → App ID `com.sachinchopra35.clothessort` exists.
5. **Apps → + → New App** (if not created yet): iOS, **Clothes Sort**, English, bundle ID above, SKU.

---

## 2. You — GitHub Pages (if not live yet)

1. `git push` latest `docs/` (especially `index.html`) to `main`.
2. Repo **Settings → Pages** → branch `main`, folder **`/docs`**.
3. On phone (private tab): open `https://sachinchopra35.github.io/clothes-sort/`.
4. Use that URL for **Privacy Policy** and **Support** everywhere in Connect.

---

## 3. You — Screenshots & metadata

Target **6.9" iPhone** (Pro Max simulator); Apple scales smaller sizes.

| # | Screen |
|---|--------|
| 1 | Main menu + Play |
| 2 | Early level in play |
| 3 | Busy later level (e.g. 80+) |
| 4 | Level complete / confetti |
| 5 | Settings (music + sliders) |
| 6 | Optional: level picker |

Simulator: **File → Save Screen** (⌘S).

**iPad:** Target is **iPhone only** — no iPad screenshots; avoids upload error 90474 (iPad multitasking orientations).

Paste from [listing.md](listing.md): name, subtitle, promo text, description, keywords, copyright `2026 Sachin Chopra`, What's New.

**App Privacy:** Data **not** collected.  
**Age rating:** questionnaire → **4+**.  
**Pricing:** Free.

---

## 4. Build & upload (Terminal + Xcode)

```bash
npm run release:prep
npx cap open ios
```

In Xcode:

1. **Signing:** Team `3WCP3D9KXB` (or your paid team), bundle `com.sachinchopra35.clothessort`, automatic signing.
2. Confirm **Version** `1.0.0`, **Build** `1` (increment build on every re-upload: 2, 3, …).
3. Run on your **physical iPhone** — full QA below.
4. Destination: **Any iOS Device (arm64)** → **Product → Archive**.
5. Organizer → **Distribute App** → **App Store Connect** → Upload.

Wait 10–30 min for processing in TestFlight.

No need to **Clean Build Folder** every time; use `release:prep` after web changes.

---

## 5. Device QA (before or via TestFlight)

- [ ] Fresh install (delete old dev build if needed): level 1 tutorial.
- [ ] Win level → confetti + complete panel → next level.
- [ ] Level 11 undo + intro; level 21 “5 per shelf” popup.
- [ ] Settings: sliders, mute, track ◀ ▶, **About the Music** links open.
- [ ] Restart level: dark/light fade.
- [ ] Level 200: **Game Complete!!** + confetti on win and on button.
- [ ] Cheat `CLEANCLOTHES25` on locked picker.
- [ ] Airplane mode: fully playable.
- [ ] Kill app: progress + volumes remembered.

---

## 6. App Store Connect — version 1.0.0

1. Attach uploaded **build** to version **1.0.0**.
2. Screenshots + listing fields.
3. **App Review Information:** contact from [review-notes.md](review-notes.md); paste **Notes** (update `BUILD_NUMBER`); **Sign-in required: No**.
4. **Manually release this version** (recommended for first launch).
5. **Add for Review → Submit**.

---

## 7. After approval

1. **Release** in Connect.
2. Optional: `git tag v1.0.0 && git push origin v1.0.0`

---

## Quick command reference

| Task | Command |
|------|---------|
| Full pre-upload sync | `npm run release:prep` |
| Open Xcode | `npx cap open ios` |
| Music credits only | `npm run music:attribution` |