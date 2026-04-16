# Prompt Improvement Analysis: PerformanceAndReturns — Equity ETF (HDV)

**ETF**: iShares Core High Dividend ETF (HDV)  
**Category**: PerformanceAndReturns  
**Asset Class**: Equity — Large Value, High Dividend, Passive Index Tracking  
**Date**: 2026-04-16

---

## What This ETF Is

HDV tracks the Morningstar Dividend Yield Focus Index — a rules-based index that screens for high-quality, high-dividend U.S. stocks. Key characteristics:
- `$13.2B` AUM, `280K` daily volume — solid but not huge
- `82` holdings — moderately concentrated
- Beta = `0.59` — very low for an equity ETF, indicating defensive positioning
- Category: "Large Value" but it's really a "high dividend" strategy within value
- 15+ years of history — fully mature fund

HDV is interesting because it's a **high-dividend equity strategy** — different from both pure value (IWD) and covered call income (JEPI/QQQI). It provides income through actual stock dividends rather than options premiums.

---

## What the Output Got Right

This is a strong output overall:
- Summary is clear, correctly calls the profile "mixed"
- Very good observation about the "highly uneven" relative performance — beating YTD but lagging 1Y
- The returns_consistency factor correctly caught the erratic quartile ranks (brilliant analysis)
- Technical analysis is done well — above MA200 (long-term uptrend) but below MA20/MA50 (short-term pullback)
- Factor scoring (2 Pass, 3 Fail) feels right for HDV's profile

---

## Issue 1: The Percentile Data Reveals HDV Is a "Feast or Famine" Fund — Best Analysis We've Seen

### What's right
The output for `returns_consistency` actually uses the quartile rank data well. It correctly identifies that HDV bounces between 1st quartile (2018, 2022, YTD) and 4th quartile (2017, 2019, 2020, 2021, 2023, 2025).

This is a genuinely important pattern: **HDV outperforms dramatically in down/volatile markets (2018, 2022) and underperforms badly in bull markets (2019, 2020, 2021).** It's a defensive fund that only wins when the market is struggling.

### What could be even better
The output notices the pattern but doesn't explicitly connect it to the WHY: HDV holds high-dividend, defensive stocks (utilities, healthcare, energy). These sectors lead in down markets and lag in growth rallies. This is THE insight a retail investor needs: "Buy HDV if you think the market will be choppy. Avoid HDV if you think the bull run continues."

The prompt says "do not do deep strategy analysis" — but connecting the defensive stock profile to the return pattern is performance analysis, not strategy analysis.

### What to fix
Add: *"If the percentile data shows a clear pattern of outperformance in down years and underperformance in up years (or vice versa), explain this pattern and what it means for investors. This is performance context, not strategy analysis."*

---

## Issue 2: HDV Trails Its Benchmark by 3-6pp — Much Worse Than IWD

### The data
HDV vs its index (Morningstar Dividend Yield Focus Index):
- 1Y: `21.88%` vs `28.05%` → -6.17pp (Weak)
- 3Y: `12.41%` vs `16.79%` → -4.38pp (Weak)
- 5Y: `10.65%` vs `11.29%` → -0.64pp (In Line)
- 10Y: `9.29%` vs `12.41%` → -3.12pp (Weak)

Wait — the "Index" row shows the same numbers as IWD's "Index" row (which was the Russell 1000 Value). Both show `28.05%` 1Y, `16.79%` 3Y, `11.29%` 5Y. This appears to be a **generic large value index** being used for both HDV and IWD, not HDV's actual stated benchmark (Morningstar Dividend Yield Focus Index).

This is a major data problem. HDV tracks the Morningstar Dividend Yield Focus Index, but the comparison "Index" in morReturns appears to be the Russell 1000 Value index. Comparing HDV to an index it doesn't track produces misleading underperformance numbers.

