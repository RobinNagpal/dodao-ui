# Prompt Improvement Analysis: PerformanceAndReturns — Bond ETF (AAA)

**ETF**: Alternative Access First Priority CLO Bond ETF (AAA)  
**Category**: PerformanceAndReturns  
**Asset Class**: Fixed Income — Securitized Bond (CLO)  
**Date**: 2026-04-16

---

## Executive Summary

The current prompt produces a competent general-purpose ETF analysis but has significant blind spots when applied to **bond ETFs**. The core issues are: (1) no asset-class awareness, (2) missing yield/income dimension which is the primary reason retail investors buy bond ETFs, (3) technical analysis thresholds calibrated for equities, (4) a ±2pp comparison threshold that is too coarse for low-return fixed income, and (5) a binary Pass/Fail system that cannot express nuance for young funds with missing data.

---

## Issue 1: No Asset-Class Awareness — One Prompt Fits All

### Problem
The prompt treats every ETF identically regardless of whether it is an equity ETF, bond ETF, commodity ETF, or alternative strategy. A CLO bond ETF returning `6.51%` CAGR is performing excellently for its asset class, but the prompt's framing implicitly benchmarks against equity-like expectations (e.g., emphasizing "wealth creation" language, momentum-style technical analysis).

### Evidence in Output
- Paragraph 5 spends ~200 words on MA crossovers and RSI for a fund trading in a `$24.33–$25.14` range (only `3.3%` total range). These technical signals are nearly meaningless for a bond ETF — its price is driven by interest rates and credit spreads, not momentum.
- The output says the ETF is "trapped in a technical downtrend" when the price is only `$0.12` below the MA20. For a bond ETF, this is noise, not a trend.

### Suggested Fix
- Add an **asset class context** section to the prompt. The prompt should receive the ETF's asset class (equity, fixed income, commodity, alternative) and adjust:
  - The weight given to technical analysis (de-emphasize for bonds)
  - The language used (e.g., "income generation" vs "wealth creation")
  - The comparison thresholds (see Issue 4)
- Alternatively, add a conditional block: *"If this is a fixed-income ETF, reduce emphasis on momentum/technicals in Paragraph 5 and instead discuss yield trajectory, interest rate sensitivity context, and credit quality implications on returns."*

---

## Issue 2: Missing Yield/Income Dimension — The Biggest Gap

### Problem
**Retail investors buy bond ETFs primarily for income.** The prompt has zero mention of:
- Distribution yield / SEC yield
- Income return vs. price return breakdown
- Yield-to-maturity or yield-to-worst of underlying holdings
- How the income stream compares to category/benchmark

The input schema (`performance-and-returns-input.schema.yaml`) also does not include any yield fields. This is a fundamental data gap for fixed-income analysis.

### Evidence in Output
- The entire 2000+ word analysis never mentions the word "yield" or "income" except when quoting the strategy text.
- A retail investor reading this would have no idea what cash flow they can expect from this ETF, which is the #1 question for bond ETF buyers.
- The output discusses `6.51%` CAGR but doesn't clarify how much came from price appreciation vs. coupon income — a critical distinction because price gains can reverse but income is locked in.

### Suggested Fix
- **Schema change**: Add yield-related fields to the input schema:
  - `distributionYield` or `secYield`
  - `incomeReturn` vs `priceReturn` breakdown (if available from data sources)
- **Prompt change**: Add a conditional paragraph or sub-section for bond ETFs:
  - *"If this is a fixed-income ETF, include a discussion of income/yield characteristics. Explain how much of the total return comes from income vs. price change. Compare the yield to category average if available."*
- **Factor addition**: Consider adding a `yield_and_income` factor for bond ETF categories, or make the existing factors yield-aware.

---

## Issue 3: ±2 Percentage Point Threshold Is Too Coarse for Bonds

### Problem
The prompt defines comparison rules as:
- `>= 2pp better` = **Strong**
- `within ±2pp` = **In Line**
- `>= 2pp worse` = **Weak**

For an equity ETF returning 15–25% annually, a 2pp gap is reasonable. For a bond ETF returning 5–7% annually, a 2pp gap represents **30–40% of the total return**. This makes the threshold far too generous.

