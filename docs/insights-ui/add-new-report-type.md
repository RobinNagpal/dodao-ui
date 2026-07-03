# Adding a New Report Type (Stocks + ETFs)

Research map for introducing a **brand-new analysis report type** (a new stock or ETF
section like "Dividend Analysis" or "Portfolio Quality") end-to-end. This is the
*design-time* companion to [`automated-report-generation.md`](automated-report-generation.md),
which only covers *running* the reports that already exist.

> **Status: research / playbook, not yet actioned.** File paths and registries below were
> located by reading the codebase; exact internal symbol names (switch cases, constant
> arrays) should be re-confirmed at implementation time — they move around. The open work
> is tracked in [`tasks/todo-tasks.md`](tasks/todo-tasks.md) → **New report types**.

## The core distinction: category (factor-based) vs. standalone

Every existing report falls into one of two shapes, and which one you pick decides how many
files you touch.

- **Factor-based category report** — a list of scored factors + an overall summary, saved to
  the *generic* category-analysis tables. Stock examples: `financial-analysis`,
  `business-and-moat`, `past-performance`, `future-growth`, `fair-value`. ETF examples:
  `performance-and-returns`, `cost-efficiency-and-team`, `risk-analysis`,
  `future-performance-outlook`. These reuse a shared table, a shared output schema, and a
  shared cache-tag loop — so a new one is *mostly* enum + config + a page.
- **Standalone / bespoke report** — its own response shape and its own Prisma table. Stock
  examples: `competition` (`TickerV1VsCompetition`), `management-team`
  (`TickerV1ManagementTeamReport`), `final-summary` (fields on the base `TickerV1` row). ETF
  examples: `key-facts` (`EtfKeyFactsReport`), `competition` (`EtfVsCompetition`),
  `final-summary` (fields on the `Etf` row). These need a new table, a new save branch, new
  cache-tag helpers, and a bespoke output schema.

**Rule of thumb:** if the report is "a set of pass/fail factors with commentary", make it a
category report and you inherit most of the plumbing. If its output is a different shape
(arrays of competitors, a verdict enum, freeform key facts), it is standalone.

## Enum & type definitions — the source of truth for the slug

**Stocks** — `src/types/ticker-typesv1.ts`
- `ReportType` enum (slug values, e.g. `MANAGEMENT_TEAM = 'management-team'`) — the master
  list of stock report types.
- `analysisTypes: AnalysisTypeInfo[]` — `{ key, label }` pairs; drives label rendering.
- `TickerAnalysisCategory` enum — **only the 5 factor-based categories**
  (`BusinessAndMoat`, `FinancialStatementAnalysis`, `PastPerformance`, `FutureGrowth`,
  `FairValue`). Competition / management-team / final-summary are deliberately **not** here.
- `CATEGORY_MAPPINGS` — category → display name.

**ETFs** — `src/types/etf/etf-analysis-types.ts`
- `EtfReportType` enum (7 slug values).
- `EtfAnalysisCategory` enum — the **4 factor-based categories** only.
- `ETF_REPORT_TYPE_TO_CATEGORY: Record<EtfReportType, EtfAnalysisCategory>` — category
  reports map to their real category; standalone reports (`KEY_FACTS`, `COMPETITION`,
  `FINAL_SUMMARY`) carry a **placeholder** mapping with a comment saying "not used". A new
  standalone report follows the placeholder convention.
- `ETF_PROMPT_KEYS: Record<EtfReportType, string>` — maps each report type to its prompt key
  (`US/etfs/<slug>`).

Prompt-key patterns: stock reports use `US/public-equities-v1/<slug>`, ETF reports use
`US/etfs/<slug>`.

## Where each concern lives

