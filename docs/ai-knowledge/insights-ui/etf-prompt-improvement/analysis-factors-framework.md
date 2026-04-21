# ETF Analysis Factors Framework

**Date**: 2026-04-21
**Branch**: `etf-analysis-factors`
**Status**: Performance & Returns factors finalized. Cost/Efficiency and Risk Analysis factors still pending.

This document captures the decisions, data model, and rationale behind how ETF analysis factors have been restructured. It supersedes the asset-class-based design that was reviewed in `asset-class-factors-review.md`.

---

## What changed and why

### Original design (pre-April 2026)

- A single file `etf-analysis-factors.json` held one `categories` array with three top-level analysis categories: `PerformanceAndReturns`, `CostEfficiencyAndTeam`, `RiskAnalysis`.
- Each category had a `factorsByAssetClass` map keyed by the 6 Mor asset classes: `Equity`, `Fixed Income`, `Alternatives`, `Commodity`, `Asset Allocation`, `Currency`.
- Each asset class had ~5 factors; factors and descriptions were hand-written per asset class, leading to near-duplicate text across buckets.

### Problem with the original design

Asset class is too coarse a lens for meaningful analysis. Examples from the 11-ETF review:

- `Equity` lumps plain index ETFs (VOO, Large Blend, 281 funds), defined-outcome buffered products (337 funds), daily-leveraged products (280 funds), sector bets (Technology 125 funds), and active stock-pickers together. One factor set can't score all of these correctly.
- `Fixed Income` hides the gap between target-maturity bullet funds, high-yield credit, Muni (where tax-equivalent yield is the entire point), and nontraditional bond funds.
- `Alternatives` groups JEPI-style derivative income, Defined Outcome, managed futures, multi-strategy, and event driven — analytically unrelated strategies with completely different promises.

The review found this was the single biggest driver of misleading outputs for non-equity ETFs.

### New design (April 2026)

1. **Split the monolithic factor file** into three per-category files so each analysis dimension (Past Returns, Cost/Efficiency, Risk) can evolve independently:
   - `etf-analysis-factors-performance-and-returns.json`
   - `etf-analysis-factors-cost-efficiency-and-team.json`
   - `etf-analysis-factors-risk-analysis.json`

2. **Introduced a group dimension** in a new file `etf-analysis-categories.json` that lists all 134 Mor categories with:
   - `numberOfStocks` — count of ETFs in the category (used for peer-group size context in reports)
   - `group` — one of 8 logical groups chosen so factors can be authored around an investment strategy's *mandate* rather than the individual fund's current asset-class snapshot

3. **Rewrote `etf-analysis-factors-performance-and-returns.json`** around those 8 groups. Each factor is defined once and tagged with the groups it applies to (`groups: [...]`). Each group ends up with exactly 5 factors. Cost/Efficiency and Risk files still use the old `factorsByAssetClass` shape and will be migrated next.

---

## Why group, not asset class

Mor categorizes ETFs by **mandate** (what the fund is trying to do), not by current holdings snapshot. A Tactical Allocation fund might be 80% equity this quarter and 30% next quarter — the `assetClass` tag reflects the snapshot, but the *category* reflects the strategy. For analysis purposes, the mandate matters more than the snapshot.

Group-level factors ask strategy-level questions:
- A Tactical Allocation fund should be evaluated on whether the manager's timing added value vs a static 60/40 — not on whether its beta to the S&P is "in line."
- A leveraged ETF should be evaluated on daily-reset fidelity and path decay — not on 10-year CAGR vs its underlying.
- A Muni fund should be evaluated on tax-equivalent yield vs peers — not on absolute yield vs the Agg.

Asset class as a tag is still useful for display and filtering, but it's no longer used for factor selection.

---

## The 8 groups

Defined in `etf-analysis-categories.json` → `groups[]`.

