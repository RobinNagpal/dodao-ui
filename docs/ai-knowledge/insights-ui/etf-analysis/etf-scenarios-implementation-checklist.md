# ETF Scenarios Page — Implementation Checklist

Plan for building a server-rendered "ETF Scenarios" feature backed by a dedicated DB table, REST API, public listing + detail pages, and admin CRUD. Source content: [`etf-market-scenarios.md`](./etf-market-scenarios.md) (31 scenarios — *underlying cause*, *historical analog*, *winners*, *losers*, *outlook*).

All paths below are relative to `insights-ui/` unless noted. Conventions in this checklist were verified against the live codebase; deviations from sibling features (ETFs, tickers, industries) are called out explicitly.

---

## 0. Conventions verified against the codebase

Before reading the rest of this checklist, note the real (not assumed) patterns in this repo so the new feature matches:

- **SSR/ISR for detail pages:** sibling `src/app/etfs/[exchange]/[etf]/page.tsx:28-30` uses `dynamic = 'force-static'`, `dynamicParams = true`, `revalidate = false`. It does **not** use `generateStaticParams` — pages render on first hit and stay cached until tagged revalidation invalidates them. Match this pattern.
- **Cache-tag helpers** live at `src/utils/<feature>-cache-utils.ts` (e.g. `src/utils/etf-cache-utils.ts` — defines `etfAndExchangeTag`, `revalidateEtfListingTag`). Helpers both build tag strings and expose `revalidateXTag()` wrappers around `revalidateTag` from `next/cache`.
- **Active revalidation:** currently wired up only in a couple of ETF write endpoints (`src/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/fetch-financial-info/route.ts`, `.../mor-info-callback/route.ts`). Most admin mutation routes do **not** call `revalidateTag`. For scenarios, do call it — the feature is content-heavy and users will edit it frequently.
- **404 pages:** `notFound()` from `next/navigation` (see `src/app/etfs/[exchange]/[etf]/page.tsx:22,57`). There is no `NotFoundError` export in `@dodao/web-core`.
- **Admin auth:** `withLoggedInAdmin` lives at `@/app/api/helpers/withLoggedInAdmin`. There is **no layout-level guard** at `src/app/admin-v1/` — each write endpoint must wrap its handler individually, and admin pages themselves are public-routed (auth happens on the API calls they make).
- **Modal primitive:** only `SingleSectionModal` from `@dodao/web-core/components/core/modals/SingleSectionModal` is in use. There is no full-screen alternative — large forms scroll inside it.
- **Fetch/mutation hooks:** `useFetchData`, `usePostData`, `usePutData`, `useDeleteData` from `@dodao/web-core/ui/hooks/fetch/*` — they accept `successMessage` / `errorMessage` props and fire toasts automatically. No separate toast wiring is needed in each form.
- **Markdown rendering:** `parseMarkdown(text)` at `src/util/parse-markdown.ts` returns HTML; callers inject via `dangerouslySetInnerHTML`. No `MarkdownViewer` component exists.
- **Body validation:** `zod` is used in some (not all) routes (e.g. `src/app/api/tickers/[tickerKey]/ticker-financials/route.ts`). Use it for the new scenario write endpoints — form fields are numerous and easy to get wrong.
- **Per-route sitemaps:** pattern is a static `sitemap.xml` per feature folder (e.g. `src/app/stocks/sitemap.xml`). There is currently no `app/sitemap.ts`, and critically **no `src/app/etfs/sitemap.xml`** either — so adding one for scenarios is consistent with stocks but not required to match the ETF surface. Treat as optional for this PR.
- **Seed scripts:** the repo has no `scripts/` directory and no `prisma/seed.ts`. Don't assume one. Importing the 31 scenarios from markdown should happen through an admin-triggered "Import from doc" endpoint (protected by `withLoggedInAdmin`), not a build-time script.
- **Types for API responses:** existing convention is **co-located with the route file** (e.g. `EtfListingItem`, `EtfListingResponse` are defined inline in `src/app/api/[spaceId]/etfs-v1/listing/route.ts:21-48`, not in `src/types/`). Follow that convention; only promote to `src/types/etfScenarios.ts` if the same type is consumed by both a page and an unrelated component.

---

## 1. Database — Prisma schema

