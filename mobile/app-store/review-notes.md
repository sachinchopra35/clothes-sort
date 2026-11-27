# App Review notes — Clothes Sort

Materials for App Store submissions. Paste into **App Store Connect → App Review Information → Notes** (or **Resolution Center** when Apple asks under Guideline 2.1). Not shown to the public.

Replace `BUILD_NUMBER` when you upload a new build.

---

## Guideline 2.1 — full response (sent 23 Nov 2026, build 3)

Submitted in **Resolution Center** with attachment **`Clothes Sort Demo.mp4`** (physical iPhone: launch → menu → Play → level 1 tutorial → level complete / confetti → other levels → Settings).

Keep this block synced in **App Review Information → Notes** for the same review cycle so metadata matches the Resolution Center reply.

```text
GUIDELINE 2.1 — ADDITIONAL INFORMATION (Clothes Sort v1.0.0, build 3)


—— 1. SCREEN RECORDING ——
A screen recording from a physical iPhone on current iOS is attached [here / in my Resolution Center reply on 23rd Nov 2026]. It shows: app launch → main menu → Play → Level 1 tutorial → level complete (confetti) → Some other levels → Settings (music/sound). No account login, no payments, and no user-generated content exist in the app.


—— 2. PURPOSE AND AUDIENCE ——
Clothes Sort is a calm, offline wardrobe-sorting puzzle for casual players (teens and adults) who want short, relaxing brain-teaser sessions. The player moves matching clothes between shelves until every shelf is clear. It provides satisfying progression (200 levels), gentle difficulty curve, and optional classical piano music—without ads, accounts, or social features.


—— 3. SETUP AND MAIN FEATURES ——
No login, no server, and no configuration files. After install, open the app and tap Play on the main menu.
Typical flow:
• Level 1: on-screen tutorial (tap shelf to pick up, tap another to place).
• Levels unlock by completing the previous level.
• Settings (main menu or in-game gear): music/sound volume, mute, track selection.
• Level 11+: undo button is unlocked.
• Level 21: one-time note that shelves hold 5 items.

For reviewing the app, to access a locked level, without playing through: on the main menu level picker, tap a locked level and enter CLEANCLOTHES followed by the level number (e.g. CLEANCLOTHES25 unlocks level 25 and earlier gates). Support/testing only; no in-app purchase.

All levels are proven solvable by a solving algorithm (this algorithm was run on every level whenever that level was generated).

Sign-in required: No.


—— 4. EXTERNAL SERVICES ——
None for core gameplay. The app is fully offline after install. No authentication, payment processors, analytics SDKs, ads, cloud save, or AI/generative services in the product. Support link on the App Store page opens a static privacy/support webpage; the game does not require that page to play.


—— 5. REGIONAL DIFFERENCES ——
No regional differences. The same 200 levels, assets, and bundled music are identical in all countries. No geo-restricted content or features.


—— 6. REGULATED INDUSTRY / THIRD-PARTY MATERIAL ——
Not a regulated industry app. Game levels and UI are original. Clothing artwork is derived from Microsoft Fluent UI Emoji (MIT-licensed; project includes attribution). Background music is my original piano performances of public-domain classical works, bundled in the app (credits on support page). No streaming music, no user-uploaded content.


Review contact: Sachin Chopra, +447921060035, sachchopra@gmail.com
```

---

## Shorter notes (routine updates / future builds)

Optional compact text if Apple does not request Guideline 2.1 again:

```text
Clothes Sort is an offline puzzle game with no account, login, or server. Progress (completed levels, unlocks, volumes, music track index, tutorial flags) is stored locally on the device only.

No microphone, camera, location, analytics, ads, or third-party tracking. Background music and sound effects are bundled in the app. The app does not require a network connection to play.

How to test:
1. Launch app → main menu → ensure a level is selected → Play.
2. Level 1: follow the on-screen tutorial (tap the highlighted shelf, then the target shelf).
3. Complete the level by clearing all shelves; confetti plays on win → advance or return to menu.
4. Main menu: Settings → adjust music/sound sliders and switch tracks with ◀ ▶.
5. Level 11+: undo button appears at the bottom (limited undo uses on later levels); a one-time undo intro may appear.
6. Level 21: one-time popup explains shelves hold 5 items (not 4).
7. Level 200: finishing shows “Game Complete!!” (confetti still plays on win); tapping it fires confetti again. There is no level 201.

Locked levels: only levels after the player’s current furthest unlock are locked. For review access to a locked level without playing through, tap the greyed level number or “Locked” on the level picker and enter the cheat code CLEANCLOTHES followed by the level number (example: CLEANCLOTHES25 unlocks level 25 and prior progress gates). This flow is intentional for support/testing; there is no in-app purchase.

Music: bundled classical piano tracks are original recordings performed by the developer (not streamed).

Sign-in required: No.
In-app purchases: None (free app).

Version 1.0.0 (build BUILD_NUMBER).
```

---

## Review contact

Fill in App Store Connect separately:

- **First name / Last name:** Sachin Chopra
- **Phone:** +447921060035
- **Email:** sachchopra@gmail.com
- **Sign-in required:** No

---

## Checklist

- [x] Guideline 2.1 reply + `Clothes Sort Demo.mp4` (23 Nov 2026, build 3)
- [ ] Mirror **Guideline 2.1** text in App Review Information → Notes (same review cycle)
- [ ] After approval: release if manual; tag `v1.0.0` if desired