### What's wrong
The output says HDV is "severely lagging" its benchmark. But if the "Index" is actually the Russell 1000 Value (not HDV's real benchmark), this comparison is unfair. HDV's real benchmark (Morningstar Dividend Yield Focus) is much more concentrated in high-dividend stocks, and HDV probably tracks it closely.

### What to fix
Two things:
1. **Data pipeline fix**: The morReturns "Index" row should match the ETF's actual stated `indexName` from morOverview. If `indexName` = "Morningstar Dividend Yield Focus Index" but the Index returns are Russell 1000 Value, there's a data mismatch.
2. **Prompt fix**: *"If the indexName in morOverview doesn't match the apparent index being used in morReturns (based on the return pattern), flag this discrepancy. The comparison may not be against the ETF's actual benchmark."*

---

## Issue 3: Dividend Yield — More Critical Here Than Almost Any Other ETF

### What's wrong
HDV's name literally says "High Dividend." Its dividend yield is roughly ~3.5-4.0%. The data confirms this:
- 1Y total return = `24.40%`
- 1Y price change = `20.48%`
- Gap = ~3.9pp = the dividend income

For a high-dividend fund, the dividend yield IS the value proposition alongside the defensive positioning. The analysis never mentions dividends. A retail investor reading this analysis of a fund called "Core High Dividend" and seeing zero mention of dividends would be confused.

### What to fix
Same as all previous ETFs. But for HDV specifically, the prompt must mention that dividend-focused ETFs should have their yield discussed as a core part of the performance story.

---

## Issue 4: Beta 0.59 Is Extremely Low for an Equity ETF — Correctly Noted but Implications Underexplored

### What's right
The output correctly highlights the 0.59 beta and says it means "milder price swings." Good.

### What's missing
Beta 0.59 means HDV captures roughly 59% of market moves. This directly explains:
- Why it trails in bull markets (it only gets 59% of the upside)
- Why it outperforms in bear markets (it only gets 59% of the downside)
- Why the 2022 return was +7.06% while the category was -5.90%

The output doesn't make this explicit connection. Beta isn't just a risk stat — for HDV, it's the primary explanation of the entire return pattern.

### What to fix
Add to prompt: *"For ETFs with beta significantly below 1.0 (e.g., below 0.7), explain how the low beta directly affects the return pattern in both up and down markets. A 0.6-beta fund is expected to capture about 60% of market gains and 60% of market losses."*

---

## Issue 5: The "Feast or Famine" Pattern Creates a Unique Problem for the ±2pp Rule

### The data
HDV's relative performance swings wildly by time period:
- YTD: +5.00pp vs category, +7.20pp vs index → Strong
- 1Y: -4.53pp vs category, -6.17pp vs index → Weak
- 3Y: -2.62pp vs category, -4.38pp vs index → Weak
- 5Y: +0.83pp vs category, -0.64pp vs index → In Line
- 10Y: -1.73pp vs category, -3.12pp vs index → Weak/In Line mix

The ±2pp rule produces a confusing patchwork: Strong, Weak, Weak, In Line, mixed. The underlying pattern is simple — HDV is defensive, so it wins when others lose and loses when others win. But the ±2pp labels don't capture this.

### What to fix
For ETFs with very low beta (<0.7) or clear defensive characteristics, the prompt should say: *"If the ETF shows a pattern of strong outperformance in down markets and underperformance in up markets (or vice versa), present this as a coherent pattern rather than labeling each period independently. Explain that the ETF is 'market-condition dependent' rather than simply 'weak' or 'strong.'"*

---

## Issue 6: HDV Holds 82 Stocks — Is That Concentrated?

### What the output says
The output says "relatively concentrated portfolio of just 82 holdings" and says the fund's "strict focus" insulates investors. It treats 82 holdings as moderately concentrated.

### The context problem
- EAGL: 34 holdings = very concentrated
- HDV: 82 holdings = moderately concentrated
- VUG: 155 holdings = moderately diversified
- VOO: 518 holdings = broadly diversified
- IWD: 870 holdings = very diversified
- AGG: 13,275 holdings = extremely diversified

The prompt gives no guidance on what counts as concentrated. 82 holdings is concentrated for a broad equity ETF but quite diversified for a dividend-focused strategy. The context depends on what the fund is trying to do.

### What to fix
Add: *"When discussing concentration: under 50 holdings is highly concentrated (single-stock risk matters), 50-200 is moderately concentrated, 200-500 is diversified, 500+ is broadly diversified. Adjust language based on the fund's strategy — a 75-stock dividend strategy is normally concentrated for its type."*

---

## Issue 7: Category Code "LV" Not Resolved

Same pipeline issue. morReturns shows "LV" instead of "US Fund Large Value."

---

## Are the Factors Right for HDV?

| Factor | Works? | Notes |
|--------|--------|-------|
| **long_term_cagr** | Yes | 15Y data available. 10.48% 15Y CAGR = solid Pass. |
| **short_term_returns** | Yes | Strong YTD/1Y/3M/6M, mild -1.19% 1M. Pass is reasonable. |
| **returns_consistency** | Interesting | Output correctly uses quartile data to show wild swings. Fail is justified. Best use of percentile data we've seen. |
| **benchmark_comparison** | Problematic | Wrong benchmark being compared (see Issue 2). Fail may be based on bad data. |
| **price_trend_momentum** | Reasonable | Above MA200 (good) but below MA20/MA50 (cooling). Fail is borderline harsh — the long-term trend is still up. Could argue Pass with the caveat of short-term cooling. |

The `price_trend_momentum` scoring is inconsistent: IWD got Pass with a very similar profile (above MA200, below MA50, RSI ~50). HDV gets Fail with nearly the same setup. The prompt doesn't give clear enough rules for these borderline cases.

### What to fix
Add: *"For price_trend_momentum, if the ETF is above its MA200 (long-term uptrend intact) but below shorter MAs (short-term cooling), this is a mixed signal, not a clear Fail. Only Fail if the ETF is below MA200 with weak RSI (<40). If above MA200 with neutral RSI (40-55), lean toward Pass with a note about short-term cooling."*

---

## Missing Data for HDV

1. **Dividend yield** (~3.5-4.0%) — literally in the fund's name
2. **Actual benchmark returns** — Morningstar Dividend Yield Focus Index, not Russell 1000 Value
3. **Expense ratio** (~0.08%) — very low, explains tight tracking to its actual index
4. **Sector concentration** — energy/healthcare heavy, directly drives the defensive pattern
5. **Dividend growth rate** — is the dividend increasing over time?

---

## What HDV Reveals About the Prompt (Unique Insights)

1. **"Feast or famine" defensive patterns need a label.** The prompt should recognize that some funds systematically outperform in bad markets and underperform in good markets. This isn't inconsistency — it's a feature. The `returns_consistency` factor penalizes this pattern, but a retail investor might actually WANT this behavior.

2. **The morReturns "Index" row may not match the actual benchmark.** This is a data integrity issue that affects IWD, HDV, and potentially many other ETFs. If the "Index" row is always the category's default benchmark (e.g., Russell 1000 Value for all Large Value funds) rather than the ETF's stated benchmark, all benchmark comparisons for non-default-index ETFs are wrong.

3. **Momentum factor scoring is inconsistent across ETFs.** IWD and HDV have very similar technical profiles but opposite scores (Pass vs Fail). The prompt needs clearer breakpoints.

---

## Summary of Findings

| Priority | Issue | New or Recurring? |
|----------|-------|-------------------|
| **P0** | morReturns "Index" may not match actual benchmark — wrong comparison for non-standard-index ETFs | New — first time we noticed data mismatch |
| **P1** | "Feast or famine" defensive pattern penalized as inconsistency when it's a feature | New — unique to defensive/high-dividend strategies |
| **P1** | Dividend yield missing — the fund is literally called "High Dividend" | Recurring — but most egregious here |
| **P1** | Beta 0.59 not connected to the return pattern (explains everything) | Recurring variant — best case for beta-to-return linking |
| **P1** | Momentum factor scoring inconsistent (IWD Pass vs HDV Fail with similar profile) | New — needs clearer breakpoints |
| **P2** | ±2pp labels produce confusing patchwork for market-condition-dependent funds | New variant — needs pattern-based labeling |
| **P2** | Holdings count context depends on strategy — 82 is different for dividend vs broad | New |
| **P3** | Category code "LV" not resolved | Recurring |
