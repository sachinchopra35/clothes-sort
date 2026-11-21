# Releasing Clothes Sort to the App Store — step by step

A walkthrough for the first iOS release, tailored to this repo. The longer reference is
[`clothes-sort-app-store-handoff.md`](clothes-sort-app-store-handoff.md) (written from the Simple Punjabi release).

## What's already true about this app

| Thing | Current value |
|-------|---------------|
| App name | Clothes Sort |
| Bundle ID | `com.sachinchopra35.clothessort` (in `capacitor.config.ts` and Xcode — they match) |
| Apple team | `3WCP3D9KXB` already set in Xcode |
| Version / build | `1.0.0` / `1` in Xcode (`MARKETING_VERSION` / `CURRENT_PROJECT_VERSION`) |
| GitHub repo | `sachinchopra35/clothes-sort` |
| Likely privacy/support URL | `https://sachinchopra35.github.io/clothes-sort/` |
| Data collected | None. No accounts, no analytics, no ads, no network calls. Progress and settings stay on the device (`localStorage`). |
| App icon source | `design/app-icon.svg` → `npm run build:icon` |

Because nothing leaves the device, the privacy side is the easy case: **"Data Not Collected"**.

---

## Step 1 — Music (done for v1.0.0)

All tracks are **original recordings** in `music/manifest.json`. Credits are in [support.md](../mobile/app-store/support.md). Before each upload run:

```bash
npm run music:attribution:check
```

## Step 2 — Release folder (admin paperwork)

Done: [`mobile/app-store/`](../mobile/app-store/) — start at [README.md](../mobile/app-store/README.md).

- `listing.md`, `privacy-policy.md`, `support.md`, `review-notes.md`, `checklist.md`
- Replace the music placeholder in `support.md` after `npm run music:attribution`
- Review contact phone/email in `review-notes.md` before you submit

## Step 3 — Privacy + support web page (GitHub Pages)

**Site file ready:** [`docs/index.html`](index.html) (synced from `mobile/app-store/privacy-policy.md` + `support.md`).

**You do this once in the browser + Terminal** — full walkthrough: **[github-pages-setup.md](github-pages-setup.md)**

1. Commit and `git push` `docs/index.html` to `main`.
2. GitHub → repo **Settings → Pages** → branch `main`, folder **`/docs`** → Save.
3. Open `https://sachinchopra35.github.io/clothes-sort/` on your phone (private tab).
4. Paste that URL into App Store Connect as **both** Privacy Policy and Support URLs.

Repo must be **public** for free Pages unless your account allows Pages on private repos.

## Step 4 — Export compliance flag (saves a question on every upload)

Done: `ITSAppUsesNonExemptEncryption` = `NO` in `ios/App/App/Info.plist` (app uses no custom encryption beyond standard iOS/HTTPS).

## Step 5 — Screenshots and icon

- **Screenshots:** App Store Connect currently requires the **6.9"** iPhone size (1320×2868 or 1290×2796);
  smaller sizes are scaled from it. Take 3–6 on the biggest simulator in Xcode (iPhone 16/17 Pro Max):
  main menu, an early level, a busy later level, the confetti win screen, the settings panel.
  Simulator: **File → Save Screen** (⌘S).
- iPad: if the build supports iPad, Connect also wants **13" iPad** screenshots. If you don't want to
  bother, set the Xcode target to **iPhone only** before archiving.
- **Icon:** the 1024×1024 is already in the Xcode asset catalog via `npm run build:icon` — Connect takes
  it from the build. Make sure it has no transparency.

## Step 6 — Build and upload

```bash
npm run release:prep
npx cap open ios
```

In Xcode:

1. Target **App → General**: Version `1.0.0`, Build `1`.
2. **Signing & Capabilities**: your paid team, bundle ID as above, *Automatically manage signing* on.
3. Run once on your phone from Xcode and do a full QA pass (step 7).
4. Choose **Any iOS Device (arm64)** as the destination → **Product → Archive**.
5. In the Organizer: **Distribute App → App Store Connect → Upload**.
6. The build appears in App Store Connect → TestFlight after 10–30 minutes of processing.

