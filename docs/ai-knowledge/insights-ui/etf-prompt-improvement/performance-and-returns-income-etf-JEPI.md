# Prompt Improvement Analysis: PerformanceAndReturns — Income ETF (JEPI)

**ETF**: JPMorgan Equity Premium Income ETF (JEPI)  
**Category**: PerformanceAndReturns  
**Asset Class**: Equity-Derivative Hybrid — Covered Call / Options Income Strategy  
**Date**: 2026-04-16

---

## What This ETF Is

JEPI is NOT a bond ETF. It's an actively managed equity-derivative income fund that:
- Holds a portfolio of large-cap stocks (like S&P 500 components)
- Sells call options (via equity-linked notes) against those holdings
- The options premium generates high income (~7-8% yield)
- In exchange, the fund gives up some upside when the market rallies

It's in the "US Fund Derivative Income" category — a fast-growing category (from 49 funds in 2020 to 279 now). With `$45B` AUM, JEPI is the dominant fund in this space.

**Important:** This ETF is fundamentally different from the bond ETFs we analyzed (AAA, TLT, HYG, AGG). It's an equity strategy that trades upside for income. Analyzing it with the same prompt and factors as a bond ETF reveals a whole new set of problems.

---

## Issue 1: The Output Quality Is Much Worse — Extremely Verbose and Repetitive

### What's wrong
This is the worst output of all 5 ETFs by far. The writing is stuffed with unnecessary filler words:
- "totally," "strictly," "mathematically," "fundamentally," "completely," "absolutely," "undeniably," "entirely," "definitively"
- These appear dozens of times and add zero information
- Example: "violently breaking entirely below the foundational 200-day moving average is a highly widely recognized strict technical signal"
- Example: "the absolute most important risk metric for understanding this specific ETF's general behavior is its beta"

The same prompt produced decent output for HYG and reasonable output for AGG. The quality drop here might be because JEPI is harder to analyze (hybrid strategy, newer fund, deliberate underperformance vs benchmark) and the model compensates for uncertainty with verbosity.

### What to fix
Add a stronger writing quality rule to the prompt: *"Do not use filler adjectives like 'totally,' 'strictly,' 'absolutely,' 'fundamentally,' 'undeniably,' 'entirely,' or 'mathematically.' Write plain, direct sentences. If you need more words, add more facts, not more adjectives."*

---

## Issue 2: Benchmark Comparison Is Fundamentally Wrong for This Strategy

