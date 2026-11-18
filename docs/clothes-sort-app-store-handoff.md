# App Store / Play release handoff — Clothes Sort

**Purpose:** Copy this file into the **Clothes Sort** repo (e.g. `docs/app-store-handoff.md` or root `APP_STORE.md`) and give it to your Cursor agent. It recycles the admin workflow from **Simple Punjabi** (sibling project: `Quizlet App` on this machine at `/Users/sachinchopra/Projects/Quizlet App`).

**Agent job:** Scaffold `mobile/app-store/` (or equivalent), host privacy + support on GitHub Pages, and walk through first release (iOS; Android if applicable). Fill every `{{PLACEHOLDER}}` from the Clothes Sort codebase and product reality.

---

## Should we reuse Simple Punjabi’s website?

| Reuse? | What |
|--------|------|
| **Yes — pattern** | `docs/index.html` single page (privacy + support), deploy via GitHub Pages from branch `main`, folder `/docs` |
| **Yes — template** | Copy HTML structure + CSS from Simple Punjabi [`docs/index.html`](../docs/index.html) — swap app name, data practices, features |
| **Yes — workflow** | Follow [`docs/github-pages-setup.md`](../docs/github-pages-setup.md) (adapt repo name and paths) |
| **Yes — contact** | Same support email alias if you want (`professor-sachin.bobcat447@simplelogin.com` or a Clothes Sort–specific alias) |
| **No — URL** | Do **not** point Clothes Sort at `https://sachinchopra35.github.io/Quizlet-App/` — Apple and Google expect a policy that describes **this** app |
| **No — legal text** | Do **not** ship Simple Punjabi’s privacy/support markdown unchanged — rewrite for Clothes Sort (storage, analytics, accounts, photos, etc.) |

**Recommended:** New public GitHub repo (or existing Clothes Sort repo) → Pages URL like:

```text
https://sachinchopra35.github.io/<Clothes-Sort-Repo-Name>/
```

Use that **same URL** for both **Privacy Policy URL** and **Support URL** in App Store Connect (same as Simple Punjabi).

**Optional later:** One “developer” site with links to per-app policy pages — only worth it with many apps; for two apps, **one Pages site per repo** is simpler.

---

## Mirror Simple Punjabi’s folder layout

Create these in Clothes Sort (Capacitor app root = `mobile/` or whatever this repo uses):

```text
mobile/app-store/
  README.md           # index of materials + hosted URLs + bundle ID
  checklist.md        # master release checklist (tick boxes)
  listing.md          # all public App Store Connect copy (character limits noted)
  privacy-policy.md   # source of truth → sync into docs/index.html
  support.md          # source of truth → sync into docs/index.html
  review-notes.md     # private App Review Notes only (how to use the app)

docs/
  index.html          # public privacy + support (GitHub Pages)
  github-pages-setup.md  # copy/adapt from Simple Punjabi

mobile/play-store/    # only if shipping Android
  README.md
  checklist.md
```

**Reference originals (Simple Punjabi):**

| File | Path on reference machine |
|------|---------------------------|
| App Store README | `Quizlet App/mobile/app-store/README.md` |
| Master checklist | `Quizlet App/mobile/app-store/checklist.md` |
| Listing copy pattern | `Quizlet App/mobile/app-store/listing.md` |
| Privacy template | `Quizlet App/mobile/app-store/privacy-policy.md` |
| Support template | `Quizlet App/mobile/app-store/support.md` |
| Review notes pattern | `Quizlet App/mobile/app-store/review-notes.md` |
| Pages setup | `Quizlet App/docs/github-pages-setup.md` |
| Live HTML shell | `Quizlet App/docs/index.html` |
| Play Store | `Quizlet App/mobile/play-store/` |

These files are **git-tracked on purpose** (no secrets; version what you submitted per release).

---

## Placeholders — fill before submission

