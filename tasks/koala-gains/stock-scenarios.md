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
> against the stock table (tickers) instead of the ETF table, (b) where we surface the
> "scenarios this asset appears in" reverse link on the asset's own report page, and
> (c) **stocks trade across many exchanges in many countries**, so each scenario declares
> which countries it applies to and the listing / detail pages expose a country filter
> (see §1.2 and §1.5 below). ETFs don't need this because the ETF universe we cover is
> effectively US-listed.

## Priority order

1. **Database + API + public listing/detail pages** (parity with `/etf-scenarios`, plus
   country scoping — §1.2).
2. **Country filter UX** on both listing and detail pages (§1.7 `StockScenarioFiltersBar`).
3. **Admin CRUD** under `/admin-v1/stock-scenarios`, including the `countries[]`
   multi-select.
4. **Reverse link** from a stock's report page → the scenarios it appears in.
5. **Shared-vs-parallel decision** with ETF scenarios (see open questions).
6. **Seed content** — curate the first batch of stock scenarios, each declaring its
   `countries[]`.

---

## Phase 1 — Database, API, public pages

### 1.1) Prisma schema

Edit `insights-ui/prisma/schema.prisma` — add models **after** the existing `EtfScenario`
/ `EtfScenarioEtfLink` definitions (around line 1815).

- [ ] **Add `StockScenario` model** — field-for-field mirror of `EtfScenario`, PLUS a
  `countries` list (new — see §1.2):
  - `id`, `scenarioNumber`, `title`, `slug`
  - `underlyingCause`, `historicalAnalog`, `winnersMarkdown`, `losersMarkdown`,
    `outlookMarkdown` (all `String @db.Text`)
  - `direction` (default `DOWNSIDE`), `timeframe` (default `FUTURE`),
    `probabilityBucket` (default `MEDIUM`), `probabilityPercentage` (nullable Int)
  - `pricedInBucket` (default `PARTIALLY_PRICED_IN`), `expectedPriceChange` (nullable Int),
    `expectedPriceChangeExplanation`, `priceChangeTimeframeExplanation` (both nullable
    `@db.Text`)
  - `outlookAsOfDate` (`@db.Date`), `metaDescription` (nullable `@db.Text`)
  - **`countries String[]` (new)** — list of supported-country names the scenario
    applies to. Validated against `SupportedCountries` (US / Canada / India / UK /
    Pakistan / Japan / Taiwan / HongKong / Korea / Australia — see
    `insights-ui/src/utils/countryExchangeUtils.ts`). Must be non-empty on create.
    Stored as `String[]` (Postgres text array) so Prisma can filter with `hasSome` /
    `hasEvery`.
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

### 1.2) Country scoping (new — not present on ETF scenarios)

Stock scenarios are country-scoped because stocks trade on exchanges in specific
countries. The supported country set is defined by `SupportedCountries` in
`insights-ui/src/utils/countryExchangeUtils.ts` (US, Canada, India, UK, Pakistan, Japan,
Taiwan, HongKong, Korea, Australia) and each country maps to a fixed exchange list via
`COUNTRY_TO_EXCHANGES` / `getExchangesByCountry()`. Reuse these — do not invent new
country lists.

- [ ] **`countries` field on `StockScenario`** — already specified in §1.1. Enforced to be
  a subset of `SupportedCountries` values and non-empty. A scenario like "Indian
  monsoon-led agri supply shock" would have `countries: ["India"]`; a scenario like
  "Geopolitical oil price spike" that affects listings in multiple countries would carry
  the full relevant set (e.g. `["US", "UK", "Canada", "India", "Australia"]`).
- [ ] **Validation at write time**:
  - POST / PUT validate `countries[]` against `SupportedCountries` (use the existing
    `toSupportedCountry()` helper or a direct `z.enum(Object.values(SupportedCountries))`
    array schema).
  - Cross-check `countries[]` against the links: every link's `exchange` (resolved
    server-side from `symbol`) must map — via `EXCHANGE_TO_COUNTRY` — to a country that
    appears in the scenario's `countries[]`. If a link's exchange resolves to a country
    not declared on the scenario, reject the write with a clear error rather than
    silently accepting a mismatched link. This prevents drift where the "countries"
    declaration disagrees with the actual tickers attached.
- [ ] **Filter semantics**:
  - Public listing: a scenario matches a country filter when `country IN
    scenario.countries` (Prisma: `where: { countries: { has: country } }`). So a scenario
    declaring `["US", "UK"]` appears under both US and UK filters.
  - Detail page: when a user arrives with a country in the query string (or selects one
    on the detail page), **filter each of the winner / loser / most-exposed columns to
    only the stocks whose exchange belongs to that country** (i.e. link's resolved
    `exchange` is in `getExchangesByCountry(selectedCountry)`). Show a count next to each
    role (e.g. "Winners (3 in UK)") when filtered, and a neutral "switch country" affordance.
  - If the user clears the country filter, all 15 links render regardless of country.
  - If the selected country isn't in `scenario.countries`, the filter bar should disable
    that country (or show "no stocks in this country for this scenario").
