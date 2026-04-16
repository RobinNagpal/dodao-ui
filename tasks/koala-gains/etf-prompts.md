# ETF Prompts — Task

## Overview

Create the ETF analysis prompt templates and supporting code infrastructure. The stock analysis pipeline already has a mature prompt system (`prompt-generator-utils.ts`, generate-prompt API route, prompt preview on detail pages). The ETF pipeline has all the backend infrastructure (Lambda invocation, schemas, input preparation, callback handling) but is missing:

1. The actual prompt templates (registered on KoalaGains platform)
2. A prompt generator utility for preview/debugging (equivalent to stock's `prompt-generator-utils.ts`)
3. An API route to generate ETF prompts on demand
4. Prompt preview actions on ETF detail pages

## 1. Prompt Generator Utility

Create `insights-ui/src/utils/etf-analysis-reports/etf-prompt-generator-utils.ts` modeled after
`insights-ui/src/utils/analysis-reports/prompt-generator-utils.ts`.

- [ ] Create `generateEtfPromptForReportType(symbol, exchange, reportType)` function
- [ ] Fetch ETF data using `fetchEtfWithAllData(symbol, exchange)` from `get-etf-report-data-utils.ts`
- [ ] Prepare input JSON using the existing per-category functions from `etf-report-input-json-utils.ts`:
  - `preparePerformanceAndReturnsInputJson(etf)` for `PERFORMANCE_AND_RETURNS`
  - `prepareCostEfficiencyAndTeamInputJson(etf)` for `COST_EFFICIENCY_AND_TEAM`
  - `prepareRiskAnalysisInputJson(etf)` for `RISK_ANALYSIS`
  - `prepareEtfFinalSummaryInputJson(etf)` for `FINAL_SUMMARY`
- [ ] Look up prompt by key from `ETF_PROMPT_KEYS` map in `etf-analysis-types.ts`
- [ ] Validate input JSON against the input schema (from `schemas/etf-analysis/inputs/`)
- [ ] Compile Handlebars template with input data using `compileTemplate()`
- [ ] Append the ETF factor analysis JSON schema for category prompts (use same output schema format as stock's `FACTOR_ANALYSIS_JSON_SCHEMA` but adapted for ETFs — reference `schemas/etf-analysis/outputs/etf-category-analysis-output.schema.yaml`)
- [ ] Append the ETF final summary JSON schema for the final summary prompt (reference `schemas/etf-analysis/etf-final-summary/etf-final-summary-analysis-output.schema.yaml`)
- [ ] Return `{ prompt, inputJson, reportType }`

## 2. Generate Prompt API Route

Create `insights-ui/src/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/generate-prompt/route.ts` modeled after
`insights-ui/src/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/generate-prompt/route.ts`.

- [ ] POST handler that accepts `{ reportType: EtfReportType }` body
- [ ] Calls `generateEtfPromptForReportType(symbol, exchange, reportType)`
- [ ] Returns `{ prompt, reportType }` response
- [ ] Uses `withErrorHandlingV2` middleware wrapper
- [ ] Define `GenerateEtfPromptRequest` and `GenerateEtfPromptResponse` interfaces

## 3. Prompt Templates (register on KoalaGains platform)

Register four prompts on the KoalaGains platform with the keys defined in `ETF_PROMPT_KEYS`:

### 3a. System Prompt (shared across all ETF prompts)

Set the system prompt on each prompt version to establish the analyst persona:

- You are a senior ETF analyst evaluating exchange-traded funds for retail investors
- Use a conservative, data-driven approach — only give "Pass" when metrics clearly support it
- Focus on what matters to long-term buy-and-hold ETF investors
- When data is missing or insufficient, default to "Fail" with explanation
- Keep language simple and accessible to retail investors

### 3b. Performance & Returns Prompt — key: `US/etfs/performance-returns`

- [ ] Input schema: `etf-analysis/inputs/performance-and-returns-input.schema.yaml`
- [ ] Output schema: `etf-analysis/outputs/etf-category-analysis-output.schema.yaml`
- [ ] Template must use Handlebars variables from `preparePerformanceAndReturnsInputJson()`:
  - `{{name}}`, `{{symbol}}`, `{{exchange}}`
  - `{{stockAnalyzerReturns}}` — JSON string with period returns and CAGR values
  - `{{stockAnalyzerTechnicals}}` — JSON string with moving averages, RSI, ATH/ATL
  - `{{morReturns}}` — JSON string with Mor annual and trailing returns (fund vs category vs index)
  - `{{morOverview}}` — JSON string with category, style box, NAV, strategy text
  - `{{financialSummary}}` — JSON string with AUM, beta, 52-week range, volume
  - `{{factorAnalysisArray}}` — array of 5 factors to evaluate
- [ ] Prompt should instruct the LLM to evaluate these 5 factors:
  1. `long_term_cagr` — Long-Term CAGR (5/10/15/20-year compound annual growth rate)
  2. `short_term_returns` — Short-Term Returns (1m/3m/6m/YTD/1y momentum)
  3. `returns_consistency` — Returns Consistency (stability across 1/3/5/10yr horizons)
  4. `benchmark_comparison` — Benchmark & Category Comparison (vs index and category average)
  5. `price_trend_momentum` — Price Trend & Momentum (moving averages, RSI)

### 3c. Cost, Efficiency & Team Prompt — key: `US/etfs/cost-efficiency-team`

- [ ] Input schema: `etf-analysis/inputs/cost-efficiency-and-team-input.schema.yaml`
- [ ] Output schema: `etf-analysis/outputs/etf-category-analysis-output.schema.yaml`
- [ ] Template must use Handlebars variables from `prepareCostEfficiencyAndTeamInputJson()`:
  - `{{name}}`, `{{symbol}}`, `{{exchange}}`
  - `{{financialInfo}}` — JSON string with expense ratio, AUM, volume, holdings, P/E
  - `{{stockAnalyzerFundInfo}}` — JSON string with issuer, asset class, category, volume metrics
  - `{{morAnalysis}}` — JSON string with adjusted expense ratio, turnover, medalist rating, analyst pillars
  - `{{managementInfo}}` — JSON string with manager tenure, advisors, current managers
  - `{{portfolioTurnover}}` — JSON string with reported turnover percentage
  - `{{factorAnalysisArray}}` — array of 5 factors
- [ ] Prompt should instruct the LLM to evaluate these 5 factors:
  1. `expense_ratio` — Expense Ratio Assessment (vs category average and prospectus)
  2. `fund_size_liquidity` — Fund Size & Liquidity (AUM, volume, bid-ask spread)
  3. `portfolio_turnover` — Portfolio Turnover (transaction costs, tax drag)
  4. `management_quality` — Management & Issuer Quality (tenure, reputation)
  5. `mor_assessment` — Mor Analyst Assessment (medalist rating, Process/People/Parent pillars)

### 3d. Risk Analysis Prompt — key: `US/etfs/risk-analysis`

- [ ] Input schema: `etf-analysis/inputs/risk-analysis-input.schema.yaml`
- [ ] Output schema: `etf-analysis/outputs/etf-category-analysis-output.schema.yaml`
- [ ] Template must use Handlebars variables from `prepareRiskAnalysisInputJson()`:
  - `{{name}}`, `{{symbol}}`, `{{exchange}}`
  - `{{stockAnalyzerRiskMetrics}}` — JSON string with beta, Sharpe, Sortino, ATR, RSI, ATH/ATL
  - `{{morRiskPeriods}}` — JSON string with 3/5/10yr risk periods (risk scores, capture ratios, drawdown)
  - `{{financialRiskContext}}` — JSON string with beta, 52-week range, volume
  - `{{categoryContext}}` — JSON string with Mor category, style box, total assets
  - `{{factorAnalysisArray}}` — array of 5 factors
- [ ] Prompt should instruct the LLM to evaluate these 5 factors:
  1. `volatility_measures` — Volatility & Standard Deviation (beta, std dev, ATR)
  2. `risk_adjusted_returns` — Risk-Adjusted Returns (Sharpe, Sortino ratios)
  3. `drawdown_analysis` — Maximum Drawdown & Recovery (peak-to-trough, recovery speed)
  4. `capture_ratios` — Upside/Downside Capture Ratios (vs benchmark)
  5. `risk_vs_category` — Risk Score vs Category (Mor risk score vs peers across periods)

### 3e. Final Summary Prompt — key: `US/etfs/final-summary`

- [ ] Input schema: `etf-analysis/etf-final-summary/etf-final-summary-analysis-input.schema.yaml`
- [ ] Output schema: `etf-analysis/etf-final-summary/etf-final-summary-analysis-output.schema.yaml`
- [ ] Template must use Handlebars variables from `prepareEtfFinalSummaryInputJson()`:
  - `{{name}}`, `{{symbol}}`, `{{exchange}}`, `{{inception}}`
  - `{{categorySummaries}}` — array of per-category overall summaries
  - `{{factorResults}}` — array of factor-level Pass/Fail results with one-line explanations
- [ ] Output is a single `summary` field: 6-7 short sentences, first line gives overall verdict (Positive/Negative/Mixed), remaining lines justify using category summaries and factor results

### Prompt Template Structure

Each prompt template should follow this Handlebars structure:

```handlebars
You are a senior ETF analyst evaluating {{name}} ({{symbol}}) on {{exchange}}.

## Category: [Category Name]

Evaluate the following ETF using the data and factors provided below. For each factor, provide a Pass/Fail judgment with supporting analysis.

## ETF Data

[Section for each data field, e.g.:]
### Returns Data
{{{stockAnalyzerReturns}}}

### Technical Indicators
{{{stockAnalyzerTechnicals}}}

[... more data sections ...]

## Factors to Evaluate

{{#each factorAnalysisArray}}
### {{factorAnalysisTitle}}
- Key: {{factorAnalysisKey}}
- Description: {{factorAnalysisDescription}}
- Metrics to examine: {{factorAnalysisMetrics}}
{{/each}}

## Instructions

1. For each factor, analyze the relevant metrics from the ETF data above.
2. Provide a clear Pass or Fail judgment — be conservative, only Pass when data strongly supports it.
3. If key data is missing or inconclusive, default to Fail with explanation.
4. Write the overallSummary as 3-5 sentences highlighting key strengths/weaknesses.
5. Write overallAnalysisDetails as 3-4 detailed paragraphs covering the category holistically.
6. Keep all analysis accessible to retail investors.
```

Note: Use triple-brace `{{{ }}}` for JSON string fields to avoid HTML escaping by Handlebars.

## 4. ETF Detail Page — Prompt Preview (optional, lower priority)

Add prompt preview actions to the ETF detail page, similar to `StockActions.tsx`:

- [ ] Create `EtfActions.tsx` component for the ETF detail page (`etfs/[exchange]/[etf]/page.tsx`)
- [ ] Add dropdown with "Generate Prompt" option per category (Performance, Cost & Team, Risk, Final Summary)
- [ ] Show generated prompt in a full-page modal with copy-to-clipboard button
- [ ] Use the `generate-prompt` API route created in step 2
- [ ] Wrap in `PrivateWrapper` so only admin users see it

## 5. Testing

- [ ] Test prompt generator utility with sample ETFs: SPY (equity), QQQ (tech), BND (bond)
- [ ] Verify input JSON validation passes against schemas for all three categories
- [ ] Verify Handlebars template compilation produces readable prompts
- [ ] Test end-to-end: generate request → cron processes → Lambda invokes LLM → callback saves results
- [ ] Verify results appear correctly on ETF detail page with spider chart and analysis sections

## Reference Files

- Stock prompt generator: `insights-ui/src/utils/analysis-reports/prompt-generator-utils.ts`
- Stock generate-prompt route: `insights-ui/src/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/generate-prompt/route.ts`
- Stock page actions: `insights-ui/src/app/stocks/[exchange]/[ticker]/StockActions.tsx`
- ETF Lambda utils: `insights-ui/src/utils/etf-analysis-reports/etf-llm-lambda-utils.ts`
- ETF generation utils: `insights-ui/src/utils/etf-analysis-reports/etf-generation-report-utils.ts`
- ETF input preparation: `insights-ui/src/utils/etf-analysis-reports/etf-report-input-json-utils.ts`
- ETF analysis factors: `insights-ui/src/etf-analysis-data/etf-analysis-factors.json`
- ETF type definitions: `insights-ui/src/types/etf/etf-analysis-types.ts`
- Input schemas: `insights-ui/schemas/etf-analysis/inputs/`
- Output schemas: `insights-ui/schemas/etf-analysis/outputs/`
- Final summary schemas: `insights-ui/schemas/etf-analysis/etf-final-summary/`
