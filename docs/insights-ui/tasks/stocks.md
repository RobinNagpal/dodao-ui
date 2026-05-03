# Stock Reports — KoalaGains (Tasks)

## Stock detail page — mobile layout

User feedback: the stock detail page has many issues on mobile and does not look good there.

- [ ] Audit the stock detail page on a real mobile viewport (Chrome DevTools + a real phone) and list the broken pieces: tables overflowing, charts cut off, fonts too small/large, spacing, sticky headers, tap targets.
- [ ] Fix layout issues so the page looks good on mobile (small phones first, then tablet).
- [ ] Verify charts/tables are scrollable or stack cleanly on narrow widths.
- [ ] Re-check after every major section restructure below — moves should not regress mobile.

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

### Use the internet for missing + latest info during Claude Code generation

Goal: when Claude Code regenerates a stock report on the off-hours runner, it should
**actively use the internet** to (a) fill in any **missing** data points the prompt
input lacks, and (b) pull the **latest** information (recent earnings, guidance,
filings, executive changes, news, regulatory actions) before producing the report.
Today the prompt is mostly fed pre-cached fields — that's why reports go stale fast
and why some sections read like they were written from incomplete data.

- [ ] **Update the report-generation prompts** (Business & Moat, Valuation, Financial
  Statements, Future Outlook, Custom Reports — every long-form section) to include
  an explicit instruction along the lines of:
  *"If any input field you need is missing, blank, or stale, **use the internet** to
  find it. Always also search for the **latest** information on this ticker —
  recent earnings, guidance, 8-K filings, executive changes, lawsuits, regulatory
  actions, material news in the last 90 days — and incorporate it before writing
  the section. Cite the source URL for every internet-sourced fact."*
- [ ] **Make sure the Claude Code invocation actually has web access**:
  - Confirm the Claude Code session running on the off-hours runner has web /
    fetch tools enabled — if it's running headless without web access, the prompt
    instruction is a no-op.
  - If we're running through `getLLMResponseForPromptViaInvocation` rather than
    Claude Code, verify that path also exposes web search / fetch.
- [ ] **Output contract additions**:
  - Each section should return a `sources: { url, title, accessedAt }[]` array
    alongside the existing markdown / structured output, so we can render
    citations on the page and audit which claims came from the internet.
  - For numeric or factual claims sourced online, include the **as-of date** in
    the prose so readers don't assume a stale figure is current.
- [ ] **Guardrails on internet use**:
  - Restrict to reputable sources where possible: SEC EDGAR, company IR pages,
    primary news outlets, official regulators. De-prioritize forum posts,
    aggregators, and obvious AI-spam pages.
  - Don't let internet-sourced text dominate the report — the analysis voice
    should still be ours; the internet is an input, not a copy-paste source.
  - Cap per-run wall-clock for internet calls so a single slow site doesn't blow
    the off-hours window budget (ties into the cron's per-stock timeout).
- [ ] **Track internet-augmented vs. pre-cached generation**:
  - Persist a flag on each generated report indicating whether the run used
    internet augmentation, plus a count of unique URLs cited.
  - Surface it in the admin generation-requests view so we can see which reports
    leaned on the internet vs. cached data only.
- [ ] **Validate**:
  - Spot-check a handful of regenerated reports — confirm latest earnings /
    recent material news appear, sources resolve, and the prompt didn't
    hallucinate citations.
  - Compare a pre- and post-change report on the same ticker to confirm
    freshness improved without quality regressing.

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

## Stock scenarios — finish + roll out

Goal: bring the **stock scenarios** feature to 100% complete and ship it publicly. ETF
scenarios already exist end-to-end (`EtfScenario` + `EtfScenarioEtfLink` in
`insights-ui/prisma/schema.prisma`, plus the `app/etf-scenarios`, `admin-v1/etf-scenarios`,
`api/[spaceId]/etf-scenarios`, and `components/etf-scenarios` trees).

**Phase 1 (foundation) shipped 2026-04-24** — Prisma models (`StockScenario` +
`StockScenarioStockLink` with country scope), public listing + detail pages under
`src/app/stock-scenarios/`, admin CRUD + import under `src/app/admin-v1/stock-scenarios/`,
public + admin API routes under `/api/[spaceId]/stock-scenarios/` and `/api/stock-scenarios/`,
component suite under `src/components/stock-scenarios/`, markdown parser
(`stock-scenario-markdown-parser.ts`) and `stock-scenarios:import` script. Phase 2/3/4
below are the remaining open work.

- [ ] **Phase 2 — reverse link on stock report pages**:
  - New public API: `/api/[spaceId]/stock-scenarios/for-symbol?symbol=...` returning
    `StockScenarioStockLink` rows for a given symbol.
  - On `src/app/stocks/[exchange]/[ticker]/page.tsx`, fetch and render a "This stock
    appears in the following scenarios" block: scenario title (link to
    `/stock-scenarios/<slug>`), direction + timeframe + probability badges, role
    (`WINNER` / `LOSER` / `MOST_EXPOSED`), and the link's `expectedPriceChange` so the
    reader sees the per-stock estimate.
  - Cache-tag the fetch with `stockScenarioBySlugTag` + a new per-symbol tag so
    revalidating a scenario also updates any stock pages that referenced it.
  - The ETF-side symmetrical reverse link was deferred; ship it for stocks because
    individual tickers sit in many more scenarios than any one ETF does.
