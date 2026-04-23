# Stock Reports — KoalaGains (Tasks)

## Stock Details Page — layout + per-section detail pages

Restructure the stock report page so heavy sub-reports live on dedicated detail pages and
the main page is a scannable summary.

- [ ] **Move the competition chart up**:
  - Relocate the competition chart so it renders directly **under the Business and Moat
    Analysis** section (currently it sits lower on the page).
  - Keep any existing "competitors list" / ranked competitor UI together with the chart so
    the reader sees the moat narrative + competitive positioning in one block.
- [ ] **Extract a dedicated details page for Financial Statements Analysis**:
  - Move the full financial-statements analysis (income statement, balance sheet, cash flow
    deep-dives, ratios, trend tables/charts) onto its own page (pattern: same as the
    per-category detail pages planned for ETFs).
  - On the main stock page, keep only a short summary/preview with a "View full financial
    statements analysis" link to the details page.
- [ ] **Extract a dedicated details page for Fair Value / Valuation**:
  - Move the full valuation analysis (DCF, multiples-based valuations, scenario tables,
    sensitivity analysis, assumptions) onto its own page.
  - On the main stock page, keep only a short summary (fair-value band, current vs fair
    value, upside/downside %) with a "View full valuation" link.
- [ ] **Navigation / linkage**:
  - Breadcrumbs + back-link from each detail page to the main stock page.
  - From the main stock page, each extracted section has a visible "full analysis" CTA.
  - Update sitemap / metadata for the new detail routes.
- [ ] **SEO**:
  - Unique titles, descriptions, and JSON-LD per new detail page.
  - Ensure the main stock page's summaries don't duplicate the full text (avoid duplicate
    content) — summaries should be genuinely shorter and link out.

## Off-hours automated report refresh (Claude Code cron)

Goal: keep stock reports fresh by letting **Claude Code** regenerate the oldest ones during
hours when the app is otherwise idle, so refresh compute doesn't compete with interactive
usage.

- [ ] **Cron job** that runs during off-hours only.
  - Default window: **10:00 PM – 5:00 AM** (local/app timezone — confirm which timezone and
    document it).
  - Cron ticks periodically inside the window (e.g. every 15–30 min) so the workload spreads
    across the window rather than hitting all at once.
- [ ] **Pick oldest reports first**:
  - Query stocks whose latest report's `updatedAt` (or equivalent "last refreshed" timestamp)
    is the oldest.
  - Batch size per tick should be small and configurable, so a single tick doesn't overrun the
    window.
  - Skip stocks that have been refreshed within a minimum staleness threshold (don't
    re-refresh a report generated a few hours ago).
- [ ] **Claude Code invocation per stock**:
  - For each selected stock, Claude Code runs the existing report prompts (all categories /
    sections we already produce for stocks).
  - Save the results back to the DB using the same pipeline/callback logic the live generation
    path uses — no separate write path.
- [ ] **Guardrails**:
  - Hard stop at the end of the off-hours window (don't run past 5 AM even if the batch isn't
    finished — pick up on the next night).
  - Per-tick timeout so a single slow stock can't hog the window.
  - Skip/flag stocks that fail repeatedly (retry cap + failure log).
- [ ] **Observability**:
  - Log per-run summary: how many stocks attempted, succeeded, failed, total time.
  - Surface failures / stuck stocks somewhere visible (admin page or log).
- [ ] **Config / toggles**:
  - Env / config for: off-hours window (start, end, timezone), batch size per tick, tick
    frequency, minimum staleness threshold, enable/disable flag.