- [ ] **Use `getExchangeFilterClause(country)`** from `countryExchangeUtils.ts` when
  building server-side Prisma queries for any flavour of symbol lookup — it already
  returns the right `{ exchange: { in: [...] } }` shape and handles the nullable case.

### 1.3) Shared enums — do NOT duplicate

The TS enum module `insights-ui/src/types/etfScenarioEnums.ts` already defines
`Direction`, `Timeframe`, `ProbabilityBucket`, `PricedInBucket`, `Role`. Stock scenarios
use the **same values**.

- [ ] Rename the file (or add a new neutral module) to `src/types/scenarioEnums.ts` and
  re-export the existing enums under both old and new names so ETF code keeps compiling.
  Stock scenarios then import from the neutral module directly.
- [ ] Do NOT create a second set of enums under `stockScenarioEnums.ts` — that would
  diverge over time and force double-maintenance.
- [ ] Country values stay in `countryExchangeUtils.ts` (`SupportedCountries` enum). Do not
  duplicate into the scenarios enum module — import from the utils file everywhere.

### 1.4) Cache-tag helpers

- [ ] Create `src/utils/stock-scenario-cache-utils.ts` mirroring
  `src/utils/etf-scenario-cache-utils.ts`:
  - `stockScenarioBySlugTag(slug)` / `revalidateStockScenarioBySlugTag(slug)`
  - `STOCK_SCENARIO_LISTING_TAG` constant + `revalidateStockScenarioListingTag()`
- [ ] Every write endpoint calls the listing revalidator, and (on PUT/DELETE/link-mgmt) the
  slug-specific revalidator.
- [ ] The listing tag is country-agnostic (one tag for all countries) — filtering by
  country is done client-side on the SSR payload, so no per-country cache variants are
  needed at this scale. Revisit only if the scenario count grows past ~200.

### 1.5) API routes

Mirror the ETF scenarios routes 1:1. Space-scoped reads live under `/api/[spaceId]/...`,
admin writes live under `/api/stock-scenarios/...`. Wrap all mutating endpoints with
`withAdminOrToken` (matches ETF scenario pattern — allows the bot / automation scripts to
post via `token=<AUTOMATION_SECRET>`).

**Public (read)**
- [ ] `src/app/api/[spaceId]/stock-scenarios/listing/route.ts` — `GET` with
  `direction`, `timeframe`, `probabilityBucket`, `search`, `page`, `pageSize`,
  `includeArchived`, and **`country`** query params. When `country` is provided, parse
  via `toSupportedCountry()` and add `where.countries = { has: country }` to the Prisma
  query. Include `countries` in each listing row so the card grid can show country pills.
- [ ] `src/app/api/[spaceId]/stock-scenarios/[slug]/route.ts` — `GET` detail, returns
  `{ scenario, winners, losers, mostExposed }` with nested stock lookups for each symbol
  (so the UI can render clickable ticker pills linking to `/stocks/<exchange>/<symbol>`).
  Resolve `tickerKey` + `exchange` on read from the symbol. Return `scenario.countries`
  so the client filter bar knows which options are enabled. Always return all 15 links —
  country filtering on the detail view is client-side against the resolved `exchange`.

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
- [ ] **`countries[]` validation**: reject writes where any link's resolved exchange maps
  to a country not present in the scenario's `countries[]` (see §1.2). Return the
  offending symbol / exchange / country triple in the error so the admin can fix the
  declaration.

### 1.6) Public pages

Follow the SSR/ISR directives that `/etf-scenarios` already uses.

- [ ] `src/app/stock-scenarios/page.tsx` — listing, `dynamic = 'force-static'`,
  `dynamicParams = true`, `revalidate = 86400`. Server-side fetch via
  `getBaseUrlForServerSidePages()` + the listing tag. `ItemList` JSON-LD inline.
  The listing SSR payload includes every scenario's `countries[]`. The country filter is
  client-side (see `StockScenarioFiltersBar` in §1.7 Components) so no separate per-
  country page variant is needed.
- [ ] `src/app/stock-scenarios/[slug]/page.tsx` — detail, same `force-static` +
  `dynamicParams = true` but `revalidate = false`. `notFound()` on missing slug.
  Three-column layout (Winners / Losers / Most-exposed) just like
  `EtfScenarioDetailView` — reuse the same visual patterns. Stocks in each role render as
  pills/cards linking to `/stocks/<exchange>/<symbol>` when resolved. Country filter on
  the detail page narrows each column to links whose resolved exchange maps to the
  selected country (see §1.2 filter semantics). Filter state lives in the URL query
  string so the selection survives reload and share-links.
- [ ] `src/app/stock-scenarios/StockScenariosPageActions.tsx` — admin cache-flush dropdown
  (mirror the ETF version).