### Evidence in Output
- The 1-year return of `5.24%` vs category `6.32%` (gap: `-1.08pp`) is labeled "In Line." But for a bond ETF, underperforming by 1pp on a 5–6% return is significant — it means the investor gave up ~17% of the available return.
- The 3-year ETF return of `6.51%` vs index `3.97%` (gap: `+2.54pp`) is labeled "Strong." This is correct, but barely crosses the threshold despite being a massive outperformance in bond terms.

### Suggested Fix
- Use **asset-class-adjusted thresholds**. For fixed-income ETFs:
  - `>= 1pp better` = **Strong**
  - `within ±1pp` = **In Line**
  - `>= 1pp worse` = **Weak**
- Or use a **relative threshold** (percentage of return rather than absolute pp):
  - `>= 15% relative outperformance` = **Strong**
  - `within ±15%` = **In Line**
  - `>= 15% relative underperformance` = **Weak**

---

## Issue 4: Pass/Fail Is Too Binary — Especially for Young Funds

### Problem
The binary Pass/Fail system cannot express:
- "Pass but with caveats" (e.g., good 3Y data but no 5Y/10Y history)
- "Borderline" cases
- "Not applicable" (e.g., long_term_cagr when none of the defined metrics exist)

### Evidence in Output
- `long_term_cagr` gets **Pass** despite having **zero** of its defined metrics (cagr5y, cagr10y, cagr15y, cagr20y). The model substituted cagr3y, which is technically "short/medium term," not "long term." This is misleading — a retail investor sees "Long-Term CAGR: Pass" and assumes there's a strong 5–10 year track record.
- `short_term_returns` gets **Fail** even though the 1Y return of `5.24%` is solid. The Fail is driven by the `-0.12%` 1-month dip, which is trivial for a bond ETF.

### Suggested Fix
- Consider a **3-tier system**: `Pass`, `Neutral/Mixed`, `Fail`
- Or add a **confidence qualifier**: `Pass (limited data)`, `Pass (strong data)`
- For `long_term_cagr` specifically: if none of the primary metrics exist, the result should be `"Insufficient Data"` or `"Neutral"` rather than forcing a Pass/Fail on substitute data.
- Add a prompt rule: *"If fewer than half of the defined metrics for a factor are available, note this limitation prominently and consider a 'Mixed' or 'Insufficient Data' rating rather than forcing Pass/Fail."*

---

## Issue 5: Percentile Rank Data Is Severely Underutilized

### Problem
The morReturns data contains rich percentile and quartile rank information that tells a compelling story about the fund's trajectory within its category. The prompt doesn't instruct the model to use this data systematically.

### Evidence in Output
- The morReturns show a **deteriorating trend**: percentile rank went from `8` (top decile) in 2021 to `96` (bottom 4%) in 2025 for annual returns. This is a dramatic decline in relative standing.
- The trailing data shows similar weakness: 84th percentile over 1-year (bottom quartile), 67th over 3-year, but 39th over 5-year (above median).
- The output mentions quartile ranks only in passing and never highlights this deteriorating trajectory, which is arguably the most important insight for a retail investor.

### Suggested Fix
- Add explicit instructions in the prompt: *"Use percentile rank and quartile rank data from morReturns to show where the ETF stands within its category. Highlight any trend in rankings over time (improving, stable, or deteriorating). A fund dropping from top quartile to bottom quartile across consecutive years is a significant red flag."*
- Consider adding a factor or sub-analysis for **"Category Rank Trajectory"**.

---

## Issue 6: NAV Return vs. Price Return Distinction Missing

### Problem
For ETFs — especially thinly traded ones — the gap between price return and NAV return can be meaningful. The morReturns data provides both `Investment (Price)` and `Investment (NAV)` rows, but the prompt never instructs the model to compare or discuss the difference.

### Evidence in Output
- In 2025, price return is `4.92%` but NAV return is `5.12%` — a `0.20pp` gap. For 2023, price return is `8.94%` vs NAV `8.34%` — a `0.60pp` gap in the opposite direction.
- These gaps indicate periods where the ETF traded at premiums or discounts to NAV, which matters for a fund with only `1,489` daily volume.
- The output never mentions this distinction.

### Suggested Fix
- Add to the prompt: *"If both price return and NAV return data are available, note any significant divergence. For thinly traded ETFs, a persistent gap between price and NAV returns may indicate liquidity issues or premium/discount patterns that affect real investor experience."*

---

## Issue 7: The 1800–2300 Word Target Encourages Padding

