# GitHub Pages setup — step by step

This folder (`docs/`) hosts your public site for Apple’s **Privacy Policy URL** and **Support URL**.

**Your URL (after setup):**

```text
https://sachinchopra35.github.io/clothes-sort/
```

Use that **same URL** for both fields in App Store Connect.

**Source copies:** edit [mobile/app-store/privacy-policy.md](../mobile/app-store/privacy-policy.md) and [mobile/app-store/support.md](../mobile/app-store/support.md), then sync [index.html](index.html) to match.

---

## Part 1 — Push the website to GitHub (Terminal)

### 1. Go to the project

```bash
cd "/Users/sachinchopra/Projects/clothes_sort"
```

### 2. Commit `docs/index.html` (and setup doc if needed)

```bash
git add docs/index.html docs/github-pages-setup.md
git commit -m "Add GitHub Pages site for App Store privacy and support"
git push
```

Use your usual GitHub auth (SSH / browser).

---

## Part 2 — Turn on GitHub Pages (browser)

1. Open **https://github.com/sachinchopra35/clothes-sort**
2. **Settings** (repo tab) → **Pages** (left sidebar)
3. Under **Build and deployment**:

   | Setting | Choose |
   |---------|--------|
   | **Source** | Deploy from a branch |
   | **Branch** | `main` |
   | **Folder** | `/docs` |

4. **Save** — wait 1–5 minutes
5. Confirm: “Your site is live at **https://sachinchopra35.github.io/clothes-sort/**”

### Repo visibility

- **Public repo:** free Pages, no extra steps.
- **Private repo:** GitHub may still allow Pages on a personal account; if Pages is blocked, make the repo public or create a tiny public repo that only contains `docs/index.html`.

---

## Part 3 — Test

Open `https://sachinchopra35.github.io/clothes-sort/` on your phone (private tab if cached). You should see **Clothes Sort**, Privacy, and Support sections.

**404?** Wait a few minutes, confirm `main` + `/docs`, and that `index.html` is on GitHub (browse the repo online).

---

## Part 4 — App Store Connect

| Field | URL |
|-------|-----|
| **Privacy Policy URL** | `https://sachinchopra35.github.io/clothes-sort/` |
| **Support URL** | `https://sachinchopra35.github.io/clothes-sort/` |

---

## Updating later

1. Edit markdown in `mobile/app-store/` and sync `docs/index.html`
2. `git commit` + `git push` — site updates within a few minutes

---

## Note: other files in `docs/`

GitHub Pages publishes **everything** under `docs/`, not only `index.html`. Files such as `release-steps.md` may be reachable at `…/release-steps.md` if linked. Internal release notes live there on purpose; move them if you want a cleaner public folder.