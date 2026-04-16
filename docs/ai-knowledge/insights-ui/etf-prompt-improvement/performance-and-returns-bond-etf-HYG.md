# Prompt Improvement Analysis: PerformanceAndReturns — Bond ETF (HYG)

**ETF**: iShares iBoxx $ High Yield Corporate Bond ETF (HYG)  
**Category**: PerformanceAndReturns  
**Asset Class**: Fixed Income — High Yield Corporate Bond (Index Tracking)  
**Date**: 2026-04-16

---

## What This ETF Is

HYG is a large ($17.1B), highly liquid passive ETF that tracks the iBoxx USD Liquid High Yield Index. It holds `1,325` high-yield (junk) corporate bonds. Unlike AAA (niche CLO fund) or TLT (long-duration treasuries), HYG sits in a massive category with `625+` competitors, making peer comparisons very meaningful.

---

## What the Output Got Right

Before listing problems, it's worth noting this was the best output of the three bond ETFs so far:
- The tone is balanced — no dramatic "wealth destruction" language like TLT
- It correctly identifies the "consistently trails index but matches category" pattern
- The summary is clear and decision-useful
- Factor scoring is mostly reasonable

---

## Issue 1: Price Return vs Total Return — Still Not Explained

### What's wrong
Same problem as TLT but less obvious because the gap is smaller.
- stockAnalyzerReturns shows 1Y = `9.88%`
- morReturns trailing 1Y (NAV) = `10.17%`
- morReturns trailing 1Y (Price) = `10.28%`

The output uses all three numbers in different places without telling the reader which includes income and which doesn't. For HYG with a ~5-6% yield, the price-only return would be much lower than total return. The stockAnalyzer numbers here seem to already include income (since they're close to morReturns total return), but the output doesn't confirm this.

### Why it matters
A retail investor sees `9.88%` in one sentence and `10.17%` two paragraphs later for the same 1-year period. They don't know which to trust.

### What to fix in the prompt
Tell the model explicitly: *"When citing returns from different sources for the same period, reconcile them. If one source says 9.88% and another says 10.17%, explain the difference (rounding, timing, price vs total return). Never present conflicting numbers for the same period without explanation."*

---

## Issue 2: Benchmark Trailing Is the Key Story — But No Root Cause

### What's wrong
The output correctly spots that HYG trails its index by ~0.5-1.0pp across every period. It calls this "structural drag" and mentions "fees and trading costs." But it never connects this to the fundamental reality: **this is expected and normal for a passive bond ETF.**

Unlike equity index ETFs (which can track within 0.01-0.05pp), bond ETFs have higher tracking costs because:
- Corporate bonds trade over-the-counter with wide bid-ask spreads
- The index includes bonds that may be illiquid or hard to buy
- Sampling methodology means the ETF doesn't hold every index bond
- Expense ratio directly eats into returns

### Why it matters
The output marks `benchmark_comparison` as **Fail**, but for a high-yield bond index ETF, trailing by 0.5-1.0pp is industry-standard. Marking it Fail implies the ETF is doing something wrong. It's not — this is the cost of accessing the high-yield market through an ETF.

### What to fix in the prompt
Add a rule: *"For passive index-tracking bond ETFs, trailing the benchmark by up to 1.0pp is normal and expected due to expense ratios and bond market trading costs. Only mark benchmark_comparison as Fail if the ETF trails by significantly more than expected (e.g., >1.5pp for high-yield, >0.5pp for treasury). Compare the tracking gap to what's typical for the ETF's sub-category."*

---

## Issue 3: Yield/Income Is Still Completely Missing

### What's wrong
HYG's yield (~5-6%) is literally the main reason investors buy it. The entire analysis talks about returns without once mentioning the word "yield" or "income." 

For a high-yield bond ETF, the income stream is the product. Price changes are secondary. A retail investor reading this analysis learns nothing about the income they would receive.

### What to fix
Same as AAA and TLT — add yield data to the input schema and prompt instructions.

---

## Issue 4: The Factors Don't Fit Bond ETFs Well

### What's wrong with each factor

**long_term_cagr** — The output says `3.71%` 5Y CAGR and `5.25%` 10Y CAGR and calls this a Pass. But is this good or bad? Without context, a retail investor has no idea. The prompt doesn't tell the model what "good" looks like for high-yield bonds. If inflation averaged 3-4% over the same period, a `3.71%` 5Y CAGR means investors barely broke even in real terms. The factor passes it without addressing this.

**short_term_returns** — The output gives this a Pass despite 1M = `-0.14%`, 3M = `-0.16%`, YTD = `0.15%`. The Pass is justified by the strong 1Y = `9.88%`. But the factor is supposed to measure "current momentum" — and the current momentum is clearly flat to slightly negative. The 1Y return is backward-looking, not "current." This shows the factor description is ambiguous about what "short-term" means.

