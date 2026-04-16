# Prompt Improvement Analysis: PerformanceAndReturns — Income ETF (QQQI)

**ETF**: NEOS Nasdaq 100 High Income ETF (QQQI)  
**Category**: PerformanceAndReturns  
**Asset Class**: Equity-Derivative Hybrid — Covered Call / Options Income on Nasdaq 100  
**Date**: 2026-04-16

---

## What This ETF Is

QQQI is very similar to JEPI in concept but with important differences:
- Holds Nasdaq 100 stocks (tech-heavy) instead of S&P 500 stocks
- Sells call options on the Nasdaq 100 Index for income
- Category: "US Fund Derivative Income" (same as JEPI)
- Young fund — no 3Y/5Y data
- `$10.5B` AUM, `3.87M` daily volume — well-established despite being young
- Beta = `0.88` — higher than JEPI's `0.59`, makes sense since Nasdaq is more volatile than S&P
- `indexName` is null — benchmark not identified
- `107` holdings

---

## What the Output Got Right

Compared to JEPI's terrible output, QQQI's is significantly better:
- Much cleaner writing — fewer filler adjectives
- Correctly identifies the "strong 1Y, weak recent months" pattern
- Good factor scoring: benchmark_comparison gets Pass (beats category by 7.6pp, matches index)
- Properly flags the missing long-term data as a limitation
- The summary is concise and decision-useful

---

## Issue 1: QQQI vs JEPI — Same Strategy, Opposite Benchmark Verdict

### The interesting comparison
Both QQQI and JEPI are covered call income ETFs in the same "Derivative Income" category. But their benchmark comparisons went opposite directions:

- **JEPI**: Trails its "Index" (S&P 500) by 17pp over 1Y → Fail
- **QQQI**: Matches its "Index" (appears to be S&P 500 based on the numbers: `32.02%` 1Y) → Pass

Why? QQQI returned `32.18%` which happened to nearly match the S&P 500's `32.02%`. But QQQI is a Nasdaq 100 options strategy — if the Nasdaq 100 returned ~35%+ that year, QQQI actually underperformed its underlying exposure (as expected for a covered call strategy). The "Index" row appears to be S&P 500 for both, not the Nasdaq 100.

This means QQQI gets a free Pass because its underlying (Nasdaq 100) outperformed the comparison index (S&P 500) so much that even after giving up upside via options, QQQI still matched the S&P. Meanwhile JEPI, whose underlying (S&P 500) IS the comparison index, naturally trails.

### What's wrong
The benchmark comparison is comparing apples to oranges. A Nasdaq-based strategy compared to S&P 500 is not a fair test. The right comparison for QQQI should be the Nasdaq 100 index (QQQ), not the S&P 500.

### What to fix
The prompt needs: *"If the ETF's underlying exposure is different from the comparison index (e.g., a Nasdaq 100 strategy compared to S&P 500), note this mismatch. Ideally compare to both the category and the ETF's actual underlying index."*

Also, the data pipeline should populate `indexName` correctly so the model knows what it's comparing against.

---

## Issue 2: Income/Yield Is the Product — Completely Missing (Again)

### What's wrong
QQQI's name literally says "High Income." It distributes roughly 12-14% annual yield. This is even higher than JEPI (~7-8%). The entire point of this ETF is the income stream.

The data reveals the income story if you look closely:
- stockAnalyzerReturns 1Y total return = `34.66%`
- stockAnalyzerReturns 1Y price change = `16.72%`
- The ~18pp gap is the income/distributions

So roughly HALF of the total return came from distributions. An investor seeing `34.66%` return thinks "great growth." The reality: the price only grew 16.72%, and 18pp was cash paid out (which reduces the share price). Without this context, the analysis is misleading.

### What to fix
Same as JEPI and all income ETFs — add yield data, explain income vs price return split.

---

## Issue 3: The Price Change Data Reveals a Problem the Output Misses

### What's wrong
Look at the `change` fields (price-only) vs `return` fields (total return):
- 6M return = `-0.48%` (total) but 6M price change = `-7.27%`
- 1Y return = `34.66%` (total) but 1Y price change = `16.72%`

The price has actually been declining significantly, masked by the high income distributions. Over 6 months, investors got back their money through distributions but the share price dropped 7.27%. The total return barely breaks even.

This is a critical insight for retail investors: **the share price is eroding while distributions make the total return look fine.** This can be sustainable (if the options premium income continues) or it can be a problem (if it's return of capital rather than real income).

The output never discusses this because the prompt doesn't distinguish price return from total return.

### What to fix
For high-distribution ETFs (yield > 5%), add: *"Compare the total return to the price-only return. If the share price is declining while total return is positive, explain that distributions are masking price erosion. This is important for investors who need capital preservation alongside income."*

---

## Issue 4: Category Is Growing Fast — QQQI Is a Top Performer in It

### What's right but underemphasized
The category grew from 127 funds (2024) to 279 (YTD) — more than doubled in ~1 year. QQQI ranks at the 27th percentile (top quartile) over 1Y among these 199 peers. That's genuinely impressive.

### What's missing
The output mentions it "beats category by 7.62pp" but doesn't contextualize that this category is exploding in size with new entrants. Being top quartile in a rapidly growing, competitive category is a stronger signal than just the raw number suggests.

---

## Issue 5: Factors — Same Problems as JEPI + Young Fund Issues

**long_term_cagr** = Fail (no data). Same as EAGL — correct but uninformative for a young fund.

**short_term_returns** = Pass. The output gives Pass because 1Y is +34.66%, despite 1M/3M/YTD all being negative. This is the same inconsistency we saw in other ETFs. Here it's even more misleading because the 1Y includes ~18pp of distributions — the price-only 1Y is only +16.72%.

**returns_consistency** = Fail (no multi-year data). Same young fund issue.

**benchmark_comparison** = Pass. As discussed in Issue 1, this is based on a mismatched benchmark (S&P 500 vs Nasdaq 100 underlying).

**price_trend_momentum** = Fail. Below all MAs, RSI neutral. Fair call.

### What to fix
Same as JEPI/EAGL — factors need strategy-type and fund-age awareness.

---

## Missing Data for QQQI

1. **Distribution yield** (~12-14%) — this IS the product
2. **Payout frequency** (monthly) — key for income investors
3. **Underlying index performance** (Nasdaq 100 / QQQ return) — needed for fair benchmark comparison
4. **Options strategy details** — how much upside is capped?
5. **Return of capital vs income** — is the yield sustainable?

---

## Summary of Findings

| Priority | Issue | New or Recurring? |
|----------|-------|-------------------|
| **P0** | Benchmark mismatch — Nasdaq 100 strategy compared to S&P 500 | New — reveals indexName null is critical |
| **P0** | Income/yield missing — 12-14% yield is the entire product | Recurring (JEPI, all bond ETFs) |
| **P0** | Price erosion masked by distributions — 6M price -7.27% but total -0.48% | New — first ETF where this is stark |
| **P1** | Factors useless for young fund (2/5 just "no data → Fail") | Recurring (EAGL) |
| **P1** | Category growth context (127→279 funds) underemphasized | Recurring (JEPI) |
| **P2** | short_term_returns Pass includes 18pp of distributions in 1Y figure | Recurring — worse here due to high yield |
| **P3** | Category code "DI" not resolved | Recurring |
