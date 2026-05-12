# Closed Tasks

Completed KoalaGains work across stocks, ETFs, scenarios, and site-wide concerns. Open
work lives in [`todo-tasks.md`](./todo-tasks.md). Items here were verified against the
current codebase.

---

## ETFs

### Foundational data + pipeline

- [x] All ETF financial-data fetched and available for report generation.
- [x] Report generation pipeline working end-to-end.
- [x] UI for ETF detail report page plus 3 separate category pages.
- [x] ETF categories divided into groups in `insights-ui/src/etf-analysis-data/etf-analysis-categories.json`.
- [x] Per-category analysis factors:
  - `etf-analysis-factors-performance-and-returns.json`
  - `etf-analysis-factors-cost-efficiency-and-team.json`
  - `etf-analysis-factors-risk-analysis.json`
- [x] Price chart section.
- [x] Introductory paragraphs (with index & strategy fields).

### Phase 1.1 — ETF Details Page layout

- [x] Final Summary shown first; spider chart + stock analysis info in two-column layout.
- [x] Price chart, Strategy heading, other sections below.
- [x] Per-category detail pages for each evaluation category.
- [x] Admin three-dots menu (per section / category / report) to trigger regeneration into the ETF generation requests queue.
- [x] Admin-only `updatedAt` timestamp per section / category / report.
- [x] ETF holdings section (ticker → stock report link, weight, sector, top-N + view-all, summary stats, empty state).

### Phase 1.2 — Competition + Similar ETFs

- [x] Competitor selection logic (group/category, AUM bands, optional issuer diversity, capped count).
- [x] Generated competition narrative + key differentiators.
- [x] Input + output schemas, finalized prompt.
- [x] Pipeline + storage (Prisma additions, generation step, callback saving, caching).
- [x] Separate competition page, competition chart, "Other similar ETFs" section on main page.
- [x] End-to-end QA in production across multiple ETF groups + edge cases.

### Phase 1.4 — Admin ETF generation requests page

Page: <https://koalagains.com/admin-v1/etf-generation-requests> (+ `/admin-v1/etf-reports`)

- [x] Sort reports by `updatedAt` desc, with pagination per section.
- [x] Top filter by name / symbol; reload icon + 30s auto-refresh with stop/start control.
- [x] Header columns cover every report type (Performance, Cost & Team, Risk, Summary, Index & Strategy, Future Outlook).
- [x] Per-report-type "Select missing" options + "Missing All Analysis"; generic "Missing Analysis" removed.
- [x] Per-ETF "Generate All Analysis" enqueues every supported report type.

### Phase 1.7 — Canadian ETFs

- [x] Sourced full Canadian ETF universe (TSX / NEO / Cboe Canada) from Stock Analyzer alongside US ETFs.
- [x] Schema adjustments — `Etf` accommodates non-US listings (exchange, currency, country); unique keys handle same ticker on different exchanges.
- [x] Wired Canadian ETFs into the generation pipeline; gated on `Etf.isComplete` rule.
- [x] One-shot backfill done; ongoing refresh via off-hours job.
- [x] Validation across Canadian ETF samples (data, reports, holdings, sitemap, SEO metadata).

### Phase 3.1 — Category grouping

- [x] Reviewed all groups in `etf-analysis-categories.json` (relevance, overlaps, mutually-exclusive vs multi-tag decision).
- [x] Finalized the groups.

### Phase 3.2 — Automated factor + prompt tuning loop

- [x] Per-iteration loop: generate → validate → aggregate → propose new factor list + prompt → persist version → repeat up to N.
- [x] Sample coverage: all groups, 5–10 ETFs per group.
- [x] Storage layout at `docs/insights-ui/tasks/prompt-tuning/<category>/<group>/<iteration>/...`.
- [x] Backward-compat guardrails (stable keys, deliberate renames only).
- [x] Final `groupKey -> { performance, costEfficiency, risk } factors` mapping produced.
- [x] Light wrapper reusing the existing generation pipeline/CLI.
- [x] Human-review gate before replacing live versions.

### ETF discoverability (partial)

- [x] ETF category pages at `app/etfs/categories/[category]` (+ index).
- [x] ETF country pages at `app/etfs/countries/[country]`.

---

## Stocks

### Detail page refactor (sections extracted to dedicated pages)

- [x] Financial Statements Analysis → dedicated page at `app/stocks/[exchange]/[ticker]/financial-statement-analysis/`.
- [x] Fair Value → dedicated page at `app/stocks/[exchange]/[ticker]/fair-value/`.

### Stock scenarios — Phase 1 (foundation, shipped 2026-04-24)

- [x] Prisma models `StockScenario` + `StockScenarioStockLink` with country scope.
- [x] Public listing + detail pages under `src/app/stock-scenarios/`.
- [x] Admin CRUD + import under `src/app/admin-v1/stock-scenarios/`.
- [x] Public + admin API routes under `/api/[spaceId]/stock-scenarios/` and `/api/stock-scenarios/`.
- [x] Component suite under `src/components/stock-scenarios/`.
- [x] Markdown parser (`stock-scenario-markdown-parser.ts`) and `stock-scenarios:import` script.

### Management Team Experience and Alignment — new 8th report type

- [x] `TickerV1ManagementTeamReport` Prisma model + `ManagementTeamAlignmentVerdict` enum (`prisma/schema.prisma`).
- [x] Prompt registered (`US/public-equities-v1/management-team-experience-and-alignment`) and wired through `getLLMResponseForPromptViaInvocation`.
- [x] `regenerateManagementTeamExperienceAndAlignment` flag on `TickerV1GenerationRequest`; included in "generate all"; no back-fill of older tickers; not added to `TickerV1CachedScore`.
- [x] API: `GET` (row or 404) + `POST` regenerate; wired into batch handler when "generate all" is set.
- [x] Main stock page: summary card with verdict pill + CTA when row exists; silent absence otherwise.
- [x] Detail page at `app/stocks/[exchange]/[ticker]/management-team/page.tsx` — full `detailedAnalysis`, Leadership block sidebar, breadcrumbs, SSR + unique title/meta; sitemap entry at `app/stocks/management-team-sitemap.xml/route.ts`.
- [x] Integrations: pass-through into Business & Moat input, mapping into 10-bagger founder/owner-operator dimension, included in Custom Reports `inputJson`.
- [x] Off-hours refresh limited to tickers with a populated row; priority bump on CEO/CFO/founder-departure 8-Ks.

---

## Site-wide

### Login improvements (partial)

- [x] Click-count login gate — counter + gate logic in `LogRocketComponent.tsx` (MIN_CLICKS = 2). Remaining SSO providers + post-login resume still open.