**returns_consistency** — Gets a Pass, and the reasoning is decent. But the factor only looks at whether returns are stable across periods. For a bond ETF, the more useful consistency question is: *"Does the income stream remain steady even when prices drop?"* The factor misses this because it doesn't separate income return from price return.

**benchmark_comparison** — Gets a Fail because the ETF trails its index. As discussed in Issue 2, this Fail is misleading for a passive bond ETF where some lag is expected and normal.

**price_trend_momentum** — Gets a Fail because the price is below MA50/MA150/MA200. But HYG is a bond ETF — its price moves in a narrow band (`$75-$81` over the past year, only ~8% range). Being `$0.88` below the MA200 is not a meaningful "failure" for a bond ETF the way it would be for an equity ETF. This factor is designed for equity-style momentum analysis and doesn't translate well to bonds.

### What factors would actually be useful for bond ETFs

Instead of the current 5 factors (which are equity-oriented), bond ETFs would benefit from:

1. **Tracking Precision** — How closely does the ETF match its index? Tracking difference and tracking error over multiple periods. This is the #1 quality metric for passive bond ETFs.

2. **Income/Yield Level** — Current yield vs category average, yield trend over time. This is what bond ETF buyers actually care about.

3. **Credit Cycle Resilience** — How did the fund handle 2020 COVID crash and 2022 rate hike? Max drawdown and recovery time. More useful than generic "returns consistency."

4. **Total Return Compounding** — Similar to long_term_cagr but explicitly using total return (not price return) and benchmarked against inflation and the category.

5. **Liquidity & Trading Quality** — Bid-ask spread, premium/discount to NAV, trading volume. For bond ETFs, these directly affect the returns investors actually receive.

The current `price_trend_momentum` factor could be kept but should be weighted much lower and interpreted differently for bonds.

### What to fix
Either:
- Create a separate factor set for bond ETFs (preferred)
- Or add conditional rules within each factor: *"For bond ETFs, evaluate this factor using [bond-specific criteria] instead of the default equity criteria."*

---

## Issue 5: Percentile Rank Data Shows a Clear Story — Barely Used

### What's wrong
HYG's percentile data tells a useful, clear story:
- It sits around the **40th-60th percentile** most years (solidly middle-of-pack)
- Trailing percentiles: 45th (1Y), 38th (3Y), 60th (5Y), 58th (10Y), 56th (15Y)
- This means HYG is a median performer in its category — not bad, not great

The output mentions percentiles once in passing ("hovers between 33rd and 60th percentiles"). But it doesn't draw the obvious conclusion: **HYG is a perfectly average high-yield bond ETF, which is exactly what you'd expect from a passive index tracker in a large active-manager-heavy category.**

This is actually a positive insight — being median among 600+ competitors (most of which are actively managed) while charging low fees and offering massive liquidity is a legitimate value proposition.

### What to fix
Add prompt instruction: *"For large passive ETFs competing in categories dominated by active managers, being in the 40th-60th percentile range is expected and can be presented as a neutral-to-positive sign. Explain this context to retail investors."*

---

## Issue 6: The ATH Comparison Is Irrelevant Here Too

### What's wrong
The output doesn't focus much on ATH (better than TLT), but the data shows ATH = `$106.47` from 2007 (before the financial crisis). This is 18 years ago and completely irrelevant to current analysis. The ATH for a high-yield bond ETF set before the 2008 crisis reflects pre-crisis credit bubble pricing.

### What to fix
Same as TLT — add context rules for ATH. If the ATH was set >10 years ago or during a known market extreme, don't treat it as a meaningful reference point.

---

## Issue 7: Category Code "HY" Not Resolved

Same data pipeline issue as AAA ("S1") and TLT ("GL"). The morReturns annual data shows `Category Name` as `"HY"` instead of "US Fund High Yield Bond."

---

## Missing Data for This ETF

1. **Distribution yield / SEC yield** — HYG currently yields ~5-6%. This single number would transform the analysis.
2. **Expense ratio** — HYG charges ~0.49%, which is relatively high for an ETF. This explains most of the benchmark tracking gap. Even though expense ratio is in the "Cost" report, knowing it here would help explain the tracking difference.
3. **Credit quality breakdown** — What % is BB, B, CCC? This directly affects the risk-return profile.
4. **Effective duration** — HYG has ~3.5 years of duration. Much shorter than TLT. This explains why HYG didn't crash as hard in 2022.
5. **Spread-to-worst / OAS** — The high-yield spread is the key driver of HYG's returns beyond treasuries. Missing this is like analyzing a stock without knowing its P/E.

---

## Cross-ETF Pattern Update (AAA + TLT + HYG)

