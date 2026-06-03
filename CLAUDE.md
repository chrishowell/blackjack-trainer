# Blackjack Strategy Trainer

## What this is
A single-page basic-strategy trainer. Deals hands, scores each decision against the
optimal play **for the currently configured table rules**, and tracks skill separately
from bankroll. Entire app is one self-contained file — no build, no deps, no server.

## Files
- `blackjack-trainer.html` (or `index.html` if served via GitHub Pages) — the whole app.
- `README.md` — user-facing description.

## Architecture (read before editing logic)
Everything lives in the `<script>` block of the HTML. The critical design rule:

> **The decision engine is the single source of truth.** The same functions that score
> the player's move also generate the three strategy charts. Never hardcode a chart cell
> or duplicate strategy logic — derive both from the engine, or they will drift.

Core functions:
- `hitStand`, `shouldDouble`, `shouldSplit`, `shouldSurrender` — pure strategy, rule-aware.
- `optimalAction(cards, dealerUp, opts)` — applies action priority: surrender → split →
  double → hit/stand, gated by what's legal (`opts.canSur/canSpl/canDbl`).
- `buildGrid` / `cellLabelTotal` / `cellLabelPair` — chart cells, built by calling the
  same strategy functions. `D`=double-else-hit, `Ds`=double-else-stand, `P`=split, `R`=surrender.

## Invariants (do not break)
1. Charts and scoring must use the same engine. If you change strategy, both update together.
2. Strategy is **rule-aware**: `rules.h17`, `rules.das`, `rules.surrender` change cells.
   Deck count does NOT change strategy (4/6/8-deck charts are identical) — it only affects
   the shoe. Don't add 1/2-deck without adding their distinct charts.
3. Splitting is by card **value**, not rank — any two ten-value cards split (true to casino).
   Splitting tens is legal but wrong; the engine flags it. Don't "fix" this.
4. Skill score (correct decisions) and bankroll (hand outcomes) are intentionally separate.
5. Persistence (`localStorage`, key `bj-trainer-v1`) is wrapped in try/catch + a capability
   probe; it must silently no-op where storage is blocked. Save on every state mutation.
6. Only legal actions are shown (buttons hidden, not disabled).

## Game flow
`startRound` → player acts on `S.hands[S.active]` → `proceed`/`seekActionable` advance
through split hands → `dealerPlayAndResolve`. Split aces draw one card and auto-stand;
resplit up to 4 hands. Naturals resolved before any decision (not scored).

## Rules model
Defaults: `{h17:false, das:true, surrender:false, decks:6, bet:10, hint:true}`. Multi-deck,
dealer stands soft 17, double-after-split allowed, no surrender. `applyRules()` rebuilds the
shoe + charts and re-renders on any option change.

## Testing strategy correctness
There's no test file checked in, but the engine is pure and node-checkable. Validate
strategy changes by extracting the functions and asserting against a known basic-strategy
chart (S17/H17, DAS on/off, late-surrender cells). Spot-checks that must hold:
- 11 vs A → Hit on S17, Double on H17
- A,8 (soft 19) vs 6 → Stand on S17, Ds on H17
- 8,8 → always split (except surrender vs A on H17+surrender); never split 5,5 or 10,10
- 16 vs 9/10/A and 15 vs 10 → R when surrender on
Syntax check after edits: extract the script and run `node --check`.

## Conventions
- Vanilla JS, no framework. Keep it dependency-free and single-file.
- Compact style matches the existing code; the Art Deco card-room theme uses CSS vars at `:root`.
- Don't introduce a bundler or split files without a deliberate reason.