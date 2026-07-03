# Adding a New Stock Report Type (End-to-End Runbook)

How to add a brand-new **report type** to the stock (ticker) analysis pipeline — for
example a new "Capital Allocation" or "ESG" report alongside the existing Financial
Analysis, Competition, Business & Moat, Past Performance, Future Growth, Fair Value,
Management Team, and Final Summary reports.

> This is a knowledge/runbook doc, not a one-off task. The active task entry that points
> here lives in [`../tasks/todo-tasks.md`](../tasks/todo-tasks.md) under **Stocks → Add a
> new stock report type**.

## Background — how a report type flows through the system

Every stock report type is a value of the `ReportType` enum in
[`insights-ui/src/types/ticker-typesv1.ts`](../../../insights-ui/src/types/ticker-typesv1.ts)
(lines ~138–160: the `enum ReportType` plus the `analysisTypes` label list). A report gets
produced through a **generation-request state machine**:

1. **Request** — the admin selects tickers + report types on
   `/admin-v1/create-reports` (`ReportGenerator` component). This POSTs to
   `insights-ui/src/app/api/[spaceId]/tickers-v1/generation-requests/route.ts`, which
   creates/updates a `TickerV1GenerationRequest` row. Each report type is a boolean column
   on that model (`regenerateCompetition`, `regenerateManagementTeam`, …).
2. **Steps** — `report-steps-statuses.ts` turns those booleans into an ordered list of
   pending `ReportType` steps; `generation-report-utils.ts` holds the dependency map + step
   order and dispatches each step to a per-type generate function.
3. **Generate** — the generate function builds the input JSON, resolves the prompt via the
   Prompt DB (`getLLMResponseForPromptViaInvocation…`, prompt key like
   `US/public-equities-v1/<report>`), validates the LLM output against a YAML schema, and
   calls back to save.
4. **Save + advance** — `save-report-callback-utils.ts` switches on `ReportType` and calls
   the matching `save…Response` function, which persists to Prisma and marks the step
   completed. The next pending step runs.
5. **Render** — the stock detail area renders the result. Most report types have a
   dedicated sub-page under
   `insights-ui/src/app/stocks/[exchange]/[ticker]/<report-slug>/`.

See also [`../automated-report-generation.md`](../automated-report-generation.md) for the
background/off-hours generation runner.

## Two flavors of report type

Pick the flavor first — it decides how much schema/persistence work you do:

- **A. Factor-based category report** (like Financial Analysis, Business & Moat, Past
  Performance, Future Growth, Fair Value). Results are stored generically in
  `TickerV1CategoryAnalysisResult` + `TickerV1AnalysisCategoryFactorResult`, keyed by a
  `TickerAnalysisCategory`. The save step reuses `save…FactorAnalysisResponse(...,
  TickerAnalysisCategory.X, ...)`. **No new Prisma table** — you add a `TickerAnalysisCategory`
  value and a factors JSON. Cheapest to add.
- **B. Bespoke report** (like Competition → `TickerV1VsCompetition`, Management Team →
  `TickerV1ManagementTeamReport`, Final Summary → fields on the ticker). Results have their
  own shape, so you add a **new Prisma model** and a dedicated `save…Response` function.

**Recommended worked example: `MANAGEMENT_TEAM`** — it is the most recently added bespoke
report and touches every layer (own table, own save fn, own sub-page, own prompt doc under
[`../stock-prompts/`](../stock-prompts/)). Grep the codebase for `ManagementTeam` /
`management-team` and mirror every hit. For a factor-based report, mirror `FAIR_VALUE`
instead.

## Touch-point checklist

Work top-to-bottom. `<NewType>` = enum member (e.g. `CAPITAL_ALLOCATION`); `<new-slug>` =
kebab value (e.g. `capital-allocation`); `<NewReport>` = PascalCase (e.g. `CapitalAllocation`).

### 1. Type system
- [ ] `insights-ui/src/types/ticker-typesv1.ts` — add `<NewType> = '<new-slug>'` to the
  `ReportType` enum **and** a `{ key, label }` entry to `analysisTypes`.
- [ ] (Flavor A only) add a `TickerAnalysisCategory` value + extend `CATEGORY_MAPPINGS` in
  the same file.

### 2. Generation-request model (Prisma)
- [ ] `insights-ui/prisma/schema.prisma` — add `regenerate<NewReport> Boolean @default(false)`
  to `TickerV1GenerationRequest`.
- [ ] (Flavor B only) add a new result model `TickerV1<NewReport>Report` (mirror
  `TickerV1ManagementTeamReport`) and its back-relation on `TickerV1`.
- [ ] Run a migration (`yarn` prisma migrate / `prisma generate` — `yarn compile` runs
  `prisma generate`).

### 3. API route
- [ ] `insights-ui/src/app/api/[spaceId]/tickers-v1/generation-requests/route.ts` — add
  `regenerate<NewReport>: boolean` to the `GenerationRequestPayload` interface (lines
  ~16–25) and to **both** the update and create blocks (lines ~235–258). It is easy to
  miss one of the two blocks.

### 4. Step / status plumbing (`insights-ui/src/utils/analysis-reports/`)
- [ ] `report-steps-statuses.ts` — add the new type to `getMissingReportTypes()` (missing
  check) and `calculatePendingSteps()` (the `regenerate<NewReport> && !completedSteps…`
  block); update any total-count logic.
- [ ] `report-status-utils.ts` — add a case to the `shouldRegenerateReport()` switch
  returning `request.regenerate<NewReport>`.
