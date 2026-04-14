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
  - `performance-and-returns-input.schema.yaml` — uses StockAnalyzer returns/technicals, Mor returns/overview, financial summary
  - `cost-efficiency-and-team-input.schema.yaml` — uses financial info, StockAnalyzer fund info, Mor analysis, management info, portfolio turnover
  - `risk-analysis-input.schema.yaml` — uses StockAnalyzer risk metrics, Mor risk periods, financial risk context, category context
- [x] Created ETF-specific output schema `insights-ui/schemas/etf-analysis/outputs/etf-category-analysis-output.schema.yaml` (same structure as stock output: overallSummary, overallAnalysisDetails, factors with Pass/Fail)
- [ ] Document example input/output for one ETF category (e.g., SPY Performance & Returns)

## 3. Database — New Tables (schema added, migration pending)

- [x] Created `EtfAnalysisCategory` enum: PerformanceAndReturns, CostEfficiencyAndTeam, RiskAnalysis
- [x] Created `EtfGenerationRequest` model with per-category regenerate booleans, status, step tracking, timestamps
- [x] Created `EtfCategoryAnalysisResult` model with summary, overallAnalysisDetails, unique on (spaceId, etfId, categoryKey)
- [x] Created `EtfAnalysisCategoryFactorResult` model with factorKey, Pass/Fail result, cascading relation to parent result
- [x] Created `EtfCachedScore` model with per-category scores and finalScore
- [x] Added relation fields on `Etf` model for all new tables
- [x] Run Prisma migration and generate client types

## 4. Prompts (done by user on KoalaGains platform)

- [ ] Write a system prompt for ETF analysis (analyst persona, evaluation framework)
- [ ] Write one prompt per category that takes ETF data + factors as input and outputs analysis in the YAML schema format
- [ ] Register each prompt with keys: `US/etfs/performance-returns`, `US/etfs/cost-efficiency-team`, `US/etfs/risk-analysis`
- [ ] Test each prompt with sample ETF data (SPY, QQQ, BND) before integrating

## 5. Input Preparation Utils ✅

- [x] Created `src/utils/etf-analysis-reports/etf-report-input-json-utils.ts` with per-category functions:
  - `preparePerformanceAndReturnsInputJson()` — gathers StockAnalyzer returns/technicals, Mor returns/overview, financial summary
  - `prepareCostEfficiencyAndTeamInputJson()` — gathers financial info, fund info, Mor analysis, management/people info, portfolio turnover
  - `prepareRiskAnalysisInputJson()` — gathers risk metrics (beta, Sharpe, Sortino), Mor risk periods, financial risk context
  - `getEtfAnalysisFactorsForCategory()` — loads factors from JSON config by category
- [x] Created `src/utils/etf-analysis-reports/get-etf-report-data-utils.ts` with `fetchEtfWithAllData()` and `fetchEtfBySymbolAndExchange()`
- [x] Created `src/utils/etf-analysis-reports/etf-report-steps-statuses.ts` with `calculateEtfPendingSteps()`
- [x] Created `src/utils/etf-analysis-reports/etf-report-status-utils.ts` with `markEtfRequestAsInProgress()` and `markEtfRequestAsCompleted()`
- [x] Added `EtfReportType` enum, `EtfGenerationRequestStatus` enum, `ETF_PROMPT_KEYS` map, `ETF_REPORT_TYPE_TO_CATEGORY` map to types

## 6. Generation Request API Routes ✅

- [x] Created POST `api/[spaceId]/etfs-v1/generation-requests` — creates or updates generation request (merges flags with OR if existing NotStarted request)
- [x] Created GET `api/[spaceId]/etfs-v1/generation-requests` — lists all requests grouped by status with pagination and counts
- [x] Created POST `api/[spaceId]/etfs-v1/generation-requests/[requestId]/reload` — resets a failed request to NotStarted

## 7. Generation Processing Pipeline ✅

- [x] Created `src/utils/etf-analysis-reports/etf-generation-report-utils.ts` with `triggerEtfGenerationOfAReport()`
- [x] Defined dependency map (all 3 categories are independent — no dependencies between them)
- [x] Created `src/utils/etf-analysis-reports/etf-llm-lambda-utils.ts` with ETF-specific callback URL (`etfs-v1/exchange/...`)
- [x] Created GET `api/[spaceId]/etfs-v1/generate-etf-v1-request` — cron endpoint that processes up to 10 requests
- [x] Uses same Lambda + callback pattern as stocks with ETF-specific callback URL

