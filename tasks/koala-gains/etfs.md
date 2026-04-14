# ETF Analysis — Implementation Checklist

## 1. Categories & Factors (JSON file, not DB) ✅

- [x] Finalized 3 ETF analysis categories: Performance & Returns, Cost Efficiency & Team, Risk Analysis
- [x] Categories are static/generic — same for all ETF types (equity, bond, commodity, sector, thematic)
- [x] Defined 5 analysis factors per category with factorAnalysisKey, title, description, and metrics
- [x] Stored in `insights-ui/src/etf-analysis-data/etf-analysis-factors.json`
- [x] Created TypeScript types in `insights-ui/src/types/etf/etf-analysis-types.ts`: `EtfAnalysisCategory` enum, `EtfAnalysisFactorDefinition`, `EtfCategoryAnalysisFactors`, `EtfAnalysisFactorsConfig`, `EtfFactorAnalysisResult`, `EtfCategoryAnalysisResponse`
- [ ] Add a utility function to load and validate the JSON at runtime

## 2. Input/Output Schemas ✅

- [x] Created 3 input YAML schemas (one per category) in `insights-ui/schemas/etf-analysis/inputs/`:
  - `performance-and-returns-input.schema.yaml` — uses StockAnalyzer returns/technicals, Morningstar returns/overview, financial summary
  - `cost-efficiency-and-team-input.schema.yaml` — uses financial info, StockAnalyzer fund info, Morningstar analysis, management info, portfolio turnover
  - `risk-analysis-input.schema.yaml` — uses StockAnalyzer risk metrics, Morningstar risk periods, financial risk context, category context
- [x] Created ETF-specific output schema `insights-ui/schemas/etf-analysis/outputs/etf-category-analysis-output.schema.yaml` (same structure as stock output: overallSummary, overallAnalysisDetails, factors with Pass/Fail)
- [ ] Document example input/output for one ETF category (e.g., SPY Performance & Returns)

## 3. Database — New Tables (schema added, migration pending)

- [x] Created `EtfAnalysisCategory` enum: PerformanceAndReturns, CostEfficiencyAndTeam, RiskAnalysis
- [x] Created `EtfGenerationRequest` model with per-category regenerate booleans, status, step tracking, timestamps
- [x] Created `EtfCategoryAnalysisResult` model with summary, overallAnalysisDetails, unique on (spaceId, etfId, categoryKey)
- [x] Created `EtfAnalysisCategoryFactorResult` model with factorKey, Pass/Fail result, cascading relation to parent result
- [x] Created `EtfCachedScore` model with per-category scores and finalScore
- [x] Added relation fields on `Etf` model for all new tables
- [ ] Run Prisma migration and generate client types

## 4. Prompts

- [ ] Write a system prompt for ETF analysis (analyst persona, evaluation framework)
- [ ] Write one prompt per category that takes ETF data + factors as input and outputs analysis in the YAML schema format
- [ ] Write a final summary prompt that takes all category results and produces an overall ETF assessment
- [ ] Register each prompt in the prompts admin page with keys like `US/etfs-v1/performance`, `US/etfs-v1/risk`, etc.
- [ ] Test each prompt with sample ETF data (SPY, QQQ, BND) before integrating

## 5. Input Preparation Utils

- [ ] Create `src/utils/etf-analysis-reports/etf-report-input-json-utils.ts` (like `report-input-json-utils.ts` for stocks)
- [ ] For each category, write a function that gathers the right ETF data (from EtfFinancialInfo, EtfStockAnalyzerInfo, EtfMorAnalyzerInfo, EtfMorRiskInfo, EtfMorPortfolioInfo) and formats it as input JSON
- [ ] Create `src/utils/etf-analysis-reports/get-etf-report-data-utils.ts` to fetch ETF records with all related tables

## 6. Generation Request API Routes

- [ ] Create POST `api/[spaceId]/etfs-v1/generation-requests` — create or update a generation request (merge flags if existing NotStarted request exists, else create new)
- [ ] Create GET `api/[spaceId]/etfs-v1/generation-requests` — list all ETF generation requests with status filters (for admin page)
- [ ] Create POST `api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/generation-requests/reload` — retry a failed request

## 7. Generation Processing Pipeline

- [ ] Create `src/utils/etf-analysis-reports/etf-generation-report-utils.ts` (like `generation-report-utils.ts` for stocks)
- [ ] Define dependency map for ETF categories (which categories must complete before others can start)
- [ ] Implement `triggerEtfGenerationOfAReport()` — picks up oldest pending request, finds next step by dependency order, invokes LLM via Lambda
- [ ] Create GET `api/[spaceId]/etfs-v1/generate-etf-v1-request` — the endpoint the cron job calls to process pending requests
- [ ] Use the same Lambda + callback pattern as stocks: invoke Lambda with prompt + input, Lambda calls back with results

