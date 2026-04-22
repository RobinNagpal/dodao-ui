# ETF prompt review — risk-analysis — iter-1

- **Date:** 2026-04-22
- **Prompt file:** `docs/ai-knowledge/insights-ui/etf-prompts/risk-analysis.md`
- **Run:** 16 ETFs across all 8 groups, regenerated via the standard
  `trigger → wait → fetch` loop. All 16 completed in ~10 minutes; 0 failed.
- **ETFs reviewed:**
  - broad-equity: `SPY` (Large Blend), `IWF` (Large Growth)
  - sector-thematic-equity: `XLK` (Technology), `XLV` (Health)
  - leveraged-inverse: `TQQQ` (Trading--Leveraged Equity), `SQQQ` (Trading--Inverse Equity)
  - fixed-income-core: `AGG` (Intermediate Core Bond), `SHY` (Short Government)
  - fixed-income-credit: `HYG` (High Yield Bond), `PFF` (Preferred Stock)
  - muni: `MUB` (Muni National Interm), `SUB` (Muni National Short)
  - alt-strategies: `JEPI` (Derivative Income), `GLD` (Commodities Focused)
  - allocation-target-date: `AOA` (Aggressive Allocation), `AOK` (Conservative Allocation)

## Overall quality

Structure and mandate-relative framing are mostly right. Leveraged-inverse reports
correctly warn on daily-reset decay and holding-period risk, covered-call / commodity
funds (`JEPI`, `GLD`) get the asymmetric-capture lens, bond and muni funds correctly
downplay RSI, and allocation funds are judged against their own category rather than
equities. The drawdown-vs-peers / riskVsCategory framing is usually applied well.

The problems are discipline-layer, not structural:

1. **Dramatic adjectives slip through despite the explicit rule.** Widespread. Examples:
   "spectacular downside protection" (`JEPI`), "phenomenally resilient" (`JEPI`),
   "devastating" / "catastrophic" (multiple), "obliteration" / "destruction of capital"
   (`SQQQ`), "punishing" (`HYG`, `PFF`), "brutal" / "painful" (`IWF`, `XLK`, `HYG`),
   "flawless tracking" / "elite" / "stellar" / "textbook" (various). The current list
   in the prompt ("terrifying, devastating, spectacular") is too short to generalise
   — the model matches on those three specific words and leaves the rest.
2. **The no-repeat-numbers rule is applied too narrowly.** Prompt says "not in more
   than one paragraph" — the model interprets that as "not within the four paragraphs
   of `overallAnalysisDetails`" and freely repeats in the summary and in the factor
   blocks. `SPY` repeats `-23.87%` in summary, paragraph 2, AND `worst_drawdown`.
   `JEPI` repeats `64` / `60` capture figures three times. `AOK` repeats `-17.53%`
   three times. `HYG` repeats `-14.86%` three times.
3. **Excessive decimal precision.** `0.59149` (`JEPI`), `0.08652` (`SUB`), `0.0632` /
   `1.389` (`AGG`), `0.41788` (`HYG`), `4.418` (`SQQQ`), `1.306` (`IWF`). These read
   like raw DB field dumps. Retail readers need 2 decimals on ratios, whole numbers on
   capture, 1-2 decimals on percentages.
4. **Backtick discipline is spotty.** The rule is listed but `IWF`, `SHY`, and parts
   of `MUB` render most numbers as plain text (`1.17`, `0.25`, `2.04%` with no
   backticks). `SPY`, `XLK`, `HYG` follow the rule. Model treats the rule as
   preferential rather than mandatory.
5. **Paragraph-merging.** `IWF` collapses all four `overallAnalysisDetails`
   paragraphs into one giant blob — no blank lines, no mental breaks. Every other
   report split them correctly. Worth making the paragraph break explicit.
6. **Forward-looking phrasing slips in.** Prompt forbids forecasts but `JEPI` says
   "investors will heavily lag during sustained equity bull runs" and `XLK` says
   "the fund's future trajectory is immensely path-dependent" — both are effectively
   predictions.
7. **Factor-description restatement.** Prompt forbids this but it happens anyway
   (`JEPI` downside_protection block opens "Downside protection is the primary
   objective of this fund's options overlay"; `AGG` reopens every factor with a
   definition sentence). Mild issue.
8. **Literal `\n\n` in `SPY` overallAnalysisDetails.** Not a prompt issue — the JSON
   string was written with escape sequences that the fetch-to-markdown step didn't
   unescape. Flag for the tooling layer, NOT the prompt.
9. **Duplicate factor keys in `AGG`, `HYG`, `JEPI`.** Each has BOTH the
   `*_analysis` / `*_returns` / `_measures` / `vs_category` variant AND the
   `overall_volatility` / `risk_adjusted_return` / `worst_drawdown` / `risk_vs_peers`
   variant. The model produces both and sometimes reaches opposite Pass/Fail verdicts
   on near-identical metrics (`HYG`: `drawdown_analysis` Fail vs `worst_drawdown` Pass
   on the same `-14.86%` drop). This is a **data bug in `factorAnalysisArray`** —
   not a prompt issue. Flag for the pipeline owner.