- [ ] `report-generator-utils.ts` — add a case that sets
  `payload.regenerate<NewReport> = true` when building a single-report request.
- [ ] `oldest-reports-utils.ts` — (Flavor A) map `<NewType>` → its `TickerAnalysisCategory`
  so the off-hours refresh picks it up; (Flavor B) map only if it participates in refresh.

### 5. Generation + prompt
- [ ] `generation-report-utils.ts` — add `<NewType>` to the dependency map
  (`reportDependencyMap`) and to the ordered `dependencyBasedReportOrder`, write a
  `generate<NewReport>Analysis()` function, and add its `case` to the dispatch switch
  (`triggerGenerationOfAReport…`).
- [ ] `prompt-generator-utils.ts` — add the output schema path to `SCHEMA_PATHS` and a
  `case` in `generatePromptForReportType()` that sets the prompt key and input JSON.
- [ ] `report-input-json-utils.ts` — add a `prepare<NewReport>InputJson()` helper that
  gathers the ticker context (and any upstream report data listed as a dependency).
- [ ] **Prompt DB (Dodao)** — create the `Prompt` + active `PromptVersion` under key
  `US/public-equities-v1/<new-slug>`. Without this the generate step throws at run time.
- [ ] **Output schema** — add the YAML schema referenced in `SCHEMA_PATHS`, under
  `insights-ui/schemas/analysis-factors/…`. Capture the source-of-truth prompt text in
  [`../stock-prompts/`](../stock-prompts/) (see the `management-team` entry as the model).

### 6. Persistence
- [ ] `save-report-callback-utils.ts` — add a `case ReportType.<NewType>:` to the switch
  (lines ~71–99) calling your save function.
- [ ] `save-report-utils.ts` (or the factor-analysis saver for Flavor A) — implement
  `save<NewReport>Response(ticker, exchange, llmResponse, { skipRevalidation })`: persist to
  Prisma and call `revalidateTag` unless `skipRevalidation`.

### 7. UI — request + render
- [ ] `insights-ui/src/hooks/useGenerateReports.ts` — add `<NewType>` to the `reportTypes`
  list and to the payload-building switches (`generateSpecificReportsInBackground`,
  `createFailedPartsOnlyGenerationRequests`) so the checkbox maps to
  `regenerate<NewReport>`. `ReportGenerator.tsx` reads from this hook — no direct edit
  needed.
- [ ] `insights-ui/src/app/stocks/[exchange]/[ticker]/<new-slug>/page.tsx` — add a sub-page
  (mirror `management-team/page.tsx`): fetch the report, render it, export
  `generateMetadata`, wire breadcrumbs/nav. Sibling sub-pages today:
  `business-and-moat`, `competition`, `fair-value`, `financial-statement-analysis`,
  `future-performance`, `management-team`, `past-performance`.
- [ ] Surface a link/section on the main detail page (`page.tsx`) and, if the report should
  be crawlable, add it to the relevant sitemap route.

### 8. Verify
- [ ] `yarn lint && yarn prettier-check && yarn compile` (from `insights-ui/`).
- [ ] Enqueue for one ticker via `/admin-v1/create-reports`, watch it advance on
  `/admin-v1/generation-requests`, confirm the result persists and the sub-page renders.
  The [`generate-stock-reports.md`](generate-stock-reports.md) runbook covers triggering.

## Gotchas

- **The `default:` in `save-report-callback-utils.ts` throws** `Unsupported report type` —
  a missing save case fails only at generation time, not compile time. Grep every switch on
  `ReportType` before shipping; TypeScript will not flag a non-exhaustive `switch` with a
  `default`.
- **Two blocks in the API route** (create + update) both list every `regenerate*` flag —
  update both.
- **Dependency order matters** — if `<NewType>` consumes another report's output, list it in
  `reportDependencyMap` and place it later in `dependencyBasedReportOrder`, or it may run
  before its inputs exist.
- **Prompt key is a runtime contract** — the key in `prompt-generator-utils.ts` must exactly
  match the Prompt DB record; a typo surfaces only when the step runs.
- **Prefer Flavor A** when the report is "N scored factors under one category" — you skip a
  new Prisma table and reuse the factor save path.

## Key files (quick index)

| Layer | File |
|---|---|
| Enum + labels | `insights-ui/src/types/ticker-typesv1.ts` |
| Request model | `insights-ui/prisma/schema.prisma` (`TickerV1GenerationRequest`) |
| API route | `insights-ui/src/app/api/[spaceId]/tickers-v1/generation-requests/route.ts` |
| Steps / status | `insights-ui/src/utils/analysis-reports/report-steps-statuses.ts`, `report-status-utils.ts`, `report-generator-utils.ts`, `oldest-reports-utils.ts` |
| Generate + prompt | `insights-ui/src/utils/analysis-reports/generation-report-utils.ts`, `prompt-generator-utils.ts`, `report-input-json-utils.ts` |
| Save | `insights-ui/src/utils/analysis-reports/save-report-callback-utils.ts`, `save-report-utils.ts` |
| UI request | `insights-ui/src/hooks/useGenerateReports.ts`, `insights-ui/src/components/public-equitiesv1/ReportGenerator.tsx` |
| UI render | `insights-ui/src/app/stocks/[exchange]/[ticker]/<slug>/page.tsx` |
| Prompt text | `docs/insights-ui/stock-prompts/` + Prompt DB key `US/public-equities-v1/<slug>` |