| Field | Clothes Sort value |
|-------|-------------------|
| **App display name** | `{{APP_NAME}}` |
| **Bundle ID / appId** | `{{BUNDLE_ID}}` e.g. `com.sachchopra.clothessort` |
| **SKU** (internal) | `{{SKU}}` e.g. `clothes-sort-2026` |
| **Privacy & Support URL** | `{{PAGES_URL}}` |
| **Support email** | `{{SUPPORT_EMAIL}}` |
| **Category (primary)** | e.g. Games / Lifestyle / Education — pick honestly |
| **Version 1.0.0 marketing version** | `1.0.0` |
| **First build number** | `1` |

**Bundle ID** must match `capacitor.config.ts` → `appId` and Xcode **Signing & Capabilities**.

---

## Phase 0 — Product + legal (before Connect)

- [ ] **Screenshots** on required iPhone sizes (check current App Store Connect sizes for 6.7" / 6.5" etc.)
- [ ] Draft **`listing.md`**: name, subtitle (30 chars), promotional text (170), description, keywords (100), What’s New for 1.0.0
- [ ] Draft **`privacy-policy.md`** and **`support.md`** for Clothes Sort (offline? local storage? cloud? ads? analytics? photos/camera?)
- [ ] Build **`docs/index.html`** from those two; push; enable GitHub Pages (`main` + `/docs`)
- [ ] Verify `{{PAGES_URL}}` loads on phone (Safari, private tab if cached)
- [ ] Device QA: fresh install, core loop, settings, no crashes, offline behaviour if claimed
- [ ] **App icon** 1024×1024 for Connect (path: `{{ICON_PATH}}`)

---

## Phase 1 — Apple Developer portal

- [ ] Paid Apple Developer account active
- [ ] **Identifiers** → App ID `{{BUNDLE_ID}}`
- [ ] Enable only capabilities the app **actually uses** (push, iCloud, etc. — Simple Punjabi used none)

---

## Phase 2 — Xcode / Capacitor build

```bash
cd mobile   # or project’s mobile folder
npm run build
npx cap copy ios
npx cap open ios
```

- [ ] Team = paid developer account
- [ ] Bundle Identifier = `{{BUNDLE_ID}}`
- [ ] **Export compliance:** `ITSAppUsesNonExemptEncryption` = `false` in `capacitor.config.ts` under `ios.customConfig` (skips repetitive encryption questions on upload) — see Simple Punjabi `mobile/capacitor.config.ts`
- [ ] Marketing **Version** = `1.0.0`, **Build** = `1`
- [ ] Run once on device; remove any old sideload with a different bundle ID
- [ ] **Product → Archive** → **Distribute App** → App Store Connect → Upload

---

## Phase 3 — App Store Connect (new app)

- [ ] **Apps** → **+** → New App → iOS
- [ ] Name, language, bundle ID, SKU from table above

### App Information

| Field | Source |
|-------|--------|
| Name, Subtitle | `listing.md` |
| Privacy Policy URL | `{{PAGES_URL}}` |
| Primary / secondary category | product-appropriate |
| Age Rating | questionnaire (honest; games with gambling etc. differ) |
| Content Rights | you own or licensed content |

### Pricing

- [ ] Free (or your price)
- [ ] Countries / availability

### App Privacy (“nutrition label”)

Answer from **actual** Clothes Sort behaviour (do not copy Simple Punjabi blindly):

- Simple Punjabi: **Data Not Collected** (local progress only, offline, no analytics).
- Clothes Sort: if still local-only → same story; if you add Firebase, sign-in, crash reporting, or ads → declare those data types.

### Version 1.0.0 page

| Field | Source |
|-------|--------|
| Screenshots | captured assets |
| Promotional text, Description, Keywords | `listing.md` |
| Support URL | `{{PAGES_URL}}` (same as privacy) |
| What’s New | `listing.md` (first release = “Initial release” + bullets) |
| Build | attach processed archive |
| App Review → **Notes** | `review-notes.md` (how to play, no login, test account N/A) |
| App Review → Contact | name, email, phone |
| Sign-in required? | almost certainly **No** for a casual game |

---

## Phase 4 — TestFlight (recommended)

- [ ] Install build on your phone
- [ ] Smoke test win/lose, settings, mute, persistence
- [ ] Optional: external tester

---

## Phase 5 — Submit