- [ ] Metadata generators: `src/utils/stock-scenario-metadata-generators.ts` (mirror
  `etf-scenario-metadata-generators.ts`) — title, description, breadcrumbs, `Article`
  JSON-LD with `datePublished = createdAt`, `dateModified = updatedAt`, `dateline =
  outlookAsOfDate`.

### 1.7) Components

Under `src/components/stock-scenarios/`:

- [ ] `StockScenarioPageLayout.tsx`
- [ ] `StockScenarioListingGrid.tsx`
- [ ] `StockScenarioCard.tsx` — in addition to the ETF card content, show small country
  pills (one per entry in `countries[]`) so readers can see at a glance which markets the
  scenario applies to.
- [ ] `StockScenarioDetailView.tsx` — three-column Winners / Losers / Most-exposed grid.
  If **any** link in a column has `roleExplanation`, `expectedPriceChange`, or
  `expectedPriceChangeExplanation` populated, the column flips from compact pills to a
  richer card list (same behaviour as the ETF detail view). Accepts a `countryFilter`
  prop — when set, each column is filtered to links whose resolved exchange is in
  `getExchangesByCountry(countryFilter)`, with a per-column count shown in the heading.
- [ ] `StockScenarioFiltersBar.tsx` — client component, mirrors
  `EtfScenarioFiltersBar` (direction / timeframe / probability / search) **PLUS a
  `country` dropdown** sourced from `ALL_SUPPORTED_COUNTRIES` (in
  `countryExchangeUtils.ts`). The country dropdown has an "All countries" option
  (clears the filter). On listing pages, selecting a country filters the scenario grid
  to scenarios whose `countries[]` contains the selection. On detail pages (optional
  embedding), selecting a country filters the winner / loser / most-exposed columns
  per §1.2. Filter state is synced to the URL query string.
- [ ] `StockScenarioCountrySelect.tsx` (optional extraction) — if we want to reuse the
  country dropdown between listing and detail pages, pull it into its own component
  backed by `ALL_SUPPORTED_COUNTRIES` and the `getCountryCodeForSearchBarDisplay`
  helper.

### 1.8) Admin UI

Follow the `SingleSectionModal` pattern already used by `/admin-v1/etf-scenarios`.

- [ ] `src/app/admin-v1/stock-scenarios/page.tsx` — listing table with row actions
  (edit, archive-toggle, delete, manage-links). Show a `countries` column so admins can
  see country scope at a glance.
- [ ] `src/app/admin-v1/stock-scenarios/UpsertStockScenarioModal.tsx` — every field on
  `StockScenario`, scrolling internally. The `countries[]` field renders as a multi-
  select populated from `ALL_SUPPORTED_COUNTRIES`; require at least one selection.
- [ ] `src/app/admin-v1/stock-scenarios/ManageLinksModal.tsx` — add/remove ticker symbols
  per role with `roleExplanation` + expected-price-change fields. Ticker typeahead calls
  the existing stock search endpoint (confirm path — likely
  `/api/koala_gains/tickers/search` or similar). After resolving the symbol's exchange,
  the modal should validate client-side that the resolved country is in the parent
  scenario's `countries[]` and show an inline error if not (server also enforces this —
  see §1.5).
- [ ] `src/app/admin-v1/stock-scenarios/ImportStockScenariosModal.tsx` — bulk markdown
  import, mirrors `ImportEtfScenariosModal`. The markdown parser needs a new `Countries:`
  frontmatter line (comma-separated) — add to
  `src/utils/stock-scenario-markdown-parser.ts` when it's built.
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
  The five-per-role rule applies **per scenario overall**, not per country — a scenario
  declaring `countries: ["US", "India"]` can have 5 winners mixing both markets, and the
  country filter on the detail page will narrow each column down accordingly.
- [ ] Prefer pure-play / sector-specific tickers over diversified giants (AAPL, MSFT,
  GOOGL) when both would qualify — same rationale as the ETF rule favouring XLE/XOP over
  SPY.
- [ ] Each scenario must declare its `countries[]` (see §1.2). Pick the smallest
  correct set: a scenario about US regional banks is `["US"]`, not `["US", "Canada"]`,
  even if Canadian banks are loosely correlated.
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
- [ ] **Country scope changes over time** — if a scenario originally declared
  `["US"]` and we later realise it also hits UK listings, do we need a migration /
  audit flow, or is it enough to let admins edit `countries[]` in place? Leaning toward
  in-place edit (matches how we let admins edit any other field) but the link-validation
  rule in §1.5 means adding a country without adding corresponding links is harmless,
  while *removing* a country leaves orphan links — spec the server to either reject the
  removal or auto-archive those links.
- [ ] **Default country filter** — should the listing page default to a country based on
  the viewer's locale / prior visits, or always start with "All countries"? Defaulting
  is more relevant but risks hiding scenarios a user would otherwise discover. Start
  with "All countries" and revisit once we have usage data.
