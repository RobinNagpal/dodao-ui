# ETF verification findings — Loop A — PerformanceAndReturns — iter-1

- **Date:** 2026-04-22
- **Loop:** A (prompt refinement)
- **Category in scope:** PerformanceAndReturns (`performance-and-returns`)
- **Prompt file:** `docs/insights-ui/etf-prompts/past-returns.md`
- **Run:** 16 ETFs across all 8 groups, regenerated via
  `POST /api/koala_gains/etfs-v1/generation-requests`. All 16 completed within ~8 minutes;
  0 failed.
- **ETFs reviewed:**
  - broad-equity: `SPY`, `IWF`
  - sector-thematic-equity: `XLK`, `XLV`
  - leveraged-inverse: `TQQQ`, `SQQQ`
  - fixed-income-core: `AGG`, `TLT`
  - fixed-income-credit: `HYG`, `BKLN`
  - muni: `MUB`, `SUB`
  - alt-strategies: `JEPI`, `GLD`
  - allocation-target-date: `AOA`, `AOR`

## Overall quality

Reports follow the prompt's structure (3–5-sentence summary, 4-paragraph overall analysis,
factor Pass/Fail blocks) and get the group-specific calls mostly right — leveraged-inverse
reports correctly name volatility decay / daily-reset path dependency, muni reports
correctly give the tax-equivalent-yield framing, and bond reports downplay technicals. The
problems sit at the language and discipline layer, not the structural layer.

## Per-ETF review

Grouped by the bucket of issue rather than one long block per ETF — each ETF is cited
where the pattern appeared.

### SPY (broad-equity — Large Blend) — change drivers: #1, #2, #4
- **Good:** correctly identifies passive tracking, cites percentile ranks against Large
  Blend peers, gets the short-term-cooling vs. long-term-strong framing right.
- **Missing / wrong:**
  - #2: repeats `31.63%` 1Y return in the summary AND paragraph 1 AND the
    `short_term_returns` factor (the prompt explicitly says not to repeat numbers across
    paragraphs).
  - #4: summary ends with "SPY continues to be a highly reliable, core wealth-building
    holding" — a forward-looking recommendation the prompt explicitly forbids ("No
    forecasts, no price targets, no valuation calls").
- **Verdict:** change needed — language discipline, not content.

### IWF (broad-equity — Large Growth) — change drivers: #1
- **Good:** correctly shows recent-weakness-in-a-multi-year-uptrend; good peer framing
  against active Large Growth peers.
- **Missing / wrong:**
  - Uses raw HTML `<br><br>` separators between paragraphs, not markdown blank lines.
    Rendering-layer bug but the prompt already says "Markdown" — worth a tightening.
- **Verdict:** change needed — enforce markdown only.

### XLK (sector-thematic-equity — Technology) — change drivers: #1
- **Good:** solid sector framing and technical-trend Fail justification.
- **Missing / wrong:**
  - Heavy intensifier soup: "phenomenal", "staggering", "incredible", "undeniably",
    "unequivocally", "massive long-term wealth creation".
- **Verdict:** change needed — adjective discipline.

### XLV (sector-thematic-equity — Health) — change drivers: #1
- **Good:** correctly highlights low-beta defensive posture and top-quartile 5-year rank
  despite trailing 1-year.
- **Missing / wrong:** mild adjective inflation ("sharply deteriorated", "severely",
  "precariously") but the facts are right.
- **Verdict:** change needed — adjective discipline.

### TQQQ (leveraged-inverse — Trading--Leveraged Equity) — change drivers: #1, #3
- **Good:** explicitly names daily-reset mechanics, path dependency, volatility decay —
  exactly the group-specific angle the prompt asks for.
- **Missing / wrong:**
  - Uses "catastrophic" — the prompt explicitly bans this adjective by name on line 14.
  - `category_peer_standing` factor contains "exact percentile rankings are omitted for
    this specialized peer group" — violates the missing-field rule (the prompt says
    "do not write 'data not provided', 'not available', 'missing', etc."; "omitted" is
    the same family).
