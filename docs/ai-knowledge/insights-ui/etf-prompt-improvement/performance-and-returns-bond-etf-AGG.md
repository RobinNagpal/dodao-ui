# Prompt Improvement Analysis: PerformanceAndReturns — Bond ETF (AGG)

**ETF**: iShares Core U.S. Aggregate Bond ETF (AGG)  
**Category**: PerformanceAndReturns  
**Asset Class**: Fixed Income — Intermediate Core Bond (Index Tracking)  
**Date**: 2026-04-16

---

## What This ETF Is

AGG is the largest bond ETF in the world at `$137B` AUM. It passively tracks the Bloomberg U.S. Aggregate Bond Index — the most widely used benchmark for the total U.S. investment-grade bond market. It holds `13,275` bonds across government, corporate, and mortgage-backed sectors. This is the "default" bond allocation for most portfolios.

---

## What the Output Got Right

- Correctly identifies the ETF as "IN LINE" with benchmark across every period
- The summary is clear and appropriately balanced
- Correctly notes the massive scale and liquidity as strengths

---

## Issue 1: 4 Out of 5 Factors Fail — But the ETF Is Doing Its Job Perfectly

### What's wrong
The output gives this scoring: long_term_cagr = Fail, short_term_returns = Fail, returns_consistency = Fail, benchmark_comparison = Pass, price_trend_momentum = Fail.

That's 4 Fails and 1 Pass for the single most important bond ETF in the world. A retail investor seeing this would think AGG is a terrible investment. But AGG tracks its index within `0.01-0.47pp` across every single time period — that's near-perfect execution.

The problem is clear: **the factors judge absolute return quality, but for a passive bond index ETF, the only thing that matters is tracking quality.** AGG's low absolute returns are the Bloomberg Agg's low returns. The ETF didn't cause them.

### Why this is the clearest example yet
- AGG 5Y CAGR = `0.30%`, Index 5Y = `0.25%`. AGG actually BEAT its index. But the factor says "Fail" because 0.30% is low in absolute terms.
- AGG 10Y = `1.66%`, Index 10Y = `1.67%`. Tracking difference = `0.01pp`. Near-perfect. But the factor says "Fail."
- returns_consistency gets Fail because 2022 had a `-13.06%` loss. But the index lost `-12.99%`. The ETF tracked accurately through the crash. That's a success, not a failure.

### What to fix
For passive index ETFs, the factors should be reframed:
- Instead of "did the CAGR create wealth?" ask "did the CAGR match the index?"
- Instead of "were returns consistent?" ask "was tracking consistent across market conditions?"
- This is the same issue we flagged in TLT and HYG, but AGG makes it undeniable because AGG's tracking is essentially perfect yet it gets 4 Fails.

---

## Issue 2: The Output Calls 0.30% CAGR "Abysmal" — Missing the Full Picture

### What's wrong
The output says the 5Y CAGR of `0.30%` shows "abysmal lack of long-term capital appreciation" and "fails to outpace basic inflation." This is technically true about the absolute number, but it completely misses context:

1. **The price dropped, but investors still got income.** AGG's 5Y price change = `-12.93%`, but the 5Y total return = `1.51%`. That means ~14% came from income over 5 years (~2.8% per year). The stockAnalyzer CAGR of `0.30%` appears to be a price-only figure, while the morReturns 5Y trailing shows `0.25-0.29%` as annualized total return. The data sources seem inconsistent.

2. **The 2022 rate shock was historically unprecedented.** The -13% loss was the worst year for the Bloomberg Agg since its creation. This wiped out years of income. The output mentions this but frames it as the ETF's failure rather than an extraordinary asset class event.

3. **No comparison to what alternatives did.** If AGG returned 0.30% CAGR over 5 years, and the category did 0.29% and the index did 0.25%, then AGG actually outperformed. The output marks this as Fail while the relative data says it's excellent.

### What to fix
- The prompt needs an explicit rule: *"If the ETF's absolute returns are low but its returns closely match or beat the category and index, the absolute return weakness should be attributed to the asset class, not scored as a fund failure."*
- Price return vs total return needs to be reconciled (same recurring issue).

---

## Issue 3: Price Return vs Total Return — Same Problem, Even More Confusing Here

### What's wrong
The data shows conflicting numbers:
- stockAnalyzerReturns: 1Y = `3.63%`
- morReturns trailing 1Y (NAV) = not directly shown but the annual data for 2025 shows `7.19%`
- stockAnalyzerReturns 5Y price change = `-12.93%` but 5Y total return = `1.51%`

The `change` fields appear to be price-only (no income). The `return` fields appear to include income. For AGG with ~4% yield, this creates big gaps. The output never explains which type of return it's citing.

