# Blackjack Strategy Trainer

A single-page trainer for drilling blackjack basic strategy. It deals hands, asks you to make a decision, and scores every choice against the optimal play **for the table rules you've configured** — so you're rewarded for correct decisions, not for winning hands.

No build step, no dependencies, no server. One self-contained HTML file.

## Running it

Open the HTML file in any modern browser, or host it (e.g. GitHub Pages) and play at a real URL. Hosting is recommended because progress is saved via `localStorage`, which is blocked in some sandboxed previews but works on a normal origin.

To serve it on GitHub Pages, rename the file to `index.html`, enable Pages for the repo, and it'll be live at `https://<user>.github.io/<repo>/`.

## How scoring works

Two independent metrics, deliberately kept apart:

- **Skill** — points awarded only for correct strategy decisions, with a streak bonus. This is the number that reflects how well you actually play.
- **Bankroll** — flat-bet chips that rise and fall with the outcome of each hand. You can play a hand perfectly and still lose it; that's variance, and seeing the two diverge is the point.

Also tracked: decision **accuracy %**, current and best **streak**, and a **rank** that climbs from Novice through to Whale as your correct-decision count grows.

## Actions

Hit, Stand, Double, Split, and (when enabled) Surrender. Only the legal moves for the current hand are shown. Splitting follows real casino rules — any two equal-**value** cards can be split, including any two ten-value cards (J+10, K+Q, …); resplit up to four hands; split aces draw one card each.

### Keyboard

| Key | Action |
|-----|--------|
| `H` | Hit |
| `S` | Stand |
| `D` | Double |
| `P` | Split |
| `R` | Surrender |
| `Space` / `Enter` | Deal / Next hand |

Hints are shown on the buttons on devices with a physical keyboard.

## Strategy chart

A toggleable reference with three grids — **hard totals**, **soft totals**, and **pairs** — colour-coded by action. The cell matching your live hand is highlighted as you play (this can be turned off for blind practice). Notation: `D` = double else hit, `Ds` = double else stand, `P` = split, `R` = surrender.

The chart is generated from the same decision engine that scores you, so it always matches the active rule set rather than showing a fixed chart.

## Options

| Option | Choices | Effect |
|--------|---------|--------|
| Dealer soft 17 | Stands / Hits | Changes dealer play **and** shifts the chart (e.g. 11 vs A, A,8 vs 6, surrender cells) |
| Double after split | On / Off | Adjusts pair-splitting strategy (4,4 · 6,6 · 2,2 · 3,3) |
| Late surrender | On / Off | Adds the Surrender action and `R` cells |
| Decks | 4 / 6 / 8 | Shoe size and shuffle cadence |
| Chip bet | 5 / 10 / 25 | Stake per hand (applies next hand) |
| Live chart hint | On / Off | Highlight the live cell, or hide it for blind practice |

Plus **Reset bankroll & stats** (zeroes stats, keeps rules) and **Clear saved data** (wipes the stored copy and restores all defaults).

Every change rewrites all three charts immediately so the "optimal" call you're scored against stays consistent with the table.

## Rule assumptions

Multi-deck basic strategy throughout. Deck count affects only the shoe, not the chart, since 4/6/8-deck strategy is identical (which is why single- and double-deck aren't offered — their charts genuinely differ). The dealer's soft-17 behaviour, double-after-split, and late-surrender rules all flow through to both the engine and the chart.

## Tech notes

- Vanilla HTML/CSS/JS in a single file; fonts pulled from Google Fonts with system fallbacks.
- State and rules persist to `localStorage` under the key `bj-trainer-v1`, wrapped in guards so it silently no-ops where storage is unavailable.
- The decision engine is the single source of truth for both scoring and chart generation.