### What's wrong
The output compares JEPI to the S&P 500 Total Return Index and declares it "Weak" across most periods because it trails by 10-17pp. But **JEPI is designed to trail the S&P 500 in bull markets.** That's the explicit trade-off: you give up upside in exchange for:
- Much higher income (~7-8% yield vs S&P's ~1.3%)
- Lower volatility (beta = 0.59)
- Better downside protection (only -3.53% in 2022 vs S&P's -19.43%)

Calling this "Fail" is like saying an umbrella fails because it doesn't make you faster. The ETF is doing exactly what it's designed to do.

The morReturns data proves JEPI's value proposition:
- 2022: JEPI = `-3.53%`, S&P 500 = `-19.43%`. JEPI beat by `+15.9pp` — massive outperformance when it matters most.
- 2024: JEPI = `12.56%`, S&P 500 = `24.09%`. JEPI trailed by `-11.53pp` — expected in a strong bull market.

This is the fund working as designed, not failing.

### What to fix
The prompt needs **strategy-aware benchmark interpretation:**
- *"For derivative income / covered call ETFs, trailing the equity benchmark in bull markets is expected and by design. These funds trade upside for income and downside protection. Judge them on: (1) total return relative to their category peers, (2) whether they delivered on the income + protection promise, (3) risk-adjusted returns, not raw total return vs a pure equity index."*
- The `benchmark_comparison` factor should be evaluated differently for income strategies.

---

## Issue 3: Income/Yield Is the Entire Product — Not Mentioned Once

### What's wrong
JEPI pays ~7-8% annual yield through monthly distributions. This is literally the reason 99% of investors buy it. The entire 2000+ word analysis never mentions yield, income, or distributions.

The data shows a revealing pattern:
- stockAnalyzerReturns: 1Y return = `17.99%`, 1Y price change = `8.50%`
- That ~9.5pp gap is the income component

So roughly half of JEPI's total return comes from income. An investor reading the analysis has no idea about this. They see `17.99%` and think it's all price growth. It's not — about half would disappear if they needed price appreciation rather than income.

### What to fix
Same as bond ETFs but even more critical here because:
- JEPI's yield (~7-8%) is higher than most bond ETFs
- The yield is the fund's core selling point
- Without yield context, the benchmark comparison makes no sense (JEPI's yield + price ≈ reasonable return, but the prompt only compares total return to S&P 500 total return)

---

## Issue 4: The Factors Don't Fit Income/Derivative Strategies

### How each factor plays out for JEPI

**long_term_cagr** — Gets Pass with 5Y CAGR = `8.25%`. This is actually a reasonable call, but the factor doesn't ask whether that 8.25% is good FOR THIS STRATEGY TYPE. Compared to the S&P 500 at 11.55% over the same period, JEPI captured ~71% of the upside with ~59% of the volatility. That ratio is the actual measure of success.

**short_term_returns** — Gets Pass despite 1M = `-2.78%` and 3M = `0.35%`. The justification leans on the 1Y = `17.99%`. Same ambiguity we saw in HYG — does "short term" mean "recent momentum" or "last year"?

**returns_consistency** — Gets Pass, and this is actually the strongest factor for JEPI. The annual returns are remarkably stable: `21.61%`, `-3.53%`, `9.88%`, `12.56%`, `8.06%`. The 2022 drawdown was only `-3.53%` when the market lost `-19.43%`. This shows the strategy works. But the output doesn't compare this to the benchmark's wild swings to show the value.

**benchmark_comparison** — Gets Fail because it trails S&P 500 by huge margins. As discussed in Issue 2, this is the wrong interpretation for this strategy.

**price_trend_momentum** — Gets Fail because price is below MAs. For an income ETF where ~50% of return is distributed as cash (reducing the share price), MA analysis is misleading. The share price naturally drifts down as income is paid out and then steps back up. Traditional momentum analysis doesn't account for this.

### What factors would actually work for income/derivative strategies

1. **Income Generation & Consistency** — Is the yield attractive? Is it stable month to month? How does it compare to category peers?

2. **Total Return vs Category** — Not vs S&P 500, but vs other derivative income funds. JEPI percentile ranks: 29th (2021), 25th (2022, which is GREAT for a down year), 67th (2023-2025). This tells a useful story.

3. **Downside Protection** — How much did it lose in bad markets vs the benchmark? The 2022 comparison (JEPI -3.53% vs S&P -19.43%) is the fund's best selling point.

4. **Upside Capture vs Downside Capture** — What % of market gains does it capture vs what % of losses? This is the definitive metric for covered call strategies.

5. **Volatility Reduction** — Beta, standard deviation vs benchmark. JEPI's 0.59 beta means it delivered 71% of S&P returns with 59% of the risk — that's excellent risk-adjusted performance.

---

## Issue 5: Percentile Rank Shows a Deteriorating Trend — Not Discussed

### What's wrong
JEPI's percentile ranks tell a clear story:
- 2021: 29th (top third — great)
- 2022: 25th (top quarter — outstanding downside protection)
- 2023: 67th (below average)
- 2024: 67th (below average)
- 2025: 70th (below average)

The fund started strong (great protection in 2022) but has fallen to the bottom third of its category in bull market years. This could mean:
- Newer competitors are doing better at capturing upside
- The options strategy is less competitive as the category grows (from 69 funds to 279)
- Or the fund is consistently conservative, which helps in down markets but hurts in up markets

The output never discusses this trajectory. It's a genuinely important insight for retail investors deciding between JEPI and newer alternatives.

### What to fix
Same as all previous ETFs — add explicit percentile rank analysis instructions to the prompt.

---

## Issue 6: The Category Is Exploding in Size — Important Context

### What's wrong
The morReturns data shows the number of funds in the category:
- 2020: 49 funds
- 2021: 69
- 2022: 85
- 2023: 92
- 2024: 127
- 2025: 174
- YTD: 279

This is a 5x increase in 5 years. JEPI was an early mover in what's now a crowded space. As the category grows, JEPI's percentile rank is worsening (from top quartile to bottom third). This competitive dynamic matters for investors — newer funds may offer better terms.

The output never mentions this. The prompt doesn't ask the model to look at category growth trends.

### What to fix
Add prompt instruction: *"If the number of investments in the category has changed significantly over the years (e.g., doubled or more), note this trend. A fund that was top quartile in a small category may become average as more competitors enter."*

---

## Issue 7: indexName Is Null — Output Assumes S&P 500

### What's wrong
The morOverview has `"indexName": null`. The output correctly infers from the strategy text that the benchmark is the S&P 500, but this should be explicit in the data. It also means the "Index" row in morReturns is the S&P 500, but this isn't labeled.

For JEPI specifically, the S&P 500 is the right reference point but the wrong performance target. The prompt should distinguish between "reference benchmark" (what the strategy is based on) and "performance target" (what success looks like).

---

## Issue 8: Category Code "DI" Not Resolved

morReturns shows `Category Name` as `"DI"` instead of "US Fund Derivative Income."

---

## Missing Data for JEPI

1. **Distribution yield** (~7-8%) — the core product, not mentioned anywhere
2. **Payout frequency** (monthly) — key selling point for income investors
3. **Options premium income vs stock dividends breakdown** — helps investors understand where the yield comes from
4. **Upside/downside capture ratio** — the definitive metric for this strategy type
5. **Expense ratio** (0.35%) — relevant because it's higher than passive ETFs

---

## What JEPI Reveals About the Prompt (Beyond Bond ETFs)

JEPI is the first non-pure-bond ETF in our analysis, and it exposes that the prompt problems are even broader than "bond vs equity":

1. **The prompt has no concept of strategy type.** A covered call income ETF, a passive bond index fund, a leveraged equity ETF, and a money market fund would all get the same analysis structure. Each needs fundamentally different evaluation criteria.

2. **The benchmark comparison factor is one-size-fits-all.** For some strategies, trailing the benchmark IS the design. The prompt needs to know what success looks like for each strategy type.

3. **Income/yield is missing across ALL income-oriented ETFs**, not just bonds. JEPI's ~7-8% yield is the product, just like HYG's ~5-6% yield is the product.

4. **The output quality degrades when the model is confused.** JEPI is harder to analyze than a straightforward index tracker, and the model compensated with filler words rather than clearer thinking. The prompt should give more guidance for complex strategy types.

---

## Summary of Findings

| Priority | Issue | New or Recurring? |
|----------|-------|-------------------|
| **P0** | Benchmark comparison is wrong for income/derivative strategies — trailing S&P is by design | New — first non-bond ETF reveals this |
| **P0** | Income/yield missing — even more critical for JEPI (~7-8% yield is the product) | Recurring but worse here |
| **P0** | Factors don't fit income/derivative strategies at all | New variant — need strategy-specific factors |
| **P1** | Output quality degrades badly — extreme verbosity with filler adjectives | New — model struggles with complex strategies |
| **P1** | Percentile rank deterioration (top quartile to bottom third) not discussed | Recurring |
| **P1** | Category growth trend (5x in 5 years) not captured | New |
| **P1** | Strategy type (covered call) not understood by prompt | Broadens the "passive vs active" issue |
| **P2** | Share price naturally drifts down from distributions — makes MA analysis misleading | New — specific to high-distribution ETFs |
| **P2** | indexName is null, output guesses S&P 500 | Recurring data gap |
| **P3** | Category code "DI" not resolved | Recurring |
