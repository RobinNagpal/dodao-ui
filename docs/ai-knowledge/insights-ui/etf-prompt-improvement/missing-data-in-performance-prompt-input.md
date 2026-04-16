# Missing Data in PerformanceAndReturns Prompt Input

**Date**: 2026-04-16

This document tracks data fields that exist in our database tables but are NOT currently passed to the PerformanceAndReturns prompt via `preparePerformanceAndReturnsInputJson()` in `insights-ui/src/utils/etf-analysis-reports/etf-report-input-json-utils.ts`.

The input schema is defined at: `insights-ui/schemas/etf-analysis/inputs/performance-and-returns-input.schema.yaml`

---

## How to Handle Young ETFs (Long-Term Data Missing)

For ETFs created after ~2020 that don't have 3Y/5Y/10Y data, this should be handled at the **prompt level**, not in the analysis factors. Reasons:
- The factors define WHAT to evaluate (e.g., "Long-Term CAGR")
- The prompt defines HOW to evaluate it (e.g., "if data is missing, don't auto-Fail")
- Creating separate factor sets for "new ETFs" vs "established ETFs" adds unnecessary complexity
- The factor descriptions already include guidance like "If the fund is less than 5 years old, note the limited history"

The prompt should include a rule like:
> "If the ETF has less than 3 years of history (3Y/5Y/10Y data missing), do not Fail the long_term_cagr factor for missing data alone. Instead, note the limited history and evaluate based on available evidence. Use inceptionDate to determine the fund's age."

---

## Data We Currently Pass to the Prompt

### From EtfStockAnalyzerInfo → `stockAnalyzerReturns`
return1m, return3m, return6m, returnYtd, return1y, return3y, return5y, return10y, return15y, return20y, cagr1y, cagr3y, cagr5y, cagr10y, cagr15y, cagr20y, change1m, change3m, change6m, changeYtd, change1y, change3y, change5y, change10y

### From EtfStockAnalyzerInfo → `stockAnalyzerTechnicals`
stockPrice, percentChange, ma20, ma50, ma150, ma200, ma20ChgPercent, ma50ChgPercent, ma150ChgPercent, ma200ChgPercent, rsi, rsiW, rsiM, ath, athDate, athChgPercent, atl, atlDate, atlChgPercent

### From EtfMorAnalyzerInfo → `morReturns`
returnsAnnual, returnsTrailing (includes fund price/NAV, category, index, quartile/percentile ranks)

### From EtfMorAnalyzerInfo → `morOverview`
overviewCategory, overviewStyleBox, overviewNav, overviewOneDayReturn, overviewTotalAssets, strategyText, indexName (from StockAnalyzerInfo)

### From EtfFinancialInfo → `financialSummary`
aum, beta, yearHigh, yearLow, volume, holdings

---

## Data We Have But Don't Pass — Organized by Priority

### P0 — Must Add (Addresses Biggest Analysis Gaps)

These fields were identified as critical missing data across our analysis of 11 ETFs (AAA, TLT, HYG, AGG, JEPI, QQQI, HDV, VOO, VUG, EAGL, IWD).

#### 1. `dividendYield` (from EtfFinancialInfo)
- **Example value**: `3.94` (for AGG), ~`5-6` for HYG, ~`7-8` for JEPI, ~`12-14` for QQQI
- **Why critical**: This is the #1 missing field. Bond ETF and income ETF investors buy primarily for yield. Across all 7 bond/income ETF analyses, yield was never mentioned because this data isn't passed. A retail investor reading about a bond ETF without seeing the yield is like reading a job listing without seeing the salary.
- **Source table**: `EtfFinancialInfo.dividendYield`

#### 2. `overviewSecYield` (from EtfMorAnalyzerInfo)
- **Example value**: `4.35%` (for AGG)
- **Why critical**: The SEC 30-day yield is the standardized, forward-looking yield that all funds must report. It's the industry standard for comparing bond funds against each other. More accurate than dividendYield for bond ETFs because it's based on current holdings, not past payments.
- **Source table**: `EtfMorAnalyzerInfo.overviewSecYield`

#### 3. `overviewTtmYield` (from EtfMorAnalyzerInfo)
- **Example value**: `3.93%` (for AGG)
- **Why critical**: Trailing 12-month yield — shows what investors actually received over the past year. Combined with dividendYield and secYield, gives a complete yield picture.
- **Source table**: `EtfMorAnalyzerInfo.overviewTtmYield`

#### 4. `payoutFrequency` (from EtfFinancialInfo)
- **Example value**: `Monthly` (for AGG, JEPI, QQQI), `Quarterly` for many equity ETFs
- **Why critical**: Monthly payout is a key selling point for income investors. The prompt should mention this in the analysis for income-oriented ETFs.
- **Source table**: `EtfFinancialInfo.payoutFrequency`

#### 5. `assetClass` (from EtfStockAnalyzerInfo)
- **Example value**: `Fixed Income` (for AGG, TLT, HYG), `Equity` (for VOO, VUG), `Alternatives` (for JEPI, QQQI)
- **Why critical**: The model needs to know the asset class to apply the right analysis framing. Currently we use it internally to pick the right factor set, but the model itself doesn't see it. Without this, the model can't distinguish between a bond ETF and an equity ETF and applies equity-style analysis to everything.
- **Source table**: `EtfStockAnalyzerInfo.assetClass`
- **Note**: Currently used only internally for factor selection. Should also be included in the prompt input so the model can adjust its analysis tone, thresholds, and framing.