- [ ] **Add for Review**
- [ ] Optional git tag: `git tag v1.0.0 && git push origin v1.0.0`
- [ ] Watch email; on rejection → read Resolution Center, fix, **increment build number**, re-archive, resubmit

---

## Phase 6 — After approval

- [ ] Choose manual or automatic release
- [ ] Update `listing.md` with a **What’s New** section for the next version (Simple Punjabi keeps 1.0.1, 1.0.2 blocks in one file)
- [ ] Bump marketing version + build for next submission

---

## What goes where (quick reference)

| Doc | Destination |
|-----|-------------|
| `listing.md` | App Store Connect public fields |
| `privacy-policy.md` + `support.md` | Hosted page + optional in-app About link |
| `review-notes.md` | App Review Information → Notes **only** (not public) |
| `checklist.md` | Your personal master list |

---

## `review-notes.md` — what to write for Clothes Sort

Mirror Simple Punjabi’s style (`Quizlet App/mobile/app-store/review-notes.md`):

1. One paragraph: what the app is, no account, works offline (if true).
2. **How to test:** open app → start level → complete sort → confetti / next level (adjust to real UX).
3. If anything is non-obvious (gestures, drag-and-drop), spell it out.
4. Attach a **short screen recording** if Apple previously asked for one on the other app.

---

## `listing.md` — sections to include

Copy structure from Simple Punjabi `listing.md`:

- Subtitle, promotional text, description (short + long if needed)
- Keywords (comma-free, no spaces wasted)
- Age rating notes (what you selected and why)
- Screenshot captions / shot list
- **What’s New** per version (headings like `## Version 1.0.0`)

Apple enforces character limits — note limits beside each field in `listing.md`.

---

## Google Play (if Android ships later)

- Reuse **`listing.md`** for short (80 char) + full description (reformat).
- **Same** `{{PAGES_URL}}` for privacy; tweak policy text if Android TTS differs from “Apple’s synthesiser”.
- Package name = `{{BUNDLE_ID}}`.
- See Simple Punjabi `mobile/play-store/checklist.md` for AAB, signing, Data safety form.

---

## Agent checklist (scaffold task list)

When implementing in Clothes Sort repo:

1. [ ] Create `mobile/app-store/` files from templates above; replace all `{{PLACEHOLDER}}`s.
2. [ ] Copy `docs/index.html` styling from Simple Punjabi; inject Clothes Sort privacy + support HTML.
3. [ ] Add `docs/github-pages-setup.md` with correct repo name and `{{PAGES_URL}}`.
4. [ ] Wire in-app **About / Privacy** link to `{{PAGES_URL}}` if the app has a settings screen (Simple Punjabi uses hosted URL in About).
5. [ ] Confirm `capacitor.config.ts` `appId`, app name, encryption flag.
6. [ ] Populate `checklist.md` and tick through with the user before **Add for Review**.

---

## Privacy policy — Clothes Sort prompts (for the writer)

Answer these in `privacy-policy.md` (and on the web page):

- Account required? Data collected?
- What is stored locally (progress, scores, preferences)?
- Network calls (analytics, ads, remote config)?
- Camera / photo library / files?
- Children / age rating alignment?
- Third-party SDKs?
- Contact for privacy questions?

Simple Punjabi’s policy is a good **tone and length** reference, not the **facts** reference.

---

## One-paragraph brief for the Clothes Sort agent

> Scaffold App Store release admin like Simple Punjabi: `mobile/app-store/{README,checklist,listing,privacy-policy,support,review-notes}.md`, host privacy+support on GitHub Pages via `docs/index.html` (new URL for this app, not Quizlet-App). Match Capacitor iOS upload flow, `ITSAppUsesNonExemptEncryption: false`, TestFlight smoke test, then Connect submission. Use handoff doc `docs/app-store-handoff.md` (this file) and copy patterns from `/Users/sachinchopra/Projects/Quizlet App/mobile/app-store/` and `/Users/sachinchopra/Projects/Quizlet App/docs/`.

---

*Handoff authored from Simple Punjabi release materials, November 2026.*