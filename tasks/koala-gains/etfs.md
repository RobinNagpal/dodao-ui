# ETF Analysis — Implementation Checklist

## Phase 1: Define Analysis Categories & Factors

### 1.1 Finalize ETF Analysis Categories
- [ ] Decide on the final set of ETF analysis categories (e.g., 5-6 categories). Proposed categories:
  - **Performance & Returns** — historical returns (1m, 3m, 6m, 1y, 3y, 5y, 10y, 20y), CAGR, benchmark comparison, rolling returns consistency
  - **Risk & Volatility** — beta, standard deviation, Sharpe ratio, Sortino ratio, max drawdown, capture ratios (upside/downside), ATR, risk-adjusted returns across 3yr/5yr/10yr periods
  - **Cost & Efficiency** — expense ratio vs category peers, tracking error vs benchmark, tax efficiency, transaction costs, bid-ask spread impact
  - **Holdings & Portfolio Composition** — top holdings concentration, sector diversification, geographic exposure, asset allocation, portfolio turnover, overlap with popular ETFs
  - **Fund Management & Structure** — AUM and fund flows, fund age/inception, issuer reputation, replication method (physical vs synthetic), securities lending revenue, manager tenure
  - **Income & Distributions** — dividend yield, distribution frequency, dividend growth rate, yield vs category average, tax treatment of distributions
- [ ] Determine whether categories are static (same for all ETFs) or dynamic (varying by ETF type — equity, bond, commodity, sector, thematic)
- [ ] Document the final category list with descriptions in `docs/ai-knowledge/projects/insights-ui/`

### 1.2 Define Analysis Factors per Category
- [ ] For each category, define 4-8 specific analysis factors with:
  - `factorAnalysisKey` — unique identifier (e.g., `sharpe_ratio_evaluation`)
  - `factorAnalysisTitle` — human-readable name (e.g., "Sharpe Ratio Evaluation")
  - `factorAnalysisDescription` — what this factor measures and why it matters
  - `factorAnalysisMetrics` — specific data points used (e.g., "3yr Sharpe, 5yr Sharpe, category avg Sharpe")
- [ ] Decide if factors vary by ETF type (equity ETFs, bond ETFs, commodity ETFs, etc.) or remain uniform
- [ ] Define `EvaluationResult` criteria for each factor — what constitutes Pass vs Fail, and scoring thresholds (0-10 scale)

### 1.3 Define Input/Output Schemas
- [ ] Create YAML schema for ETF analysis category definitions (input to the LLM prompts)
- [ ] Create YAML schema for category factor analysis results (LLM output format)
- [ ] Define the scoring/grading output structure per factor (score, one-liner, detailed explanation, data used)
- [ ] Document example input/output for at least one complete category

## Phase 2: Database Schema & Types

### 2.1 Prisma Schema — New ETF Analysis Tables
- [ ] Create `EtfAnalysisCategory` enum in Prisma (or reuse extended `TickerAnalysisCategory` if categories overlap)
- [ ] Create `EtfAnalysisCategoryFactor` model (mirrors `AnalysisCategoryFactor` for stocks):
  - Fields: id, etfTypeKey (equity/bond/commodity/etc.), categoryKey, factorAnalysisKey, factorAnalysisTitle, factorAnalysisDescription, factorAnalysisMetrics, spaceId, timestamps
- [ ] Create `EtfCategoryAnalysisResult` model (mirrors `TickerV1CategoryAnalysisResult`):
  - Fields: id, categoryKey, summary, overallAnalysisDetails, etfId, spaceId
  - Relation: has many `EtfAnalysisCategoryFactorResult`
- [ ] Create `EtfAnalysisCategoryFactorResult` model (mirrors `TickerV1AnalysisCategoryFactorResult`):
  - Fields: id, categoryKey, analysisCategoryFactorId, oneLineExplanation, detailedExplanation, result (Pass/Fail), score (Float), etfId, spaceId
- [ ] Create `EtfCachedScore` model (mirrors `TickerV1CachedScore`):
  - Fields: id, etfId, performanceAndReturnsScore, riskAndVolatilityScore, costAndEfficiencyScore, holdingsAndPortfolioScore, fundManagementScore, incomeAndDistributionsScore, finalScore, spaceId, timestamps
