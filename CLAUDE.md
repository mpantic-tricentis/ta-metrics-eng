# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm ci                               # Install dependencies
npm run serve                        # Serve site/ locally at http://localhost:4173
npm test                             # Run all Playwright tests (headless)
npm run test:ui                      # Run tests in Playwright UI mode
npx playwright test tests/e2e/slice2.spec.ts                  # Run a single slice
npx playwright test tests/e2e/slice2.spec.ts -g "test name"   # Run a single test by name
npx playwright install --with-deps   # First-time: install browser binaries
```

There is no build step — `site/` is served directly. GitHub Actions deploys `site/` to GitHub Pages on every push to `main`.

## Architecture

**Stack:** Vanilla HTML/CSS/JS + Chart.js. No framework, no bundler. Data is pre-aggregated JSON loaded at runtime.

**Data flow:**
```
site/data/pr-metrics.json   ─┐
                              ├─ Promise.all fetch → render() → per-card updateCardDisplay()
site/data/benchmarks.json   ─┘
```

- `site/assets/js/pr-metrics.js` owns the entire dashboard: fetches both JSON files, manages filter state (`{ team, component }`), renders cards, and wires up filter dropdowns.
- `site/assets/js/app.js` provides shared utilities: `gradeValue(metricKey, value, benchmarks)` and nav active-state marking.
- `site/data/benchmarks.json` defines, per metric key, the `direction` (`lower-is-better` | `higher-is-better`) and tier thresholds. `gradeValue()` reads this to produce `{ tier, cssClass, nextTip }`.

**Metric cards** are driven by a `CARDS` config array in `pr-metrics.js`. Each entry declares its `metricKey`, display type (percentile p50/p75/p90 vs. single value), and how rows map to the data. Adding a new metric means adding a benchmarks entry, a CARDS entry, and corresponding test data.

**Tier grades** — LinearB 2026:
| Metric | Elite | Good | Fair | Needs Focus |
|---|---|---|---|---|
| Pickup Time | ≤2h | ≤4h | ≤13h | >13h |
| Iteration Time | ≤3h | ≤13h | ≤23h | >23h |
| Acceptance Rate (30d) | >95% | 92–95% | 87–91% | <87% |

## Testing

Tests live in `tests/e2e/` as `sliceN.spec.ts` files — each slice covers one feature or card. Playwright intercepts `fetch` calls and serves mock data from `tests/fixtures/` (or inline JSON defined in the test). There are no unit tests; all tests are browser-level e2e.

`data-testid` conventions:
- Card containers: `card-{pickup,iteration,acceptance-rate}`
- Percentile rows: `{pickup,iteration,acceptance}-{p50,p75,p90}-{value,chip}`
- Legends: `{pickup,iteration,acceptance}-ladder`
- Filters: `filter-team`, `filter-component`
- Page states: `cards-grid`, `empty-state`, `load-error`

## Delivery pattern

Features are delivered as vertical slices — one card or feature per PR, always including its test slice. When adding a new metric card, follow this checklist:

1. Add metric key + thresholds to `site/data/benchmarks.json`
2. Add field to `site/data/pr-metrics.json` (and fixture files in `tests/fixtures/`)
3. Add card config to `CARDS` array in `pr-metrics.js`
4. Add render logic (percentile or single-value)
5. Add a new `sliceN.spec.ts` covering the card's display and grading

Filters follow the same pattern: extend `pr-metrics.json` with the new dimension, add a dropdown to `pr-metrics.html`, populate it in `initFilters()`, and filter by it in `render()`.