#### 6. `inceptionDate` (from EtfMorPeopleInfo)
- **Example value**: `Sep 22, 2003` (for AGG), `May 20, 2020` (for JEPI)
- **Why critical**: Needed to handle young funds properly. If the model knows the fund is only 2 years old, it can skip "why is there no 10-year data?" and instead focus on the available track record. Also helps calibrate expectations — a fund that launched in 2020 hasn't seen a full market cycle.
- **Source table**: `EtfMorPeopleInfo.inceptionDate`

---

### P1 — Should Add (Improves Analysis Quality)

#### 7. `expenseRatio` (from EtfFinancialInfo)
- **Example value**: `0.03` (VOO/AGG), `0.19` (IWD), `0.49` (HYG), `0.35` (JEPI)
- **Why important**: Directly explains tracking drag. When IWD trails its index by 1.5pp, the expense ratio of 0.19% accounts for a chunk of that. When HYG trails by 0.5-1.0pp, the 0.49% expense ratio IS the tracking difference. The model can explain "the fund trails its benchmark by approximately its expense ratio, which is normal" instead of flagging it as a problem.
- **Source table**: `EtfFinancialInfo.expenseRatio`
- **Note**: Currently used in the CostEfficiencyAndTeam report. But it's also highly relevant for PerformanceAndReturns to explain benchmark tracking.

#### 8. `divGrowth3y` and `divGrowth5y` (from EtfStockAnalyzerInfo)
- **Example values**: `15.06%` (3Y) and `10.69%` (5Y) for AGG
- **Why important**: Tells investors whether the income stream is growing or shrinking. A bond ETF with rising dividends is benefiting from a rising rate environment (higher reinvestment income). A declining dividend trend is a warning sign.
- **Source table**: `EtfStockAnalyzerInfo.divGrowth3y`, `EtfStockAnalyzerInfo.divGrowth5y`

#### 9. `dividendTtm` (from EtfFinancialInfo)
- **Example value**: `3.911077` (for AGG — means $3.91 per share annually)
- **Why important**: When combined with the share price, this gives the actual dollar income per share. Useful for retail investors who think in terms of "how much cash will I get from a $10,000 investment?"
- **Source table**: `EtfFinancialInfo.dividendTtm`

---

### P2 — Nice to Have (Especially for Bond ETFs)

#### 10. `fixedIncomeStyle` (from EtfMorPortfolioInfo)
- **Example fields inside**: Effective Duration (`5.78`), Modified Duration, Effective Maturity (`8.12`), Avg Credit Rating (`AA-`), Weighted Coupon (`3.79`), Yield to Maturity (`4.57`)
- **Why useful**: For bond ETFs, effective duration is the single most important number for understanding interest rate sensitivity. A duration of 5.78 means a 1% rate increase causes roughly -5.78% price loss. This explains why AGG dropped -13% in 2022 (rates rose ~2.5%). Yield-to-maturity tells investors what return they can expect if they hold to maturity.
- **Source table**: `EtfMorPortfolioInfo.fixedIncomeStyle` (JSON field)
- **Note**: This is a JSON object, not a simple field. Would need to stringify or extract key fields.

#### 11. `overviewTurnover` (from EtfMorAnalyzerInfo)
- **Example value**: `81%` (for AGG)
- **Why useful**: High turnover ETFs have more transaction cost drag, which can explain tracking differences. An ETF with 81% turnover replaces most of its portfolio annually, generating more trading costs.
- **Source table**: `EtfMorAnalyzerInfo.overviewTurnover`

---

## Fields We Have That Are NOT Relevant for PerformanceAndReturns

These exist in the database but belong in other analysis categories or are not useful for performance analysis:

| Field | Table | Why Not Relevant |
|-------|-------|-----------------|
| `pe` | EtfFinancialInfo | Valuation metric — belongs in strategy/valuation analysis |
| `sharesOut` | EtfFinancialInfo | Fund structure — not performance-related |
| `options` | EtfStockAnalyzerInfo | Trading feature — not performance-related |
| `leverage` | EtfStockAnalyzerInfo | Strategy characteristic — could be useful but edge case |
| `country`, `region` | EtfStockAnalyzerInfo | Geographic context — not directly performance-related |
| `isinNumber`, `cusipNumber` | EtfStockAnalyzerInfo | Identifiers — not analysis data |
| `analysis` | EtfMorAnalyzerInfo | Analyst commentary — used in CostEfficiencyAndTeam |
| `holdings` (detailed) | EtfMorAnalyzerInfo/PortfolioInfo | Holdings analysis — not performance |
| `sectorExposure` | EtfMorPortfolioInfo | Portfolio composition — could explain returns but belongs in strategy |
| `bondBreakdown` | EtfMorPortfolioInfo | Credit quality — could explain returns but more detail than needed |
| `assetAllocation` | EtfMorPortfolioInfo | Portfolio mix — belongs in strategy |

---

## Next Steps

1. Update the input schema (`performance-and-returns-input.schema.yaml`) to include the P0 and P1 fields
2. Update `preparePerformanceAndReturnsInputJson()` to pass these fields
3. Update the prompt to use the new fields in its analysis instructions
