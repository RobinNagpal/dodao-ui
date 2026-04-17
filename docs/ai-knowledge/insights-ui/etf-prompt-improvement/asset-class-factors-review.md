# Review: Asset-Class-Specific Analysis Factors for PerformanceAndReturns

**Date**: 2026-04-16
**Context**: The new `factorsByAssetClass` structure in `etf-analysis-factors.json` replaces the old one-size-fits-all factor set with asset-class-specific factors for Equity, Fixed Income, Alternatives, Commodity, Asset Allocation, and Currency.

This review evaluates the new factors against the findings from all 11 ETF prompt analyses.

---

## Overall Assessment: Strong Improvement

The new factor structure directly addresses the single biggest issue found across all 11 ETF analyses: **the old factors were designed for equities and produced misleading results for every other asset class.** The new structure fixes this at the root by giving each asset class its own factor set.

---

## Equity Factors — Well-Designed, Minor Suggestions

The 5 equity factors (long_term_cagr, short_term_returns, returns_consistency, benchmark_and_category_comparison, price_trend_momentum) are a clear upgrade from the originals:

**What's good:**
- `short_term_returns` now explicitly distinguishes "recent momentum (1M, 3M)" from "trailing performance (6M, 1Y)" — this was a key issue seen in VOO/VUG where +31% 1Y got Fail because 1M was -3%.
- `benchmark_and_category_comparison` now includes rules for passive vs active ETFs and the "persistent trailing" pattern (trails in every period even if within ±2pp) — directly addresses the IWD and TLT findings.
- `price_trend_momentum` now has beta-adjusted severity and clarifies that above MA200 + neutral RSI = not a Fail — fixes the VOO/VUG issue where normal -5% corrections were scored as failures.
- `returns_consistency` now mandates percentile rank trend analysis — addresses the #1 recurring underutilization issue.

**Suggestions:**
- Consider mentioning that for **value ETFs** (IWD, HDV), feast-or-famine patterns (outperform in down markets, underperform in up markets) are a feature, not inconsistency. The `returns_consistency` description doesn't cover this pattern, which was the key insight from HDV analysis.
- The `benchmark_and_category_comparison` factor could note that some ETFs may have a mismatched "Index" row in morReturns (e.g., HDV's actual benchmark is Morningstar Dividend Yield Focus but the comparison index appears to be Russell 1000 Value). The factor description could add: "If the comparison index returns appear mismatched with the ETF's stated indexName, note this discrepancy."

---

## Fixed Income Factors — Excellent, Addresses All Major Bond ETF Issues

The 5 bond factors (tracking_and_benchmark_alignment, total_return_compounding, income_contribution, category_relative_standing, interest_rate_and_environment_resilience) are a massive improvement:

**What's good:**
- `tracking_and_benchmark_alignment` is now the **lead factor** — correctly reflects that tracking precision is the #1 metric for bond ETFs. The old setup had no tracking concept. The sub-type-specific thresholds (0.5pp for treasury/aggregate, 1.0pp for high-yield) directly address findings from AGG/TLT/HYG.
- `income_contribution` is an entirely new factor that fills the biggest gap identified across ALL bond ETFs. It explicitly instructs comparing return fields vs change fields to quantify income — this was the core of the "6pp unexplained gap" issue in TLT.
- `total_return_compounding` properly frames bond returns (2-6% is normal) and says "attribute to asset class, not ETF failure" — directly fixes the AGG "4 Fails for a perfect tracker" problem.
- `category_relative_standing` mandates percentile trend analysis and notes that 40-60th percentile is acceptable for passive bond ETFs — addresses the HYG finding.
- `interest_rate_and_environment_resilience` adds the rate context that was completely missing from TLT analysis — the most critical gap for long-duration bond ETFs.

**Suggestions:**
- The `income_contribution` factor should also reference `yieldAndIncome` data (dividendYield, secYield, ttmYield) now that we pass it — the factor currently only references return vs change comparison, but the actual yield numbers are the most direct measure.
- `tracking_and_benchmark_alignment` should mention that if indexName is null and the model can't identify the benchmark, this factor may not be fully evaluable — suggest a "Mixed" rather than forced Pass/Fail.

---

## Alternatives Factors — Good, Covers the JEPI/QQQI Issues

The 5 alternatives factors (total_return_delivery, income_vs_price_return, category_outperformance, downside_protection, price_trend_momentum) are well-targeted:

**What's good:**
- `category_outperformance` correctly says category comparison is more meaningful than benchmark for income strategies — fixes the JEPI "Fail because it trailed S&P 500 by design" problem. Also catches category growth trends (49 → 279 funds).
- `downside_protection` is a dedicated factor — exactly what was needed for JEPI's 2022 story (-3.53% vs S&P's -19.43%).
- `income_vs_price_return` addresses the "price erosion masked by distributions" issue found in QQQI (6M price -7.27% but total -0.48%).
- `price_trend_momentum` correctly warns about distribution-driven price drift — addresses the JEPI/QQQI issue where MA analysis was misleading for high-distribution funds.

