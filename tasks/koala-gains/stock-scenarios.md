# Stock Scenarios — KoalaGains (Tasks)

Goal: build a **Stock Scenarios** feature for KoalaGains, mirroring the existing ETF
Scenarios feature (see [`etf-scenarios.md`](../../docs/ai-knowledge/projects/insights-ui/features/etf-scenarios.md)
and [`etf-scenarios-implementation-checklist.md`](../../docs/ai-knowledge/insights-ui/etf-analysis/etf-scenarios-implementation-checklist.md)).

Each scenario carries a probability outlook, a priced-in assessment, an expected residual
price move, and explicit lists of the **stocks** most exposed to it. The page should read
like a ranked trade idea rather than a story — **five winners, five losers, and five most-
exposed tickers**, each with a clear mechanical reason and an estimated % move.

> The ETF Scenarios feature is already live (`/etf-scenarios`, `/admin-v1/etf-scenarios`,
> `EtfScenario` + `EtfScenarioEtfLink` Prisma models). **Borrow its schema, API shape, and
> UI patterns rather than inventing new ones.** The differences are: (a) links resolve
> against the stock table (tickers) instead of the ETF table, and (b) where we surface the
> "scenarios this asset appears in" reverse link on the asset's own report page.

## Priority order

1. **Database + API + public listing/detail pages** (parity with `/etf-scenarios`).
2. **Admin CRUD** under `/admin-v1/stock-scenarios`.
3. **Reverse link** from a stock's report page → the scenarios it appears in.
4. **Shared-vs-parallel decision** with ETF scenarios (see open questions).
5. **Seed content** — curate the first batch of stock scenarios.

---

## Phase 1 — Database, API, public pages

### 1.1) Prisma schema

Edit `insights-ui/prisma/schema.prisma` — add models **after** the existing `EtfScenario`
/ `EtfScenarioEtfLink` definitions (around line 1815).

- [ ] **Add `StockScenario` model** — field-for-field mirror of `EtfScenario`:
  - `id`, `scenarioNumber`, `title`, `slug`
  - `underlyingCause`, `historicalAnalog`, `winnersMarkdown`, `losersMarkdown`,
    `outlookMarkdown` (all `String @db.Text`)
  - `direction` (default `DOWNSIDE`), `timeframe` (default `FUTURE`),
    `probabilityBucket` (default `MEDIUM`), `probabilityPercentage` (nullable Int)
  - `pricedInBucket` (default `PARTIALLY_PRICED_IN`), `expectedPriceChange` (nullable Int),
    `expectedPriceChangeExplanation`, `priceChangeTimeframeExplanation` (both nullable
    `@db.Text`)
  - `outlookAsOfDate` (`@db.Date`), `metaDescription` (nullable `@db.Text`)
  - `archived` (default `false`), `spaceId` (default `"koala_gains"`),
    `createdAt`, `updatedAt`
  - Relation: `stockLinks StockScenarioStockLink[]`
  - Constraints (match ETF version):
    - `@@unique([spaceId, scenarioNumber])`, `@@unique([spaceId, slug])`
    - `@@index([spaceId, archived])`, `@@index([spaceId, direction])`,
      `@@index([spaceId, timeframe])`, `@@index([spaceId, probabilityBucket])`,
      `@@index([spaceId, pricedInBucket])`
    - `@@map("stock_scenarios")`
- [ ] **Add `StockScenarioStockLink` join model** — mirror `EtfScenarioEtfLink` but link to
  tickers instead of ETFs:
  - `id`, `scenarioId`, `tickerKey` (nullable String — the existing ticker identity in
    `TickerV1` / stock tables; confirm the correct FK field name before writing the
    migration), `symbol`, `exchange` (nullable), `role`, `sortOrder`
  - `roleExplanation`, `expectedPriceChange`, `expectedPriceChangeExplanation`
  - `spaceId`, `createdAt`, `updatedAt`
  - Relation back to `StockScenario` with `onDelete: Cascade`
  - `@@unique([scenarioId, symbol, role])`, `@@index([scenarioId])`, `@@index([symbol])`
  - `@@map("stock_scenario_stock_links")`