| Concern | Stocks | ETFs |
| --- | --- | --- |
| Report-type enum + labels | `src/types/ticker-typesv1.ts` | `src/types/etf/etf-analysis-types.ts` |
| Prompt template | DB `prompt_versions` (key `US/public-equities-v1/<slug>`); version-controlled copy under `docs/insights-ui/stock-prompts/` | **File-backed** for 5 types in `etf-prompts/*.md`, resolved by `resolveEtfPromptTemplate()` via `FILE_BACKED_ETF_PROMPT_FILES` in `src/utils/etf-analysis-reports/etf-prompt-template-utils.ts`; others fall back to DB `Prompt.promptTemplate` |
| Analysis factors | DB-seeded (`AnalysisCategoryFactor`-style rows, per industry/subindustry/category/factor) | Static JSON `src/etf-analysis/etf-analysis-factors-<category>.json`, imported + registered in `CATEGORY_CONFIGS` in `src/utils/etf-analysis-reports/etf-analysis-factor-utils.ts` |
| Input-JSON preparer | `prepare<X>InputJson()` in `src/utils/analysis-reports/report-input-json-utils.ts`; dispatched in `src/utils/analysis-reports/prompt-generator-utils.ts` | `prepare<X>InputJson()` in `src/utils/etf-analysis-reports/etf-report-input-json-utils.ts`; dispatched in `src/utils/etf-analysis-reports/etf-prompt-generator-utils.ts` |
| Output (validation) schema | `schemas/analysis-factors/**` YAML (generic `whole-category-analysis-output.schema.yaml` for factor reports; bespoke per standalone type) | `schemas/etf-analysis/outputs/**` YAML; custom ones registered in `FILE_BACKED_ETF_OUTPUT_SCHEMAS` in `etf-prompt-template-utils.ts` |
| Save handler | `src/utils/analysis-reports/save-report-utils.ts`; route `.../save-json-report/route.ts` | `src/utils/etf-analysis-reports/save-etf-report-utils.ts`; route `.../save-report-callback/route.ts` |
| Prisma result tables | `TickerV1CategoryAnalysisResult` (+ factor-result table) for category reports; bespoke tables (`TickerV1VsCompetition`, `TickerV1ManagementTeamReport`) for standalone; per-category score columns on the cached-score row | `EtfCategoryAnalysisResult` (+ factor-result table); bespoke (`EtfKeyFactsReport`, `EtfVsCompetition`); score columns on `EtfCachedScore` |
| Prisma category enum | `TickerAnalysisCategory` in `prisma/schema.prisma` | `EtfAnalysisCategory` in `prisma/schema.prisma` |
| Per-section data API | `src/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/<slug>-data/route.ts` (+ `full-render`) | `src/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/<slug>-data/route.ts` (+ `full-render`) |
| Sub-page | `src/app/stocks/[exchange]/[ticker]/<slug>/page.tsx` | `src/app/etfs/[exchange]/[etf]/<slug>/page.tsx` |
| Section registry (sibling links) | `src/components/ticker-reportsv1/TickerRelatedSections.tsx` | `src/components/etf-reportsv1/EtfRelatedSections.tsx` |
| Cache tags + category→path | `src/utils/ticker-v1-cache-utils.ts` (`TICKER_CATEGORY_TO_PATH`) | `src/utils/etf-cache-utils.ts` (`ETF_CATEGORY_TO_PATH`) |
| Per-section sitemap | `src/app/stocks/<slug>-sitemap.xml/route.ts` + register in `src/app/stocks/sitemap.xml/route.ts` | `src/app/etfs/<slug>-sitemap.xml/route.ts` + register in `src/app/etfs/sitemap.xml/route.ts` |
| CLI trigger / prompt | `src/scripts/tickers/trigger-generation.ts`, `get-report-prompt.ts` | `src/scripts/etfs/trigger-generation.ts`, `get-report-prompt.ts` |
| Admin regenerate toggle | `regenerate<X>` flag on the stock generation-request Prisma model + `src/app/admin-v1/generation-requests/page.tsx` | `regenerate<X>` flag on the ETF generation-request Prisma model + `src/app/admin-v1/etf-generation-requests/page.tsx` |

## Ordered checklist — new **ETF category** report (the cheapest path)

The ETF category path is the most config-driven, so start here when scoping effort.

1. **Enum + mappings** (`src/types/etf/etf-analysis-types.ts`): add the slug to `EtfReportType`
   and `EtfAnalysisCategory`; add the real entry to `ETF_REPORT_TYPE_TO_CATEGORY` and
   `ETF_PROMPT_KEYS`.
2. **Factors JSON**: create `src/etf-analysis/etf-analysis-factors-<slug>.json`; import it and
   add it to `CATEGORY_CONFIGS` in `etf-analysis-factor-utils.ts`.
3. **Prompt template**: create `etf-prompts/<file>.md` and add it to
   `FILE_BACKED_ETF_PROMPT_FILES` (or seed a DB `Prompt` at `US/etfs/<slug>`).
4. **Input JSON**: add `prepare<X>InputJson()` in `etf-report-input-json-utils.ts` and a
   dispatch case in `etf-prompt-generator-utils.ts`.