Every re-upload needs a **higher Build number** (2, 3, …). The Version stays `1.0.0` until release.

## Step 7 — QA on a real phone (via TestFlight ideally)

- Fresh install (delete the old dev build first): level 1 tutorial appears and works.
- Play through several levels; win confetti + chord; next level.
- Undo appears at level 11 with the intro popup; level 21 explains 5 items per shelf.
- Level 120: “Game Complete!!” button; confetti on win and on that button.
- Settings: both sliders, mute buttons, track ◀ ▶, a track ends and the next one starts.
- Kill and reopen the app: progress, volumes and track are remembered.
- Locked level → cheat code panel → `CLEANCLOTHES25` unlocks.
- Airplane mode: everything still works (it's all bundled).
- Silent switch / phone call interruption: music behaves sensibly when you come back.

## Step 8 — App Store Connect: create the app

[appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Apps → + → New App**

- Platform iOS, name **Clothes Sort** (if taken, try "Clothes Sort: Wardrobe Puzzle" etc.),
  language English (UK), bundle ID from the dropdown, SKU e.g. `clothes-sort-2026`.

Then fill in:

**App Information**
- Subtitle (e.g. "A cosy wardrobe sorting puzzle").
- Category: **Games**, subcategories **Puzzle** (+ optionally **Casual**).
- Privacy Policy URL: the Pages URL.
- Content Rights: "No, it does not contain third-party content" isn't quite right because of the music —
  choose **Yes, contains third-party content, and I have the rights** (public-domain recordings).
- Age Rating questionnaire: answer "None" to everything → **4+**.

**Pricing and Availability** — Free; all countries (or pick).

**App Privacy** — Get Started → "Do you collect data?" → **No** → Publish.

**Version 1.0.0 page**
- Screenshots, promotional text, description, keywords, support URL (same Pages URL), marketing URL (optional, blank is fine).
- Copyright: `2026 Sachin Chopra`.
- Build: pick the uploaded build.
- **App Review Information**: your name, email, phone; *Sign-in required* **off**; Notes, for example:

  > Clothes Sort is an offline puzzle game with no account or login. Tap a shelf to pick up the clothes at its open end, then tap another shelf to move them next to matching clothes. Clear every shelf to win. Level 1 has a guided tutorial. Locked levels can be unlocked for review with the code CLEANCLOTHES followed by the level number (e.g. CLEANCLOTHES25). All music is public-domain classical recordings bundled with the app.

  (Giving the reviewer the cheat code means they can see later levels without playing 100 of them.)

- **Version release**: "Manually release" is safest for a first launch.

## Step 9 — Submit

**Add for Review → Submit.** Review is usually 1–3 days. Watch your email.

If rejected: read the message in the Resolution Center, fix, bump the **Build** number, archive and upload
again, attach the new build, resubmit. Common first-app rejections to pre-empt:

- **Guideline 4.2 (minimum functionality)** — unlikely for a 100-level game, but good screenshots help.
- **Broken support URL** — make sure the Pages site is live *before* submitting.
- **Metadata mismatch** — screenshots must show the actual app; no "beta", no prices, no other platforms.

## Step 10 — After approval

1. Press **Release** (if you chose manual).
2. `git tag v1.0.0 && git push origin v1.0.0`.
3. For the next update (e.g. more music): bump Version to `1.0.1`, Build back to any number higher than before,
   add a "What's New" section to `listing.md`, repeat steps 6–9 (no new app setup needed).

---

### Things that are easy to forget

- Paid Apple Developer membership must be active (renews yearly, £79/$99).
- **Agreements, Tax and Banking** in App Store Connect — the free-apps agreement is accepted automatically,
  but check there are no pending agreements banners, or submission is blocked.
- Since 2024 the EU requires a **trader status** declaration (App Store Connect → Business). As an individual with a free app you can usually declare **non-trader**; if you declare trader, your address/phone become public in the EU.
- The reviewer gets the app exactly as shipped — remove any debug-only shortcuts you don't want them using.