- [ ] **Back-ref on the stock model** — add `scenarioLinks StockScenarioStockLink[]` to
  whichever model represents a tradable stock ticker today (verify: `TickerV1`, `Ticker`,
  or equivalent) so the future reverse-lookup join is indexed.
- [ ] **Migration**: `yarn prisma migrate dev --name add_stock_scenarios`. Commit the
  generated SQL.

### 1.2) Shared enums — do NOT duplicate

The TS enum module `insights-ui/src/types/etfScenarioEnums.ts` already defines
`Direction`, `Timeframe`, `ProbabilityBucket`, `PricedInBucket`, `Role`. Stock scenarios
use the **same values**.

- [ ] Rename the file (or add a new neutral module) to `src/types/scenarioEnums.ts` and
  re-export the existing enums under both old and new names so ETF code keeps compiling.
  Stock scenarios then import from the neutral module directly.
- [ ] Do NOT create a second set of enums under `stockScenarioEnums.ts` — that would
  diverge over time and force double-maintenance.

### 1.3) Cache-tag helpers

- [ ] Create `src/utils/stock-scenario-cache-utils.ts` mirroring
  `src/utils/etf-scenario-cache-utils.ts`:
  - `stockScenarioBySlugTag(slug)` / `revalidateStockScenarioBySlugTag(slug)`
  - `STOCK_SCENARIO_LISTING_TAG` constant + `revalidateStockScenarioListingTag()`
- [ ] Every write endpoint calls the listing revalidator, and (on PUT/DELETE/link-mgmt) the
  slug-specific revalidator.

### 1.4) API routes

Mirror the ETF scenarios routes 1:1. Space-scoped reads live under `/api/[spaceId]/...`,
admin writes live under `/api/stock-scenarios/...`. Wrap all mutating endpoints with
`withAdminOrToken` (matches ETF scenario pattern — allows the bot / automation scripts to
post via `token=<AUTOMATION_SECRET>`).

**Public (read)**
- [ ] `src/app/api/[spaceId]/stock-scenarios/listing/route.ts` — `GET` with
  `direction`, `timeframe`, `probabilityBucket`, `search`, `page`, `pageSize`,
  `includeArchived` query params.
- [ ] `src/app/api/[spaceId]/stock-scenarios/[slug]/route.ts` — `GET` detail, returns
  `{ scenario, winners, losers, mostExposed }` with nested stock lookups for each symbol
  (so the UI can render clickable ticker pills linking to `/stocks/<exchange>/<symbol>`).
  Resolve `tickerKey` + `exchange` on read from the symbol.

**Admin (write)**
- [ ] `src/app/api/stock-scenarios/route.ts` — `POST` upsert-by-slug (mirror of
  `POST /api/etf-scenarios`). Accepts full scenario payload including a `links[]` array;
  transaction deletes existing links and recreates them. Zod validation.
- [ ] `src/app/api/stock-scenarios/[id]/route.ts` — `PUT` (partial update, no link
  changes) + `DELETE` (hard-delete, cascades to links).
- [ ] `src/app/api/stock-scenarios/[id]/links/route.ts` — `POST` / `DELETE` for a single
  link row (admin-session only, matches ETF convention).
- [ ] `src/app/api/stock-scenarios/import/route.ts` — `POST` admin-session only; bulk
  import from markdown using a parser modelled on
  `src/utils/etf-scenario-markdown-parser.ts`.
- [ ] **Automation auth parity**: POST / PUT / DELETE / link-mgmt accept the
  `AUTOMATION_SECRET` via `token=` query or `x-automation-token` header, same as
  ETF scenarios (see `withAdminOrToken`).
- [ ] **Symbol → ticker resolution**: backend looks up each link's `symbol` against the
  stock table (`spaceId + symbol`) and populates `tickerKey` + `exchange`. Clients do NOT
  pass those fields manually — same rule as ETF scenarios.