| Issue | AAA (CLO) | TLT (Treasury) | HYG (High Yield) | Pattern |
|-------|-----------|-----------------|-------------------|---------|
| Yield/income missing | Critical | Critical | Critical | **Universal — P0 fix needed** |
| Price vs total return confusion | Minor | Major (6pp gap) | Moderate (unclear labeling) | **Universal — P0 fix needed** |
| Passive vs active awareness | N/A (active) | Critical | Important | **Needed for all passive ETFs** |
| Factors don't fit bonds | Somewhat | Very poor fit | Moderate fit but misleading | **Need bond-specific factors** |
| ±2pp threshold issues | Too generous | Masks bottom-quartile | Masks normal tracking lag | **Needs asset-class adjustment** |
| Percentile rank underused | Missed deterioration | Missed bottom quartile | Missed "median is OK" story | **Universal — add prompt rules** |
| Dramatic/misleading tone | Mild | Severe | Good (balanced) | Varies — HYG shows it CAN be good |
| Rate/duration context missing | Minor (floating rate) | Critical | Moderate (shorter duration) | **Scales with duration risk** |
| Category code not resolved | "S1" | "GL" | "HY" | **Data pipeline fix needed** |
| ATH comparison issues | OK | Very misleading | Irrelevant (18yr ago) | **Add context rules** |
| Benchmark identity | Missing (null) | Present | Present | Depends on data quality |
| Tracking difference not measured | N/A (active) | Not measured | Not measured | **Need as first-class metric** |

---

## Yield/Income Data — What's Missing and What We Need

The biggest gap across all bond ETF analyses is that **yield and income data is completely absent**. Here's exactly what that means and what data fields we should add:

### What "yield/income" means in practice

For bond ETFs, most of the total return comes from income (coupon payments distributed as dividends), not price going up. For example, HYG's data shows:
- 10Y total return (CAGR) = `5.25%`
- 10Y price change = `-1.60%` (price actually went DOWN)
- So roughly `6.85%` per year came from income, and the price lost money

A retail investor reading only `5.25%` CAGR thinks "decent growth." The real story: "You got ~7% income annually, but the share price dropped, netting 5.25%." That's a very different investment decision.

### Specific data fields to add to the input schema

1. **Distribution Yield (or Dividend Yield)** — The annual income the ETF pays out as a % of its price. For HYG this is roughly ~5-6%. This is the single most important number for bond ETF buyers.

2. **SEC Yield (30-day)** — A standardized, forward-looking yield that SEC requires all funds to report. More accurate than distribution yield because it's based on current holdings, not past payments. This is the industry standard for comparing bond funds to each other.

3. **Payout Frequency** — How often dividends are paid (monthly, quarterly, etc.). HYG pays monthly, which matters to income investors who want regular cash flow.

4. **Income Return vs Price Return split** — Our data already partially has this (morReturns has both "Investment (Price)" and "Investment (NAV)" which is total return). But the prompt never tells the model to separate and explain the two. For bond ETFs, the model should say something like: "The ETF returned 5.25% total, of which ~6.85% came from income and -1.60% came from price decline."

### Where to get this data

We should check if these fields already exist in our data tables:
- `EtfFinancialInfo` — may have dividend yield, payout frequency
- `EtfMorAnalyzerInfo` — Morningstar usually reports SEC yield, TTM yield
- `EtfStockAnalyzerInfo` — may have dividend yield

If not already in our tables, these are standard fields available from most financial data APIs (Morningstar, Yahoo Finance, etc.).

### How this changes the prompt

For bond ETFs, the prompt should instruct:
- Always mention the current yield in the summary
- Explain how much of total return comes from income vs price change
- Compare the yield to category average
- In the factors, add a "yield_and_income" factor or make existing factors yield-aware

---

## Summary of Findings

| Priority | Issue | New or Recurring? |
|----------|-------|-------------------|
| **P0** | Yield/income data missing from schema and prompt | Recurring (all 3 ETFs) |
| **P0** | Price return vs total return not reconciled | Recurring (all 3 ETFs) |
| **P0** | Analysis factors are equity-oriented, need bond-specific versions | Recurring — HYG makes this clearest |
| **P1** | Normal benchmark lag for passive bond ETFs wrongly marked as Fail | New from HYG |
| **P1** | No context for what "good" CAGR means for the asset class | New from HYG |
| **P1** | Short-term returns factor mixes 1Y (backward) with momentum (current) | New from HYG |
| **P1** | Percentile rank context for passive ETFs in active-heavy categories | New from HYG |
| **P2** | Missing data: expense ratio, duration, credit quality, spread | Recurring |
| **P2** | ATH from pre-crisis or crisis periods is irrelevant | Recurring |
| **P3** | Category code "HY" not resolved to full name | Recurring |
