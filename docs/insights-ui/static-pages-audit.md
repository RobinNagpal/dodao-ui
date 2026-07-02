# Static (build-time) pages audit

Which KoalaGains (insights-ui) routes Next.js **pre-generates at build time** (`○ Static`), why, and
how that relates to CloudFront edge caching. Companion to the "Audit build-time (statically generated)
pages" task in [`tasks/todo-tasks.md`](./tasks/todo-tasks.md).

## How a page ends up pre-built

A `page.tsx` is rendered to static HTML at `next build` (fastest possible serve — a flat file from
cache, no per-request server work) **only when it has none of**:

1. `export const dynamic = 'force-dynamic'`,
2. a dynamic `[param]` segment **without** `generateStaticParams` (→ rendered on demand, `ƒ Dynamic`),
3. a dynamic request API at render — `cookies()`, `headers()`, `draftMode()`, `searchParams`,
   `getServerSession()` / `auth()`,
4. a parent `layout.tsx` that itself trips any of the above.

If it avoids all four, Next.js bakes it at build (optionally revalidated via ISR).

## Current snapshot (source-derived)

Of **149** non-API `page.tsx` routes:

| Bucket | Count | Pre-built at build? |
|---|---:|---|
| `force-dynamic` pages | 50 | ❌ on-demand SSR |
| `[param]` routes with **no** `generateStaticParams` | 55 | ❌ rendered on demand |
| Static-path pages, no dynamic API | **44** | ✅ **yes** |

There are **zero** `generateStaticParams` in the whole app, so **none** of the high-value detail pages
(`/stocks/[exchange]/[ticker]`, `/etfs/[exchange]/[etf]`, `/industry-tariff-report/[industryId]`,
ticker/blog/scenario detail pages) are pre-built — they render on demand and are then held at
CloudFront's edge (see below), which is a *different* mechanism from build-time SSG.

> The **authoritative** list is the route table `next build` prints (`○ Static` / `● SSG` / `ƒ Dynamic`).
> The list below is derived from source (grep for the four signals above). A build-log count such as
> "Generating static pages (85/85)" is higher than 44 because Next's static-worker tally also sweeps in
> framework-internal entries (`/_not-found`, error/route-group shells, per-route metadata) and varies by
> the exact commit built. To make this doc authoritative, paste the `next build` route table and replace
> the list below.

## The 44 pages pre-generated at build time

**Public / marketing / listing (server components, 18)**

- `/`  *(homepage — also edge-cached; see CloudFront section)*
- `/blogs`
- `/reports`
- `/ticker-reports`
- `/tariff-reports`
- `/stocks/comparison`
- `/genai-business`
- `/genai-simulation`
- `/crowd-funding`
- `/crowd-funding/debug/reports`
- `/crowd-funding/projects/create`
- `/auth/email/verify`
- `/portfolio-managers/college-ambassadors`
- `/portfolio-managers/college-ambassadors/industry-analysis`
- `/portfolio-managers/professional-managers`
- `/portfolio-managers/top-ranked`
- `/public-equities/tickers`
- `/public-equities/tickers/create`

**Client-shell pages (`'use client'`, prerendered as a static shell, 26)**

- `/login`
- `/authenticate`
- `/favourites`
- `/etf-favourites`
- `/invocations`
- `/generate-ppt`
- `/prompts`
- `/prompts/create`
- `/public-equities/debug/tickers`
- `/public-equities/industry-group-criteria`
- `/public-equities/tickers/compare-metrics-and-checklist`
- `/admin-v1/analysis-factors`
- `/admin-v1/analysis-template-report`
- `/admin-v1/analysis-templates`
- `/admin-v1/create-reports`
- `/admin-v1/etf-generation-requests`
- `/admin-v1/etf-reports`
- `/admin-v1/etf-scenarios`
- `/admin-v1/generation-requests`
- `/admin-v1/industry-analysis-management`
- `/admin-v1/industry-management`
- `/admin-v1/invalidate-cache`
- `/admin-v1/missing-reports`
- `/admin-v1/stock-scenarios`
- `/admin-v1/ticker-management`
- `/admin-v1/users`

## CloudFront edge caching (separate from build-time SSG)

Config: [`deployments/insights-ui/cloudfront.tf`](../../deployments/insights-ui/cloudfront.tf). One cache
policy, `koalagains_one_week` (TTL = 518400s = **6 days**, strips cookies + headers). Cached path
patterns (first-match order):

- `/` — homepage
- `/stocks/*` — **except** `/stocks/*/create` (admin, routed to CachingDisabled)
- `/etfs/*` — **except** `/etfs/*/financial-data` (admin, routed to CachingDisabled)
- `/industry-tariff-report/*`
- `/tariff-reports*`
- 15 enumerated per-stock / per-ETF GET API endpoints (see the `.tf` locals)

Everything else falls under the `default_cache_behavior` = Managed-CachingDisabled → **not** edge-cached.

## The "6 days" is a TTL, not a scheduled invalidation

- **6 days** is the per-object **TTL** in the `koalagains_one_week` cache policy. Each cached URL expires
  independently 6 days after it was fetched, then is re-pulled from the origin on the next request. There
  is **no** job that "invalidates all pages every 6 days."
- **Explicit invalidation** lives in
  [`insights-ui/src/utils/cloudfront-cache-utils.ts`](../../insights-ui/src/utils/cloudfront-cache-utils.ts)
  (`invalidateCloudFrontPaths` / `invalidateCloudFrontPathsAwaited`, via the AWS
  `CreateInvalidationCommand`). It's called from save / report-regeneration flows alongside
  `revalidateTag(...)`, and only for the **specific** paths affected — filtered by `CACHED_PATH_PREFIXES`
  so non-cached paths never consume the invalidation quota. It never purges "all pages."
