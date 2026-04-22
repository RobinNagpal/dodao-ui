# ETF prompt review — performance-and-returns — iter-1

- **Date:** 2026-04-22
- **Loop:** A (prompt)
- **Category in scope:** PerformanceAndReturns
- **ETFs reviewed:**
  - broad-equity: SPY (Large Blend), IWF (Large Growth)
  - sector-thematic-equity: XLK (Technology), XLV (Health)
  - leveraged-inverse: TQQQ (Trading--Leveraged Equity), SQQQ (Trading--Inverse Equity)
  - fixed-income-core: AGG (Intermediate Core Bond), SHY (Short Government)
  - fixed-income-credit: HYG (High Yield Bond), PFF (Preferred Stock)
  - muni: MUB (Muni National Interm), SUB (Muni National Short)
  - alt-strategies: JEPI (Derivative Income), GLD (Commodities Focused)
  - allocation-target-date: AOA (Aggressive Allocation), AOK (Conservative Allocation)

## Per-ETF review

### SPY (broad-equity — Large Blend)

- **What's good:** Narrative is well-anchored to numbers; Pass/Fail calls on all 5 factors are correct; 10Y/5Y CAGR + percentile ranks framed correctly against an active-peer group.
- **What's missing / wrong:** Uses banned phrase `reliable core holding` — `"core equity holding for retail investors"` in the summary is a direct `reliable core holding` variant (prompt explicitly forbids this). `14.26%` 10Y CAGR is repeated three times (summary, overall ¶2, factor block) — violates the "do not repeat the same number across paragraphs" rule.
- **Verdict:** no change to the factor calls; tone guardrail violations warrant a prompt tweak.

### IWF (broad-equity — Large Growth)

- **What's good:** Correct calls on all factors; strong handling of passive-vs-active peer standing; benchmark tracking math is clean.
- **What's missing / wrong:** `a staggering 10Y CAGR of 16.79%` — `staggering` is on the banned list. `massively grown long-term shareholder capital`, `a stellar 1-year return`, `undeniably its ability to consistently compound` — all banned intensifiers / dramatic adjectives. Entire `overallAnalysisDetails` is one giant paragraph, not the four-paragraph structure the prompt demands.
- **Verdict:** factor calls fine; tone + structure violations warrant a prompt tweak.

### XLK (sector-thematic-equity — Technology)

- **What's good:** The Fail on `benchmark_tracking` is correct — `14.53 pp` 2024 gap is well outside the `1.0 pp` tolerance for sector funds. Narrative names the specific index, cites the tracking gap with numbers.
- **What's missing / wrong:** `technical_trend_position` Fail is thin — price `-1.3%` below MA200 and RSI `49.5` is barely a downtrend. For a sector equity fund this is borderline, but not a hard violation.
- **Verdict:** no change.

### XLV (sector-thematic-equity — Health)

- **What's good:** Strong handling of the "defensive fund in a growth year" narrative; correct identification that long-horizon peer standing improves dramatically. Good use of 5Y/10Y percentile progression. Correct Pass on tracking.
- **What's missing / wrong:** `Overall analysis` is four tight paragraphs, clean numbers, correct Pass/Fail logic. Uses banned "undeniably weak" language in one factor.
- **Verdict:** no change; the one banned-word slip is covered by the overall tone tweak.

### TQQQ (leveraged-inverse — Trading--Leveraged Equity)

- **What's good:** Prompt's "Mandate-specific funds" rule is being applied correctly — `benchmark_tracking`, `daily_leverage_fidelity`, and `category_peer_standing` all Pass because the fund does its daily job, not because it beats the S&P 500. Good math on 3x daily reset, volatility drag.
- **What's missing / wrong:** `a massive tech-led equity rally` — `massive` banned. Minor.
- **Verdict:** no change; tone tweak covers it.

### SQQQ (leveraged-inverse — Trading--Inverse Equity)

- **What's good:** Correctly Passes `benchmark_tracking` / `daily_leverage_fidelity` / `category_peer_standing` on daily-mandate grounds despite `-99.95%` 10-year return. Correctly Fails `long_term_cagr` because no daily-inverse fund can pass a long-term compounding factor. Good framing of decay / path dependency.
- **What's missing / wrong:** `strictly as a short-term tactical tool` and `guarantees deep losses` — `strictly` is banned; `guarantees` is a mild recommendation (prompt forbids "tells the reader what to do"). `successfully executes its highly specific short-term hedging mandate` — `highly specific` is intensifier noise.
- **Verdict:** no change to factor calls; tone tweak.