### What to fix
Same as all previous ETFs — label the data sources clearly in the schema, tell the model to reconcile conflicting numbers.

---

## Issue 4: Yield/Income Still Missing — Especially Important for AGG

### What's wrong
AGG currently yields ~4.2-4.5%. For the "default bond allocation" in most portfolios, the yield is the primary reason people hold it. The entire analysis never mentions yield or income.

For AGG specifically, the income story is critical to understanding the returns:
- Over 20 years, total return = `86.97%` but price change = only a fraction of that
- Most of AGG's return comes from steady, reliable income payments
- In years when the price drops (like 2022), income partially offsets losses

### What to fix
Same as all bond ETFs — add yield data to schema and prompt.

---

## Issue 5: Returns Consistency Factor Is Judging the Wrong Thing

### What's wrong
The output marks returns_consistency as Fail because:
- 2022 had `-13.06%` loss
- 3Y return = `10.10%` but 5Y = `1.51%` (big gap)

But look at it from a tracking perspective:
- 2022 fund = `-13.06%`, index = `-12.99%`, category = `-13.32%`. The fund tracked perfectly through the crash.
- The "inconsistency" between 3Y and 5Y is because the 5Y period includes 2022 and the 3Y period starts after it.

For a core bond fund, the real consistency question should be: "Does it reliably track the broad bond market?" Answer: Yes, within fractions of a percent every single year. That's excellent consistency.

### What to fix
For passive ETFs, redefine consistency as "tracking consistency" not "absolute return smoothness."

---

## Issue 6: Technical Analysis Is Borderline Useless for AGG

### What's wrong
AGG trades in a `$96.15-$101.46` range (5.5% band over a year). The output says price is "below the 200-day moving average of $99.81" as if this is meaningful. The price is $0.72 below — less than 1%. For a bond index ETF, this is just normal daily fluctuation driven by interest rate movements.

The RSI of `44.86` is called "slightly more selling pressure than buying pressure." For a bond ETF that moves based on rate expectations, RSI is not a useful trading signal.

### What to fix
Same as all bond ETFs — de-emphasize or reframe technical analysis. For bond ETFs, a paragraph on interest rate environment and duration sensitivity would be 10x more useful than MA crossover analysis.

---

## Issue 7: Category Code "CI" Not Resolved

Same data pipeline issue. morReturns shows `Category Name` as `"CI"` instead of "US Fund Intermediate Core Bond."

---

## Issue 8: ATH from 2020 COVID Era Is Misleading

The ATH of `$119.73` was set in August 2020 when rates were near zero. The output mentions the fund is `-17.23%` below ATH. This is meaningless context — rates were at historic lows, and the ATH reflects an abnormal rate environment. Same issue as TLT.

---

## Missing Data for AGG

1. **Distribution yield / SEC yield** (~4.2-4.5%) — the main reason people hold AGG
2. **Effective duration** (~6 years) — explains rate sensitivity
3. **Credit quality breakdown** — mostly AAA (government) with some investment-grade corporate
4. **Expense ratio** (0.03%) — AGG is one of the cheapest bond ETFs, which explains its tight tracking

---

## What AGG Confirms About the Prompt

AGG is the ultimate test case because it's the most "boring" and well-tracked bond ETF possible. If the prompt/factors can't properly evaluate AGG, they can't properly evaluate any passive bond ETF. The key takeaways:

1. **Factors MUST distinguish between "ETF performance" and "asset class performance"** — AGG gets 4 Fails despite being essentially a perfect product
2. **For passive ETFs, tracking difference should be THE primary metric** — AGG tracks within 0.01-0.47pp yet this achievement is barely mentioned
3. **Yield/income is not optional for bond ETFs** — it's the main product
4. **Technical analysis adds almost no value for core bond ETFs** — the price is driven by rates, not momentum

---

## Summary of Findings

| Priority | Issue | New or Recurring? |
|----------|-------|-------------------|
| **P0** | 4/5 factors Fail for a perfectly-tracking $137B index ETF — factors are broken for passive bond ETFs | Recurring — AGG is the clearest proof |
| **P0** | Yield/income data missing | Recurring (all 4 bond ETFs) |
| **P0** | Absolute returns judged as ETF failure when they're asset class returns | Recurring — AGG makes it undeniable |
| **P1** | Price return vs total return confusion | Recurring |
| **P1** | Returns consistency judged on absolute smoothness, not tracking accuracy | Recurring |
| **P2** | Technical analysis useless for core bond ETFs | Recurring |
| **P2** | ATH from zero-rate era is misleading | Recurring |
| **P3** | Category code "CI" not resolved | Recurring |
