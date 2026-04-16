# Prompt Improvement Analysis: PerformanceAndReturns — Equity ETF (VOO)

**ETF**: Vanguard S&P 500 ETF (VOO)  
**Category**: PerformanceAndReturns  
**Asset Class**: Equity — Large Blend (Passive Index Tracking)  
**Date**: 2026-04-16

---

## What This ETF Is

VOO is one of the largest ETFs in the world at `$1.4 Trillion` total assets. It passively tracks the S&P 500 index — the most widely followed benchmark for U.S. large-cap stocks. It holds `518` stocks. This is the "default" equity allocation for most retail investors and often the benchmark against which all other funds are compared.

---

## What the Output Got Right

This is the best output we've seen across all ETFs so far:
- The summary is clear, balanced, and decision-useful
- Correctly identifies the "strong long-term, weak short-term" story
- Benchmark comparison paragraph is well done — tight tracking against S&P 500 while beating category by 2-3pp
- Factor scoring is reasonable (3 Pass, 2 Fail)
- Percentile rank data is actually somewhat reflected (mentions outperforming peers)
- The tone is balanced — not overly dramatic despite recent -4.22% 3M dip

---

## Issue 1: The Factors Work Much Better for Equity ETFs — But Still Have Problems

### What's different from bond ETFs
For VOO, the factors actually make sense:
- `long_term_cagr` = Pass with 10Y CAGR of `14.32%` — clearly strong, no ambiguity
- `returns_consistency` = Pass — annual returns swing but recovery is fast, correctly evaluated
- `benchmark_comparison` = Pass — tight tracking + beating category, correctly evaluated

The factors were clearly designed with equity ETFs like VOO in mind. They work reasonably well here.

### What's still wrong

**short_term_returns gets Fail despite 31.28% 1Y return.** The factor is called "Short-Term Returns" and its description says it evaluates "1-month, 3-month, 6-month, YTD, and 1-year periods." The 1M through YTD numbers are all negative (-3.35% to -3.40%), but the 1Y is +31.28%. The model correctly fails it based on the negative recent months, but a retail investor might find it odd that an ETF up 31% in a year gets "Fail" on short-term returns.

The problem: the factor mixes two different things:
1. **Recent momentum** (1M, 3M, YTD) — which is clearly negative
2. **Short-term total return** (1Y) — which is clearly positive

These should probably be separate signals, or the factor description should clarify what it's really measuring.

**price_trend_momentum gets Fail for a normal market correction.** VOO is only -5.91% from its ATH and -0.94% from its MA200. For an equity ETF with beta ~1.0, this is a completely normal pullback. Marking it as Fail implies something is wrong, when this is just standard equity market behavior. A -10% to -15% correction happens roughly once a year on average.

### What to fix
- Split `short_term_returns` into two clearer concepts: "Recent Momentum (1M-3M)" and "Trailing Return (1Y)"
- Or add context in the prompt: *"For the short_term_returns factor, if the 1Y return is strong but very recent months (1M, 3M) are negative, explain this as a pullback within an uptrend rather than a blanket failure. Only Fail if both the 1Y and the recent months are weak."*
- For `price_trend_momentum`: *"For equity ETFs, a -5% to -10% pullback from highs is normal market behavior. Only mark Fail if the ETF shows sustained breakdown (e.g., -15%+ from highs, below MA200 for multiple months, RSI below 30)."*

---

## Issue 2: Price Return vs Total Return — Smaller Gap but Still Unreconciled

### What's wrong
For VOO, the gap between price return and total return is smaller (~1.3% yield) than for bond ETFs, but it's still present and never explained:
- stockAnalyzerReturns 1Y = `31.28%` (likely total return)
- stockAnalyzerReturns 1Y price change = `29.72%`
- morReturns trailing 1Y (Price) = `31.79%`
- morReturns trailing 1Y (NAV) = `31.72%`

The numbers are close enough that it doesn't cause major confusion, but the model still uses different numbers from different sources without explaining why `31.28%` vs `31.79%` for the "same" period. For equity ETFs this is a minor issue; for bond ETFs it was major.

### What to fix
Same reconciliation rule as before, but lower priority for equity ETFs.

---

## Issue 3: ±2pp Threshold Works Well for Equity — But VOO Reveals an Edge Case

### What's working
For equity ETFs with 10-25% annual returns, the ±2pp threshold is appropriate:
- VOO 1Y = `31.79%` vs category `28.75%` → gap = +3.04pp → correctly labeled "Strong"
- VOO 5Y = `12.57%` vs category `10.74%` → gap = +1.83pp → correctly labeled "In Line"

### The edge case
VOO 10Y = `14.84%` vs category `13.42%` → gap = +1.42pp → labeled "In Line." But being 1.42pp above the average of 1,300+ funds for 10 straight years is quite impressive. Over 10 years, this compounds to a meaningful difference. The ±2pp rule masks this.