- [ ] **Phase 3 — seed content**:
  - Draft a first batch of ~15–30 stock scenarios as markdown matching
    `stock-scenario-markdown-parser.ts`. Each needs title, underlying cause, historical
    analog, direction, timeframe, probability bucket (+ optional %), priced-in bucket,
    expected price change + explanation + timeframe explanation, winners/losers
    narrative, outlook + `outlookAsOfDate`.
  - **Exactly 5 winners + 5 losers + 5 most-exposed per scenario** (same convention as
    ETF scenarios — if you reach for a sixth, drop the weakest existing one). The
    five-per-role rule applies per scenario overall, not per country.
  - Prefer pure-play / sector-specific tickers over diversified giants (AAPL, MSFT,
    GOOGL) when both would qualify — same rationale as the ETF rule favouring XLE/XOP
    over SPY.
  - Each scenario must declare `countries[]` — pick the smallest correct set (a US
    regional-banks scenario is `["US"]`, not `["US", "Canada"]` even if Canadian banks
    are loosely correlated).
  - Import via the admin "Import from doc" button.
- [ ] **Phase 4 — Claude-assisted draft + auto-refresh outlook** (follow-up):
  - **Claude-assisted draft** — given a scenario description, ask Claude to suggest
    candidate stocks for each role + a first-pass role explanation + priced-in
    assessment. Human reviews and publishes. Reuse the `AUTOMATION_SECRET` path via
    `POST /api/stock-scenarios`.
  - **Auto-refresh outlook** — scheduled job that re-visits `outlookAsOfDate` on
    scenarios older than N weeks and asks Claude whether the thesis is still intact /
    needs a probability or priced-in update.
- [ ] **Surface + roll-out** (cross-cuts Phase 2):
  - Home-page entry point (card / tile next to the ETF scenarios entry, or a combined
    "Scenarios" section that branches into stocks vs ETFs); show featured / most-recent
    / highest-confidence scenarios.
  - "Scenarios" link in the main stocks navigation / list page header.
  - Add a stock-scenarios sitemap (e.g. `app/stocks/stock-scenarios-sitemap.xml/route.ts`),
    wire it into the parent sitemap index, and pre-empt the "Crawled — currently not
    indexed" issue (see SEO Fixes) by shipping unique per-scenario titles/meta and
    real internal links.
  - Definition of done: a logged-out visitor can reach the listing from the home page,
    open a detail page, and click through to a related stock — all SSR'd, indexable,
    and in the sitemap; admin can create / edit / archive end-to-end via
    `admin-v1/stock-scenarios`.

### Open questions (decide before Phase 2/3/4 land)

- [ ] **Shared scenarios table vs parallel tables with ETFs?** Underlying cause and
  historical analog are identical between an ETF and stock counterpart of the same
  scenario; only winner/loser/most-exposed lists differ. Option A (parallel tables) is
  simpler and matches today's code. Option B (shared `Scenario` table + `ScenarioEtfLink`
  + `ScenarioStockLink`) is one source of truth for the narrative but requires migrating
  the existing `EtfScenario` data and updating every caller. Pick before any further
  schema work — hard to walk back. Same question is flagged on the Trends task.
- [ ] **Scenario numbering across asset classes** — if shared, a single `scenarioNumber`
  is natural; if parallel, decide whether stock scenarios restart at 1 or continue the
  ETF sequence.
- [ ] **Cross-asset link on scenario detail page** — only meaningful in Option B; the
  detail page can show "Stocks in this scenario" + "ETFs in this scenario" side-by-side.
- [ ] **Ticker resolution edge cases** — stocks change tickers / merge / delist more
  often than ETFs. Decide how the link row handles a delisted ticker: keep as plain text,
  auto-archive, or flag for review.
- [ ] **Mapping to sub-industries** — should each scenario carry an optional list of
  relevant sub-industries so the stock detail page can flag "any scenario tagged to this
  ticker's sub-industry even if the ticker itself isn't in the 15-row list"? Breadth vs
  noise tradeoff.
