# Clothes Sort

Proof-of-concept foundation: Phaser 3 + TypeScript + Vite.

**Git remote (personal):** `git@github-personal:sachinchopra35/clothes-sort.git` — use the `github-personal` SSH host so pushes authenticate as **sachinchopra35**, not work GitHub.

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (default port 5173). Use browser device emulation for iPhone portrait (e.g. 390×844).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build to `dist/`
- `npm test` — unit tests (rules, solver, generator, layout, and a solvability proof for every level)
- `npm run levels:analyze` — exact solver metrics and difficulty score for every level
- `npm run levels:analyze -- --sample <types> <emptyShelves> <deals> [maxStartRun]` — stats for random deals of a given size (used to calibrate difficulty bands)
- `npm run levels:generate` — (re)build levels **4–10** only
- `npm run levels:generate:more` — **append** levels 11–20 without changing 4–10

## Levels

Levels 1-3 are copied from Bird Sort 2 (`src/levels/levelData.ts`). Levels 4+ are generated offline from the spec table in `scripts/levels-generate.ts`:

1. A seeded random deal fills one shelf per clothing type and adds empty shelves.
2. The solver (`src/game/solver.ts`) explores **every** reachable state, so "solvable" is a proof rather than a guess.
3. A difficulty score combines the shortest solution length, how often a single move makes the level unwinnable, how much of the state space is a dead end, and how often random play wins.
4. The candidate closest to the level's target score is saved with its shortest solution, and the tests replay that solution through the real game rules.

To add or retune a level, edit its row in the spec table (types, empty shelves, score band, seed) and re-run `npm run levels:generate`.