5. **Output schema**: reuse `etf-category-analysis-output.schema.yaml`, or add a custom YAML +
   register it in `FILE_BACKED_ETF_OUTPUT_SCHEMAS`.
6. **Prisma**: add the value to the `EtfAnalysisCategory` enum; optionally add a score column
   to `EtfCachedScore`. Migrate. (Category reports reuse `EtfCategoryAnalysisResult`, so **no
   new table**.)
7. **Save handler**: confirm `save-etf-report-utils.ts` routes the new category to the generic
   category-result writer (usually automatic once the enum exists).
8. **Data API**: create `.../etfs-v1/exchange/[exchange]/[etf]/<slug>-data/route.ts`; add the
   slice to `full-render` if it should appear on the main page.
9. **Sub-page**: create `src/app/etfs/[exchange]/[etf]/<slug>/page.tsx`.
10. **Section registry**: add to `SECTIONS` + the category→slug map in `EtfRelatedSections.tsx`.
11. **Cache**: add to `ETF_CATEGORY_TO_PATH`; the per-category tag loop then covers it (no new
    tag helper needed for category reports).
12. **Sitemap**: create `src/app/etfs/<slug>-sitemap.xml/route.ts`; register in the ETF sitemap
    index.
13. **CLI + admin**: add the report type to the ETF `trigger-generation.ts` list/payload; add a
    `regenerate<X>` flag to the ETF generation-request model + admin page.
14. **Verify**: `yarn compile`, then generate one ETF end-to-end (prompt → save → GET
    `/analysis` → render the sub-page) before rolling out.

## Ordered checklist — new **stock category** report

Same 14 shape as the ETF path, but with the stock-side files and two differences:

- **Factors come from the DB**, not a JSON file — seed the factor rows for each
  industry/subindustry rather than committing a JSON.
- **Prompts live in the DB** `prompt_versions` table — add the version-controlled copy under
  `docs/insights-ui/stock-prompts/` and seed the `US/public-equities-v1/<slug>` prompt.

Touch: `ticker-typesv1.ts` (`ReportType`, `analysisTypes`, `TickerAnalysisCategory`,
`CATEGORY_MAPPINGS`) → `report-input-json-utils.ts` + `prompt-generator-utils.ts` → output
schema under `schemas/analysis-factors/**` → `prisma/schema.prisma` (`TickerAnalysisCategory`
+ score column) → `save-report-utils.ts` → `<slug>-data/route.ts` (+ `full-render`) →
`src/app/stocks/[exchange]/[ticker]/<slug>/page.tsx` → `TickerRelatedSections.tsx` →
`ticker-v1-cache-utils.ts` (`TICKER_CATEGORY_TO_PATH`) → `<slug>-sitemap.xml/route.ts` +
sitemap index → `src/scripts/tickers/*` → stock generation-request model + admin page.

## Standalone (bespoke-table) report — the extra work

If the output is not a factor list, add on top of the category checklist:

- A **new Prisma table** modelled on `TickerV1VsCompetition` / `EtfKeyFactsReport`, plus a
  migration.
- A **bespoke output schema** (don't reuse the generic category schema).
- A **dedicated save branch** in the save-handler switch that writes to the new table.
- **Dedicated cache-tag helpers** (a standalone tag like `tickerCompetitionTag`) and a call
  in the "revalidate all" routine — standalone reports are **not** covered by the per-category
  tag loop.
- For ETFs, a **placeholder** entry in `ETF_REPORT_TYPE_TO_CATEGORY` (follow the KEY_FACTS /
  COMPETITION comment convention).
- The "available siblings" query on the detail page (`getAvailableSiblingSlugs()` /
  `fetchEtfAvailableSlugs()`) may need to also read the new table so the section shows up in
  the sibling nav.

## Architecture note — how generic is this really?

ETF category reports are ~60% config-driven: factors are JSON, prompts are markdown files, the
result table and output schema are shared, and the cache-tag loop is enum-driven. The residual
code is the input-JSON preparer + dispatch case, the data API route, and the page. Stock
reports are further from plug-and-play because factors and prompts are DB-seeded rather than
committed, but the category-result table and schema are still shared.

The recurring friction is that a report type's identity is spread across **enums, constant
maps, switch/dispatch cases, and per-slug route folders** rather than a single registry.
There is no one "register a report type" entry point — see the **New report types** task for a
proposed consolidation (a data-driven registry keyed by slug that the pages, sitemaps, cache
tags, and CLI all read from) that would collapse most of the checklist into one config edit
plus a prompt/factor definition.