- [ ] **Country scope changes over time** — admins editing `countries[]` in place is
  fine when adding (link-validation makes the new country additive), but *removing* a
  country leaves orphan links. Spec the server to either reject the removal or
  auto-archive the now-out-of-scope links.
- [ ] **Default country filter** — start with "All countries" on the listing page;
  revisit once we have usage data on whether locale-defaulting helps or hides discovery.
- [ ] **Which stock model is the FK target?** The schema has both `Ticker` and
  `TickerV1` families. Confirm whether `StockScenarioStockLink.tickerKey` should FK to
  `TickerV1`, `Ticker`, or resolve loosely by `(symbol, exchange)` without an FK. ETF
  side uses a strict FK to `Etf`; pick before any migration.
- [ ] **ADR + dual-listing handling** — e.g. Alibaba (`BABA` on NYSE, `9988` on HKEX).
  Does a link-row represent both listings, the primary, or two rows (one per country)?
  Two-row is more honest but risks double-counting in listings.
- [ ] **Markdown source format for non-US tickers** — the ETF parser reads bare
  uppercase tokens. Non-US scenarios need `EXCHANGE:SYMBOL` qualifiers, which breaks
  drop-in compatibility. Decide between (a) qualifiers everywhere for uniformity, or
  (b) auto-assume `NASDAQ` / `NYSE` when no qualifier is present.
- [ ] **Shared scenario enums** — renaming `etfScenarioEnums.ts` → `scenarioEnums.ts`
  is a breaking import across the existing ETF code; a re-export shim makes it safe but
  grep-for-enums becomes noisier. Confirm before flipping.
- [ ] **Sitemap entries** — ETF scenarios are currently not in any `sitemap*.ts`.
  Recommend adding for stock scenarios since traffic potential is higher.
- [ ] **Per-symbol reverse-link cache tag** — settle the tag-name shape (e.g.
  `stock_scenario_for_symbol:<EXCHANGE>:<SYMBOL>`); every link add/remove invalidates
  the tags for the old AND new symbol, cheap given the 15-row cap.

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

## 10-bagger shortlist — small-cap candidates filtered by Business & Moat

Goal: build a shortlist of potential **10-baggers** — stocks with a credible path to a
~10x return — biased toward **small-caps**, where the upside math actually works. Use
our existing **Business & Moat** score as the first-pass filter, then evaluate the
survivors through a structured 10-bagger lens.

- [ ] **Cast the initial pool** (cheap filter, run from the existing data):
  - **Market cap**: small-cap band (e.g. roughly $300M – $2B; tune the upper bound
    once we see how many candidates pass the moat filter).
  - **Business & Moat score ≥ 4** (out of 5) from the existing per-ticker analysis.
  - **Liquidity floor**: minimum average daily $-volume so the pick is actually
    investable (e.g. ≥ $1M ADV) — drop OTC / dark stocks unless explicitly
    desired.
  - **Data completeness**: only include tickers where the Business & Moat report
    is fully generated and recent (mirror the ETF `isComplete` pattern).
- [ ] **Evaluate each candidate through the 10-bagger lens** (qualitative + a few
  quantitative checks per ticker):
  - **TAM / runway** — is the addressable market at least 10x the company's
    current revenue? Without big TAM there's no 10x.
  - **Unit economics + margin expansion path** — gross margin trend, operating
    leverage on next-stage revenue, free-cash-flow inflection.
  - **Reinvestment runway** — high incremental ROIC + room to redeploy
    incremental capital at similar returns.
  - **Founder / owner-operator quality** — founder still in the seat, insider
    ownership, capital-allocation track record, alignment.
  - **Niche dominance** — clear category leadership in a specific niche, not
    a marginal player in a crowded one.
  - **Optionality** — adjacent products / geographies / customer segments the
    business can credibly expand into.
  - **Customer / supplier / regulatory concentration risks** — fewer the
    better; flag any single-point dependency.
  - **Catalyst / inflection** — what specific change in the next 12–24 months
    plausibly re-rates the multiple?
  - **Why hasn't this rerated already?** — a real 10-bagger setup needs an
    answer here (under-followed, micro-cap stigma, recent spin-out, recent
    IPO lockup, post-restructuring, etc.).
- [ ] **Scoring + shortlist**:
  - Score each candidate 1–5 on the lens dimensions above; require an average
    threshold (e.g. ≥ 3.5) before it makes the shortlist.
  - Hand-pick the top **~10 names** for the published list — keep it short on
    purpose; a shortlist of 50 isn't a shortlist.