## 8. Save Report Callback ✅

- [x] Created POST `api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/save-report-callback` — receives LLM response, dispatches via ETF_REPORT_TYPE_TO_CATEGORY map
- [x] Created `src/utils/etf-analysis-reports/save-etf-report-utils.ts` — upserts EtfCategoryAnalysisResult and EtfAnalysisCategoryFactorResult, uses factor keys from JSON config
- [x] After saving, computes category score (Pass count) and upserts EtfCachedScore with per-category + final scores
- [x] After saving, marks step as completed in EtfGenerationRequest and triggers next step via `triggerEtfGenerationOfAReport()`

## 9. Cron Job Setup ✅

- [x] Added cron job in `vercel.json` — calls `/api/koala_gains/etfs-v1/generate-etf-v1-request` every 3 minutes
- [x] Timeout handling already implemented in `etf-generation-report-utils.ts` — 5-min timeout marks step as failed

## 10. Admin Page — ETF Reports (extend existing) ✅

- [x] Added 3 analysis status columns (Performance, Cost & Team, Risk) to EtfReportsTable showing factor result counts
- [x] Added "Missing Analysis" filter option in EtfReportsFilters dropdown
- [x] Added "Generate Analysis" bulk action in BulkActionsBar — creates generation requests for all selected ETFs
- [x] Added "Generate All Analysis" per-ETF dropdown action in EtfRowActionsDropdown
- [x] Added "Missing Analysis" category in SelectMissingBar for quick-selecting ETFs without analysis
- [x] Updated API to return `performanceAnalysisCount`, `costEfficiencyAnalysisCount`, `riskAnalysisCount`

## 11. Admin Page — ETF Generation Requests ✅

- [x] Created new admin page at `admin-v1/etf-generation-requests/page.tsx`
- [x] Shows requests grouped by status with color-coded borders (blue=InProgress, gray=NotStarted, red=Failed, green=Completed)
- [x] Per-step status dots (green=done, red=failed, blue=pending, yellow=in-progress, gray=not enabled)
- [x] "Reload" button for failed requests (calls reload API endpoint)
- [x] Auto-refresh every 30 seconds when active requests exist, with Pause/Resume toggle
- [x] Added nav link in AdminNav under "ETF Mgmt" section

## 12. ETF Detail Page — Spider Chart & Analysis

- [x] Added spider/radar chart on the right side using `EtfRadarChart` component (reuses `RadarChart` + `SpiderGraphForTicker`)
- [x] Moved financial info to left side, spider chart to right side (50/50 lg layout)
- [x] Added `EtfAnalysisSections` component below chart: shows summary, Pass/Fail factor list with expandable details per category
- [x] Fetches analysis data via new API routes; shows nothing gracefully when not yet generated
- [ ] Add admin-only "Generate" / "Regenerate" buttons per category on the detail page

## 13. New ETF Financial Data Debug Page ✅

- [x] Created `etfs/[exchange]/[etf]/financial-data/page.tsx` showing all raw financial data
- [x] Displays EtfFinancialInfo and EtfStockAnalyzerInfo as structured field tables
- [x] Displays EtfMorAnalyzerInfo, EtfMorRiskInfo, EtfMorPeopleInfo, EtfMorPortfolioInfo as formatted JSON

## 14. Analysis Results API Routes ✅

- [x] Created GET `api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis` — returns categories with factor results
- [x] Created GET `api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/scores` — returns cached scores for spider chart

## 15. SEO & Metadata ✅

- [x] Updated `generateMetadata()` with analysis-specific keywords (performance, risk, expense ratio)
- [x] Added JSON-LD structured data (Article schema with author, publisher, dates)
- [x] OpenGraph and Twitter card meta tags already present from initial implementation

## 16. Testing & Validation

- [ ] Test end-to-end: create generation request → cron processes it → callback saves results → detail page shows analysis
- [ ] Test with different ETF types: equity ETF (SPY), bond ETF (BND), sector ETF (XLF)
- [ ] Test spider chart with partial data (some categories generated, others not)
- [ ] Test admin bulk actions with 10+ ETFs
- [ ] Verify light and dark theme for all new components
- [ ] Test on mobile, tablet, and desktop
