# Category Flags

Mor-category-level prompt instructions ("most important facts" + green/red flags) plumbed
into the four ETF analysis prompts (Past Returns / Cost & Team / Risk / Future Outlook) as
`categoryInstructions`. The same rendered block goes into all four prompts when the fund's
Mor category has an entry.

## One file per analysis group

The flags are split into **one JSON file per ETF analysis group** — the `group` keys defined
in `src/etf-analysis/etf-analysis-categories.json`:

- `broad-equity.json`
- `sector-thematic-equity.json`
- `commodities-and-digital-assets.json`
- `derivative-income.json`
- `allocation-target-date.json`
- `fixed-income-investment-grade.json`
- `fixed-income-credit-and-income.json`
- `leveraged-inverse.json`

Each file is imported (bundled) and registered in a `group key -> flags` map in
`src/utils/etf-analysis-reports/etf-report-input-json-utils.ts`. At analysis-generation time
the lookup (`getCategoryInstructionEntry`) resolves the fund's group from its (canonicalized)
category and indexes into **only that group's entries**, so a single ETF's analysis never
touches the other groups' flags.

## File shape

Each file is a flat object keyed by category slug — `slugifyEtfCategory(name)` from
`etf-categorization-utils` (e.g. `Large Blend` -> `large-blend`,
`Trading--Leveraged Equity` -> `trading-leveraged-equity`), the same identifier used in
category URLs and `getEtfCategoryBySlug`. Each slug MUST resolve to a `categories[].name`
in `etf-analysis-categories.json`; unknown keys are silently ignored.

```json
{
  "large-blend": {
    "mostImportant": ["…", "…"],
    "greenFlags": ["…", "…"],
    "redFlags": ["…", "…"]
  }
}
```

## Coverage

Populated for **every** canonical Mor category in `etf-analysis-categories.json` (US
Morningstar-style and Canada Stock-Analysis-style names alike). Lookups canonicalize the raw
per-country category through `etf-category-aliases.json` first, so an aliased Canada label
(e.g. `Financials` -> `Financial`, `Information Technology` -> `Technology`) resolves to the
same entry as its US equivalent.

## Authoring style

Each category carries three lists:

- `mostImportant` (3-5 bullets) — qualitative facts describing what this KIND of fund is: its
  index/selection methodology, the character of the resulting portfolio, and its income & tax
  nature. Neutral context with no verdict and no numeric thresholds, in the form
  "the fact — its character".
- `greenFlags` / `redFlags` (3-5 bullets each) — evaluative, in the form
  "signal — why it matters" with brief numeric anchors (tickers, bps, %). Rules: (1) include
  ONLY genuinely impactful signals — omit obvious basics like a plain low/high expense ratio;
  (2) `redFlags` must NOT be the mirror-image negation of `greenFlags` — each red flag is its
  own distinct failure mode, so a given dial appears on at most one side.

_Last reviewed: 2026-05-30._
