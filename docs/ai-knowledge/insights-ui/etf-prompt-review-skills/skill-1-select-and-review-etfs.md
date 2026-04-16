# Skill 1: Select Random ETFs by Asset Class & Review Prompts

## Goal

Pick 4 diverse ETFs from each asset class, fetch their data (Morningstar + StockAnalyzer + financial info), review the LLM-generated analysis output, and write a per-ETF prompt improvement document — identifying what the prompt gets right, what it gets wrong, which factors are relevant or irrelevant for this specific ETF type, and what concrete changes would improve the output.

---

## Step 1: Select 4 ETFs per Asset Class

### Asset Classes

The platform has 6 asset classes (from `ETF_ASSET_CLASS_OPTIONS` in `insights-ui/src/utils/etf-filter-utils.ts`):

| Asset Class | Examples |
|---|---|
| Equity | SPY, VOO, QQQ, VUG, HDV, IWD, EAGL |
| Fixed Income | AGG, TLT, HYG, BND, AAA |
| Commodity | GLD, SLV, USO, DBC |
| Alternatives | QAI, BTAL, MNA |
| Multi-Asset | AOM, AOR, AOK |
| Currency | UUP, FXE, FXY |

### Selection Criteria

Pick **4 ETFs per asset class** with diversity across these dimensions:

1. **Famous / large AUM** — a household-name ETF everyone knows (e.g., SPY, GLD, AGG)
2. **Mid-tier / category leader** — well-known but not the biggest (e.g., HDV, HYG, SLV)
3. **Relatively new / young fund** — launched in the last 3-5 years, smaller AUM (e.g., EAGL, QQQI)
4. **Niche / unusual strategy** — different sub-strategy within the asset class (e.g., AAA for CLO bonds, JEPI for covered call income)

### How to Fetch the ETF List

Use the **ETF listing API** to browse ETFs filtered by asset class:

```
GET https://koalagains.com/api/koala_gains/etfs-v1/listing?assetClass={assetClass}&page=1&limit=100
```

Replace `{assetClass}` with: `Equity`, `Fixed Income`, `Commodity`, `Alternatives`, `Multi-Asset`, `Currency`

The response returns `EtfListingResponse` with fields: `id`, `symbol`, `name`, `exchange`, `aum`, `expenseRatio`, `holdings`, `beta`, `hasMorAnalyzerInfo`, `hasMorRiskInfo`, `hasMorPeopleInfo`.

**Important**: Only pick ETFs that have `hasMorAnalyzerInfo: true` — we need Morningstar data for the review.

Sort by AUM to identify large vs small ETFs. Check `holdings` and `expenseRatio` for diversity. Look at the `name` to identify different sub-strategies within the asset class.

### If an Asset Class Has Fewer Than 4 ETFs

Some asset classes (Commodity, Alternatives, Multi-Asset, Currency) may have fewer ETFs in the database. In that case, review all available ETFs in that class.

---

## Step 2: Fetch Data for Each Selected ETF

For each selected ETF, fetch these data sources:

### 2a. Morningstar Data

```
GET https://koalagains.com/api/koala_gains/etfs-v1/exchange/{exchange}/{symbol}/mor-info
```

Returns: `morAnalyzerInfo`, `morRiskInfo`, `morPeopleInfo`, `morPortfolioInfo` (all nullable).

Key fields in `morAnalyzerInfo`:
- `returnsAnnual` — year-by-year returns with Index, Category, and fund returns
- `returnsTrailing` — trailing period returns (1M, 3M, 1Y, 3Y, 5Y, 10Y, 15Y)
- `overviewCategory`, `overviewStyleBox` — Morningstar classification
- `overviewTotalAssets`, `overviewAdjExpenseRatio`, `overviewTurnover`
- `strategyText` — Morningstar's description of the fund's strategy
- `analysis` — Morningstar analyst assessment sections

Key fields in `morRiskInfo`:
- `riskPeriods` — risk metrics by period (3Y, 5Y, 10Y) including capture ratios, risk levels, risk scores

### 2b. Analysis Output (LLM-Generated)

```
GET https://koalagains.com/api/koala_gains/etfs-v1/exchange/{exchange}/{symbol}/analysis
```

Returns: `categories[]` — each with `categoryKey`, `summary`, `overallAnalysisDetails`, and `factorResults[]` (each with `factorKey`, `oneLineExplanation`, `detailedExplanation`, `result` = Pass/Fail).

**This is the main thing we're reviewing** — the LLM-generated analysis output.

### 2c. Cached Scores

```
GET https://koalagains.com/api/koala_gains/etfs-v1/exchange/{exchange}/{symbol}/scores
```

Returns per-category Pass counts and final score.

### 2d. Financial Data Page (Visual Reference)

```
https://koalagains.com/etfs/{exchange}/{symbol}/financial-data
```

Shows all raw financial data for visual inspection.

### 2e. ETF Detail Page (to see how the analysis renders)

```
https://koalagains.com/etfs/{exchange}/{symbol}
```

Shows the spider chart, analysis sections, and factor results as a retail investor would see them.

---

## Step 3: Review Each ETF's Analysis

For each ETF, review all 3 category analysis outputs (PerformanceAndReturns, CostEfficiencyAndTeam, RiskAnalysis) and evaluate:

### 3a. What the Prompt Gets Right

- Is the summary clear and decision-useful for a retail investor?
- Are the factor Pass/Fail scores reasonable given the data?
- Is the tone appropriate for this type of ETF?
- Does it use the data sources effectively?

### 3b. What Can Be Improved in the Prompt

