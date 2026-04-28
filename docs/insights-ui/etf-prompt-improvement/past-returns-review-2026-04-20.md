# Past Returns Prompt — Per-ETF Review (2026-04-20)

**Prompt ID:** `ba7c2d75-4263-4a5e-a518-f3b31c996251` (Past Returns for ETFs / category `PerformanceAndReturns`)
**Run:** 2026-04-20 12:28–12:31 UTC
**Scope:** one ETF per analysis group, 5 factors per group, invocation → prompt → output reviewed below.

| Group | Symbol | Category | Invocation ID |
|---|---|---|---|
| broad-equity | IWM | Small Blend | `d397c8e1-5d46-4a27-bfc0-b86cd4fe6be0` |
| sector-thematic-equity | XLV | Health | `db9b8a4b-cf53-4447-8a7a-a1a5e7b615d1` |
| leveraged-inverse | SOXL | Trading--Leveraged Equity | `d163f3e9-a633-4a42-8c5e-88f67b917ad8` |
| fixed-income-core | AGG | Intermediate Core Bond | `476eaf07-2ac5-44ac-8b29-5d770d80592b` |
| fixed-income-credit | HYG | High Yield Bond | `176b477a-399f-4b4f-a9bb-eceed9f92f45` |
| muni | TFI | Muni National Long | `ea4bdd84-7fd9-419c-8acb-e308c3471f17` |
| alt-strategies | DBC | Commodities Broad Basket | `9a13942e-a3e0-4f72-9eb1-f08a0023b30c` |
| allocation-target-date | AOR | Global Moderate Allocation | `9c1d65c8-b2ae-4772-8f61-2cd5daf3d69c` |

---

## IWM — iShares Russell 2000 ETF (broad-equity, Small Blend)

- **Prompt improvements:** `long_term_cagr` was Failed on one weak window (`5Y CAGR 3.52%`) while `10Y 10.13%`, `15Y 8.96%`, `20Y 7.58%` were all solid — the factor should be guarded against single-window failure when the majority of horizons are Pass-worthy; require a "most windows weak" test. No "calendar anchor" context for why 5Y looks weak (starts near 2021 small-cap peak).
- **Good:** Correctly identifies the `40.32%` 1Y vs `~30.8%` category gap, picks the right 3–5 decision numbers, and keeps `benchmark_tracking` Pass based on the tight `Investment (Price)` vs `Index` per-year gaps.
- **Weaknesses:** `returns_consistency` is called Fail but the key data point — percentile collapsing from `14` (2020) → `95` (2021) → `87` (2022) then recovering to `18` (2025) — is never cited; a strong-but-vague adjective ("volatile swings") replaces the actual evidence.
- **Factor relevance:** All 5 factors are appropriate for a US small-cap passive fund. `short_term_returns` + `long_term_cagr` naturally overlap; consider trimming overlap in the prompt's paragraph guidance.
- **Other observations:** Beta `1.10` is never cited; paragraph 6 under-uses the risk context block. `indexName = "Russell 2000"` is in the input but the narrative still says "its benchmark" in places. Tone is balanced.

---

## XLV — State Street Health Care Select Sector SPDR ETF (sector-thematic-equity, Health)

- **Prompt improvements:** No handling for the **style-box vs category mismatch**: category is `Health` but `overviewStyleBox = Large Value` — XLV is pharma-heavy and mega-cap, which fully explains the 1Y peer lag vs biotech-heavy peers. The prompt should instruct the model to flag style-box vs category divergences as an explanatory lens before Failing a factor.
- **Good:** `long_term_cagr` Pass with the `9.67%` 10Y number is well-grounded; `short_term_returns` Fail correctly combines `YTD -5.45%`, `1M -4.90%`, `3M -5.59%` signals.
- **Weaknesses:** `returns_consistency` Pass claims the fund "excels at protecting capital during down years" with **zero numeric support** — no year-specific losses cited. `drawdown_and_recovery` Pass calls protection "exceptional" but the input has no `captureRatios` to back it.
- **Factor relevance:** All 5 factors fit a sector-equity ETF. However `drawdown_and_recovery` without `captureRatios` in the input data reduces it to a narrative claim — either supply capture ratios or drop the factor for this invocation.
- **Other observations:** Beta `0.64` (defensive) and the sector cyclicality framing would strengthen paragraph 5; currently underused. Low-cost `0.08%` expense ratio shows up but guardrails correctly push deep fee discussion to the Cost report.

---

## SOXL — Direxion Daily Semiconductor Bull 3X ETF (leveraged-inverse, Trading--Leveraged Equity)

