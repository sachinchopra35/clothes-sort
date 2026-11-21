# App Review notes — Clothes Sort

Materials for App Store submissions. Paste into **App Store Connect → App Review Information → Notes**. Not shown to the public.

Replace `BUILD_NUMBER` with the build you upload from Xcode (e.g. `1`).

---

## App Review Information → Notes field (version 1.0.0)

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
7. Level 120: finishing shows “Game Complete!!” (confetti still plays on win); tapping it fires confetti again. There is no level 121.

Locked levels: only levels after the player’s current furthest unlock are locked. For review access to a locked level without playing through, tap the greyed level number or “Locked” on the level picker and enter the cheat code CLEANCLOTHES followed by the level number (example: CLEANCLOTHES25 unlocks level 25 and prior progress gates). This flow is intentional for support/testing; there is no in-app purchase.

Music: bundled classical piano tracks are original recordings performed by the developer (not streamed).

Sign-in required: No.
In-app purchases: None (free app).

Version 1.0.0 (build BUILD_NUMBER): initial App Store release.
```

---

## Review contact

Fill in App Store Connect separately:

- **First name / Last name:** Sachin Chopra
- **Phone:** +447921060035
- **Email:** sachchopra@gmail.com
- **Sign-in required:** No

---

## After you submit

- [ ] Attach the processed Xcode build to version 1.0.0
- [ ] Paste **Notes** above (update `BUILD_NUMBER`)
- [ ] Optional: 1–2 minute screen recording on physical iPhone (menu → play → win) if Apple requests Guideline 2.1 detail again