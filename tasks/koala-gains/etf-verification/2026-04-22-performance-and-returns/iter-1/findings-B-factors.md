# ETF verification findings — Loop B — factors (performance-and-returns) — iter-1

- **Date:** 2026-04-22
- **Loop:** B (factors)
- **Category in scope:** PerformanceAndReturns
- **Files reviewed:**
  - `insights-ui/src/etf-analysis-data/etf-analysis-categories.json`
  - `insights-ui/src/etf-analysis-data/etf-analysis-factors-performance-and-returns.json`
- **ETFs reviewed (same 16 as Loop A):**
  - broad-equity: SPY (Large Blend), IWF (Large Growth)
  - sector-thematic-equity: XLK (Technology), XLV (Health)
  - leveraged-inverse: TQQQ (Trading--Leveraged Equity), SQQQ (Trading--Inverse Equity)
  - fixed-income-core: AGG (Intermediate Core Bond), SHY (Short Government)
  - fixed-income-credit: HYG (High Yield Bond), PFF (Preferred Stock)
  - muni: MUB (Muni National Interm), SUB (Muni National Short)
  - alt-strategies: JEPI (Derivative Income), GLD (Commodities Focused)
  - allocation-target-date: AOA (Aggressive Allocation), AOK (Conservative Allocation)

## Method

Each group has exactly 5 factors in the JSON. For each sampled ETF I asked:

1. Did every assigned factor produce decision-useful content for this specific ETF?
2. Is anything missing — an angle that matters for this group but has no factor today?
3. Is anything not applicable — a factor that produced vague / inapplicable output?

## Per-ETF review

### SPY (broad-equity — Large Blend) — JSON factors: `long_term_cagr`, `short_term_returns`, `returns_consistency`, `benchmark_tracking`, `category_peer_standing`

- **What's good:** Every one of the 5 factors produced a distinct, decision-useful Pass/Fail with a numeric anchor. `benchmark_tracking` (S&P 500) and `category_peer_standing` (top 18th percentile over 10Y vs 1,315 Large Blend funds) are the headline findings for a passive large-blend ETF.
- **What's missing / wrong:** Nothing. The 5 factors are the correct 5 factors for a broad-equity passive tracker.
- **Verdict:** no change.

### IWF (broad-equity — Large Growth)

- **What's good:** Same 5 factors, same decision-useful output. `returns_consistency` caught the ETF's top-quartile rank across market regimes; `benchmark_tracking` confirmed tight Russell 1000 Growth replication.
- **What's missing / wrong:** Nothing.
- **Verdict:** no change.

### XLK (sector-thematic-equity — Technology) — JSON factors: `long_term_cagr`, `short_term_returns`, `benchmark_tracking`, `category_peer_standing`, `technical_trend_position`

- **What's good:** `benchmark_tracking` (Fail, `14.53 pp` gap in 2024) is the single most important finding for XLK and the 5-factor set surfaces it correctly. `technical_trend_position` adds useful current-state info; `category_peer_standing` properly contextualises passive in active-tech peers.
- **What's missing / wrong:** `short_term_returns` and `technical_trend_position` both touch current momentum but from different angles (trailing returns vs chart position) — the overlap is real but each adds information the other doesn't.
- **Verdict:** no change.

### XLV (sector-thematic-equity — Health)

- **What's good:** XLV's defensive-fund-in-growth-year story (dropped `-2.04%` in 2022 while category lost `-15.16%`, but lagged `20.85%` category return in 2025 with just `14.51%`) is exactly the kind of insight sector investors need. Note: the server generated this as a `returns_consistency` factor even though sector-thematic-equity doesn't have `returns_consistency` in the JSON. The JSON's 5 factors also handle the content via `short_term_returns`, `category_peer_standing` (5Y 25th percentile), and the narrative `overallAnalysisDetails` section.
- **What's missing / wrong:** The 5 JSON factors cover XLV adequately without `returns_consistency` — the cyclicality story is also surfaced in the `Overall analysis` narrative §1/§2.
- **Verdict:** no change.

### TQQQ (leveraged-inverse — Trading--Leveraged Equity) — JSON factors: `long_term_cagr`, `benchmark_tracking`, `category_peer_standing`, `daily_leverage_fidelity`, `technical_trend_position`

- **What's good:** `daily_leverage_fidelity` and `long_term_cagr` are the right pair to tell the leveraged-decay story. `benchmark_tracking` correctly judges the fund on its *daily* mandate (not long-term). `technical_trend_position` is essential because TQQQ is a tactical tool.
- **What's missing / wrong:** `category_peer_standing` is a weak fit — the SQQQ report had to write "Traditional category standing is less applicable to an instrument engineered for outsized daily volatility." That caveat is a signal that the factor isn't adding much per-ETF distinction in a homogeneous leveraged peer group. But it still produces Pass-grade mandate-aligned content.
- **Verdict:** no change.

### SQQQ (leveraged-inverse — Trading--Inverse Equity)