- Missing data that should be in the input schema (e.g., yield/income for bond ETFs)
- Missing context the prompt should instruct the LLM to provide (e.g., asset-class norms)
- Thresholds that need adjustment (e.g., ±2pp comparison threshold)
- Instructions that are too vague or ambiguous

### 3c. Weaknesses

- Factor scores that are clearly wrong or misleading
- Conclusions that would confuse or mislead a retail investor
- Data that is available but ignored or underutilized (e.g., percentile ranks)
- Tone issues (too dramatic, too verbose, filler text)

### 3d. Factor Relevance for This Specific ETF

This is critical — the 15 factors were designed for equity ETFs. For each factor, assess:

- **Fully relevant** — factor makes sense and scoring is appropriate
- **Partially relevant** — factor applies but needs adjusted thresholds or interpretation
- **Not relevant** — factor doesn't make sense for this ETF type (e.g., momentum analysis for bond ETFs)
- **Missing factor** — important aspect of this ETF that no factor covers (e.g., yield analysis, tracking precision)

### 3e. Other Observations

- Price return vs total return confusion
- Benchmark mismatch (comparing to wrong index)
- Active vs passive fund distinction
- Young fund handling (insufficient data scored as Fail)
- Category code not resolved to full name
- indexName null issues
- Output format inconsistencies across ETFs

---

## Step 4: Write Per-ETF Review Documents

### File Naming Convention

```
docs/ai-knowledge/insights-ui/etf-prompt-improvement/{category}-{asset-class-slug}-{symbol}.md
```

Examples:
- `performance-and-returns-equity-etf-SPY.md`
- `cost-efficiency-and-team-bond-etf-AGG.md`
- `risk-analysis-commodity-etf-GLD.md`

### Document Structure

Follow this template (based on existing reviews like `performance-and-returns-equity-etf-VOO.md`):

```markdown
# Prompt Improvement Analysis: {CategoryName} — {AssetClassDescription} ({SYMBOL})

**ETF**: {Full ETF Name} ({SYMBOL})
**Category**: {CategoryName}
**Asset Class**: {AssetClass} — {SubCategory} ({Active/Passive})
**Date**: {YYYY-MM-DD}

---

## What This ETF Is

Brief description: AUM, what it tracks/does, number of holdings, how it fits in the market.

---

## What the Output Got Right

List what the analysis did well before listing problems.

---

## Issue 1: {Issue Title}

### What's wrong
Describe the specific problem with concrete data points.

### Why it matters
Explain impact on retail investor understanding.

### What to fix in the prompt
Provide specific prompt instruction text that would fix this issue.

---

## Issue N: ...

(Repeat for each major issue, typically 5-8 issues)

---

## Missing Data for {SYMBOL}

List data fields that should be in the input schema but aren't.

---

## Summary of Findings

| Priority | Issue | New or Recurring? |
|----------|-------|-------------------|
| **P1** | ... | ... |
| **P2** | ... | ... |
| **P3** | ... | ... |
```

---

## Step 5: Write Cross-ETF Summary

After reviewing all ETFs, create a summary document:

```
docs/ai-knowledge/insights-ui/etf-prompt-improvement/prompt-improvement-summary-{batch-name}.md
```

This should:
1. List the 6-7 most important issues per ETF (condensed from the per-ETF files)
2. Identify cross-cutting issues that affect multiple ETFs
3. Categorize fixes by type: Schema changes, Prompt instruction changes, Data pipeline fixes, Factor redesign
4. Prioritize: what fixes would have the biggest impact on analysis quality

---

## Reference: Analysis Categories and Factors

The 3 analysis categories and their 5 factors each are defined in:
`insights-ui/src/etf-analysis-data/etf-analysis-factors.json`

### PerformanceAndReturns
1. `long_term_cagr` — CAGR over 5/10/15/20 years
2. `short_term_returns` — 1M, 3M, 6M, YTD, 1Y returns
3. `returns_consistency` — stability across time periods
4. `benchmark_comparison` — vs index and category average
5. `price_trend_momentum` — price vs moving averages, RSI

### CostEfficiencyAndTeam
1. `expense_ratio` — cost vs category
2. `fund_size_liquidity` — AUM, volume, spread
3. `portfolio_turnover` — trading frequency
4. `management_quality` — team tenure, issuer reputation
5. `mor_assessment` — Morningstar medalist rating

### RiskAnalysis
1. `volatility_measures` — beta, std dev, ATR
2. `risk_adjusted_returns` — Sharpe, Sortino ratios
3. `drawdown_analysis` — max drawdown, recovery
4. `capture_ratios` — upside/downside capture
5. `risk_vs_category` — risk score vs peers

---

## Reference: Input Data Sources

The input JSON for each category is prepared by functions in:
`insights-ui/src/utils/etf-analysis-reports/etf-report-input-json-utils.ts`

- `preparePerformanceAndReturnsInputJson()` — StockAnalyzer returns/technicals, Mor returns/overview, financial summary
- `prepareCostEfficiencyAndTeamInputJson()` — financial info, fund info, Mor analysis, management, portfolio turnover
- `prepareRiskAnalysisInputJson()` — risk metrics (beta, Sharpe, Sortino), Mor risk periods, financial risk context

---

## Reference: Previous Reviews

Existing prompt improvement analysis files are at:
`docs/ai-knowledge/insights-ui/etf-prompt-improvement/`

These cover 11 ETFs (AAA, AGG, HYG, TLT, EAGL, HDV, IWD, VOO, VUG, JEPI, QQQI) — all for the PerformanceAndReturns category only. The cross-cutting issues identified there should be checked against the new ETFs selected by this skill.
