# ETF Scenarios Page — Implementation Checklist

Plan for building a server-rendered "ETF Scenarios" feature backed by a dedicated DB table, REST API, public listing + detail pages, and admin CRUD. Source content lives in [`etf-market-scenarios.md`](./etf-market-scenarios.md) (31 scenarios, each with *underlying cause*, *historical analog*, *winners*, *losers*, *outlook*).

All paths below are relative to `insights-ui/` unless otherwise noted.

---

## 1. Database — Prisma schema

Edit `prisma/schema.prisma` (ETF models currently live around lines 1270–1712; append new models at the end of the ETF section).

- [ ] **Add `EtfScenario` model** (one row per scenario)
  - Fields:
    - `id` — `String @id @default(uuid())`
    - `scenarioNumber` — `Int` (1..31, stable sort key, must be unique per space)
    - `title` — `String` (e.g. "Technology Sector Stagnation / Crash")
    - `slug` — `String` (URL-friendly, unique per space; derived from title)
    - `underlyingCause` — `String @db.Text` (markdown)
    - `historicalAnalog` — `String @db.Text` (markdown)
    - `winnersMarkdown` — `String @db.Text`
    - `losersMarkdown` — `String @db.Text`
    - `outlookMarkdown` — `String @db.Text` (full outlook paragraph)
    - `outlookBucket` — enum `EtfScenarioOutlookBucket` (see below)
    - `outlookAsOfDate` — `DateTime @db.Date`
    - `archived` — `Boolean @default(false)`
    - `spaceId` — `String @default("koala_gains") @map("space_id")`
    - `createdAt` / `updatedAt` — standard `@map` snake_case
  - Relations:
    - `winners` — `EtfScenarioEtfLink[]` (role = WINNER)
    - `losers` — `EtfScenarioEtfLink[]` (role = LOSER)
    - `mostExposed` — `EtfScenarioEtfLink[]` (role = MOST_EXPOSED)
  - Constraints:
    - `@@unique([spaceId, scenarioNumber])`
    - `@@unique([spaceId, slug])`
    - `@@index([spaceId, archived])`
    - `@@map("etf_scenarios")`