## Per-ETF review

### SPY (broad-equity — Large Blend) — issues #1, #2, #8
- **Good:** Correctly Pass on all factors, accurate mandate framing (passive index,
  exactly 100% capture both sides), names the 2022 rate shock correctly.
- **Missing / wrong:** Repeats `-23.87%` three times. Contains literal `\n\n` escape
  strings between paragraphs 2 and 3. Uses "flawless tracking" and "textbook passive
  index tracker" (dramatic language).
- **Verdict:** change needed — language discipline + repeated numbers.

### IWF (broad-equity — Large Growth) — issues #1, #4, #5
- **Good:** Correctly recognises the 5Y downside-capture advantage (`114` vs `123`),
  correctly flags the active-peer comparison, does not force-fail on equity beta.
- **Missing / wrong:** No backticks on ANY numbers (`1.17`, `0.84`, `-30.75%`, etc.).
  All four `overallAnalysisDetails` paragraphs collapsed into one block. Uses
  "brutal" and "massive buffer".
- **Verdict:** change needed — backticks and paragraph breaks.

### XLK (sector-thematic-equity — Technology) — issues #1, #6
- **Good:** Good concentration-risk Fail with specific NVDA `15.45%`, Apple `12.62%`,
  Microsoft `9.77%` single-name breakdown. Correctly applies sector-peer drawdown
  framing against `-40.97%` category.
- **Missing / wrong:** "catastrophic" drop, "future trajectory is immensely
  path-dependent" is forward-looking. "textbook definition of a structurally sound
  portfolio" is a dramatic flourish.
- **Verdict:** change needed — language.

### XLV (sector-thematic-equity — Health) — issue #1 (mild)
- **Good:** Correctly identifies sector mandate and defensive beta (`0.49` 1Y).
  Honest on top-holding concentration (`14%` LLY). Good peer-drawdown comparison.
- **Missing / wrong:** Uses "severe volatility" and "reliably sidesteps the worst".
  Mild. Cites concentration with a `[1.6]` footnote marker and nothing else — a
  spurious citation artifact.
- **Verdict:** change needed — minor language.

### TQQQ (leveraged-inverse — Trading--Leveraged Equity) — issue #1
- **Good:** Correctly frames as tactical-only, not buy-and-hold. Correctly calls out
  that multi-year Sharpe is meaningless for daily-reset. Specific capture numbers
  (`303` 5Y upside, `389` 5Y downside) with correct peer-index reference.
- **Missing / wrong:** "structurally misaligned" is fine but "severely impact" and
  "erode capital" border on dramatic. Otherwise clean.
- **Verdict:** change needed — minor.

### SQQQ (leveraged-inverse — Trading--Inverse Equity) — issue #1
- **Good:** Correctly reinforces short-horizon-only suitability, names daily reset,
  correctly places the fund's `-100%` long-term decay as mathematical inevitability
  rather than a fund flaw. Good peer-relative risk discussion.
- **Missing / wrong:** "complete wealth obliteration", "mathematical certainty of
  portfolio destruction", "absolute mathematical certainty", "inescapable reality"
  — too many disaster adjectives even given the asset class.
- **Verdict:** change needed — language.

### AGG (fixed-income-core — Intermediate Core Bond) — issues #2, #9
- **Good:** Correctly identifies the 2022 drawdown as asset-class-driven, accurate
  on duration and rate sensitivity. Picks the right lens (R², std dev vs beta).
- **Missing / wrong:** Duplicate factor keys (`volatility_measures` vs
  `overall_volatility`, `risk_adjusted_returns` vs `risk_adjusted_return`,
  `drawdown_analysis` vs `worst_drawdown`, `risk_vs_category` vs `risk_vs_peers`),
  and the model gives OPPOSITE verdicts: `risk_adjusted_returns` Fail, then
  `risk_adjusted_return` Pass on effectively the same data. Data layer bug, not
  prompt. Repeats `-17.19%` three times.
- **Verdict:** change needed for language/repetition; flag duplicate factors as
  pipeline issue.

### SHY (fixed-income-core — Short Government) — issue #4
- **Good:** Accurately frames equity-beta as irrelevant for short Treasuries.
  Correctly contextualises negative Sharpe as structural feature of the rate cycle,
  not a fund flaw. Good peer-drawdown comparison (`-5.35%` vs `-7.00%`).
- **Missing / wrong:** No backticks on any numbers. Otherwise clean.
- **Verdict:** change needed — backticks only.