### 1.5) Public pages

Follow the SSR/ISR directives that `/etf-scenarios` already uses.

- [ ] `src/app/stock-scenarios/page.tsx` — listing, `dynamic = 'force-static'`,
  `dynamicParams = true`, `revalidate = 86400`. Server-side fetch via
  `getBaseUrlForServerSidePages()` + the listing tag. `ItemList` JSON-LD inline.
- [ ] `src/app/stock-scenarios/[slug]/page.tsx` — detail, same `force-static` +
  `dynamicParams = true` but `revalidate = false`. `notFound()` on missing slug.
  Three-column layout (Winners / Losers / Most-exposed) just like
  `EtfScenarioDetailView` — reuse the same visual patterns. Stocks in each role render as
  pills/cards linking to `/stocks/<exchange>/<symbol>` when resolved.
- [ ] `src/app/stock-scenarios/StockScenariosPageActions.tsx` — admin cache-flush dropdown
  (mirror the ETF version).
- [ ] Metadata generators: `src/utils/stock-scenario-metadata-generators.ts` (mirror
  `etf-scenario-metadata-generators.ts`) — title, description, breadcrumbs, `Article`
  JSON-LD with `datePublished = createdAt`, `dateModified = updatedAt`, `dateline =
  outlookAsOfDate`.

### 1.6) Components

Under `src/components/stock-scenarios/`:

- [ ] `StockScenarioPageLayout.tsx`
- [ ] `StockScenarioListingGrid.tsx`
- [ ] `StockScenarioCard.tsx`
- [ ] `StockScenarioDetailView.tsx` — three-column Winners / Losers / Most-exposed grid.
  If **any** link in a column has `roleExplanation`, `expectedPriceChange`, or
  `expectedPriceChangeExplanation` populated, the column flips from compact pills to a
  richer card list (same behaviour as the ETF detail view).
- [ ] `StockScenarioFiltersBar.tsx` — client component, mirrors
  `EtfScenarioFiltersBar` (direction / timeframe / probability / search). Filtering can
  be purely client-side against the initial SSR payload since scenario counts will stay
  small.

### 1.7) Admin UI

Follow the `SingleSectionModal` pattern already used by `/admin-v1/etf-scenarios`.

- [ ] `src/app/admin-v1/stock-scenarios/page.tsx` — listing table with row actions
  (edit, archive-toggle, delete, manage-links).
- [ ] `src/app/admin-v1/stock-scenarios/UpsertStockScenarioModal.tsx` — every field on
  `StockScenario`, scrolling internally.
- [ ] `src/app/admin-v1/stock-scenarios/ManageLinksModal.tsx` — add/remove ticker symbols
  per role with `roleExplanation` + expected-price-change fields. Ticker typeahead calls
  the existing stock search endpoint (confirm path — likely
  `/api/koala_gains/tickers/search` or similar).
- [ ] `src/app/admin-v1/stock-scenarios/ImportStockScenariosModal.tsx` — bulk markdown
  import, mirrors `ImportEtfScenariosModal`.
- [ ] `src/app/admin-v1/AdminNav.tsx` — add a **Stock Scenarios** link next to the
  existing **ETF Scenarios** entry.

---

## Phase 2 — Reverse link on stock report pages

Goal: on each stock's report page, show a "This stock appears in the following scenarios"
block with links back to each scenario detail page.

- [ ] On `src/app/stocks/[exchange]/[ticker]/page.tsx`, fetch
  `StockScenarioStockLink` rows for the current `symbol` (via a new public API:
  `/api/[spaceId]/stock-scenarios/for-symbol?symbol=...`).
- [ ] Render a compact section — one line per scenario with:
  - Scenario title (link to `/stock-scenarios/<slug>`).
  - Direction + timeframe + probability badges.
  - Role (`WINNER` / `LOSER` / `MOST_EXPOSED`).
  - The link's `expectedPriceChange` (if set) so the reader sees the per-stock estimate.