- [ ] **Add `EtfScenarioOutlookBucket` enum**
  - Values: `HIGH`, `MEDIUM`, `LOW`, `IN_PROGRESS` (matches outlook doc's qualitative buckets: >40%, 20–40%, <20%, already-happened)

- [ ] **Add `EtfScenarioEtfLink` join model** (normalises the symbols referenced in winners/losers/"most exposed right now")
  - Fields: `id`, `scenarioId`, `etfId` (FK to `Etf.id`, `onDelete: Cascade`), `role` (enum `EtfScenarioRole`: `WINNER | LOSER | MOST_EXPOSED`), `sortOrder Int`, `spaceId`, timestamps
  - `@@unique([scenarioId, etfId, role])`
  - `@@index([etfId])`
  - `@@map("etf_scenario_etf_links")`
  - Rationale: the scenarios doc lists specific tickers — storing them relationally lets us render "scenarios this ETF appears in" on the ETF detail page later.

- [ ] **Add `scenarioLinks EtfScenarioEtfLink[]` relation back-ref** on the existing `Etf` model (non-breaking; no migration impact on existing code paths).

- [ ] **Generate migration**: `yarn prisma migrate dev --name add_etf_scenarios` (run locally, commit `prisma/migrations/**`).

- [ ] **Regenerate client**: `yarn prisma generate` (should be automatic via postinstall, but verify types in `node_modules/.prisma/client`).

- [ ] **Seed script (optional, admin-only)**: `scripts/seed-etf-scenarios.ts` that parses `docs/ai-knowledge/insights-ui/etf-analysis/etf-market-scenarios.md` into rows. Wire into `package.json` as `yarn seed:etf-scenarios`. Ticker resolution: look up `Etf` by `(spaceId, symbol)`; skip-with-warning if missing rather than failing.

---

## 2. Types & DTOs

- [ ] Create `src/types/etfScenarios.ts` exporting:
  - `EtfScenarioListingItem` — lightweight row for the listing page (id, scenarioNumber, slug, title, outlookBucket, outlookAsOfDate, short excerpt of underlyingCause)
  - `EtfScenarioDetail` — full scenario + joined `winners[] / losers[] / mostExposed[]` (each includes symbol, exchange, name)
  - `EtfScenarioListingResponse` — `{ scenarios, totalCount, page, pageSize, totalPages, filtersApplied }` (mirrors existing `EtfListingResponse` shape in `src/app/api/[spaceId]/etfs-v1/listing/route.ts`)
  - `CreateEtfScenarioRequest`, `UpdateEtfScenarioRequest` (admin payloads)
  - Filter enum: `EtfScenarioFilter` (`outlookBucket?`, `search?`, `archived?`)

---

## 3. API routes

Two conventions are in use: space-scoped (`/api/[spaceId]/...`) for read endpoints that mirror the public pages, and non-space-scoped (`/api/...`) admin endpoints protected by `withLoggedInAdmin`. Follow that split.

### Public (read)
- [ ] `src/app/api/[spaceId]/etf-scenarios/listing/route.ts` — `GET`
  - Paginated listing (default `pageSize = 32` like `etfs-v1/listing`)
  - Query params: `page`, `pageSize`, `outlookBucket`, `search` (matches title / symbols)
  - `where: { spaceId, archived: false }` — always hide archived on public path
  - `orderBy: [{ scenarioNumber: 'asc' }]`
  - Wrap with `withErrorHandlingV2<EtfScenarioListingResponse>`
- [ ] `src/app/api/[spaceId]/etf-scenarios/[slug]/route.ts` — `GET`
  - `findUnique({ where: { spaceId_slug: { spaceId, slug } } })`
  - Include `winners`, `losers`, `mostExposed` with nested `etf` (select: id, symbol, exchange, name)
  - 404 when missing (throw `NotFoundError` from `@dodao/web-core`)

### Admin (write)
- [ ] `src/app/api/etf-scenarios/route.ts` — `POST` (create)
  - Validate required fields, unique `scenarioNumber`/`slug` per space
  - Wrap with `withLoggedInAdmin<EtfScenario>`
- [ ] `src/app/api/etf-scenarios/[id]/route.ts` — `PUT` (update) + `DELETE` (hard delete, cascades to links)
  - Both wrapped with `withLoggedInAdmin`
- [ ] `src/app/api/etf-scenarios/[id]/links/route.ts` — `POST`/`DELETE` for managing `EtfScenarioEtfLink` rows (add/remove a ticker in a given role). Keeps the edit-scenario modal simple.
- [ ] **Revalidation**: after any mutation, call `revalidateTag('etf-scenarios')` and `revalidateTag(etfScenarioSlugTag(slug))` so static pages refresh. Tag helpers: add to `src/util/revalidation-tags.ts` alongside existing `etfAndExchangeTag`.

---

## 4. Server-rendered public pages

All pages use the existing SSR/ISR pattern from `src/app/etfs/page.tsx`:
```
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400;
```

- [ ] **Listing** — `src/app/etf-scenarios/page.tsx`
  - Server component; fetches via direct `prisma.etfScenario.findMany` (same pattern as `src/app/etfs/page.tsx`)
  - Wraps content in `EtfScenarioPageLayout` (new — see §5)
  - Breadcrumbs: `Home → ETFs → Scenarios`
  - Renders `<EtfScenarioListingGrid data={...} />`
  - `export const metadata = generateEtfScenarioListingMetadata();`
  - Inject listing JSON-LD (`ItemList` schema)

- [ ] **Detail** — `src/app/etf-scenarios/[slug]/page.tsx`
  - `export async function generateMetadata({ params })` → `generateEtfScenarioDetailMetadata({ title, outlookBucket, asOfDate })`
  - `export async function generateStaticParams()` — pre-render all 31 scenarios at build time (small, finite set)
  - Fetch via `fetch(...${internal API}..., { next: { revalidate: WEEK_IN_SECONDS, tags: [...] } })` — mirrors `fetchEtfByExchange` in `src/app/etfs/[exchange]/[etf]/page.tsx`
  - `notFound()` if null
  - Layout: breadcrumbs → title → outlook badge → markdown sections (underlyingCause / historicalAnalog / winners / losers / outlook) → related-ETFs links grid
  - JSON-LD: `Article` schema with `datePublished = createdAt`, `dateModified = updatedAt`

- [ ] **(Optional) Filter-by-ETF page** — `src/app/etfs/[exchange]/[etf]/scenarios/page.tsx`
  - "Scenarios this ETF appears in" — uses the `EtfScenarioEtfLink` relation
  - Can be phase 2; not required for first cut.

---

## 5. Components

Create under `src/components/etf-scenarios/`:

- [ ] `EtfScenarioPageLayout.tsx` — mirror of `EtfPageLayout` (title, breadcrumbs, description slot, children). Reuse existing background/container classes from `EtfPageLayout`.
- [ ] `EtfScenarioListingGrid.tsx` — responsive card grid. Each card: scenario number badge, title, outlook bucket pill (colour by bucket), 1-line excerpt, link to `/etf-scenarios/[slug]`.
- [ ] `EtfScenarioCard.tsx` — single card (extracted so it can be reused in ETF detail page later).
- [ ] `EtfScenarioOutlookBadge.tsx` — pill component keyed by bucket (`HIGH`=red, `MEDIUM`=amber, `LOW`=green, `IN_PROGRESS`=grey).
- [ ] `EtfScenarioDetailView.tsx` — renders full scenario:
  - Uses existing `parseMarkdown` util (`src/util/parse-markdown`) to render each markdown field safely
  - Winners/losers/mostExposed lists link each ticker to `/etfs/[exchange]/[symbol]` when the join row exists
- [ ] `EtfScenarioFiltersBar.tsx` — client component for the listing page: outlook bucket dropdown + search box. Posts back via query params (client navigation only; no API hook needed because listing is static/ISR and filters can apply client-side over the page's 32 rows; full-feature search can come later).

---

## 6. Admin UI

Follow the `industry-management` pattern (`src/app/admin-v1/industry-management/page.tsx` + its `UpsertIndustryModal.tsx`).

- [ ] `src/app/admin-v1/etf-scenarios/page.tsx` — `'use client'`
  - `useFetchData<EtfScenarioListingItem[]>` against `/api/koala_gains/etf-scenarios/listing?pageSize=100`
  - Table: number, title, outlook bucket, as-of, archived, actions (edit / delete / toggle-archive)
  - Buttons: "Create Scenario" (opens upsert modal), "Import from doc" (runs seed script via a dedicated admin endpoint — optional)
- [ ] `src/app/admin-v1/etf-scenarios/UpsertEtfScenarioModal.tsx`
  - Form fields: scenarioNumber (int), title, slug (auto-derived on blur), underlyingCause (TextareaAutosize), historicalAnalog, winnersMarkdown, losersMarkdown, outlookMarkdown, outlookBucket (select), outlookAsOfDate (date input), archived (checkbox)
  - Uses `usePostData` / `usePutData` against `/api/etf-scenarios` and `/api/etf-scenarios/[id]`
  - Validates required fields client-side
- [ ] `src/app/admin-v1/etf-scenarios/ManageLinksModal.tsx`
  - Secondary modal launched from the main upsert modal: add/remove ETF symbols under each role (WINNER / LOSER / MOST_EXPOSED)
  - Typeahead against existing `Etf` rows (reuse any existing `EtfSymbolAutocomplete` if present; otherwise simple `/api/koala_gains/etfs-v1/search` call)
- [ ] **AdminNav update** — `src/app/admin-v1/AdminNav.tsx`
  - Add `{ name: 'ETF Scenarios', href: '/admin-v1/etf-scenarios' }` under the existing `etfMgmtSection` (lines ~35–50 in that file)

---

## 7. Metadata, SEO, routing glue

- [ ] `src/utils/etf-scenario-metadata-generators.ts` (new)
  - `generateEtfScenarioListingMetadata()` — title, description, canonical, OG tags
  - `generateEtfScenarioDetailMetadata({ title, outlookBucket, outlookAsOfDate, slug })`
  - `generateEtfScenariosListingJsonLd(items)` — `ItemList`
  - `generateEtfScenarioDetailJsonLd(scenario)` — `Article`
- [ ] Add `/etf-scenarios` + `/etf-scenarios/[slug]` entries to `sitemap.xml` generation (`src/app/sitemap.ts` if present).
- [ ] Add header-nav link if the public ETFs section has a sub-nav; otherwise link from the ETFs landing page (`src/app/etfs/page.tsx` — small "Browse scenarios" CTA in the description area).

---

## 8. Tests / verification

- [ ] Manual: run `yarn dev` in `insights-ui/`, verify:
  - `/etf-scenarios` renders 31 scenarios after seeding
  - `/etf-scenarios/technology-sector-stagnation-crash` renders the full detail with markdown
  - Admin page at `/admin-v1/etf-scenarios` allows create / edit / archive / delete
  - Revalidation tags fire (edit scenario → public detail reflects within one revalidate window)
- [ ] `yarn lint && yarn prettier-check && yarn build` clean
- [ ] Prisma migration applied on staging before merging

---

## 9. Out of scope for this PR (follow-ups)

- "Scenarios this ETF appears in" block on ETF detail pages
- Historical outlook change-log (store past `outlookBucket` values with dates)
- Per-scenario subscription / alert
- Auto-refresh of the outlook section from an LLM pipeline

---

## File inventory (net new)

```
prisma/schema.prisma                                               (edit)
prisma/migrations/<timestamp>_add_etf_scenarios/migration.sql       (new)

src/types/etfScenarios.ts                                           (new)

src/app/api/[spaceId]/etf-scenarios/listing/route.ts                (new)
src/app/api/[spaceId]/etf-scenarios/[slug]/route.ts                 (new)
src/app/api/etf-scenarios/route.ts                                  (new)
src/app/api/etf-scenarios/[id]/route.ts                             (new)
src/app/api/etf-scenarios/[id]/links/route.ts                       (new)

src/app/etf-scenarios/page.tsx                                      (new)
src/app/etf-scenarios/[slug]/page.tsx                               (new)

src/app/admin-v1/etf-scenarios/page.tsx                             (new)
src/app/admin-v1/etf-scenarios/UpsertEtfScenarioModal.tsx           (new)
src/app/admin-v1/etf-scenarios/ManageLinksModal.tsx                 (new)
src/app/admin-v1/AdminNav.tsx                                       (edit)

src/components/etf-scenarios/EtfScenarioPageLayout.tsx              (new)
src/components/etf-scenarios/EtfScenarioListingGrid.tsx             (new)
src/components/etf-scenarios/EtfScenarioCard.tsx                    (new)
src/components/etf-scenarios/EtfScenarioOutlookBadge.tsx            (new)
src/components/etf-scenarios/EtfScenarioDetailView.tsx              (new)
src/components/etf-scenarios/EtfScenarioFiltersBar.tsx              (new)

src/utils/etf-scenario-metadata-generators.ts                       (new)
src/util/revalidation-tags.ts                                       (edit)

scripts/seed-etf-scenarios.ts                                       (new, optional)
```

~20 new files, ~3 edits. Estimated effort: 1–2 days for a single developer familiar with the codebase.
