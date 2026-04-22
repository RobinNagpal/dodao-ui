# Stock Reports — KoalaGains (Tasks)

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