### HYG (fixed-income-credit — High Yield Bond) — issues #2, #9
- **Good:** Honest about the credit-risk asymmetry. Correctly applies narrow
  ±0.5pp threshold for fixed-income Sharpe comparison. Good 2022 peer comparison.
- **Missing / wrong:** Duplicate factors with contradictory Pass/Fail verdicts on
  the same data (`drawdown_analysis` Fail vs `worst_drawdown` Pass on `-14.86%`;
  `volatility_measures` Fail vs `overall_volatility` Pass on `7.33%` std dev).
  This is a data bug. Repeats `-14.86%` and capture `53`/`38` multiple times.
- **Verdict:** change needed for repetition/language; flag duplicates.

### PFF (fixed-income-credit — Preferred Stock) — issue #1
- **Good:** Correct Weak verdict, honest about the Above-Avg risk / Below-Avg
  return structural failure. Good distinction between equity beta (irrelevant) and
  peer-relative volatility (elevated).
- **Missing / wrong:** "radically trailing", "structurally weaker", "bleed more
  capital" are melodramatic.
- **Verdict:** change needed — language.

### MUB (muni — Muni National Interm) — issues #2, #4 (partial)
- **Good:** Correctly names duration as primary risk driver, accurate
  credit-quality framing, correct use of narrow ±0.5pp band for Sharpe comparison.
- **Missing / wrong:** Missing backticks on some numbers (`0.25`, `15`, `5.73%`
  partial). Repeats `-11.56%` three times.
- **Verdict:** change needed.

### SUB (muni — Muni National Short) — issue #4
- **Good:** Very strong report. Correctly identifies the short-duration
  protection mechanism, good peer-drawdown comparison, accurate interest-rate
  sensitivity analysis.
- **Missing / wrong:** No backticks on most numbers (`0.05`, `-0.97`, `2.25%`).
- **Verdict:** change needed — backticks only.

### JEPI (alt-strategies — Derivative Income) — issues #1, #2, #3, #6, #9
- **Good:** Correctly applies the covered-call capture-asymmetry test. Gets the
  `~70%` up / `~50%` down mandate framing right, and correctly compares the
  protection-ratio (`0.52`) to the failure threshold (`0.85`).
- **Missing / wrong:** "spectacular downside protection" and "phenomenally
  resilient" are the two specific forbidden-adjective patterns. "investors will
  heavily lag" is forward-looking. Decimal precision (`0.59149`, `0.9367`).
  Repeats `64`/`60` capture three times. Duplicate factor keys
  (`volatility_measures` + `overall_volatility`, etc.).
- **Verdict:** change needed — language, precision, repetition.

### GLD (alt-strategies — Commodities Focused) — issue #1
- **Good:** Correctly identifies decorrelation mandate and gets the negative
  downside capture framing right. Accurate use of protection ratio. Nice
  group-specific framing as a portfolio hedge.
- **Missing / wrong:** "stellar" risk-adjusted picture, "exceptionally shallow"
  — mild. Some language overstatement.
- **Verdict:** change needed — minor language.

### AOA (allocation-target-date — Aggressive Allocation) — issues #1, #2
- **Good:** Correctly applies allocation-mandate lens. Good framing of the 2022
  stock-bond correlation failure as a structural regime event. Honest on the
  five-year Sharpe drag.
- **Missing / wrong:** "highly favorable peer-relative combination" / "strictly
  enforces its moderately aggressive mandate" — filler language. Repeats
  `-23.01%` twice.
- **Verdict:** change needed — language/repetition.

### AOK (allocation-target-date — Conservative Allocation) — issues #1, #2
- **Good:** Correctly Mixed verdict, accurate duration-exposure framing for why
  2022 hit harder than conservative peers. Honest structural diagnosis.
- **Missing / wrong:** "amplified the damage" (dramatic), repeats `-17.53%`
  three times, repeats `0.46` beta twice, repeats capture `74` twice.
- **Verdict:** change needed — language/repetition.

## Final changes

- `docs/ai-knowledge/insights-ui/etf-prompts/risk-analysis.md` —
  (1) expand the forbidden-adjective list with actual offenders; (2) make the
  no-repeat-numbers rule explicitly span summary + overallAnalysisDetails +
  factor blocks; (3) add a decimal-precision rule (2 dp on ratios, whole or 1 dp
  on percentages / captures); (4) tighten the backtick rule to "required, not
  optional"; (5) require blank line between the four `overallAnalysisDetails`
  paragraphs; (6) extend the forward-looking ban with "what investors will /
  would experience in future markets".

Pipeline-layer items to flag separately (outside this prompt edit):
- `factorAnalysisArray` input contains duplicate factor keys for some ETFs
  (seen in `AGG`, `HYG`, `JEPI`), causing the model to double-evaluate the same
  metric and sometimes disagree with itself.
- The fetch-to-markdown step renders `\n\n` literal escape sequences for `SPY`
  instead of real paragraph breaks.