| Key | Name | # categories | # funds | Short description |
|-----|------|--------------|---------|-------------------|
| `broad-equity` | Broad Equity | 28 | 1,517 | Diversified equity by cap/style/region (Large/Mid/Small × Blend/Value/Growth × US/Foreign/Global/Emerging/Single-region). |
| `sector-thematic-equity` | Sector & Thematic Equity | 17 | 599 | Sector or thematic equity (Technology, Health, Real Estate, Natural Resources, Equity Digital Assets, Infrastructure, etc.). |
| `leveraged-inverse` | Leveraged & Inverse Trading | 8 | 464 | Daily-rebalanced leveraged, inverse, or multi-asset leveraged products (all `Trading--*` categories + Multi-Asset Leveraged). |
| `fixed-income-core` | Fixed Income — Core & Government | 20 | 523 | Investment-grade government, corporate, mortgage, TIPS, securitized, target-maturity, global bond, money market. |
| `fixed-income-credit` | Fixed Income — Credit & Income | 9 | 215 | High yield, bank loan, preferred stock, convertibles, EM debt, nontraditional, multisector, private debt. |
| `muni` | Municipal Bonds | 14 | 147 | All Muni variants — national, state-specific, high-yield, target-maturity. |
| `alt-strategies` | Alternative Strategies | 16 | 821 | Derivative income, defined outcome, hedge-fund-style strategies, commodities, digital assets, single currency. |
| `allocation-target-date` | Allocation & Target-Date | 22 | 116 | Static/tactical/glide-path allocation funds + all Target-Date vintages. |

**Total**: 134 categories, 4,402 ETFs. Groups are a **strict partition** — every category belongs to exactly one group, no overlaps.

Edge-case decisions worth noting:

- `Equity Precious Metals` → `sector-thematic-equity` (gold-mining *stocks*, e.g. GDX).
- `Commodities Precious Metals` → `alt-strategies` (the metal itself, e.g. GLD).
- `Digital Assets` → `alt-strategies` (direct crypto ETFs); `Equity Digital Assets` → `sector-thematic-equity` (crypto-related stocks).
- `Energy Limited Partnership` → `sector-thematic-equity` (MLPs are equity, albeit with unique tax treatment).
- `Muni Target Maturity` → `muni` (not `fixed-income-core`), because the tax-equivalent-yield lens is group-defining.
- `Target Maturity` (non-muni, 86 funds) → `fixed-income-core`.
- Money Market categories (`Money Market-Taxable`, `Prime Money Market`) → `fixed-income-core` for lack of a better fit; these are small and the analysis is narrow.
- `Convertibles`, `Preferred Stock` → `fixed-income-credit` (income-centric hybrids).
- `Tactical Allocation`, all `Target-Date *`, Moderate/Conservative/Aggressive Allocation, Global Allocation variants → `allocation-target-date`.

---

## The 10 Past Returns factors

Defined in `etf-analysis-factors-performance-and-returns.json` → `factors[]`. Each factor has `factorKey`, `factorTitle`, `factorDescription`, `factorMetrics`, `groups[]`.