- [ ] **Open questions**:
  - Which category of stock reports are in scope — all of them, or only specific ones that
    tend to go stale fastest?
  - Do we want the same mechanism for ETFs later (the ETF side has a separate "daily
    generation" task in SEO phase — decide whether to unify or keep separate).

## Off-hours automated stock recategorization (Claude Code)

Goal: during off-hours, let Claude Code sweep every stock ticker in our universe, verify
its assigned **category** and **subcategory**, recategorize any that are misplaced, and
trigger report generation for the newly assigned category/subcategory so reports stay in
sync.

Runs in the same off-hours window as the report-refresh cron (10 PM – 5 AM), but as a
**separate scheduled job** so the two don't fight for the window.

- [ ] **Fetch the taxonomy**:
  - At the start of each run, load the current list of **categories** and **subcategories**
    from the source of truth (DB / JSON config — confirm which).
  - Pass the full taxonomy into the Claude prompt as context so classification is consistent
    across the run.
- [ ] **Sweep all stock tickers**:
  - Iterate over every stock in the universe (batched to fit the off-hours window).
  - Prioritize stocks that haven't been re-classified recently, or stocks flagged by earlier
    runs as low-confidence.
  - For each stock, feed Claude: current category/subcategory, company description / profile,
    sector/industry tags, any existing report snippets.
- [ ] **Claude decision per stock**:
  - Output: `{ keep, changeTo: { category, subcategory }, confidence, rationale }`.
  - If `keep` with high confidence — no-op, just log.
  - If `changeTo` — update the stock's category/subcategory in the DB and log the old→new
    transition with rationale.
  - If `confidence` is low or Claude is uncertain — flag for human review instead of writing
    the change.
- [ ] **Trigger reports for new (sub)categories**:
  - After a recategorization, populate / regenerate the relevant reports for the stock under
    its new category and subcategory (reusing the existing generation pipeline).
  - If the new (sub)category is one we have never generated reports for on this stock,
    kick off the full suite for it.
- [ ] **Guardrails**:
  - Hard stop at the end of the off-hours window.
  - Cap on recategorizations per run to avoid a runaway sweep that moves hundreds of stocks
    at once — require human review above a threshold.
  - Batch size + per-stock timeout.
  - Retry/skip on failure with a failure log.
- [ ] **Observability**:
  - Per-run summary: tickers scanned, kept, moved, flagged for review, failed, total time.
  - Audit trail per stock: old category → new category, confidence, rationale, timestamp.
  - Admin page or log surface for the flagged-for-review queue.
- [ ] **Config / toggles**:
  - Env/config: window (start/end/tz), batch size, confidence threshold for auto-apply vs
    flag-for-review, max recategorizations per run, enable/disable flag.
- [ ] **Open questions**:
  - Should this share the same cron infrastructure as the report-refresh job, or be fully
    independent?
  - What's the right cadence — nightly, weekly, or only when the taxonomy itself changes?
  - How do we prevent thrashing when Claude oscillates between two plausible categories for
    the same stock across runs? (e.g. hysteresis: require the new category to win twice in a
    row before applying.)

## Trends page (stocks)

Goal: a dedicated page where we record long-running **trends** — macro, demographic,
generational, technological, regulatory — and map each trend to the **stocks** that would
likely benefit if the trend plays out. The value is in catching trends whose implications are
**not yet priced in**, so we (and readers) can identify candidates ahead of the move.

The ETF **scenarios** feature (see `insights-ui/prisma/schema.prisma` `EtfScenario` +
`EtfScenarioEtfLink`, and `src/types/etfScenarioEnums.ts`) already solves a very similar
shape — probability, timeframe, priced-in, expected price change, winners/losers, historical
analog. We should **borrow its schema and UI patterns** for the stock-trends feature rather
than invent new ones.

- [ ] **Trend entries** — each trend should capture (mirrors `EtfScenario` fields where
  sensible):
  - **Title** + short description (e.g. "2026 — aging boomer retirement wave drives healthcare
    demand", "younger generation prefers experiences over ownership", "shift from ICE to EV",
    "re-shoring of semiconductor manufacturing", etc.).
  - **Slug** — stable URL-safe identifier, derived from title on create.
  - **Underlying cause** (markdown) — why the trend is happening.
  - **Historical analog** (markdown) — past equivalent shift. Borrowed from scenarios; very
    high-value for trends (e.g. dot-com adoption curve, boomer housing demand in the 1970s).
  - **Direction** — `UPSIDE` / `DOWNSIDE` (reuse the scenario enum): does the trend lift or
    depress mapped stocks?
  - **Timeframe / lifecycle** — `FUTURE` / `IN_PROGRESS` / `PAST`. Replaces the earlier
    "active / played-out / invalidated" question — `PAST` ≈ played out.
  - **Probability bucket** — `HIGH` (>40%) / `MEDIUM` (20–40%) / `LOW` (<20%).
  - **Probability percentage** (optional int 0–100) — numeric override when we have a
    sharper estimate.
  - **Priced-in bucket** — `NOT_PRICED_IN` / `PARTIALLY_PRICED_IN` / `MOSTLY_PRICED_IN` /
    `FULLY_PRICED_IN` / `OVER_PRICED_IN`.
  - **Expected price change** (int %) + **expectedPriceChangeExplanation** (markdown) +
    **priceChangeTimeframeExplanation** (markdown) — same trio scenarios use.
  - **Outlook** (markdown) + **`outlookAsOfDate`** — "last reviewed" date.
  - **Evidence / sources** (markdown or structured list).
  - **Archived** boolean — soft-delete, same pattern as scenarios.
  - **Author** + `createdAt` / `updatedAt`.
- [ ] **Mapped stocks** (join table, mirror `EtfScenarioEtfLink`):
  - `trendId`, `stockId` (nullable), `symbol`, `exchange`.
  - **Role** — `WINNER` / `LOSER` / `MOST_EXPOSED`. Winners benefit from the trend, losers
    suffer, most-exposed are high-sensitivity for risk management.
  - **Role explanation** (markdown) — per-stock thesis.
  - **Expected price change** (int %) + explanation (markdown) — stock-specific move,
    separate from the trend-level estimate.
  - `sortOrder` for display order within a role group.
- [ ] **Page UI** (mirror the scenarios pages):
  - **Trends index** — card grid with direction / probability / timeframe badges, one-line
    excerpt. Client-side filter bar (direction, probability, timeframe, search).
  - **Trend detail page** — underlying cause, historical analog, priced-in + expected move
    box, winners/losers side-by-side, most-exposed section, outlook with `outlookAsOfDate`,
    JSON-LD Article schema.
  - **From a stock's report page**, link to the trends that reference it ("This stock
    appears in the following trends").
- [ ] **Authoring flow**:
  - Admin upsert modal (pattern: `UpsertEtfScenarioModal.tsx`).
  - Optional: Claude-assisted draft — given a trend description, suggest candidate stocks +
    initial thesis + "priced-in?" assessment for human review.
  - Consider bulk markdown import (pattern: `etf-scenario-markdown-parser.ts`).
- [ ] **Storage + caching**:
  - Prisma models: `StockTrend` + `StockTrendStockLink` (shapes mirror the scenario models),
    or a shared `Trend` model if we decide to unify across stocks and ETFs (see below).
  - Space-scoped (`spaceId`), cache-tag revalidation on create/update.
  - Zod schemas at API boundaries.
- [ ] **Open questions**:
  - Should trends be **shared** between stocks and ETFs (one trend, linked to both stock and
    ETF join tables), or **parallel datasets**? (See ETF-side task for the symmetrical ask.)
    Leaning towards shared, since the underlying cause / historical analog is identical —
    only the mapped assets differ.
  - Do trends need a separate "trend category" taxonomy (macro / demographic / generational /
    technological / regulatory) for filtering, beyond what scenarios have?

## Custom Reports ("random reports") per stock

Source: design doc `docs/ai-knowledge/projects/insights-ui/requirements/req-001-stock-custom-reports.md`
(PR #1318). Summary below; read the doc before implementing.

Goal: let a user (or curator) attach **arbitrary, free-form investigation reports** to a
single ticker — e.g. "Why did Beta Farms (BYRN) drop in Q1 2026 and will it drop further?",
"Is the recent insider selling a red flag?", "How exposed is this ticker to a 50% tariff on
Chinese imports?". Each ticker has **0..N** Custom Reports; each is a one-shot prompt → one-shot
answer with regeneration history.

- [ ] **Data model** (new Prisma tables — see §5 of the design doc):
  - `TickerV1CustomReport` — one row per report on a ticker; holds `title`, `userQuestion`,
    optional `templateKey`, denormalized `latestAnswerMarkdown` / `latestAnswerJson` /
    `latestSources` / `latestRunId`, `status` (`NotStarted` / `InProgress` / `Completed` /
    `Failed`), `archived` soft-delete, audit fields.
  - `TickerV1CustomReportRun` — one row per LLM invocation; links to `PromptInvocation`;
    keeps history so we can compare answers over time.
  - Optional `TickerV1CustomReportTemplate` — curated pre-written prompts with placeholders
    (e.g. "Explain a recent stock drop") that users can pick from.
  - Backref `TickerV1.customReports`.
- [ ] **API** — under the existing per-report namespace
  `/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/custom-reports`:
  - `GET` list, `POST` create (kicks off first Run), `GET /[reportId]` detail with all Runs,
    `POST /[reportId]/regenerate`, `PATCH /[reportId]` (title / archive).
  - Admin route for curated templates: `/api/[spaceId]/tickers-v1/custom-report-templates`.
  - Handlers stay thin; work goes into `src/utils/analysis-reports/custom-report-utils.ts`.
- [ ] **Prompt infra reuse**:
  - All LLM calls go through `getLLMResponseForPromptViaInvocation` with a single generic
    system prompt registered as `promptKey: 'US/public-equities-v1/custom-report'`.
  - The `inputJson` carries ticker context (symbol/name/industry, cached financials, latest
    summary, 30d price move, recent news) **plus** the user's question or resolved template.
  - We get `Prompt` / `PromptVersion` / `PromptInvocation` versioning, status, model id,
    error capture, raw I/O for free.
- [ ] **Output shape** the LLM must return:
  - `answerMarkdown` — long-form rendering on the detail page.
  - `answerJson`: `{ summary, keyPoints[], verdict?: 'Bullish'|'Bearish'|'Neutral',
    confidence?: 'Low'|'Medium'|'High', sources?: { title, url }[] }`.
- [ ] **UI**:
  - Add a **"Custom Reports"** section to the V1 stock detail page
    (`app/stocks/[exchange]/[ticker]/page.tsx`): `[+ New Report]` button, card grid of
    existing reports (title, `answerJson.summary`, verdict pill, `updatedAt`), empty state
    with Beta Farms example.
  - New sub-page `app/stocks/[exchange]/[ticker]/custom-reports/[reportId]/page.tsx` —
    full markdown render, sources list, "Regenerate" (permission-gated), collapsed history
    panel of prior Runs.
  - **New-report modal** with two tabs: **From template** (dropdown with preview of
    substituted prompt) and **Free-form** (title + question textarea). Submit optimistically,
    show `InProgress`, poll until `Completed`.
  - Admin CRUD page for curated templates.
- [ ] **Generation flow** (v1 = synchronous inside the POST handler, matches
  `future-risk/route.ts`):
  1. Load ticker; insert Report (`NotStarted`) + first Run (`InProgress`); return
     `201 { reportId, runId }`.
  2. `await` `getLLMResponseForPromptViaInvocation`.
  3. On success: populate Run fields, flip Report to `Completed`, update denormalized latest-*
     fields and `latestRunId`.
  4. On failure: store `errorMessage`, mark Run `Failed`; keep prior successful answer if one
     existed, else mark Report `Failed`.
- [ ] **Permissions / quotas / abuse**:
  - Space-scoped via existing membership check (same as other V1 POST routes).
  - Per-user quota: cap N Custom Reports per ticker per user per day (config-driven).
  - Hard output-length cap in the system prompt; no recursive web-research tools in v1.
  - Archive-only (no row deletion) in v1; only creator or admin can edit/archive.
- [ ] **Why not extend `TickerV1GenerationRequest`**:
  - That model is a fixed set of boolean flags for the closed list of canonical sections.
  - Custom Reports are open-ended, per-row ids, per-report status, multiple runs — a dedicated
    pair of tables is cleaner and keeps the batch regen pipeline focused.
- [ ] **Phased rollout** (from §12):
  - **P0**: schema + migration + admin curated-template CRUD (no user-facing UI yet).
  - **P1**: list + detail + create-from-template modal on the V1 ticker page.
  - **P2**: free-form prompt behind a feature flag; per-user quota enforced.
  - **P3**: streaming answers, web-search citations, history diff view.
- [ ] **Open questions to resolve before P1**:
  - Streaming vs spinner-then-render (rec: spinner for v1).
  - Free-form vs templates-only at launch (rec: ship both, free-form behind flag).
  - Citations — synthesize-only for v1; web-search citations need separate design.
  - Cross-ticker reports are explicitly out of scope here.

## Login improvements

Goal: grow logged-in users by broadening SSO coverage and nudging highly-engaged anonymous
visitors into signing up.

- [ ] **Add more SSO providers**:
  - Add **LinkedIn** SSO (most relevant for our finance/professional audience).
  - Add **Yahoo** SSO.
  - Confirm which existing providers we already support and keep the UI tidy (don't let the
    login sheet become a wall of buttons — prioritize the 3–4 most-used).
  - Handle account-linking: if a user signs in with a new provider using an email that
    matches an existing account, link them instead of creating a duplicate.
- [ ] **Click-count login gate**:
  - Track the number of "meaningful clicks" per anonymous visitor (e.g. clicks on interactive
    buttons / CTAs — not every scroll or hover).
  - After **3 clicks**, the next click on a gated button should trigger a "sign in to
    continue" prompt instead of performing the action.
  - Tune the threshold (2 vs 3) behind a config flag so we can A/B it without a deploy.
  - Persist the counter across sessions (localStorage + optional server-side by device/IP
    hash) so refresh/re-visit doesn't reset it and bypass the gate.
  - Define "meaningful click" precisely — likely buttons on stock/ETF report pages (e.g.
    "view full valuation", "view competition", "add to watchlist") rather than nav links.
  - Don't gate pure navigation or back-button; only gate value-delivering actions.
- [ ] **Post-login resume**:
  - After the user signs in from the gate, complete the action they were trying to take
    (route them to the clicked page or re-fire the click).
- [ ] **Telemetry**:
  - Event for: click counted, gate shown, gate → login conversion, gate dismissed.
  - Dashboard or admin view to monitor login conversion rate from the gate.
- [ ] **Open questions**:
  - Should logged-in users who already converted ever see this gate again? (No — once signed
    in, the gate is off permanently for that account.)
  - Do we want a "soft" version (banner / tooltip nudge) before the hard gate at click #3?