- **What's good:** Same 5 factors, same useful signal. `long_term_cagr` correctly Failed (`-52.96%` 10Y CAGR — the decay story); `daily_leverage_fidelity` correctly Passed (daily objective met).
- **What's missing / wrong:** Same mild `category_peer_standing` softness as TQQQ.
- **Verdict:** no change.

### AGG (fixed-income-core — Intermediate Core Bond) — JSON factors: `long_term_cagr`, `benchmark_tracking`, `category_peer_standing`, `income_vs_price_return`, `rate_environment_resilience`

- **What's good:** This is the ideal 5-factor set for a core bond passive tracker. `benchmark_tracking` (0.01 pp 10Y drag vs Bloomberg US Agg) proves the fund works; `income_vs_price_return` (price `-10.54%` over 10Y but total return `17.90%`) explains the asset class; `rate_environment_resilience` (`-13.06%` 2022, in line with index `-12.99%`) frames the drawdown correctly.
- **What's missing / wrong:** Nothing. The server also generated extra factors (`short_term_returns`, `returns_consistency`, `price_trend_momentum`, `benchmark_comparison`) that aren't in the JSON — and those were exactly the ones force-Failing in Loop A. The JSON's 5 factors are the right set; the server's extras are the problem.
- **Verdict:** no change.

### SHY (fixed-income-core — Short Government)

- **What's good:** Same 5 factors, same clean output. `income_vs_price_return` (price `-3.03%` over 10Y, total return `17.82%`) and `rate_environment_resilience` (`-3.90%` 2022 vs category `-5.15%`) are the decision-useful factors for a short-duration Treasury tracker.
- **What's missing / wrong:** Nothing.
- **Verdict:** no change.

### HYG (fixed-income-credit — High Yield Bond) — JSON factors: `long_term_cagr`, `returns_consistency`, `category_peer_standing`, `income_vs_price_return`, `rate_environment_resilience`