- [ ] **Output / surface**:
  - Decide where the shortlist lives — a curated content page (e.g.
    `/stocks/10-baggers` or under a "Watchlist" surface), with one card per name
    showing Business & Moat score, market cap, and a 1-paragraph "why this could
    10x" summary.
  - Each card links to the existing stock report page (Business & Moat,
    Valuation, Custom Reports) for the full analysis.
  - Include the methodology (filters + lens) on the page so the picks are
    transparent.
- [ ] **Refresh cadence**:
  - Re-run the filter + lens evaluation on a regular cadence (likely quarterly,
    after the Business & Moat scores are themselves refreshed) on the off-hours
    Claude-Code runner — don't let the list go stale.
  - Track entries that get added / removed / promoted / cut, so the list has a
    visible track record over time.
- [ ] **Open questions**:
  - Should the lens evaluation produce a **persisted** structured field on each
    `TickerV1` (e.g. `tenBaggerScore` + per-dimension subscores) so it can be
    queried / sorted independently of being on the shortlist? Likely yes — the
    score is useful even for stocks that don't make the top 10.
  - Do we want a "honorable mentions" tier (next 10) or a single hard cut?
  - Geographic scope — US only at first, or also include Canadian small-caps once
    `etfs.md` 1.7 unlocks the broader Canadian universe?

## Founder & management team — LinkedIn-sourced info

Goal: founders and management teams are one of the most-cited reasons a great
business stays great (or a mediocre one re-rates). For every stock we cover, surface
the **founder + key executives** with their LinkedIn profiles, tenure, and a short
human-readable bio, so readers can size up the people running the business at a
glance. This also feeds the **founder / owner-operator quality** dimension of the
10-bagger lens above.

- [ ] **Data shape — per stock** (extend the existing ticker model):
  - `keyPeople: { role, name, title, linkedinUrl, photoUrl?, tenureSinceYear?,
    isFounder: boolean, bio: string, source }[]`.
  - At minimum capture: **founder(s)**, **CEO**, **CFO**, **COO/President**, plus
    any board chair / lead-director if distinct from CEO.
  - `source` records where each row came from (e.g. company website, 10-K, proxy
    statement, manual curation, scraping-lambdas extractor) so we can re-validate
    later.
  - Audit fields (`updatedAt`, `verifiedAt`) so we know how stale a row is.
- [ ] **Acquisition strategy** (be deliberate — LinkedIn ToS bans scraping):
  - **Do not scrape LinkedIn directly.** Instead, build a LinkedIn-URL **resolver**
    that (a) takes the canonical name + company from official sources, then
    (b) accepts a `linkedinUrl` either through a public company page that already
    links it, an admin curation tool, or a paid people-data provider (PDL,
    Clearbit, Crunchbase, etc.) that has its own LinkedIn licensing.
  - Primary structured sources: company **About / Leadership** page, latest
    **10-K / 20-F / proxy statement**, IR site, press releases.
  - Use the existing `scraping-lambdas` infra to ingest the structured
    leadership tables from these sources; LinkedIn URL is enriched on top, not the
    primary key.