### AGG (fixed-income-core — Intermediate Core Bond)

- **What's good:** `benchmark_comparison`, `benchmark_tracking`, `category_peer_standing`, `income_vs_price_return`, `rate_environment_resilience` all correctly Pass. Good acknowledgement that AGG's low absolute return reflects the asset class, not the fund.
- **What's missing / wrong:** Two hard errors:
  1. `price_trend_momentum` **Fail** because price is below MA20/50/200 — but the prompt's own §2.3 says "For bond, muni, and allocation ETFs where technicals are noise … do not force the analysis." The factor-level Pass/Fail rule never carries the "technicals are noise for bonds" exception into the factor judgment, so the model still Fails on MAs. This is a repeatable failure.
  2. `returns_consistency` **Fail** with the reasoning "5Y cumulative is just `1.51%`" — but AGG's 2022 drawdown of `-13.06%` was **In Line** with its own index (`-12.99%`) and category (`-13.32%`). Per the prompt, a tracker that matches its benchmark in a macro-wide drawdown has done its job. Failing consistency on absolute-return volatility that matches the index contradicts the "mandate-based Pass/Fail" rule.
- **Uses banned language:** `flawlessly executes its passive mandate` / `executes its passive core-bond mandate flawlessly` — `flawlessly` is explicitly on the banned list.
- **Verdict:** **change needed.**

### SHY (fixed-income-core — Short Government)

- **What's good:** All five factors Pass, including correct handling of low absolute return as a function of the asset class. Explicitly notes MA/RSI is noise for short-duration Treasuries. Good peer-vs-index framing.
- **What's missing / wrong:** `exceptional resilience` — banned. `highly effective portfolio tool` — `highly effective` is on the banned recommendation list.
- **Verdict:** no change to calls; tone tweak.

### HYG (fixed-income-credit — High Yield Bond)

- **What's good:** Clean Pass on `category_peer_standing`, `income_vs_price_return`, `long_term_cagr`. Correct framing of passive-in-active-category. Notes MAs/RSI matter less for fixed-income.
- **What's missing / wrong:** Hard error on `benchmark_comparison` — marked **Fail** for a `0.93 pp` / `0.55 pp` gap vs the iBoxx USD Liquid High Yield index. The prompt's §5 Comparison labels and §3 Pass/Fail section both say `1.0 pp` is the Pass threshold for high-yield / sector / thematic / muni passive trackers. `0.93 pp` is **inside** tolerance and should be Pass. The factor block even says "remains within the 1.0 pp tolerance for high-yield passive mandates" in `long_term_cagr` but still Fails the same concept in `benchmark_comparison`. Internal contradiction.
- **Also:** `price_trend_momentum` Fail on MA positioning for a credit ETF — same pattern as AGG.
- **Verdict:** **change needed.**

### PFF (fixed-income-credit — Preferred Stock)

- **What's good:** Correct Fail on `returns_consistency` (true tracking divergence vs index in 2022 — 3.8 pp off), `category_peer_standing` (legitimately 4th-quartile over 3/5/10Y), `rate_environment_resilience` (2022 drawdown actually worse than index and category, not a macro match). These Fails are earned, not forced.
- **What's missing / wrong:** Minor banned-word usage (`massive`, `severe`).
- **Verdict:** no change to factor calls; tone tweak covers word choices.

### MUB (muni — Muni National Interm)

- **What's good:** Clean factor calls, correct tax-equivalent-yield framing with the `~32%` federal bracket as the prompt prescribes. Explicit "technical signals are minimal predictive weight in muni". Pass on all factors.
- **What's missing / wrong:** None material.
- **Verdict:** no change.

### SUB (muni — Muni National Short)

- **What's good:** Correct Pass on all factors, correct passive-in-active-peer framing. Long but well-anchored `Overall analysis` paragraph. TEY framed correctly at the `32%` bracket.
- **What's missing / wrong:** The `Overall analysis` section is delivered as two giant run-on paragraphs instead of four tight ones the prompt requires. Minor tone: `remarkable consistency`, `highly stable`, `highly effective portfolio tool`.
- **Verdict:** no change to calls; tone + structure tweak.

### JEPI (alt-strategies — Derivative Income)