- **Prompt improvements:** `category_peer_standing` was marked **Pass despite the output explicitly admitting "peer ranking data is missing"** — this contradicts the prompt's own "do not mark Pass just because one data point is missing" rule AND the "use closest relevant evidence" rule. The prompt needs a stronger instruction: when a factor's primary metric is absent, default to a conservative result (not Pass-by-inertia) and state `data not provided`.
- **Good:** `daily_leverage_fidelity` Fail is correct and the decay explanation is clear; `benchmark_tracking` Fail correctly explains that a 3x fund structurally cannot track linearly.
- **Weaknesses:** The `522.07%` 1Y return is not quantitatively compared against the 3× of the underlying semiconductor index return (approx. would be `~160%` if underlying is ~53%) — the "compounding benefit in strong uptrends" is narrated but unquantified. 5Y CAGR `4.39%` vs beta `4.54` is the real decay story and is under-emphasized.
- **Factor relevance:** `drawdown_and_recovery` and `daily_leverage_fidelity` are essential for leveraged products — well-placed. `category_peer_standing` is low-value here because the "peer group" is a bag of unrelated leveraged products; consider dropping for this group.
- **Other observations:** Mandatory "short-term trading vehicle only" warning is present — good. RSI weekly/monthly not surfaced. 52-week range `$7.225–$72.36` (10x range) would be a dramatic, retail-useful illustration of decay risk that's currently missing from narrative.

---

## AGG — iShares Core U.S. Aggregate Bond ETF (fixed-income-core, Intermediate Core Bond)

- **Prompt improvements:** Same systemic issue flagged in `prompt-improvement-past-returns.md`: `long_term_cagr` Fails a **near-perfect index tracker** because the factor judges absolute return quality, not tracking quality. The prompt should route passive bond funds to a "tracking-quality" dominant view — explicitly: *if `benchmark_tracking` is Pass with tight per-period gaps, `long_term_cagr` should not be Failed on absolute return grounds alone*.
- **Good:** `benchmark_tracking`, `income_vs_price_return`, and `rate_environment_resilience` all Pass correctly; the "income offsetting price erosion" framing captures the bond-ETF total-return dynamic well.
- **Weaknesses:** `rate_environment_resilience` Pass never cites the exact 2022 loss number (AGG 2022 price `-13.06%` per the input) alongside the category average — the qualitative "standard for asset class" claim needs to quote both.
- **Factor relevance:** All 5 factors fit, but `long_term_cagr` is the weakest fit for a passive aggregate bond tracker; see prompt-improvement note.
- **Other observations:** `dividendYield 3.94%` / `secYield 4.36%` are powerful income context and are mostly under-used in the "long-term capital appreciation" framing — narrative should lean harder on yield as the product.

---

## HYG — iShares iBoxx $ High Yield Corporate Bond ETF (fixed-income-credit, High Yield Bond)

- **Prompt improvements:** `category_peer_standing` Fail penalizes HYG for ranking in the bottom-half — but HYG is a **passive index tracker competing against mostly active HY managers**; this is a structural 30-50 bp headwind, not fund underperformance. The prompt should instruct the model to consider passive-vs-active composition of the peer group before judging peer standing.
- **Good:** `income_vs_price_return` Pass is sharp — correctly identifies that price decay is offset by distributions, which is the entire HY-bond-ETF thesis. `drawdown_and_recovery` Pass with "massive distance from ATH reflects structural nature of bond ETFs" is a nice frame.
- **Weaknesses:** `5.86%` dividend yield is mentioned only in passing; should be the headline number alongside `1Y 9.88%` because roughly 60% of HY total return comes from coupons. `indexName` / iBoxx identity is not named.
- **Factor relevance:** All 5 factors fit credit-driven income funds. The `long_term_cagr` factor should carry the asset-class-return caveat (see AGG note).
- **Other observations:** No credit-quality context (obviously — not in performance inputs) but the prompt should at minimum mention "HY" implies speculative-grade to avoid investor misreading of the 5.86% yield as low-risk income.

---

## TFI — State Street SPDR Nuveen ICE Municipal Bond ETF (muni, Muni National Long)

- **Prompt improvements:** No **tax-equivalent yield** context for a muni analysis. A `3.45%` dividend yield on a muni is roughly a `5.0–5.8%` taxable-equivalent depending on bracket — without this, retail investors will compare TFI's yield to taxable bond ETFs and conclude it is weak. The prompt should explicitly instruct: for any `muni` group, frame yield in tax-equivalent terms (note bracket assumption).
- **Good:** Three Fails (`long_term_cagr`, `returns_consistency`, `category_peer_standing`) are consistent with the data and correctly align — this is one of the 8 ETFs where the Fails are genuinely earned (long-duration muni, bottom-quartile peer rank across 3/5/10Y).
- **Weaknesses:** The peer set is "Muni National Long" — a duration-concentrated peer group where 2022 hit everyone hard; the analysis should compare TFI vs long-duration peers specifically, not generic muni. `income_vs_price_return` Pass lacks the income-contribution percentage.
- **Factor relevance:** All 5 fit. `rate_environment_resilience` is the most important factor for long-duration muni, and the Pass is defensible but weakly sourced.
- **Other observations:** `holdings: 1822`, `AUM $3.05B` — liquidity is fine but not surfaced. Volume `223k` is noticeably lower than AGG/HYG — worth a one-line trading-cost note.

