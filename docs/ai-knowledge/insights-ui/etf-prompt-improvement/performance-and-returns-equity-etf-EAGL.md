# Prompt Improvement Analysis: PerformanceAndReturns — Equity ETF (EAGL)

**ETF**: Eagle Capital Select Equity ETF (EAGL)  
**Category**: PerformanceAndReturns  
**Asset Class**: Equity — Large Blend/Value, Actively Managed, Concentrated (34 holdings)  
**Date**: 2026-04-16

---

## What This ETF Is

EAGL is a young, actively managed, concentrated equity fund. Key characteristics:
- Only `34` holdings — extremely concentrated for an equity ETF
- Launched recently — no 3Y/5Y/10Y data exists
- `$4.1B` AUM — decent size but small vs VOO/VUG
- Beta = `0.81` — lower volatility than the market
- Categorized as "Large Blend" by Morningstar but style box says "Large Value"
- `indexName` is null — benchmark is not identified
- Strategy says "seeks to generate investment returns superior to U.S. equity markets" — this is an active fund trying to beat the market

This is our first **actively managed, concentrated, young** equity ETF. It stress-tests the prompt in ways the passive index ETFs (VOO, VUG) did not.

---

## What the Output Got Right

- Correctly identifies the massive underperformance vs category and benchmark (7-10pp gap)
- Correctly flags the lack of long-term data as a limitation
- Mentions the 34-holding concentration risk
- All 5 factors get Fail, which is a defensible call for this specific ETF
- The tone is direct without being dramatic

---

## Issue 1: The Prompt Doesn't Know This Is an Active Fund — Changes Everything

### What's wrong
EAGL is actively managed and explicitly tries to beat the market. The prompt treats it the same as VOO (passive index tracker). But the analysis questions are fundamentally different:

**For passive ETFs (VOO):** "Did it track the index well?" → tracking precision matters
**For active ETFs (EAGL):** "Did the manager's stock picks add value?" → alpha generation matters