- [ ] **Explicitly NOT out of scope** — the ETF side deferred the symmetrical ETF-side
  reverse link. For stock scenarios, ship this reverse link in the initial PR. Value is
  higher for stocks because individual tickers sit in many more scenarios than any one
  ETF does.
- [ ] Cache-tag the fetch with `stockScenarioBySlugTag` + a new per-symbol tag so
  revalidating a scenario also updates any stock pages that referenced it.

---

## Phase 3 — Seed content

- [ ] Draft a first batch of ~15–30 stock scenarios as markdown, matching the parser
  format expected by `stock-scenario-markdown-parser.ts`.
- [ ] Each scenario needs: title, underlying cause, historical analog, direction,
  timeframe, probability bucket (+ optional percentage), priced-in bucket, expected price
  change + explanation + timeframe explanation, winners/losers narrative, outlook +
  `outlookAsOfDate`.
- [ ] **Exactly 5 winners + 5 losers + 5 most-exposed** per scenario (same operational
  convention as ETF scenarios — if you reach for a sixth, drop the weakest existing one).
- [ ] Prefer pure-play / sector-specific tickers over diversified giants (AAPL, MSFT,
  GOOGL) when both would qualify — same rationale as the ETF rule favouring XLE/XOP over
  SPY.
- [ ] Import via the admin "Import from doc" button once the endpoint is live.

---

## Phase 4 — Prompts / automation (optional, follow-up)

The ETF scenarios are currently hand-authored. For stock scenarios:

- [ ] **Claude-assisted draft** — given a scenario description, ask Claude to suggest
  candidate stocks for each role + a first-pass role explanation + priced-in assessment.
  Human then reviews and publishes. Reuse the `AUTOMATION_SECRET` path via
  `POST /api/stock-scenarios`.
- [ ] **Auto-refresh outlook** — scheduled job that re-visits `outlookAsOfDate` on
  scenarios older than N weeks and asks Claude whether the thesis is still intact /
  needs a probability or priced-in update.

---

## Open questions

- [ ] **Shared scenarios table vs parallel tables with ETFs?** The `stocks.md` and
  `etfs.md` Trends tasks already flagged this. For scenarios specifically the same
  question applies — the *underlying cause* and *historical analog* are identical between
  a "Geopolitical Oil Price Spike" ETF scenario and its stock counterpart; only the
  winner/loser/most-exposed lists differ.
  - **Option A (parallel tables)**: simpler, keeps existing `EtfScenario` untouched,
    matches how the code is structured today. Two admin pages, two detail pages, two
    listings.
  - **Option B (shared `Scenario` table + two join tables — `ScenarioEtfLink`,
    `ScenarioStockLink`)**: one source of truth for the scenario narrative, two asset-
    class lenses on top. Requires migrating the existing `EtfScenario` data, splitting
    the current `EtfScenarioEtfLink` into a `ScenarioEtfLink`, and updating every caller.
  - Pick before starting Phase 1 — the schema decision is hard to walk back.
- [ ] **Scenario numbering across asset classes** — if we go with shared scenarios, a
  single `scenarioNumber` is natural. If parallel, decide whether stock scenarios restart
  at 1 or continue the ETF sequence.
- [ ] **Cross-asset link on scenario detail page** — when (and only when) we share
  scenarios, the detail page can show both "Stocks in this scenario" and "ETFs in this
  scenario" side-by-side. Worth building if we go Option B.
- [ ] **Ticker resolution edge cases** — stocks change tickers / merge / delist more
  often than ETFs. Decide how the link row should handle a delisted ticker (keep as
  plain text? auto-archive? flag for review?). ETF scenarios ignored this because ETF
  ticker churn is rare; we cannot ignore it for stocks.
- [ ] **Mapping to existing stock categories / sub-industries** — should each scenario
  carry an optional list of relevant sub-industries, so the stock detail page can flag
  "any scenario tagged to this ticker's sub-industry even if the ticker itself isn't in
  the 15-row list"? Useful for breadth, risk of noise.