- [ ] Create `EtfGenerationRequest` model (mirrors `TickerV1GenerationRequest`):
  - Fields: id, etfId, status (ProcessingStatus), regenerate flags per category (e.g., `regeneratePerformance`, `regenerateRisk`, `regenerateCost`, `regenerateHoldings`, `regenerateManagement`, `regenerateIncome`), completedSteps, failedSteps, inProgressStep, error messages, timestamps, spaceId
- [ ] Run Prisma migration: `npx prisma migrate dev --name add-etf-analysis-tables`
- [ ] Verify migration applies cleanly and all relations are correct

### 2.2 TypeScript Types
- [ ] Generate Prisma client types: `npx prisma generate`
- [ ] Create ETF analysis TypeScript types in `src/types/etf/` (or extend existing `src/types/public-equity/`):
  - `EtfAnalysisCategory` enum type
  - `EtfAnalysisFactorDefinition` interface
  - `EtfCategoryAnalysisFactors` interface
  - `EtfAnalysisResultResponse` interface (API response shape)
- [ ] Create ETF spider chart types:
  - `SpiderGraphForEtf` type (category scores mapped for chart rendering)
- [ ] Add ETF generation request types:
  - `EtfGenerationRequestStatus` type
  - `UpsertEtfGenerationRequest` interface

## Phase 3: Prompts & LLM Integration

### 3.1 Finalize Prompts
- [ ] Write the system prompt for ETF analysis that establishes the analyst persona and evaluation framework
- [ ] Write per-category prompts that include:
  - Category-specific evaluation criteria
  - Required data points to analyze (mapped from EtfFinancialInfo, EtfStockAnalyzerInfo, EtfMorAnalyzerInfo, etc.)
  - Output format specification (matching the YAML schema from Phase 1)
  - Scoring rubric (what earns 1-2 vs 5 vs 8-10)
- [ ] Write a final summary prompt that synthesizes all category results into an overall assessment
- [ ] Test each prompt manually with sample ETF data (e.g., SPY, QQQ, BND) to validate output quality

### 3.2 Register Prompts on UI
- [ ] Add prompt templates to the prompts admin page (each prompt needs a unique `promptKey` referenced in code)
- [ ] Verify prompts are retrievable via the prompt API and render correctly
- [ ] Document the prompt keys and their mapping to categories

## Phase 4: Backend — Generation Request Processing

### 4.1 API Routes for ETF Generation Requests
- [ ] Create `POST /api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/generation-requests` — upsert generation request (merge if NotStarted, create new otherwise)
- [ ] Create `GET /api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/generation-requests` — list generation requests for an ETF
- [ ] Create `GET /api/[spaceId]/etfs-v1/generation-requests` — list all ETF generation requests (for admin page) with filters by status
- [ ] Create `POST /api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/generation-requests/[requestId]/reload` — retry a failed request

### 4.2 Cron Job / Processing Pipeline
- [ ] Implement ETF analysis generation processor (similar to stock ticker processing):
  - Pick up oldest NotStarted/Failed request
  - Set status to InProgress
  - For each flagged category: fetch relevant ETF data, call LLM with category prompt, parse response, store results
  - Update completedSteps/failedSteps as each category finishes
  - On completion: compute and update `EtfCachedScore` with per-category scores and final score
  - Handle errors gracefully — mark individual steps as failed without failing the entire request
- [ ] Set up cron schedule for ETF analysis processing (e.g., every 2-5 minutes, process one request at a time)
- [ ] Add rate limiting / delay between LLM calls to avoid API throttling (similar to 2-second delay in stock bulk operations)
- [ ] Implement idempotency — re-processing a completed category should overwrite cleanly

### 4.3 API Routes for Analysis Results
- [ ] Create `GET /api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis` — fetch all category analysis results for an ETF
- [ ] Create `GET /api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/[category]` — fetch single category result with factor details
- [ ] Create `GET /api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/scores` — fetch cached scores for spider chart

## Phase 5: Admin Pages