- [ ] **Surfacing on the stock page**:
  - Add a **"Leadership"** block to the stock detail page (place next to or under
    Business & Moat — that's where the analysis already references management).
  - Card per person: photo (where licensed), name, title, "Founder" badge if
    applicable, tenure, 1–2 sentence bio, LinkedIn icon link (rel=`nofollow noopener
    external`).
  - Compact mode for the main stock page; full list on the per-section detail
    page (mirrors the holdings pattern).
- [ ] **Use the data in analysis**:
  - Pass the leadership block into the **Business & Moat** prompt input (founder
    presence, tenure, insider ownership signals) so the moat narrative grounds
    its team-quality claims in actual data, not inference.
  - Feed the same data into the **10-bagger lens** scoring (founder / owner-
    operator dimension).
- [ ] **Refresh + verification**:
  - Schedule a quarterly re-ingest on the off-hours Claude-Code runner so people
    who join / leave / change titles flow in.
  - Provide an admin verification UI (mirror the per-ETF generation-requests page
    pattern) that flags rows older than N months for human review.
- [ ] **Open questions / risks**:
  - **Compliance** — confirm with legal that storing publicly-listed LinkedIn
    URLs (just the URL, not scraped profile content) is fine. Do not cache
    photo / bio HTML pulled from LinkedIn — use issuer-supplied or licensed
    photos.
  - **Coverage** — what's the minimum set of people required before we render
    the block? (e.g. CEO + at least one founder if applicable.) Suppress the
    block entirely below threshold rather than rendering a half-empty card grid.
  - **De-duplication** — same person can be on multiple boards / multiple
    tickers (parent + sub); decide whether to model `Person` as its own table
    with stock links, or denormalize per ticker.

## Management Team Experience and Alignment — new optional report type

Goal: add an **8th** stock report type — **Management Team Experience and Alignment** —
alongside the existing seven (Business & Moat, Financial Statement Analysis, Past
Performance, Future Growth, Fair Value, Future Risk, Vs Competition; see
`TickerAnalysisCategory` + `TickerV1CategoryAnalysisResult` +
`TickerV1GenerationRequest` in `insights-ui/prisma/schema.prisma`). Where the
**Founder & management team — LinkedIn-sourced info** task above handles the *who*
(Leadership block: photos, tenure, LinkedIn URLs), this report answers
**"how experienced is this team and how aligned are they with long-term
shareholders?"** in a focused, narrative format.

This report is intentionally **optional** — no back-fill of stocks whose reports
were generated before this category shipped. It only gets created for tickers that
go through a "generate all reports" run *after* the category lands.

### What the report covers

Exactly four things, in this order:

1. **Who's running the company** — names + titles of each key management team
   member (CEO, CFO, COO/President, founder if separate, board chair if
   distinct from CEO). Pulled from the Leadership block populated by the
   "Founder & management team — LinkedIn-sourced info" task.
2. **Tenure** — how long each person has been in their current role and at the
   company overall. Flag founders, recent hires, and unusually short or long
   tenures vs. industry norm.
3. **Ownership + compensation alignment** — each named exec's stock ownership
   as a % of shares outstanding (and approximate $ value), the structure of
   their compensation (cash vs equity, performance-vested vs time-vested,
   metrics that govern long-term incentive plans), and whether comp design
   actually rewards long-term company growth (e.g. revenue / FCF / ROIC over
   multi-year windows) vs. short-term proxies (single-year EPS, stock price,
   ESG fluff).
4. **Insider buying / selling** — net insider activity over the trailing
   12 months (Form 4 filings), distinguishing planned 10b5-1 sales from
   discretionary trades. Heavy buying = strong conviction signal; persistent
   selling = a yellow flag worth surfacing.

### Verdict scale (NOT 0–5)

Use a categorical enum that names the overall *experience-and-alignment* posture
of the team. Don't fall back to generic "Very Bad / Bad / Fair / Good" — pick
labels that actually describe the construct. Recommended `AlignmentVerdict`
enum:

- `OWNER_OPERATOR` — founder(s) still in the seat, double-digit insider
  ownership, recent buying or no selling, comp materially tied to long-term
  metrics.
- `STRONGLY_ALIGNED` — non-founder team but long-tenured, meaningful insider
  ownership, LTI tied to multi-year performance metrics, no concerning
  insider sales.
- `ALIGNED` — typical professional management with reasonable tenure, modest
  ownership, conventional comp structure; no red flags but nothing
  exceptional either.
- `WEAKLY_ALIGNED` — low insider ownership, short or churn-prone tenure,
  comp dominated by short-term proxies, mixed insider activity.
- `MISALIGNED` — concerning combination of insider selling, governance flags,
  short tenures, and / or comp design that pays out regardless of long-term
  outcomes.

Render the verdict as a labeled pill on both the summary block and the detail
page; use distinct colors per level so a reader can pattern-match across
tickers at a glance.

### Tasks

- [ ] **Data model** — keep it simple, narrative-shaped (don't reach for the
  factor pattern):
  - Either add `MANAGEMENT_TEAM_EXPERIENCE_AND_ALIGNMENT` to
    `TickerAnalysisCategory` and reuse `TickerV1CategoryAnalysisResult` for the
    `summary` + `overallAnalysisDetails` markdown, **plus** a new
    `alignmentVerdict` column on that table (or a dedicated companion table),
    *or* add a fresh top-level model `TickerV1ManagementTeamReport` mirroring
    `TickerV1FutureRisk`'s shape: `summary` (markdown, ~2 paragraphs),
    `detailedAnalysis` (markdown, 5–7 paragraphs), `alignmentVerdict`
    (enum), audit fields. Pick the model based on whether the verdict enum
    fits the shared category result row or not.
  - Add the new `AlignmentVerdict` enum to the Prisma schema (or
    `src/types/`) with the five values above.
  - Add `regenerateManagementTeamExperienceAndAlignment` to
    `TickerV1GenerationRequest` so the "generate all reports" pipeline picks
    this up by default for new runs.
  - **Do NOT** add a corresponding score to `TickerV1CachedScore` — this
    report uses a categorical verdict, not a 0–5 score, so it should not feed
    the numeric `finalScore` rollup. Surface the verdict separately.
- [ ] **No back-fill, opt-in by default for new generations**:
  - Migration is purely additive — no historical data to populate.
  - The "generate all reports" entry point flips
    `regenerateManagementTeamExperienceAndAlignment = true` so newly-requested
    full runs include it.
  - Existing stock pages whose generation pre-dated this section keep
    rendering as today; the UI hides the new section entirely when no row
    exists (see UI tasks below — no half-empty card / no "coming soon"
    placeholder).
- [ ] **Prompt + inputs** (reuse `getLLMResponseForPromptViaInvocation`):
  - Register a new `promptKey:
    'US/public-equities-v1/management-team-experience-and-alignment'`.
  - `inputJson` carries: ticker symbol/name/industry, the **Leadership block**
    rows (`keyPeople[]` with name, title, tenure, founder flag), recent
    **proxy / DEF 14A** excerpts (compensation, ownership, related-party
    sections), trailing-12-month **Form 4** insider transactions (buyer,
    seller, $ amount, 10b5-1 flag).
  - Output contract:
    - `summary`: ~2 paragraphs (target ~150–250 words) suitable for the
      main stock page.
    - `detailedAnalysis`: 5–7 paragraphs (target ~600–900 words) covering
      the four areas above in order. Each numbered exec mention should
      include their tenure inline.
    - `alignmentVerdict`: one of the 5 enum values.
  - Cite sources (proxy section, Form 4 filing date) inline so claims are
    auditable.
- [ ] **API**:
  - `GET /api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/management-team-experience-and-alignment`
    — returns the row + verdict, or 404 if absent (caller treats 404 as "not
    generated yet", not an error).
  - `POST` regenerate route that mirrors `future-risk/route.ts` —
    synchronous v1, flips the section's regen flag and invokes the prompt
    end-to-end.
  - Wire the new section into the batch regeneration handler that consumes
    `TickerV1GenerationRequest`, but **only when the "generate all" flag is
    set** — no implicit back-fill on individual-section regens of older
    tickers.
- [ ] **UI — main stock page**
  (`app/stocks/[exchange]/[ticker]/page.tsx`):
  - When the report exists, render a **Management Team Experience and
    Alignment** summary card: section title, `alignmentVerdict` pill,
    ~2-paragraph `summary` markdown, and a "View full management team
    analysis" CTA linking to the detail page.
  - When the report does **not** exist (older tickers), render nothing — no
    placeholder, no "coming soon", no empty card. The section is silently
    absent.
- [ ] **UI — new detail page**
  (`app/stocks/[exchange]/[ticker]/management-team-experience-and-alignment/page.tsx`):
  - Header: ticker / company name / verdict pill.
  - Body: full 5–7 paragraph `detailedAnalysis` markdown.
  - Sidebar / top block: the **Leadership block** (founders + key execs from
    the LinkedIn task) so readers see *who* before reading the assessment.
  - Breadcrumbs back to the main stock page.
  - SSR'd, indexable, unique `<title>` + `<meta description>` per ticker
    (avoid the "Crawled — currently not indexed" trap flagged in the SEO
    Fixes section below).
  - Add the route to the relevant per-section sitemap.
- [ ] **Integration with adjacent features**:
  - **Business & Moat** prompt input should optionally include the
    `summary` + `alignmentVerdict` so the moat narrative grounds team-quality
    claims in this report's verdict instead of re-deriving them inline.
  - **10-bagger lens** "founder / owner-operator quality" dimension should
    map to `alignmentVerdict` (e.g. `OWNER_OPERATOR` ⇒ top score, `MISALIGNED`
    ⇒ bottom).
  - **Custom Reports** — include the management-team report's `summary` +
    `alignmentVerdict` in the generic custom-report prompt's `inputJson` so
    user questions about leadership are grounded in our own analysis.
- [ ] **Off-hours refresh**:
  - Add this section to the off-hours regeneration cron (see "Off-hours
    automated report refresh" above) but only for tickers that already have a
    populated row — don't use the cron to retro-back-fill the entire
    universe.
  - Bump priority on tickers where a CEO/CFO/founder departure was detected
    (Form 8-K Item 5.02) so the verdict catches the change quickly.
- [ ] **Open questions**:
  - **Verdict-only-without-detail tickers** — if the Leadership block /
    proxy data is too thin to write 5–7 paragraphs, do we suppress the
    report entirely, or render a shorter version with a "limited data"
    flag? Lean towards suppressing — a half-baked alignment verdict is
    worse than no verdict.
  - **Frequency of refresh** — proxy filings update annually, Form 4s
    arrive continuously. Pick separate refresh cadences (e.g. annual full
    regen post-proxy, lighter monthly regen that only updates the insider-
    activity paragraph) or one combined cadence?
  - **Verdict colour mapping** — settle the pill colours up front so they're
    consistent across the summary card, detail page header, and any future
    listing/filter UI.
  - **Cross-ticker comparability** — do we want a future "leaderboard" view
    of `OWNER_OPERATOR` tickers as a discovery surface? Out of scope for v1
    but the schema should not preclude it.

## Social media content — convert reports into posts

Goal: turn the work we already produce (stock reports, **stock scenarios**, the
10-bagger shortlist, founder/management profiles, trends) into a steady cadence of
**social media content** that drives traffic back to KoalaGains. The content engine
should be cheap to run (built on top of artifacts we already generate) and consistent
enough that we ship something useful every week without a one-off scramble.

This task is paired with the ETF-side equivalent in `etfs.md` — they should share the
templates, queue, and posting infra. Don't build two parallel systems.

- [ ] **Content sources we can mine** (today + planned):
  - **Stock scenarios** (the new feature being finished + rolled out — see "Stock
    scenarios — finish + roll out" above): each scenario card / detail page is a
    natural post — direction, timeframe, priced-in bucket, expected move, winners
    / losers — formatted for a hook + 3–5 bullet points + chart.
  - **10-bagger shortlist**: a quarterly "10 small-caps we think can 10x" thread is
    one of the highest-share post shapes for retail finance; the lens scoring +
    one-paragraph "why this could 10x" maps cleanly onto a numbered post.
  - **Founder / management team profiles**: short LinkedIn-style "founder spotlight"
    posts pulling from the new `keyPeople` data.
  - **Off-hours-refreshed reports**: when a Business & Moat / Valuation / Custom
    Report regenerates, the diff (verdict change, fair-value change, new risks
    flagged) is itself post-worthy.
  - **Stock trends** (once the trends page ships): each trend → multiple posts
    (the trend itself, the winners list, the losers list, an "is it priced in?"
    angle).
- [ ] **Content templates** — codify a small set of repeatable shapes so we're not
  reinventing every post:
  - **Scenario card post** — hook, one-line setup, direction + timeframe +
    probability + priced-in, 1–3 bullets on the thesis, link to scenario detail.
  - **Top-N post** (10-baggers, top dividend payers, top moats by sector, etc.) —
    numbered list, one line per name, link to the curated list page.
  - **Founder spotlight** — photo, name + title + tenure, 2–3 sentence bio, why
    they matter, link to the stock report.
  - **Verdict-change post** — "We updated our view on X" — old verdict → new
    verdict, what triggered the change, link to the report.
  - **Trend post** — trend title + historical analog, 2–3 winners, link to the
    trend page.
- [ ] **Platform mix** (pick a primary + secondary, don't try to be everywhere):
  - **Primary**: LinkedIn (matches the audience for value-investing + the
    "leadership" angle from the founder data) and **X/Twitter** (the standard
    finance-twitter loop).
  - **Secondary**: Reddit (relevant subs only — `r/investing`, `r/stocks`,
    `r/CanadianInvestor` once 1.7 unlocks Canadian coverage), Threads, YouTube
    Shorts / Instagram Reels for chart-driven scenarios.
  - Don't ship all of these at once — start with LinkedIn + X, add a third only
    once the first two are humming.
- [ ] **Production pipeline**:
  - Build a small **post-draft generator** that, given a source artifact (scenario
    id, ticker id, trend id, shortlist id), renders a draft post per template via
    the existing prompt infra (`getLLMResponseForPromptViaInvocation`).
  - Drafts land in a lightweight **content queue** (a new admin page) where a
    human reviews, edits, picks platforms, schedules, and approves.
  - Approved posts are pushed to a scheduling tool (Buffer / Hootsuite / Hypefury,
    or a thin in-house scheduler) — start with whatever's cheapest, swap later.
  - Every post carries a UTM-tagged link back to the relevant KoalaGains page so
    we can attribute traffic.
- [ ] **Cadence + governance**:
  - Target a **minimum** weekly cadence (e.g. 1 scenario post + 1 founder
    spotlight + 1 verdict-change or top-N post per week) on each primary platform
    once the queue is live.
  - One person owns the queue per week — don't let it become a free-for-all.
  - Compliance pass on every post — no investment-advice phrasing, disclaimers
    where appropriate, claims grounded in the underlying report.
- [ ] **Measurement**:
  - Per-platform impressions / engagement / clicks tracked in one dashboard.
  - Per-source-artifact attribution: which scenario / stock / founder profile
    actually drove sessions.
  - Feed the winners back into the off-hours runner — if a scenario gets
    high engagement, prioritize refreshing/expanding it.
- [ ] **Open questions**:
  - Build vs. buy on the scheduler — the cheapest path is probably an existing
    SaaS until volume justifies our own.
  - Voice / tone — single editorial voice across platforms, or platform-tailored?
    Default: shared core + platform-specific opener.
  - Cross-link with the ETF social pipeline (`etfs.md`) — confirmed shared queue
    + shared templates; only the source artifacts differ.

## Custom Reports ("random reports") per stock

Source: PR #1318 description has the full spec. Summary below; read the PR before implementing.

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

## SEO Fixes

### "Crawled — currently not indexed" on `business-and-moat-sitemap.xml`

Goal: resolve the Google Search Console indexing issue affecting URLs in
`https://koalagains.com/stocks/business-and-moat-sitemap.xml`. We already requested
validation once, and Search Console came back with:

> Some fixes failed for Page indexing issues for pages in sitemap
> `/stocks/business-and-moat-sitemap.xml` on site `koalagains.com`.
> You requested that Google validate your fix for: Page indexing issues on your
> property, koalagains.com. The fix requested was for the following issue:
> **"Crawled — currently not indexed"**. Some of your pages are still affected by
> this issue.

"Crawled — currently not indexed" means Googlebot **fetched** the page but chose
**not** to include it in the index. This is almost always a content-quality,
duplication, or signal-weight problem — not a robots/noindex bug — so the fix has to
be more than a re-submission.

- [ ] **Pull the affected URLs from Search Console**:
  - Export the current list of URLs marked "Crawled — currently not indexed" under
    this sitemap.
  - Save it to `docs/insights-ui/tasks/seo/crawled-not-indexed-business-and-moat.csv`
    (or similar) so we can diff against future validation runs.
- [ ] **Sample + audit the affected pages** (10–20 representative URLs):
  - Do they render real, meaningful content server-side, or is the main analysis
    text injected via client-side JS after load? (SSR / RSC check.)
  - How much **unique** text is above the fold vs. repeated across stocks (same
    boilerplate intro / same section headings / same disclaimer blocks)?
  - Do these pages have a strong `<title>` and `<meta name="description">` tailored
    to the specific ticker?
  - Do they link out to other related pages (other sections of the same report,
    competitors, similar stocks)?
  - Are there any soft-404 signals (empty body, "report coming soon", error
    fallbacks)?
- [ ] **Likely causes to rule out / fix** (check each):
  - **Thin or duplicative content** — if the Business & Moat pages share large
    boilerplate across many tickers, Google sees them as near-duplicates.
    Beef up per-ticker unique text and trim shared scaffolding.
  - **Weak canonical signals** — confirm each URL sets a canonical pointing to
    itself, and that we don't accidentally canonicalize to the parent stock page.
  - **Orphan pages / poor internal linking** — these URLs should be linked from
    the main stock report page, from the Stocks list, and from sibling section
    pages. Check crawl depth is ≤ 3 clicks from home.
  - **Render-blocked content** — verify the main report text is in the initial
    SSR/RSC payload (fetch the URL without JS and confirm the analysis is there).
  - **Slow TTFB / LCP** — Core Web Vitals failures can downrank to "not indexed"
    in practice; spot-check a handful on PageSpeed Insights.
  - **Duplicate titles / meta descriptions** — run a crawl (Screaming Frog or
    similar) and flag pages with identical titles/meta.
  - **Sitemap hygiene** — make sure the sitemap only contains URLs that actually
    return 200, are canonical, and are expected to rank (no drafts / incomplete
    reports — ties into 1.6 `isComplete` for ETFs; do the same for stocks).
- [ ] **Implement fixes, priority order**:
  1. Ship unique per-ticker content improvements (reduce boilerplate, surface
     more ticker-specific analysis).
  2. Tighten titles / meta descriptions to be ticker-specific.
  3. Improve internal linking (related competitors, valuation page, financial
     statements page — ties into the details-page extraction tasks above).
  4. Confirm SSR / canonical / sitemap hygiene.
- [ ] **Re-submit validation**:
  - In Search Console, re-run "Validate fix" only **after** the content /
    canonical / linking changes are live and Googlebot has had a chance to
    re-crawl at least a few of the sample URLs.
  - Track the status; if another round fails, use the newly returned affected
    URLs to iterate.
- [ ] **Monitor + prevent regressions**:
  - Add a weekly (or per-deploy) report that lists: total Business & Moat URLs in
    the sitemap, how many are actually indexed, and the delta week-over-week.
  - Add a pre-publish guard: only include a stock's Business & Moat page in the
    sitemap once its content crosses a minimum length / completeness threshold
    (mirrors the ETF `isComplete` pattern in `etfs.md` 1.6).
- [ ] **Generalize the fix**:
  - If this sitemap has the problem, the other per-section sitemaps (financial
    statements, valuation, etc.) are likely at risk too. After fixing Business &
    Moat, check Search Console for the same status on the other stock sitemaps
    and apply the same checklist.