- **Worst offender in this batch.**
- **What's good:** Correct Pass on `risk_adjusted_return_quality`, `income_vs_price_return`, `returns_consistency` — the covered-call mandate is being understood at the narrative level.
- **What's missing / wrong:**
  1. `benchmark_comparison` **Fail** vs the S&P 500 — the prompt's "Mandate-specific funds" section explicitly calls out covered-call / derivative-income funds and says *"A covered-call fund that gave up upside for income and downside protection has delivered on its mandate — call that a Pass even when it trails the S&P 500."* Direct, documented violation.
  2. `price_trend_momentum` **Fail** — same bond/allocation pattern: price below MAs, RSI `43`, force-Failed despite the prompt saying technicals are thin for income/derivative funds.
  3. Banned-words carnival in the `benchmark_comparison` and `price_trend_momentum` blocks: `entirely`, `strictly`, `totally`, `absolutely`, `completely`, `perfectly`, `precisely`, `heavily`, `violently`, `aimlessly`, `definitively`, `mathematically`, `staggering`, `structurally` are all on the banned list or functionally equivalent. These two blocks are unreadable.
  4. `<br><br>` raw HTML tags in the `overallAnalysisDetails` — prompt §14 explicitly says `Do not emit raw HTML tags like <br>`.
  5. `long_term_cagr` says `standard 10-year, 15-year, and 20-year data points are technically not provided` — directly violates the missing-field rule (`not provided`, `technically not provided` are banned).
- **Verdict:** **change needed.**

### GLD (alt-strategies — Commodities Focused)

- **What's good:** Correct factor calls; physical-commodity framing is right; no forced benchmark comparison against broad equity; peer standing calibrated to the Commodities Focused category. Handles `0.00%` yield correctly ("exactly aligned with its mandate to simply hold gold bars").
- **What's missing / wrong:** `Overall analysis` section is one giant run-on paragraph, not 4 paragraphs. Tone: `extraordinary achievement`, `premier volatility dampener`, `extreme precision`, `remarkable historical compounding` — all on or near the banned-word line.
- **Verdict:** no change to calls; tone + structure tweak.

### AOA (allocation-target-date — Aggressive Allocation)

- **What's good:** All five factors correctly Pass. Correct "passive in an active peer group" framing. Good recognition that 2022's `-16.21%` was in-line with index (`-15.48%`) and category (`-14.49%`) — not penalized. Four clean paragraphs in the `Overall analysis`.
- **What's missing / wrong:** Minor: `seamlessly executes`, `definitively strong outcome` — banned intensifiers.
- **Verdict:** no change.

### AOK (allocation-target-date — Conservative Allocation)

- **What's good:** Correct calls throughout. Good framing that the 2022 drawdown is duration-driven but in line with category. Notes explicitly that MAs are noise for allocation ETFs.
- **What's missing / wrong:** Tone: `thoroughly dominates`, `highly efficient growth`, `optimally balances`. Minor; summary is otherwise correctly measured.
- **Verdict:** no change.

---

## Final changes

- `docs/ai-knowledge/insights-ui/etf-prompts/past-returns.md` — tighten three guardrails that the sample
  reports repeatedly violated:
  1. Pull the "technicals are noise for bond / muni / allocation / derivative-income funds"
     exception out of the narrative section and into the factor-level Pass/Fail rule, so
     `price_trend_momentum` / `technical_trend_position` factors stop Failing on MA
     crossovers alone for those groups (AGG, HYG, JEPI were all force-Failed this way).
  2. Add an explicit "tracker inside tolerance = Pass" line and a covered-call example to
     `benchmark_comparison` so a `0.93 pp` HYG gap (inside the `1.0 pp` high-yield band) is
     not a Fail, and so JEPI is not Failed for trailing the S&P 500 on a covered-call
     mandate.
  3. Add a "benchmark-matched drawdown ≠ consistency Fail" line so AGG's `-13.06%` 2022 NAV
     move (in line with its index `-12.99%` and category `-13.32%`) stops generating a
     `returns_consistency` Fail.
  4. Reinforce the banned-words / no-HTML rules — the existing list is comprehensive but
     JEPI emitted `<br><br>` and a "technically not provided" phrase, and other reports
     leaked `flawlessly`, `staggering`, `reliable core`, `highly effective`. Add a
     pre-emit checklist line calling out the most common slips.