The output compares EAGL to the S&P 500 index (the "Index" row in morReturns appears to be S&P 500 based on the numbers matching VOO's data). This is actually the right comparison for an active fund — but the prompt doesn't tell the model to frame it as "did active management add value?"

### Why this matters
EAGL returned `21.46%` trailing 1Y vs the index's `31.82%`. The output correctly calls this "Weak." But it doesn't connect this to the core question: **the manager's active stock picks cost investors over 10 percentage points.** That's the most important insight for a retail investor deciding between EAGL and VOO.

### What to fix
Add fund type awareness: *"If the ETF is actively managed (strategy text mentions seeking returns 'superior to' a benchmark or doesn't mention index tracking), frame the benchmark comparison as 'did active management add value?' Compare the performance gap to the fund's expense ratio — if the gap exceeds expenses, the active management is destroying value, not just failing to add it."*

---

## Issue 2: The Factors Are Mostly Useless for a Fund This Young

### How each factor plays out

**long_term_cagr** — Gets Fail because no 3Y/5Y/10Y data exists. This is correct but uninformative. The factor says "data not provided" and fails it. That's all it can say. A retail investor learns nothing useful — they already know the fund is young.

**short_term_returns** — Gets Fail for negative 1M/3M/6M/YTD. Fair call, but doesn't compare to what the market did in those same periods. VOO was also down -3.40% YTD. EAGL's -5.79% YTD is worse, but by how much? The factor doesn't do relative short-term comparison.

**returns_consistency** — Gets Fail because there's only 1 year of data. Again, correct but uninformative. The factor can't evaluate consistency with 1 data point.

**benchmark_comparison** — Gets Fail for trailing the index by 10pp. This is the one genuinely useful factor evaluation. It tells the investor something meaningful: active management destroyed value here.

**price_trend_momentum** — Gets Fail for trading below MA50/MA150/MA200. Fair call. But with only ~1 year of price history, the moving averages have limited statistical meaning.

### The problem
3 out of 5 factors effectively say "not enough data" and fail. Only 2 (benchmark_comparison and short_term_returns) provide actual analysis. For a young fund, the prompt generates a lot of words saying very little.

### What to fix
- For funds under 3 years old, the prompt should say: *"If the ETF has less than 3 years of history, skip the long_term_cagr and returns_consistency factors (or mark them 'Insufficient Data' rather than Fail). Focus the analysis on benchmark comparison, short-term relative performance, and any available context about the manager's track record."*
- Add a **"Track Record Maturity"** indicator: young funds should get a prominent disclaimer that the data is too limited for confident conclusions.

---

## Issue 3: Category vs Style Box Mismatch — Not Caught

### What's wrong
- morOverview says `overviewCategory: "US Fund Large Blend"`
- morOverview says `overviewStyleBox: "Large Value"`

These don't match. The fund is categorized as "Large Blend" but its actual holdings position it as "Large Value." This means:
- The category comparison (against Large Blend peers) may not be the right benchmark
- The index comparison (against what appears to be S&P 500 = Large Blend) may be unfair if the fund is actually a value fund

With beta = 0.81 and a value tilt, comparing to the S&P 500 (+31.82%) during a growth-led rally is somewhat apples-to-oranges. If compared to a value index, the gap would be smaller.

The output never notices or discusses this mismatch.

### What to fix
Add prompt instruction: *"If the overviewCategory and overviewStyleBox don't match (e.g., categorized as 'Large Blend' but style box shows 'Large Value'), flag this mismatch. Explain that the category/benchmark comparison may not be perfectly appropriate and consider what a more fitting comparison would be."*

---

## Issue 4: Concentration Risk (34 Holdings) — Mentioned But Not Connected to Performance

### What's wrong
The output mentions "EAGL holds a highly concentrated portfolio of just 34 stocks" and says "its success relies entirely on picking a handful of big winners." But it doesn't connect this to the actual performance:

- With 34 stocks and active management, one bad pick can cost 3% of the portfolio
- The -10pp underperformance vs index could be explained by just 2-3 bad stock picks
- The 0.81 beta suggests the manager is holding defensive/value stocks, which explains trailing during a growth rally

The analysis mentions concentration as a risk but doesn't analyze it as a performance driver.

### What to fix
Add: *"For highly concentrated funds (under 50 holdings), explain how concentration affects the return pattern. A 34-stock fund's performance is much more sensitive to individual stock picks than a 500-stock index fund. Large deviations from benchmark (positive or negative) are expected, not anomalous."*

---

## Issue 5: The indexName Is Null — Output Compares to Unknown Benchmark

### What's wrong
`indexName` is null in morOverview. The morReturns "Index" row contains numbers that look like S&P 500 returns (matching VOO's data). The output compares EAGL to this unnamed index and calls the gap "severe."

But the output never says WHICH index it's comparing against. A retail investor reads "it trails its index by 10 percentage points" and has no idea what "its index" is.

### What to fix
Same recurring issue — data pipeline should populate indexName. The prompt should also require: *"Always name the benchmark when making comparisons. If indexName is null, try to identify it from the strategy text or the return data. If it cannot be identified, say 'the comparison benchmark (not identified)' rather than just 'the index.'"*

---

## Issue 6: Percentile Rank Tells a Concerning Story — Used Well Here

### What's right
The output does mention the 92nd percentile YTD ranking. This is actually one of the better uses of percentile data across all our ETFs.

### What's still missing
The annual data shows: 2025 = 36th percentile (decent), YTD = 92nd percentile (terrible). This sharp drop from 36th to 92nd in a few months is a specific, useful data point that the output doesn't highlight. It suggests the fund's recent stock picks went badly wrong very recently.

---

## Issue 7: The Summary Says Beta 0.81 Makes the Fund "Less Predictable" — That's Wrong

### What's wrong
The summary says: "With a low beta of 0.81, this ETF behaves less predictably than the broader market." This is backwards. Lower beta means MORE predictable in terms of volatility (less volatile). What the output probably means is that the low beta + active management + concentration makes it less correlated with the market. But "less predictable" from low beta is incorrect.

### What to fix
The prompt could add: *"Beta below 1.0 means the fund is less volatile than the market, not less predictable. Do not confuse lower volatility with unpredictability."*

---

## Missing Data for EAGL

1. **Expense ratio** — Critical for an active fund. If EAGL charges 0.50%+ while trailing by 10pp, that's a strong argument against it.
2. **Manager track record** — Eagle Capital has a long history as a firm. Their private fund track record would be relevant context.
3. **Benchmark identity** — indexName is null
4. **3Y/5Y/10Y history** — Fund is too young; nothing to do about this

---

## What EAGL Reveals About the Prompt

EAGL is the most interesting test case because it's the first ETF that is:
- Actively managed (not passive)
- Concentrated (34 holdings, not 500+)
- Young (no multi-year history)
- Mismatched between category and style box
- Genuinely underperforming (not just an asset class issue)

The prompt handles it okay but misses the deeper story: **this is an active manager who made bad picks during a growth-led rally while holding value-tilted, low-beta stocks.** That's the analysis a retail investor needs. Instead, they get 5 Fails with limited context.

---

## Summary of Findings

| Priority | Issue | New or Recurring? |
|----------|-------|-------------------|
| **P0** | No active vs passive fund awareness — changes what "good performance" means | New — first active ETF |
| **P1** | Factors useless for young funds (3/5 just say "data not provided") | New — first fund under 3 years |
| **P1** | Category/style box mismatch not detected (Large Blend vs Large Value) | New |
| **P1** | Concentration (34 stocks) mentioned but not connected to performance drivers | New |
| **P2** | indexName null — comparing to unnamed benchmark | Recurring |
| **P2** | Beta described as making fund "less predictable" — incorrect interpretation | New — prompt should clarify beta meaning |
| **P2** | Percentile drop (36th → 92nd) not highlighted as a specific red flag | Recurring underuse |
| **P3** | Category code "LB" not resolved | Recurring |