## 8. Save Report Callback

- [ ] Create POST `api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/save-report-callback` — receives LLM response from Lambda
- [ ] Create `src/utils/etf-analysis-reports/save-etf-report-utils.ts` — parses LLM response, upserts EtfCategoryAnalysisResult and EtfAnalysisCategoryFactorResult records
- [ ] After saving, compute category score (Pass count / total factors) and update EtfCachedScore
- [ ] After saving, mark step as completed in EtfGenerationRequest and trigger next step

## 9. Cron Job Setup

- [ ] Set up a cron job that calls `generate-etf-v1-request` endpoint every 2-5 minutes
- [ ] Add 2-second delay between sequential LLM calls (like stocks do for Morningstar/StockAnalysis)
- [ ] Handle timeout: if a step has been InProgress for 5+ minutes, mark it as failed and move on

## 10. Admin Page — ETF Reports (extend existing)

- [ ] Extend `insights-ui/src/app/admin-v1/etf-reports/` to show analysis status columns (one column per category, green/red/empty dot)
- [ ] Add "Missing Analysis" filter — show ETFs that are missing one or more category analysis results
- [ ] Add "Generate Analysis" bulk action — creates generation requests for selected ETFs with all categories flagged
- [ ] Add per-ETF dropdown action to generate or regenerate specific categories
- [ ] Add auto-refresh (30s) when any generation request is InProgress

## 11. Admin Page — ETF Generation Requests

- [ ] Create new admin page at `admin-v1/etf-generation-requests/` (like `admin-v1/generation-requests/` for stocks)
- [ ] Show requests grouped by status: InProgress, Failed, NotStarted, Completed
- [ ] For each request, show ETF symbol, per-step status dots (green=done, red=failed, blue=pending, yellow=in-progress)
- [ ] Add "Reload" button for failed requests
- [ ] Add auto-refresh every 30 seconds

## 12. ETF Detail Page — Spider Chart & Analysis

- [ ] On the ETF detail page (`etfs/[exchange]/[etf]/page.tsx`), add spider/radar chart on the right side showing category scores (reuse `TickerRadarChart` pattern)
- [ ] Move the existing financial info table to the left side of the layout (spider chart right, financial table left)
- [ ] Below the chart/financial section, add analysis sections for each category showing: summary, factor Pass/Fail list, expandable detailed explanations
- [ ] Add admin-only "Generate" / "Regenerate" buttons per category on the detail page
- [ ] Fetch analysis data via new API route and handle missing data gracefully (show placeholder if not yet generated)

## 13. New ETF Financial Data Debug Page

- [ ] Create a new page (e.g., `etfs/[exchange]/[etf]/financial-data`) that shows ALL raw financial data for an ETF in a readable format
- [ ] Display EtfFinancialInfo fields in a structured table
- [ ] Display EtfStockAnalyzerInfo fields (moving averages, CAGR, period returns, technical indicators)
- [ ] Display all EtfMorAnalyzerInfo sections (overview, market data, analysis, returns, holdings, strategy)
- [ ] Display EtfMorRiskInfo (risk periods, scores, volatility, capture ratios)
- [ ] Display EtfMorPeopleInfo (managers, tenure, inception)
- [ ] Display EtfMorPortfolioInfo (asset allocation, style measures, sector exposure, bond breakdown, holdings)
- [ ] This page helps debug whether data is present and correct before running analysis generation

## 14. Analysis Results API Routes

- [ ] Create GET `api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis` — returns all category analysis results with factor details
- [ ] Create GET `api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/scores` — returns cached scores for spider chart rendering

## 15. SEO & Metadata

- [ ] Update `generateMetadata()` on ETF detail page to include analysis keywords in title/description
- [ ] Add structured data (JSON-LD) for ETF pages
- [ ] Ensure OpenGraph and Twitter card meta tags are set for social sharing

## 16. Testing & Validation

- [ ] Test end-to-end: create generation request → cron processes it → callback saves results → detail page shows analysis
- [ ] Test with different ETF types: equity ETF (SPY), bond ETF (BND), sector ETF (XLF)
- [ ] Test spider chart with partial data (some categories generated, others not)
- [ ] Test admin bulk actions with 10+ ETFs
- [ ] Verify light and dark theme for all new components
- [ ] Test on mobile, tablet, and desktop
