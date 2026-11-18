# App Store submission checklist — Clothes Sort

Tick items as you go. Details: [docs/release-steps.md](../../docs/release-steps.md).

**App:** Clothes Sort  
**Bundle ID:** `com.sachinchopra35.clothessort`  
**SKU (suggestion):** `clothes-sort-2026`  
**Privacy & Support URL:** `https://sachinchopra35.github.io/clothes-sort/`

---

## Phase 0 — Before Connect

- [ ] Musopen links + licences in `music/manifest.json`; `npm run music:attribution`; merge credits into [support.md](support.md)
- [ ] Before submit: `npm run music:attribution:check` passes
- [ ] Draft store copy → [listing.md](listing.md)
- [x] `docs/index.html` built from privacy + support (keep in sync when editing `.md`)
- [x] Push `docs/` to `main`; enable GitHub Pages — [github-pages-setup.md](../../docs/github-pages-setup.md)
- [x] Verify `https://sachinchopra35.github.io/clothes-sort/` on phone (private Safari tab)
- [ ] Screenshots (6.9" iPhone; see shot list in listing.md)
- [ ] `npm run build:icon`; icon looks correct in Xcode
- [ ] Device QA: tutorial, play, win, settings, music advance, undo, cheat unlock, offline

---

## Phase 1 — Apple Developer

- [ ] Paid Apple Developer account active
- [ ] **Identifiers** → App ID `com.sachinchopra35.clothessort`
- [ ] App Store Connect → **Agreements** / **Business** (trader status) — no blocking banners

---

## Phase 2 — Xcode build

From repo root:

```bash
npm run build
npx cap copy ios
npx cap open ios
```

- [ ] Team = paid developer account (`3WCP3D9KXB`)
- [ ] Bundle Identifier = `com.sachinchopra35.clothessort`
- [x] `ITSAppUsesNonExemptEncryption` = NO in `ios/App/App/Info.plist`
- [ ] **Version** = `1.0.0`, **Build** = `1` (increment build on each re-upload)
- [ ] Run on physical device; delete old sideload if bundle ID differed
- [ ] **Product → Archive** → **Distribute App** → App Store Connect → Upload

---

## Phase 3 — App Store Connect (new app)

- [ ] **Apps → + → New App** (iOS, English, bundle ID, SKU)

### App Information

| Field | Source |
|-------|--------|
| Name, Subtitle | [listing.md](listing.md) |
| Privacy Policy URL | hosted URL |
| Category | Games → Puzzle (optional second: Casual) |
| Content Rights | Third-party music with rights; original game content |
| Age Rating | Questionnaire → **4+** |

### Pricing

- [ ] Free; countries as desired

### App Privacy

- [ ] **Data Not Collected** (local progress only; no tracking)

### Version 1.0.0

| Field | Source |
|-------|--------|
| Screenshots | captured assets |
| Promotional text, Description, Keywords | [listing.md](listing.md) |
| Support URL | same hosted URL |
| What's New | [listing.md](listing.md) |
| Copyright | [listing.md](listing.md) |
| Build | attach uploaded archive |
| Review Notes | [review-notes.md](review-notes.md) |
| Review contact | [review-notes.md](review-notes.md) |
| Sign-in required | **No** |

---

## Phase 4 — TestFlight (recommended)

- [ ] Install build; smoke test (see release-steps QA list)
- [ ] Optional: external tester

---

## Phase 5 — Submit

- [ ] **Add for Review**
- [ ] Optional: `git tag v1.0.0 && git push origin v1.0.0`
- [ ] On rejection: fix → bump **Build** → re-archive → resubmit

---

## Phase 6 — After approval

- [ ] Release (manual if selected)
- [ ] For next update: bump version, What's New in [listing.md](listing.md), repeat build + submit