### 5.1 ETF Generation Request Admin Page
- [ ] Create admin page at `/admin-v1/etf-generation-requests/` (similar to `/admin-v1/generation-requests/`)
- [ ] Show generation requests grouped by status: InProgress, Pending (NotStarted), Completed, Failed
- [ ] Display per-request details: ETF symbol, status, completed/failed steps with color-coded indicators
- [ ] Add action buttons: "Reload" for failed requests, "Cancel" for in-progress
- [ ] Add auto-refresh (every 30 seconds) to track in-progress requests
- [ ] Add bulk action: select multiple ETFs and create generation requests for all

### 5.2 Missing ETF Reports Admin Page
- [ ] Create admin page at `/admin-v1/etf-missing-reports/` (or extend existing `/admin-v1/etf-reports/`)
- [ ] Show ETFs that are missing analysis results (no `EtfCategoryAnalysisResult` records)
- [ ] Add filters: by exchange, by missing category, by ETF type
- [ ] Add bulk action: "Generate Analysis" for selected ETFs — creates generation requests for all missing categories
- [ ] Show count of ETFs with complete vs incomplete analysis

### 5.3 Individual ETF Admin Actions
- [ ] Add "Generate Analysis" button on ETF detail page (admin view) to trigger generation for specific categories
- [ ] Add per-category "Regenerate" buttons to re-run individual analysis sections
- [ ] Show analysis generation status on the detail page (last generated date, current request status if any)

## Phase 6: ETF Detail Page — Analysis Display

### 6.1 Spider Chart
- [ ] Implement spider/radar chart component for ETF scores (reuse or adapt stock spider chart component)
- [ ] Map `EtfCachedScore` fields to chart axes (one axis per category)
- [ ] Style chart consistently with existing stock spider charts
- [ ] Add tooltips showing score details on hover
- [ ] Handle missing scores gracefully (show partial chart or placeholder)

### 6.2 Category Analysis Sections
- [ ] Create `EtfAnalysisSection` component to display one category's analysis results:
  - Category summary and overall details
  - List of factor results with Pass/Fail indicators, scores, one-liner explanations
  - Expandable detailed explanations per factor
- [ ] Add analysis sections to ETF detail page (below or alongside existing financial/Morningstar data)
- [ ] Create tab or accordion navigation for switching between categories
- [ ] Ensure responsive layout for mobile/tablet/desktop

### 6.3 Overall Assessment Display
- [ ] Show final score prominently (e.g., as a badge or header score)
- [ ] Display category score breakdown in a summary card
- [ ] Add comparison context (e.g., "Above average for Large Cap Blend ETFs")

## Phase 7: SEO & Metadata

### 7.1 Page Metadata
- [ ] Update `generateMetadata()` in ETF detail page to include analysis-related keywords
- [ ] Add structured data (JSON-LD) for ETF analysis pages (FAQPage or Review schema where appropriate)
- [ ] Ensure unique, descriptive title and meta description per ETF (e.g., "SPY ETF Analysis — Performance, Risk, Holdings | KoalaGains")
- [ ] Add OpenGraph and Twitter card meta tags for social sharing

### 7.2 URL Structure & Sitemap
- [ ] Verify ETF analysis pages follow clean URL structure: `/etfs/[exchange]/[etf]`
- [ ] Add ETF pages to sitemap generation
- [ ] Ensure proper canonical URLs to avoid duplicate content

## Phase 8: Testing & Quality

### 8.1 Data Validation
- [ ] Test analysis generation end-to-end with at least 3 different ETF types (equity, bond, sector)
- [ ] Validate LLM output parsing handles edge cases (missing fields, unexpected formats)
- [ ] Verify scores are computed correctly and cached scores match individual factor results

### 8.2 UI Testing
- [ ] Test spider chart rendering with various score distributions (all high, all low, mixed, partial data)
- [ ] Test analysis sections display on mobile, tablet, and desktop breakpoints
- [ ] Verify light and dark theme compatibility for all new components
- [ ] Test admin pages with large datasets (100+ ETFs with generation requests)

### 8.3 Performance
- [ ] Ensure ETF detail page with analysis data loads within acceptable time
- [ ] Add caching for analysis results (revalidation strategy similar to existing ETF data caching)
- [ ] Monitor LLM API usage and costs for analysis generation at scale