---

## DBC — Invesco DB Commodity Index Tracking Fund (alt-strategies, Commodities Broad Basket)

- **Prompt improvements:** `downside_protection` is being mis-applied here. Commodities are a **diversifier**, not a downside hedge — the factor's "protection ratio (fund drawdown / benchmark drawdown) < 0.75 is good" framing penalizes DBC for being volatile, but DBC's entire mandate is to provide uncorrelated exposure. The prompt should allow (or require) the model to state "mandate mismatch" and judge on correlation/diversification evidence instead of forcing a Fail.
- **Good:** `income_vs_price_return` Pass correctly surfaces the commodity-ETF-specific structure — cash-collateral yield + roll yield — and flags the `2.52%` dividend. This is a rare insight the model got right without explicit prompt guidance.
- **Weaknesses:** **Contango / roll-yield decay** is the signature long-term risk for a broad-basket commodity ETF and it's never named; DBC specifically uses optimum-yield methodology to dampen contango — the strategyText would support this but it's under-used. RSI-W `84.19` (extreme overbought) is cited in summary but the risk framing is soft.
- **Factor relevance:** `short_term_returns`, `returns_consistency`, and `income_vs_price_return` fit. `category_peer_standing` is mostly noise given the tiny peer group. `downside_protection` is a poor fit as noted above.
- **Other observations:** Beta `0.10` is the most investor-useful number (low correlation to stocks) and is surfaced — good. `0.84%` expense ratio is high for a commodity ETF but guardrails correctly push that to Cost report.

---

## AOR — iShares Core 60/40 Balanced Allocation ETF (allocation-target-date, Global Moderate Allocation)

- **Prompt improvements:** AOR is a **static 60/40 fund-of-funds** (holdings count 9, all underlying iShares Core ETFs); the prompt should instruct the model to recognize FoF structure and note that performance is fully driven by underlying ETFs + fee-stacking. Also no mention of the 60/40 being global (ex-US equity + international bonds) vs a pure-US 60/40 — a retail-meaningful distinction.
- **Good:** All 5 factor calls are defensible; `downside_protection` Fail is a nice nuance — AOR's 2022 drawdown matched a pure 60/40 rather than beat its category's tactical peers. `category_peer_standing` Pass with "top-half, frequently top-quartile" is factually right for AOR.
- **Weaknesses:** 2022 loss number (AOR was ~`-17%`) is never cited despite being the defining year for allocation funds. The beta `0.64` vs equity-heavy allocation peers (often beta `0.85+`) is not leveraged as explanatory context.
- **Factor relevance:** All 5 fit. `drawdown_and_recovery` + `downside_protection` overlap significantly for allocation funds — consider merging or differentiating more sharply.
- **Other observations:** Narrative ends on "dependable, middle-of-the-road compounding" — appropriate tone for a 60/40 product, not over-claiming. Good work on tone.

---

## Cross-cutting prompt improvements (rolls up 2–5 above)

1. **Passive vs active awareness.** For passive index trackers (AGG, HYG, IWM, SPY, BND, etc.), add a rule: if `benchmark_tracking` is tight, the fund is doing its job regardless of absolute return quality. Don't Fail `long_term_cagr` on asset-class returns.
2. **Missing-data discipline.** Explicitly: when a factor's primary metric is missing, default to a conservative call (`"Fail"` or neutral with justification) and say `data not provided` — never rubber-stamp Pass (SOXL `category_peer_standing` is the clearest violation).
3. **Mandate-aware factor interpretation.** For commodities, digital-assets, leveraged/inverse, and defined-outcome funds, introduce a "factor applies only if mandate matches" check; otherwise state mandate mismatch and judge on closest relevant evidence (DBC `downside_protection`).
4. **Quote the numbers you're judging on.** Several Pass/Fail calls use adjectives ("volatile", "exceptional protection", "navigated brutally") without the specific year's percentage — require at least one numeric anchor per factor explanation.
5. **Style-box vs category conflict.** Flag divergence as explanatory context before Failing a factor (XLV Health categorized but Large Value style box).
6. **Tax-equivalent yield for muni.** Any muni invocation should surface TEY with a stated bracket assumption; raw dividend yield alone is misleading vs taxable peers.
7. **Named benchmarks, not "the index".** `indexName` is available in inputs — always name the specific index (Russell 2000, Bloomberg US Aggregate, iBoxx HY Corporate, etc.) so retail readers know what "beating the benchmark" means.
8. **Peer-group composition context.** When evaluating `category_peer_standing`, have the model consider whether the peer group is mostly active (expect passive to trail), highly duration-concentrated (peer set amplifies one variable), or fragmented/tiny (small-n rankings are noisy).