### Problem
The strict word count target of `1800–2300` words for overallAnalysisDetails incentivizes verbose, padded writing. For a simple, low-volatility bond ETF with limited data, there isn't enough substance to fill 2000 words without repetition.

### Evidence in Output
- Multiple paragraphs restate the same numbers. The `6.51%` 3-year CAGR appears in the summary, paragraph 1, paragraph 3, paragraph 4, paragraph 6, paragraph 7, and multiple factor analyses.
- Phrases like "for retail investors" and "for patient investors" are filler.
- Paragraph 6 (risk context) repeats the beta and volume figures already covered in the summary and paragraph 1.

### Suggested Fix
- Change the word target to a **range based on data availability**: *"Target 1200–1800 words if data is limited (e.g., fund age < 5 years, missing long-term data). Target 1800–2300 words only when sufficient data across all periods is available."*
- Or simply change to: *"Write as much as the data justifies. Do not pad to reach a word count."*
- Add a stronger anti-repetition rule: *"Each specific number should appear in at most 2 locations across the entire output: once in the detailed analysis and once in the factor analysis. The overallSummary may reference numbers but should not repeat figures that will appear in every paragraph."*

---

## Issue 8: Missing Benchmark Identity Handling

### Problem
The morOverview has `"indexName": null` — the benchmark index is unknown. Yet the morReturns data contains "Index" return rows. The prompt doesn't instruct the model on how to handle this disconnect.

### Evidence in Output
- The output repeatedly references "the index" and "the benchmark" without ever identifying what index is being compared against. A retail investor reading this has no idea what they're being compared to.
- This undermines the entire benchmark comparison paragraph.

### Suggested Fix
- Add to the prompt: *"If the index/benchmark name is not provided in morOverview but index return data exists in morReturns, explicitly note that the benchmark identity is unknown and present the comparison with that caveat. If possible, try to identify the benchmark from available context (category, strategy text)."*
- Better yet: ensure the data pipeline populates `indexName`. This is likely a data-fetching gap in `EtfMorAnalyzerInfo`.

---

## Issue 9: Category Name Shows as Coded Value "S1"

### Problem
The morReturns annual data shows `Category Name` values as `"S1"` rather than the full category name. This appears to be a data-mapping issue.

### Evidence in Output
- The output doesn't mention this, but it means category identification across years may be unreliable.
- If the category changed (which would show as different codes across years), the comparison would be invalid — the prompt doesn't address this.

### Suggested Fix
- Fix the data pipeline to map category codes to full names.
- Add a prompt instruction: *"If category names change across years in the annual returns data, note this explicitly as it means the comparison baseline shifted."*

---

## Issue 10: No Guidance on How to Handle Very Small/New Funds

### Problem
AAA has only `$39.9M` AUM, `1,489` daily volume, and `34` holdings. It only has data back to 2021. The prompt treats this the same as a `$100B` fund with 20 years of history.

### Evidence in Output
- The output mentions small size as a risk but doesn't adequately convey how fundamentally this changes the reliability of all other analysis. Statistical confidence in 3-year returns with a small, illiquid fund is much lower than for a large, established fund.
- The long_term_cagr factor gets a "Pass" even though the fund barely has 4 years of history.

### Suggested Fix
- Add an **early-stage fund disclaimer** instruction: *"If the ETF has less than 5 years of history or AUM below $100M, open the analysis with a clear note that the performance track record is limited and all conclusions should be interpreted with that context. Adjust factor scoring conservatively for young funds."*

---

## Summary of Recommended Changes

| Priority | Issue | Type | Fix Complexity |
|----------|-------|------|---------------|
| **P0** | No yield/income analysis for bond ETFs | Schema + Prompt | Medium — requires new data fields |
| **P0** | No asset-class awareness | Prompt | Low — add conditional sections |
| **P1** | ±2pp threshold too coarse for bonds | Prompt | Low — add asset-class-adjusted thresholds |
| **P1** | Percentile rank data underutilized | Prompt | Low — add explicit instructions |
| **P1** | Pass/Fail too binary for missing data | Prompt + Output schema | Medium |
| **P2** | Word count target encourages padding | Prompt | Low |
| **P2** | NAV vs price return distinction missing | Prompt | Low |
| **P2** | Missing benchmark identity handling | Prompt + Data pipeline | Low–Medium |
| **P2** | Small/new fund handling | Prompt | Low |
| **P3** | Category name shows as coded "S1" | Data pipeline | Low |