**Suggestions:**
- `total_return_delivery` says "judge against what's realistic for the strategy type" but doesn't give ranges. Could add: "A covered call equity strategy typically delivers 60-80% of the underlying index's total return with significantly lower volatility." This helps the model calibrate expectations.
- Consider whether `category_outperformance` should also note the benchmark mismatch issue found in QQQI — a Nasdaq 100 strategy compared to S&P 500 gets an unfair comparison. The factor could say: "If the ETF's underlying exposure differs from the comparison index in morReturns, note this mismatch."

---

## Commodity Factors — Reasonable, Less Data to Validate Against

We didn't analyze any commodity ETFs in our 11-ETF review, so these are harder to validate. The factors look reasonable based on general commodity ETF knowledge:
- Contango/roll cost awareness in `benchmark_tracking` is good
- Cyclicality awareness in `returns_consistency` is appropriate
- Momentum being "particularly meaningful" for commodities is correct

No specific suggestions without real data to test against.

---

## Asset Allocation Factors — Reasonable

Similar to commodity — no test data. The emphasis on "smoother returns" and drawdown comparison to pure equity/bond is appropriate for balanced funds.

---

## Currency Factors — Reasonable

No test data. The focus on short-term returns and mean-reversion awareness is appropriate.

---

## Cross-Cutting Issues Still Not Fully Addressed by Factors Alone

These issues from the 11-ETF analysis require prompt-level changes beyond just the factor definitions:

1. **Young fund handling** — The `missing-data-in-performance-prompt-input.md` doc correctly says this should be at the prompt level, not factor level. The prompt needs a rule: "If the ETF has <3 years of history, do not Fail factors for missing data." The equity long_term_cagr description mentions this but other asset classes' equivalent factors don't.

2. **Output format consistency** — VUG used `[Paragraph 1]` brackets, VOO used natural paragraphs, TLT used bold headers. Factors can't fix this — the prompt's output format instructions need to be explicit.

3. **Tone calibration** — TLT's "wealth destruction" language was the worst example. The factors now properly frame bond returns, but the prompt should also add: "Match tone to what the ETF is designed to do. Don't use failure language for an ETF that accurately tracked a declining asset class."

4. **Category code resolution** — "S1", "GL", "HY", "CI", "LV", "LB", "LG", "DI" appearing instead of full category names is a data pipeline issue, not a factor issue.

5. **Word count padding** — The 1800-2300 word target still encourages filler. The factors are much improved, but the prompt's word count rule should be adjusted to "write as much as the data justifies" rather than a fixed range.

---

## Summary

| Asset Class | Factor Quality | Key Strength | Key Gap |
|---|---|---|---|
| **Equity** | Very Good | Beta-adjusted momentum, passive vs active awareness | Feast-or-famine pattern for defensive value ETFs |
| **Fixed Income** | Excellent | Tracking precision as lead factor, income contribution factor | Income factor should also reference yield data fields |
| **Alternatives** | Good | Category comparison over benchmark, downside protection | Benchmark mismatch for non-S&P underlying strategies |
| **Commodity** | Reasonable | Contango awareness | Untested — no commodity ETFs in our analysis |
| **Asset Allocation** | Reasonable | Smoother-returns emphasis | Untested |
| **Currency** | Reasonable | Short-term focus, mean-reversion | Untested |

**Overall verdict:** The new asset-class-specific factors are a significant improvement that addresses the majority of issues identified in the 11-ETF analysis. The remaining gaps are mostly at the prompt level (tone, format, word count) rather than in the factor definitions.