| Key | Title | Groups | Why it lives in those groups |
|-----|-------|--------|------------------------------|
| `long_term_cagr` | Long-Term CAGR | 6 (broad-equity, sector-thematic, fixed-income-core, fixed-income-credit, muni, allocation-target-date) | Long-horizon growth is a meaningful question for buy-and-hold categories. **Excluded** from `leveraged-inverse` (CAGR is misleading for daily-reset products) and `alt-strategies` (absolute return isn't the point). |
| `short_term_returns` | Short-Term Returns & Momentum | 4 (broad-equity, sector-thematic, leveraged-inverse, alt-strategies) | Recent momentum is relevant for equity and short-term trading vehicles. Fixed income and allocation products shouldn't be scored on month-to-month momentum. |
| `returns_consistency` | Returns Consistency | 6 (broad-equity, sector-thematic, fixed-income-credit, muni, alt-strategies, allocation-target-date) | Year-to-year stability matters where manager skill or strategy discipline affects outcomes. **Excluded** from `fixed-income-core` (returns are rate-driven, not manager-driven) and `leveraged-inverse` (inconsistency is by design, captured better by `daily_leverage_fidelity`). |
| `benchmark_tracking` | Benchmark Tracking | 3 (broad-equity, leveraged-inverse, fixed-income-core) | Tracking precision is meaningful where a passive index is the stated goal. Excluded from sector/thematic (sector ETFs hug their index — not discriminating), from alt/allocation (no natural benchmark), and from muni/credit (category standing matters more). |
| `category_peer_standing` | Category Peer Standing | 8 (all groups) | The only universal factor. Always useful to know where a fund ranks among its Mor-category peers. |
| `drawdown_and_recovery` | Drawdown & Recovery | 4 (sector-thematic, leveraged-inverse, fixed-income-credit, allocation-target-date) | Where drawdown magnitude and recovery speed differentiate funds. Broad equity drawdowns are mostly asset-class-driven; core bond/muni drawdowns are rate-driven — better captured elsewhere. |
| `income_vs_price_return` | Income vs Price Return | 4 (fixed-income-core, fixed-income-credit, muni, alt-strategies) | For income-heavy funds, total return minus price change = income contribution. Crucial to explain "price is down but total return is positive" correctly. |
| `daily_leverage_fidelity` | Daily Leverage Fidelity & Decay | 1 (leveraged-inverse only) | Group-specific. Addresses the single most important question for these products: did the realized multi-period return match the daily-leverage target, or did path-decay destroy the multiple? |
| `downside_protection` | Downside Protection Delivery | 2 (alt-strategies, allocation-target-date) | These groups' value proposition *is* downside protection. Protection ratio (fund drawdown / benchmark drawdown) is the headline metric. |
| `rate_environment_resilience` | Rate Environment Resilience | 2 (fixed-income-core, muni) | Bond-specific: how the fund fared in rising-rate (2022) vs falling-rate (2019, 2020) years. Addresses the TLT "no rate context" gap found in the 11-ETF review. |

### Factors per group (always 5)

| Group | Factors |
|-------|---------|
| `broad-equity` | long_term_cagr, short_term_returns, returns_consistency, benchmark_tracking, category_peer_standing |
| `sector-thematic-equity` | long_term_cagr, short_term_returns, returns_consistency, category_peer_standing, drawdown_and_recovery |
| `leveraged-inverse` | daily_leverage_fidelity, short_term_returns, drawdown_and_recovery, benchmark_tracking, category_peer_standing |
| `fixed-income-core` | long_term_cagr, benchmark_tracking, income_vs_price_return, rate_environment_resilience, category_peer_standing |
| `fixed-income-credit` | long_term_cagr, income_vs_price_return, drawdown_and_recovery, returns_consistency, category_peer_standing |
| `muni` | long_term_cagr, income_vs_price_return, rate_environment_resilience, returns_consistency, category_peer_standing |
| `alt-strategies` | short_term_returns, returns_consistency, downside_protection, income_vs_price_return, category_peer_standing |
| `allocation-target-date` | long_term_cagr, returns_consistency, drawdown_and_recovery, downside_protection, category_peer_standing |

---

## Data model (current state)

### `src/etf-analysis-data/etf-analysis-categories.json`

Top-level schema:

```json
{
  "groups": [
    { "key": "broad-equity", "name": "Broad Equity", "description": "..." },
    …
  ],
  "categories": [
    { "name": "Large Blend", "numberOfStocks": 281, "group": "broad-equity" },
    …
  ]
}
```

- `groups[]` holds the 8 groups with human-readable name and description.
- `categories[]` holds all 134 Mor categories sorted by `numberOfStocks` descending. Each category belongs to exactly one group.

### `src/etf-analysis-data/etf-analysis-factors-performance-and-returns.json`

Top-level schema:

```json
{
  "categoryKey": "PerformanceAndReturns",
  "categoryName": "Performance & Returns",
  "categoryDescription": "...",
  "factors": [
    {
      "factorKey": "long_term_cagr",
      "factorTitle": "Long-Term CAGR",
      "factorDescription": "...",
      "factorMetrics": "cagr5y, cagr10y, cagr15y, cagr20y",
      "groups": ["broad-equity", "sector-thematic-equity", "fixed-income-core", "fixed-income-credit", "muni", "allocation-target-date"]
    },
    …
  ]
}
```

- Each factor is defined **once** with a `groups[]` array listing which groups it applies to. No per-group duplication of descriptions.
- Consumers filter at runtime: `factors.filter(f => f.groups.includes(etfGroup))`.

### Still old-style (to be migrated)

- `etf-analysis-factors-cost-efficiency-and-team.json` — still uses `factorsByAssetClass`.
- `etf-analysis-factors-risk-analysis.json` — still uses `factorsByAssetClass`.

### Code reference (currently broken, deferred)

`src/utils/etf-analysis-reports/etf-report-input-json-utils.ts` still imports the old monolithic `etf-analysis-factors.json` path. Typecheck/build are expected to fail until the loader is updated to read the three per-category files. This was left intentionally broken by user request — factor definitions first, code wiring later.

---

## Prompt strategy (decision recorded, not yet implemented)

**Single prompt per analysis category, not per group.** The report generator should build one prompt that adapts to any ETF via data injection:

```
[STATIC instructions] Output format, tone, length, rules.
[INJECTED from group]  Group framing — one paragraph from etf-analysis-categories.json.
[INJECTED from filtered factors] The 5 factors this group uses (titles, descriptions, metric lists).
[INJECTED from ETF data] Ticker, name, Mor category, AUM, all metric payloads.
```

Rationale:

- 3 prompts total (one per analysis category) is sustainable; 8 × 3 = 24 per-group prompts would drift within weeks.
- The factor descriptions already carry group-specific nuance (e.g. `daily_leverage_fidelity` explicitly warns about decay and short-term-only suitability). The prompt can delegate framing to the factor definitions.
- Consistency of structure across ETFs helps readers who compare multiple funds.

**One follow-up to make this work well**: sharpen each group's `description` field in `etf-analysis-categories.json` from *descriptive* ("Daily-rebalanced leveraged funds…") to *instructive* ("ALWAYS open with a holding-period warning. ALWAYS call out decay. Do not quote long-horizon CAGR."). These sharpened descriptions become the "group framing" block injected into the prompt. **Not yet done** — open task.

---

## Summary of decisions

| Decision | Outcome |
|----------|---------|
| Split `etf-analysis-factors.json` into per-category files | Done. 3 files under `src/etf-analysis-data/`. |
| Add `etf-analysis-categories.json` with all 134 Mor categories | Done. Includes `numberOfStocks` counts for all and `group` tag for all. |
| Drop asset class as the factor-selection dimension; replace with groups | Done for Performance & Returns. Pending for Cost/Efficiency and Risk. |
| Choose between 4–8 groups | 8 groups chosen. Clean partition of the 134 categories. |
| Use a single prompt with group-aware data injection, not per-group prompts | Decided. Implementation pending. |
| Sharpen group descriptions into instructive framings | Pending. |
| Update `etf-report-input-json-utils.ts` loader to read the split files | Pending. Typecheck/build intentionally broken until ready. |

---

## Open tasks

1. Migrate `etf-analysis-factors-cost-efficiency-and-team.json` from `factorsByAssetClass` to the group-based `factors[]` shape. Design ~8-12 factors with 5 per group.
2. Migrate `etf-analysis-factors-risk-analysis.json` the same way.
3. Sharpen all 8 group `description` fields in `etf-analysis-categories.json` into instructive framings.
4. Update `etf-report-input-json-utils.ts` to read the three split files and combine them via group lookup. Fix build.
5. Author the single prompt template for Performance & Returns that consumes `{group, factors[], etfData}`.