### What to fix
Consider adding a **duration multiplier** for long periods: *"For comparisons over 10+ years, a gap of ±1pp or more is notable because it compounds significantly. Mention the compounding effect even if the annual gap is within the ±2pp In Line range."*

---

## Issue 4: Percentile Rank Data Tells a Strong Story — Only Partially Used

### What's right
The output mentions VOO beats its category. But the percentile data tells a much more precise and compelling story:

Trailing percentiles: 35th (1Y), 26th (3Y), 18th (5Y), 16th (10Y), 10th (15Y)

This means: **the longer you hold VOO, the better it ranks against active managers.** At 15 years, it beats 90% of all large blend funds. This is the single most powerful argument for passive index investing, and it's barely mentioned.

Annual percentiles are consistently in the 20s-30s range (top quartile) except 2022 (52nd — median during a crash). This shows VOO is a "slow and steady beats most" fund.

### What to fix
Same as all previous ETFs — add explicit percentile analysis instructions. For VOO specifically, the "longer holding period = better rank" pattern is a genuinely useful retail investor insight.

---

## Issue 5: Passive vs Active Context — The Category Comparison Tells an Important Story

### What's right but undersold
VOO beating its "Large Blend" category by 2-3pp is not just a nice stat — it's THE argument for passive investing. The category includes ~1,400 funds, most of which are actively managed. VOO beating most of them means:
- Most active large-cap managers fail to beat the index
- The cheapest, simplest approach (passive indexing) outperforms the expensive, complex one (active management)

The output mentions the numbers but never draws this conclusion for the retail investor. It says "the sheer power of low-cost passive investing" in passing but doesn't build on it.

### What to fix
For passive S&P 500 trackers specifically, add: *"If the ETF is a passive S&P 500 index fund that beats its category average (which includes many active managers), explain what this means: passive indexing has historically outperformed most active managers over long periods. This is useful context for retail investors choosing between this ETF and actively managed alternatives."*

---

## Issue 6: Verbosity — Better Than JEPI But Still Too Long

### What's wrong
The output is ~2,200 words. It's readable and not filled with filler adjectives (unlike JEPI), but it could be tighter:
- Paragraph 1 is ~200 words of preamble before getting to the actual snapshot
- Several sentences explain what CAGR or RSI means — fine, but this is repeated across paragraphs
- The explanation of beta ("measures how sensitive a specific investment is to broad market swings") is given in full every time

### What to fix
Lower priority than the structural issues, but: *"Define technical terms once. After the first explanation, use the term without re-explaining."*

---

## Issue 7: Category Code "LB" Not Resolved

morReturns shows `Category Name` as `"LB"` instead of "US Fund Large Blend." Same pipeline issue as all previous ETFs.

---

## Missing Data for VOO

Unlike bond ETFs, VOO has fewer critical data gaps because the prompt was designed for equity ETFs. Still missing:
1. **Dividend yield** (~1.3%) — less critical than for bond ETFs but still useful context
2. **Expense ratio** (0.03%) — explains the tight tracking and category outperformance
3. **Sector concentration** — top sectors (tech heavy) affect risk interpretation
4. **P/E ratio or valuation context** — the prompt correctly says "do not discuss valuation," but some readers would want to know if the strong returns came at the cost of high valuations

---

## How Equity ETFs Compare to Bond ETFs — Prompt Fit

| Aspect | Bond ETFs (AAA, TLT, HYG, AGG) | Equity ETFs (VOO) |
|--------|-------------------------------|-------------------|
| Factors fit the ETF type | Very poor | Good — designed for this |
| ±2pp threshold appropriate | Too coarse | Appropriate |
| Yield/income importance | Critical (missing) | Nice-to-have (missing) |
| Technical analysis useful | Mostly useless | Somewhat useful |
| Price vs total return confusion | Major problem | Minor problem |
| Passive vs active framing | Missing | Mentioned but undersold |
| Tone calibration | Often wrong (dramatic for passive trackers) | Appropriate |
| Percentile data usage | Underused | Underused but less critical |

This confirms the prompt was designed with equity ETFs in mind. The bond/income ETF issues are where the real work is needed.

---

## Summary of Findings

| Priority | Issue | New or Recurring? |
|----------|-------|-------------------|
| **P1** | short_term_returns factor mixes momentum with trailing return — ambiguous | Recurring — clearest for equity ETFs |
| **P1** | price_trend_momentum Fail for normal -5% correction is too harsh | New — equity-specific threshold needed |
| **P1** | Percentile rank "longer hold = better rank" story not surfaced | Recurring |
| **P2** | ±2pp rule masks meaningful long-term compounding differences | New edge case |
| **P2** | Passive vs active investing lesson undersold | New — specific to index ETFs |
| **P2** | Technical terms re-explained in every paragraph | Recurring verbosity issue |
| **P3** | Category code "LB" not resolved | Recurring |