- **What's good:** `returns_consistency` surfaces the 2022 credit stress (`-11.37%` NAV, in line with index and category); `income_vs_price_return` captures the fund's core value (`6.59%` SEC yield offsetting long-term price decay); `rate_environment_resilience` ties the 2022 move to the rate cycle. `category_peer_standing` correctly frames median rank as expected for a passive tracker.
- **What's missing / wrong:** One thought — `benchmark_tracking` is NOT in fixed-income-credit (only in fixed-income-core), yet HYG is a passive iBoxx index tracker. The `returns_consistency` factor does quote the index for year-by-year comparisons, but there isn't a dedicated "are we tracking the iBoxx index" factor. The server actually generates one (`benchmark_comparison`) that forced-Failed HYG at 0.93 pp (addressed in Loop A's prompt tweak). Still, considering adding `benchmark_tracking` to the fixed-income-credit group would make the factor set clearer — at the cost of 6 factors per group instead of 5.
- **Verdict:** no change now — the iter-1 evidence doesn't require it; `returns_consistency` covers the tracking story implicitly. Flag for iter-2 consideration.

### PFF (fixed-income-credit — Preferred Stock)

- **What's good:** This ETF is the most informative of all 16 because the 5 JSON factors produced genuine Fails that were earned: `returns_consistency` (PFF actually diverges `3.8 pp` from its index in 2022), `category_peer_standing` (4th-quartile over 3Y/5Y/10Y), `rate_environment_resilience` (`-18.37%` 2022 vs index `-14.60%`). The Pass/Fail set is exactly what a retail investor needs to decide against PFF.
- **What's missing / wrong:** Nothing.
- **Verdict:** no change.

### MUB (muni — Muni National Interm) — JSON factors: `long_term_cagr`, `returns_consistency`, `category_peer_standing`, `income_vs_price_return`, `rate_environment_resilience`

- **What's good:** Identical factor set to fixed-income-credit, but specialised via the factor descriptions (TEY framing in `income_vs_price_return`). All 5 produced tight, mandate-aligned Pass calls.
- **What's missing / wrong:** Nothing.
- **Verdict:** no change.

### SUB (muni — Muni National Short)

- **What's good:** Same 5 factors, same output. `rate_environment_resilience` (`-2.15%` 2022 vs index `-3.39%`) proves the short-duration mandate.
- **What's missing / wrong:** Nothing.
- **Verdict:** no change.

### JEPI (alt-strategies — Derivative Income) — JSON factors: `short_term_returns`, `returns_consistency`, `category_peer_standing`, `income_vs_price_return`, `risk_adjusted_return_quality`

- **What's good:** `income_vs_price_return` and `risk_adjusted_return_quality` (0.59 beta) are the right pair for a covered-call income fund. `returns_consistency` surfaces the "underperform bulls / outperform bears" cyclicality. `category_peer_standing` is reasonable.
- **What's missing / wrong:** Nothing from the JSON's 5. The server adds `benchmark_comparison` and `price_trend_momentum` which were the ones force-Failing JEPI in Loop A — addressed in the prompt fix. Those extras are not in the JSON and shouldn't be.
- **Verdict:** no change.

### GLD (alt-strategies — Commodities Focused)

- **What's good:** `short_term_returns`, `returns_consistency`, `category_peer_standing`, `risk_adjusted_return_quality` all produce useful content for a physical gold ETF.
- **What's missing / wrong:** `income_vs_price_return` is a weak fit — GLD yields `0.00%`, so the factor block becomes "all returns are generated through pure price appreciation... investors here must rely entirely on capital appreciation, but because it perfectly fulfills its non-yielding mandate, the fund passes." This is mandate-aligned but adds little decision-useful info for a retail investor. It also passes trivially for any non-yielding alt-strategy (commodities, digital assets, single currency).
  Not a hard bug — it passes with a mandate-aligned rationale — but a marginal fit. Could consider making this factor group-conditional (drop for commodity / digital-asset / single-currency sub-categories within alt-strategies) if a future iteration wants cleaner output. This would need per-category targeting, which the current schema (factor → groups) doesn't support cleanly.
- **Verdict:** no change now — the factor set still produces mandate-correct output for GLD.

### AOA (allocation-target-date — Aggressive Allocation) — JSON factors: `long_term_cagr`, `returns_consistency`, `category_peer_standing`, `rate_environment_resilience`, `risk_adjusted_return_quality`

- **What's good:** All 5 produce useful content. `rate_environment_resilience` correctly ties the 2022 drawdown to the dual-asset rate shock; `risk_adjusted_return_quality` (beta 0.77) captures the 80/20 mix; `category_peer_standing` shows top-quartile persistence against active allocation managers.
- **What's missing / wrong:** Nothing.
- **Verdict:** no change.

### AOK (allocation-target-date — Conservative Allocation)

- **What's good:** Same 5 factors produce the analogue analysis for a 30/70 conservative fund. `rate_environment_resilience` (`-14.16%` in 2022 vs category `-11.11%`) surfaces the duration drag correctly.
- **What's missing / wrong:** Nothing.
- **Verdict:** no change.

---

## Group-level summary

| Group | 5-factor set fit | Change? |
|---|---|---|
| broad-equity | Excellent for SPY + IWF; covers absolute returns, relative returns, and index replication. | No |
| sector-thematic-equity | Good for XLK + XLV; `technical_trend_position` adds real value for sector cycles. | No |
| leveraged-inverse | Good for TQQQ + SQQQ; `daily_leverage_fidelity` + `technical_trend_position` are essential. `category_peer_standing` is a mild weak-fit but passes with mandate-aligned content. | No |
| fixed-income-core | Perfect for AGG + SHY. `income_vs_price_return` + `rate_environment_resilience` are the correct bond-fund pairs. | No |
| fixed-income-credit | Good for HYG + PFF. PFF's earned Fails demonstrate the factor set works. Minor gap: no explicit `benchmark_tracking` factor (fixed-income-core has it) but `returns_consistency` picks up index deviations implicitly. | No |
| muni | Perfect for MUB + SUB. TEY framing specialisation in `income_vs_price_return` works. | No |
| alt-strategies | Good for JEPI; mild weak-fit on `income_vs_price_return` for non-yielding alt-strategies like GLD (passes trivially). Not broken, just marginal. | No |
| allocation-target-date | Perfect for AOA + AOK. `risk_adjusted_return_quality` is the right headline factor for allocation funds. | No |

## Cross-cutting observation (not actionable for this JSON, but worth recording)

The server-generated reports for 4 ETFs — XLV, AGG, HYG, JEPI — included factors that are **not in the current JSON**:

- `returns_consistency` (on sector-thematic-equity / fixed-income-core, where the JSON doesn't include it)
- `drawdown_and_recovery` (doesn't exist in any JSON — may be a server-only legacy factor, or belongs in risk-analysis)
- `benchmark_comparison` (vs `benchmark_tracking` — near-duplicate semantically)
- `price_trend_momentum` (vs `technical_trend_position` — near-duplicate semantically)
- `short_term_returns` (on fixed-income-core / fixed-income-credit — JSON doesn't assign it there)

Every one of those server-extra factors was either a force-Fail that Loop A's prompt fix addresses, or a duplicate of an existing factor. This suggests the server's stored factor config is drifted from the repo JSON and needs a sync. That sync is outside the scope of this review loop (it's a deployment / DB question) but flagging it here because the JSON-based factor analysis is only meaningful if the server actually respects the JSON on the next generation.

## Final changes

- `insights-ui/src/etf-analysis-data/etf-analysis-factors-performance-and-returns.json` — **no change — factors assigned to each group fit the sampled ETFs.**
- `insights-ui/src/etf-analysis-data/etf-analysis-categories.json` — **no change — group definitions and category mappings are coherent; each sampled ETF was in the expected group.**

Two minor observations flagged for future iteration consideration, but not edited now:

1. Consider adding `benchmark_tracking` to `fixed-income-credit` group (HYG is a passive index tracker just like AGG; would make 6 factors vs the current "exactly 5" contract).
2. Consider splitting `income_vs_price_return` so non-yielding alt-strategies (commodities, digital assets, single currency) don't get a trivially-passing factor block.

Both would need schema / contract changes beyond a simple group-array edit, so they're out of scope for this iter.