- **Verdict:** change needed — named banned word slipped through; missing-field rule needs
  wider coverage.

### SQQQ (leveraged-inverse — Trading--Inverse Equity) — change drivers: #1
- **Good:** correctly explains "near-absolute certainty of long-term capital loss due to
  volatility drag"; correctly frames it as a tactical instrument, not an investment.
- **Missing / wrong:** adjectives lean heavy ("staggering", "inescapable", "guaranteed
  outcome") but facts are right.
- **Verdict:** change needed — adjective discipline.

### AGG (fixed-income-core — Intermediate Core Bond) — change drivers: #1, #2
- **Good:** cleanly separates NAV-return-tracking (pass) from absolute-return-volatility
  (fail in `returns_consistency`). Good use of SEC yield as the "income-first headline"
  the prompt wants for income funds.
- **Missing / wrong:**
  - #2: `-13.06%` 2022 loss repeated across summary, paragraph, strengths section,
    `rate_environment_resilience` factor, and `returns_consistency` factor.
  - Adjective inflation: "flawlessly", "perfectly", "near-flawless".
- **Verdict:** change needed — repetition + adjectives.

### TLT (fixed-income-core — Long Government) — change drivers: #1, #2, #5
- **Good:** correctly Fails `benchmark_tracking` on the `1.12 pp` 3-year lag vs. the index
  (passes the narrow-threshold rule for bonds correctly).
- **Missing / wrong:**
  - #2: `-31.41%` 2022 loss and `-51.83%` distance-from-ATH are each repeated 3+ times.
  - #5: `category_peer_standing` correctly ranks it bottom-quartile but doesn't note
    whether the peer group is mostly active managers — the prompt (Section 3) says a
    passive fund near the median in an active peer group should still be Pass; for TLT
    the reverse (bottom-quartile) applies so Fail is right, but the rationale should
    mention the passive-vs-active setup.
- **Verdict:** change needed — repetition, plus a minor sharpening of the passive-vs-active
  rationale (factor-description responsibility, noted but not the prompt's top priority).

### HYG (fixed-income-credit — High Yield Bond) — change drivers: #1
- **Good:** correctly uses the `1.0 pp` narrow threshold for high-yield tracking; correctly
  frames yield as the income engine.
- **Missing / wrong:** intensifier soup ("strictly", "deeply", "precisely"); otherwise
  solid.
- **Verdict:** change needed — adjective discipline.

### BKLN (fixed-income-credit — Bank Loan) — change drivers: #1, #2
- **Good:** correctly separates capital-preservation from yield-harvesting; surfaces
  floating-rate advantage vs. 2022 rate shock.
- **Missing / wrong:**
  - #2: `7.03%` dividend yield and `-8.97%` 10-year price drop each repeat 3+ times.
- **Verdict:** change needed — repetition.

### MUB (muni — Muni National Interm) — change drivers: none material
- **Good:** includes the tax-equivalent-yield line with the 32% bracket (`~5.0% TEY`) as
  the prompt explicitly requires. Correctly pegs performance to the passive mandate.
- **Missing / wrong:** minor adjective inflation but within tolerance.
- **Verdict:** no individual change needed — good example of prompt compliance.

### SUB (muni — Muni National Short) — change drivers: none material
- **Good:** includes `~3.65% TEY` at 32% bracket as required; frames it correctly as a
  cash-alternative with capital-preservation focus.
- **Missing / wrong:** mild adjective inflation.
- **Verdict:** no individual change needed.

### JEPI (alt-strategies — Derivative Income) — change drivers: #1, #3, #4 (worst offender)
- **Good:** correctly labels the mandate (defensive / covered-call), correctly cites low
  beta and `-3.53%` 2022 drawdown vs. benchmark's `-19.43%`.
- **Missing / wrong:** **severe** prose quality issues:
  - `benchmark_comparison` factor: 7 intensifier adverbs in one sentence — "entirely",
    "strictly", "totally", "staggering", "massive", "deeply chronic", "completely Fail".
  - `long_term_cagr` factor: "standard 10-year, 15-year, and 20-year data points are
    technically not provided" — direct violation of the missing-field rule; should have
    omitted the reference entirely.
  - `price_trend_momentum` factor: "entirely current technical momentum posture of the
    massive ETF heavily reflects absolutely clear short-term directional weakness and a
    complete lack of broad buying momentum" — maximum adverb stacking.
  - Summary ends with "the fund is a highly effective tool for retail investors" — an
    investment recommendation the prompt forbids.
- **Verdict:** change needed — JEPI is the clearest single signal that the prompt's
  discipline rules aren't being enforced strongly enough.

### GLD (alt-strategies — Commodities Focused) — change drivers: #1, #4
- **Good:** correctly calls out zero-yield / price-only return driver; correctly highlights
  low-equity-correlation as the diversification value.
- **Missing / wrong:**
  - #1: "highly attractive", "flawlessly", "strictly", "extraordinarily", "remarkably".
  - #4: summary ends with "this ETF delivers precisely on its core mandate" — borderline
    recommendation.
- **Verdict:** change needed — adjective discipline.

### AOA (allocation-target-date — Global Moderately Aggressive) — change drivers: #1, #4
- **Good:** correctly frames 80/20 mandate, names the benchmark (S&P Target Risk
  Aggressive), cites peer group correctly.
- **Missing / wrong:**
  - #4: "the fund is a highly efficient 80/20 global portfolio that captures equity
    upside" — recommendation language.
- **Verdict:** change needed — recommendation language.

### AOR (allocation-target-date — Global Moderate) — change drivers: #1, #4
- **Good:** clean peer-standing framing, correctly Fails `downside_protection` on the
  2022 category underperformance.
- **Missing / wrong:**
  - #4: "this is a highly reliable core holding that strictly and successfully executes
    its moderate risk mandate" — recommendation.
- **Verdict:** change needed — recommendation language.

## Group-level summary

- **Broad-equity, sector-thematic-equity, alt-strategies:** adjective / intensifier
  inflation is the dominant problem. Content is solid.
- **Leveraged-inverse:** one banned word ("catastrophic") slipped through; "omitted"
  phrasing in factor text violates the missing-field rule.
- **Fixed-income-core, fixed-income-credit:** number repetition is the dominant problem.
  Content is solid.
- **Muni:** clean. TEY rule works.
- **Allocation-target-date:** recommendation phrasing in summaries.

## Final changes

- **`docs/insights-ui/etf-prompts/past-returns.md`** — apply four targeted
  tightenings:
  1. **Expand the banned-adjective list** to include the intensifier adverbs that showed
     up repeatedly: "entirely", "strictly", "totally", "utterly", "absolutely",
     "completely", "perfectly", "flawlessly", "precisely", "massively", "staggering",
     "phenomenal", "incredible". These don't add information.
  2. **Broaden the missing-field rule** to explicitly ban "omitted", "not disclosed",
     "not listed", "technically not provided", "not in the data", "unavailable" —
     "missing" alone isn't catching variants.
  3. **Ban recommendation phrasing in the summary**. Add one sentence: "The summary
     is a description of what the numbers show, not a recommendation. Do not write
     'reliable core holding', 'highly effective tool', 'continues to be', 'the fund is
     a … for investors who …' or any variant that tells the reader what to do."
  4. **Drop the 900–1300-word target** on `overallAnalysisDetails`. Actual good outputs
     are ~400–500 words and the word floor creates a padding incentive. Replace with
     "Aim for substance over length; four tight paragraphs is the target."
- **No factor JSON changes in this pass.** The factor file
  `etf-analysis-factors-performance-and-returns.json` looks appropriate — the failures
  were language-level, not taxonomy-level.
- **No changes to the other three category prompts** — they weren't in scope for this
  test run.