Edit `prisma/schema.prisma` (existing ETF models are around lines 1270–1712; append new models at the end of the ETF section).

- [ ] **Add `EtfScenario` model**
  - Fields:
    - `id` — `String @id @default(uuid())`
    - `scenarioNumber` — `Int` (1..31, stable sort key; unique per space)
    - `title` — `String`
    - `slug` — `String` (URL-safe; unique per space; derived from title on create and immutable thereafter so detail URLs don't rot)
    - `underlyingCause` — `String @db.Text` (markdown)
    - `historicalAnalog` — `String @db.Text` (markdown)
    - `winnersMarkdown` — `String @db.Text`
    - `losersMarkdown` — `String @db.Text`
    - `outlookMarkdown` — `String @db.Text`
    - `outlookBucket` — enum `EtfScenarioOutlookBucket`
    - `outlookAsOfDate` — `DateTime @db.Date`
    - `archived` — `Boolean @default(false)` (matches `TickerV1Industry.archived` at line 478)
    - `spaceId` — `String @default("koala_gains") @map("space_id")`
    - `createdAt` / `updatedAt` — snake-case `@map`
  - Relations:
    - `winners` — `EtfScenarioEtfLink[]` (role = WINNER)
    - `losers` — `EtfScenarioEtfLink[]` (role = LOSER)
    - `mostExposed` — `EtfScenarioEtfLink[]` (role = MOST_EXPOSED)
  - Constraints:
    - `@@unique([spaceId, scenarioNumber])`
    - `@@unique([spaceId, slug])`
    - `@@index([spaceId, archived])`
    - `@@map("etf_scenarios")`

- [ ] **Add enums** (inline `enum` keyword — matches the rest of the schema):
  - `EtfScenarioOutlookBucket { HIGH, MEDIUM, LOW, IN_PROGRESS }` — buckets map to the outlook doc: >40%, 20–40%, <20%, "already happened".
  - `EtfScenarioRole { WINNER, LOSER, MOST_EXPOSED }`.

- [ ] **Add `EtfScenarioEtfLink` join model** (normalises tickers referenced in each scenario's winners/losers/"most exposed right now" lists)
  - Fields: `id`, `scenarioId`, `etfId` (FK to `Etf.id`, `onDelete: Cascade`), `role EtfScenarioRole`, `sortOrder Int`, `spaceId`, timestamps.
  - `@@unique([scenarioId, etfId, role])`, `@@index([etfId])`, `@@map("etf_scenario_etf_links")`.
  - Rationale: enables a later "scenarios this ETF appears in" block on ETF detail pages without reparsing markdown.

- [ ] **Add back-ref on `Etf`** model: `scenarioLinks EtfScenarioEtfLink[]` (no FK changes on existing columns, so migration stays additive).

- [ ] **Migration:** `yarn prisma migrate dev --name add_etf_scenarios`. Commit `prisma/migrations/<timestamp>_add_etf_scenarios/migration.sql`. `yarn prisma generate` runs via existing `compile` script (`package.json`).

---

## 2. Cache-tag helpers

Mirror the existing `src/utils/etf-cache-utils.ts` and `src/utils/ticker-v1-cache-utils.ts` pattern — one per-feature file that defines both the tag builder and the `revalidateXTag()` wrapper.

- [ ] Create `src/utils/etf-scenario-cache-utils.ts`:
  - `etfScenarioBySlugTag(slug)` / `revalidateEtfScenarioBySlugTag(slug)`
  - `ETF_SCENARIO_LISTING_TAG` constant + `revalidateEtfScenarioListingTag()`
- [ ] After any admin write to `EtfScenario`, call **both** revalidation helpers (listing page and, if editing an existing row, the specific slug). This matches what the two ETF callback routes already do.

---

## 3. API routes

Split (as elsewhere in the repo): space-scoped reads (`/api/[spaceId]/...`) mirror the public pages, admin writes live at non-space-scoped paths under `/api/etf-scenarios`.

### Public (read)
- [ ] `src/app/api/[spaceId]/etf-scenarios/listing/route.ts` — `GET`
  - Define `EtfScenarioListingItem` + `EtfScenarioListingResponse` **inline in this file** (matching the `EtfListingItem` convention at `.../etfs-v1/listing/route.ts:21-48`).
  - Pagination: `page`, `pageSize` (default 32 like the ETF listing), `outlookBucket?`, `search?`.
  - `where: { spaceId, archived: false }`. `orderBy: [{ scenarioNumber: 'asc' }]`.
  - Wrap with `withErrorHandlingV2<EtfScenarioListingResponse>`.

- [ ] `src/app/api/[spaceId]/etf-scenarios/[slug]/route.ts` — `GET`
  - `findUnique({ where: { spaceId_slug: { spaceId, slug } } })`, include `winners / losers / mostExposed` with nested `etf { id, symbol, exchange, name }`.
  - If missing, **throw** (not `notFound()` — page routes use `notFound()`, API routes throw and let `withErrorHandlingV2` serialise a 4xx JSON response). Match the existing API 404 pattern.

### Admin (write) — each handler wrapped with `withLoggedInAdmin`
- [ ] `src/app/api/etf-scenarios/route.ts` — `POST` (create). Validate body with Zod: `scenarioNumber`, `title`, `underlyingCause`, `historicalAnalog`, `winnersMarkdown`, `losersMarkdown`, `outlookMarkdown`, `outlookBucket`, `outlookAsOfDate`. Auto-derive `slug` server-side from `title`.
- [ ] `src/app/api/etf-scenarios/[id]/route.ts` — `PUT` (update) + `DELETE` (hard delete; cascades via FK).
- [ ] `src/app/api/etf-scenarios/[id]/links/route.ts` — `POST` / `DELETE` for adding/removing an `EtfScenarioEtfLink` row (simpler than embedding link management in the upsert payload).
- [ ] `src/app/api/etf-scenarios/import/route.ts` — `POST` (one-off). Parses the scenarios markdown doc, upserts `EtfScenario` rows, resolves tickers against `Etf` (by `spaceId + symbol`), logs unmatched symbols in the response. **Replaces** the earlier idea of a `scripts/seed-etf-scenarios.ts` — no `scripts/` directory exists in this repo.
- [ ] **Every write endpoint** calls `revalidateEtfScenarioListingTag()` and (on PUT/DELETE) `revalidateEtfScenarioBySlugTag(slug)` before returning.

---

## 4. Server-rendered public pages

Use the existing SSR/ISR pattern from `src/app/etfs/[exchange]/[etf]/page.tsx`:

```ts
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;
```

**Do NOT add `generateStaticParams`** — sibling ETF pages deliberately rely on on-demand render + tag revalidation. Stay consistent.

- [ ] **Listing** — `src/app/etf-scenarios/page.tsx`
  - Server component. Fetch directly via `prisma.etfScenario.findMany` (same pattern as `src/app/etfs/page.tsx`).
  - Render inside a new `EtfScenarioPageLayout`. Breadcrumbs: `Home → ETFs → Scenarios`.
  - `export const metadata = generateEtfScenarioListingMetadata();`
  - Inline `ItemList` JSON-LD with 31 entries.

- [ ] **Detail** — `src/app/etf-scenarios/[slug]/page.tsx`
  - `export async function generateMetadata({ params })` → `generateEtfScenarioDetailMetadata(...)`.
  - Fetch via `fetch(..., { next: { revalidate: WEEK_IN_SECONDS, tags: [etfScenarioBySlugTag(slug)] } })` — same shape as `fetchEtfByExchange` in `src/app/etfs/[exchange]/[etf]/page.tsx:70-75`.
  - `notFound()` from `next/navigation` when null.
  - Layout: breadcrumbs → title → outlook badge → markdown sections (rendered via `parseMarkdown` + `dangerouslySetInnerHTML`) → related-ETFs grid linking to `/etfs/[exchange]/[symbol]`.
  - Inline `Article` JSON-LD (`datePublished = createdAt`, `dateModified = updatedAt`, `dateline = outlookAsOfDate`).

- [ ] **`loading.tsx` / `error.tsx` / `not-found.tsx`:** sibling ETF pages do **not** use these. Skip for parity unless the user asks for them.

- [ ] **Sitemap:** feature-level static `sitemap.xml` files exist for `stocks`, `industry-tariff-report`, etc., but **not for ETFs**. Treat `src/app/etf-scenarios/sitemap.xml` as optional; if added, list all 31 `/etf-scenarios/<slug>` URLs (can be regenerated manually when scenarios change).

---

## 5. Components

Create under `src/components/etf-scenarios/`:

- [ ] `EtfScenarioPageLayout.tsx` — breadcrumbs + title + description slot + children; mirror of `src/components/etfs/EtfPageLayout.tsx`.
- [ ] `EtfScenarioListingGrid.tsx` — responsive card grid backed by `EtfScenarioListingItem[]`.
- [ ] `EtfScenarioCard.tsx` — scenario-number badge, title, outlook-bucket pill, one-line excerpt, link to `/etf-scenarios/<slug>`. Extracted so it can be reused on ETF detail pages later.
- [ ] `EtfScenarioOutlookBadge.tsx` — pill component keyed by bucket (`HIGH`=red, `MEDIUM`=amber, `LOW`=green, `IN_PROGRESS`=grey). Reuse existing badge class names if the codebase has a shared `Badge`/`Pill` component — otherwise inline Tailwind.
- [ ] `EtfScenarioDetailView.tsx` — renders the five markdown sections + the winners/losers/mostExposed link lists.
- [ ] `EtfScenarioFiltersBar.tsx` — client component: outlook-bucket dropdown + free-text search, syncs to query params. Since the full dataset is only 31 rows, filtering can be purely client-side against the initial SSR payload — no extra API round-trip needed.

---

## 6. Admin UI

Follow `src/app/admin-v1/industry-management/page.tsx` + `UpsertIndustryModal.tsx`.

- [ ] `src/app/admin-v1/etf-scenarios/page.tsx` — `'use client'`
  - `useFetchData<EtfScenarioListingItem[]>('/api/koala_gains/etf-scenarios/listing?pageSize=100')`.
  - Table: number, title, outlook bucket, as-of date, archived flag, row actions (edit / archive-toggle / delete).
  - Buttons: **Create Scenario** (opens upsert modal), **Import from doc** (calls `POST /api/etf-scenarios/import`).
  - Toasts are fired by `useFetchData` / `usePostData` / `usePutData` / `useDeleteData` via their `successMessage`/`errorMessage` props — don't re-invent.

- [ ] `src/app/admin-v1/etf-scenarios/UpsertEtfScenarioModal.tsx` — `SingleSectionModal` with form fields: `scenarioNumber`, `title`, `underlyingCause` (TextareaAutosize), `historicalAnalog`, `winnersMarkdown`, `losersMarkdown`, `outlookMarkdown`, `outlookBucket` (select), `outlookAsOfDate` (use `react-datepicker` — already in the repo; see `src/components/daily-stock-movers/DateSelector.tsx`), `archived` (`Checkboxes` component). Uses `usePostData` / `usePutData`. The modal scrolls internally for the long form — `SingleSectionModal` is the only primitive available.

- [ ] `src/app/admin-v1/etf-scenarios/ManageLinksModal.tsx` — secondary modal from the main upsert, adds/removes ETF symbols per role. Ticker typeahead can call `/api/koala_gains/etfs-v1/listing?search=...` (existing endpoint).

- [ ] `src/app/admin-v1/AdminNav.tsx` — add `{ name: 'ETF Scenarios', href: '/admin-v1/etf-scenarios' }` to the existing `etfMgmtSection` (lines ~35–50).

- [ ] **Admin auth boundary:** there is no layout-level guard at `src/app/admin-v1/`. Anyone can reach the client page; the security is enforced purely by the API routes' `withLoggedInAdmin` wrapper. This is consistent with the rest of `admin-v1/` — don't add a page-level guard unless you also change it for the other admin pages.

---

## 7. Metadata, SEO, routing glue

- [ ] Create `src/utils/etf-scenario-metadata-generators.ts` (matches `src/utils/etf-metadata-generators*`): `generateEtfScenarioListingMetadata()`, `generateEtfScenarioDetailMetadata(...)`, listing JSON-LD (`ItemList`), detail JSON-LD (`Article`).
- [ ] Header-nav integration: if the public site has an ETFs dropdown, add "Scenarios" under it; otherwise add a prominent CTA on `/etfs` linking to `/etf-scenarios`.

---

## 8. Types / DTOs — convention reconciliation

- [ ] **Request + response DTOs** for API routes stay co-located with each route file (matches `EtfListingItem` / `EtfListingResponse` inline in `.../etfs-v1/listing/route.ts`).
- [ ] If (and only if) a type needs to be consumed by both a page/component and a route file, promote it to `src/types/etfScenarios.ts`. Otherwise leave inline.
- [ ] Enum types (`EtfScenarioOutlookBucket`, `EtfScenarioRole`) come from Prisma; import from `@prisma/client`.

---

## 9. Verification / test plan

- [ ] `yarn dev` in `insights-ui/`:
  - `/etf-scenarios` renders 31 cards after running **Import from doc**.
  - `/etf-scenarios/technology-sector-stagnation-crash` renders full detail with rendered markdown and ticker links.
  - Edit a scenario in admin → `revalidateEtfScenarioBySlugTag` fires → reload public detail page shows the new text without a manual cache bust.
  - Delete a scenario → listing updates after `revalidateEtfScenarioListingTag`.
- [ ] `yarn lint && yarn prettier-check && yarn build` clean at the insights-ui project root.
- [ ] `yarn prisma migrate status` clean on staging before merging.
- [ ] Mobile viewport check on listing + detail (the project ships on Vercel and is used on mobile).

---

## 10. Explicitly out of scope for this PR (follow-ups)

- "Scenarios this ETF appears in" block on ETF detail pages (uses `EtfScenarioEtfLink` relation).
- Historical outlook change-log (store past `outlookBucket` values with dates so you can see how a probability drifted).
- Per-scenario email or Discord subscription.
- Auto-refresh of the outlook section from an LLM pipeline (would reuse the `/api/etf-scenarios/import` endpoint with a scheduled trigger).

---

## 11. File inventory (net new)

```
prisma/schema.prisma                                               (edit)
prisma/migrations/<ts>_add_etf_scenarios/migration.sql              (new)

src/app/api/[spaceId]/etf-scenarios/listing/route.ts                (new; types inline)
src/app/api/[spaceId]/etf-scenarios/[slug]/route.ts                 (new; types inline)
src/app/api/etf-scenarios/route.ts                                  (new; admin POST)
src/app/api/etf-scenarios/[id]/route.ts                             (new; admin PUT + DELETE)
src/app/api/etf-scenarios/[id]/links/route.ts                       (new; admin link mgmt)
src/app/api/etf-scenarios/import/route.ts                           (new; admin import from doc)

src/app/etf-scenarios/page.tsx                                      (new; public listing)
src/app/etf-scenarios/[slug]/page.tsx                               (new; public detail)

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

src/utils/etf-scenario-cache-utils.ts                               (new; revalidation tags)
src/utils/etf-scenario-metadata-generators.ts                       (new; SEO)

src/types/etfScenarios.ts                                           (new, only if shared between page + non-route component)
```

~18 new files, ~2 edits. Estimated effort: 1–2 days for a developer familiar with the codebase.

---

## 12. Notes on revisions

An earlier revision of this checklist contained a few specific errors — all corrected above:

- Prescribed `generateStaticParams` for the detail page. Sibling ETF detail pages don't use it (they rely on on-demand render + tag revalidation). **Removed.**
- Placed cache-tag helpers at `src/util/revalidation-tags.ts`. Actual repo convention is per-feature files at `src/utils/<feature>-cache-utils.ts`. **Corrected.**
- Referenced `NotFoundError` from `@dodao/web-core`. That export does not exist; pages use `notFound()` from `next/navigation`, API routes throw ordinary `Error` and let `withErrorHandlingV2` serialise. **Corrected.**
- Suggested a `scripts/seed-etf-scenarios.ts`. There is no `scripts/` directory and no Prisma seed file in this repo. **Replaced** with an admin-gated `POST /api/etf-scenarios/import` endpoint.
- Proposed a central `src/types/etfScenarios.ts`. Existing convention is to co-locate request/response types with each API route. **Corrected** — only promote types to `src/types/` when shared outside the route file.
- Mentioned an `app/sitemap.ts`. The repo uses per-feature static `sitemap.xml` files; ETFs doesn't currently have one either. **Marked optional.**
- Claimed `loading.tsx` / `error.tsx` / `not-found.tsx` were needed. Sibling ETF pages don't use them. **Marked optional.**
- Implied admin routes inherit a layout-level guard. They don't — every write endpoint must wrap with `withLoggedInAdmin` individually. **Called out explicitly.**
