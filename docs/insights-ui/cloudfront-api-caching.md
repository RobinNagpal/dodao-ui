# CloudFront API-response caching — current state & findings

Focused reference for **how the GET API endpoints that back the public `/stocks/*` and
`/etfs/*` page trees are cached at CloudFront** on koalagains.com, verified against the
live Terraform (`deployments/insights-ui/cloudfront.tf`) and the app-side cache helpers.

This is the API-layer companion to the broader caching docs:

- [`cloudfront-deploy-skew.md`](cloudfront-deploy-skew.md) — full caching architecture / journey / page (HTML) caching. **Predates the AWS-Lightsail migration and the ETF-API-caching work — see [§6 Discrepancies](#6-discrepancies-found-during-this-investigation) below for what it now gets wrong.**
- [`cloudfront-error-caching.md`](cloudfront-error-caching.md) — how 4xx/5xx vs soft-200 responses are (or aren't) pinned at the edge.
- [`aws-deployment.md`](aws-deployment.md) — the as-built Lightsail deployment the distribution now fronts.

> **Terraform location.** The CloudFront stack lives in [`deployments/insights-ui/cloudfront.tf`](../../deployments/insights-ui/cloudfront.tf). Older docs and a few code comments still point at `dodao-api-v2-deployment/cloudfront.tf` — the config was migrated into this repo (state imported verbatim, no recreate) during the Vercel→Lightsail move. Distribution ID is unchanged: `EZI5H8FKNE9R1`.

---

## 1. TL;DR

- CloudFront caches **two families of GET API endpoints** for 6 days, not just page HTML. The
  cached list was **realigned** (this PR) to match exactly the public GET endpoints each page
  render actually fetches — see the [Alignment audit](#alignment-audit--configured-cache-vs-what-pages-actually-fetch-verified):
  - **Stocks — 11 endpoints** under `/api/koala_gains/tickers-v1/…` (9 per-ticker GETs + 2 country-listing GETs).
  - **ETFs — 9 endpoints** under `/api/koala_gains/etfs-v1/exchange/…`.
- Both families use the same `koalagains_one_week` cache policy (6-day TTL, cookies + headers stripped from the key, all query strings in the key) and the `Managed-AllViewer` origin-request policy.
- Each endpoint is **enumerated as its own `ordered_cache_behavior`** — never a broad `/api/…/*` wildcard — because the same prefixes also host admin-protected GETs/mutations, and the cookie-stripping policy would otherwise cache a public `401` and serve it to admins. Every cached pattern is a verified **public `withErrorHandlingV2` GET**.
- **The base `/exchange/{e}/{t}` fast route is deliberately NOT cached.** CloudFront path patterns can't anchor the final segment, so a `/exchange/*/*` catch-all would swallow the per-ticker/ETF POST+`withAdmin` mutation subtree. Its content is a cheap DB read; the heavy report/data slices are the ones cached.
- **Why cache the API at all:** the pages are `force-dynamic`, so a CloudFront page miss triggers an SSR on the Lightsail origin, and that SSR self-fetches its data through CloudFront. Caching the API endpoints means those data fetches hit the edge instead of fanning back into the origin.
- **Invalidation is wired end-to-end:** each save-flow `revalidate*` helper purges the page URL **and** the matching (now-correct) API URL in lockstep (`ticker-v1-cache-utils.ts`, `etf-cache-utils.ts`).

---

## 2. What is configured in `cloudfront.tf`

The distribution has **28 cache behaviors**: 1 default + 7 literal ordered + 20 generated
(`dynamic "ordered_cache_behavior"` over `local.api_cached_paths = concat(stocks_api_cached_paths, etfs_api_cached_paths)`).

> Every row below is now a public GET a page render actually fetches (verified — see the
> [Alignment audit](#alignment-audit--configured-cache-vs-what-pages-actually-fetch-verified)).
> The pre-realignment list had 3 dead stock behaviors (`/full-render`, `/competition`,
> `/management-team`) and 1 dead ETF behavior (`/analysis`), and was missing the endpoints the
> main + category + competition pages fetch; both are corrected here.

### 2.1 Stocks API — `local.stocks_api_cached_paths` (11)

| CloudFront path pattern | Fetched by |
|---|---|
| `/api/koala_gains/tickers-v1/exchange/*/*/business-and-moat-data` | `/stocks/{e}/{t}/business-and-moat` |
| `/api/koala_gains/tickers-v1/exchange/*/*/financial-statement-analysis-data` | `/stocks/{e}/{t}/financial-statement-analysis` |
| `/api/koala_gains/tickers-v1/exchange/*/*/past-performance-data` | `/stocks/{e}/{t}/past-performance` |
| `/api/koala_gains/tickers-v1/exchange/*/*/future-performance-data` | `/stocks/{e}/{t}/future-performance` |
| `/api/koala_gains/tickers-v1/exchange/*/*/fair-value-data` | `/stocks/{e}/{t}/fair-value` |
| `/api/koala_gains/tickers-v1/exchange/*/*/financial-info` | `/stocks/{e}/{t}` (main) |
| `/api/koala_gains/tickers-v1/exchange/*/*/quarterly-chart-data` | `/stocks/{e}/{t}` (main) |
| `/api/koala_gains/tickers-v1/exchange/*/*/price-history` | `/stocks/{e}/{t}` (main) |
| `/api/koala_gains/tickers-v1/exchange/*/*/competition-tickers` | `/stocks/{e}/{t}` (main) + `/competition` |
| `/api/koala_gains/tickers-v1/country/*/tickers/industries` | `/stocks/countries/{c}` |
| `/api/koala_gains/tickers-v1/country/*/tickers/industries/*` | `/stocks/countries/{c}/industries/{k}`, `/stocks/industries/{k}` |

### 2.2 ETF API — `local.etfs_api_cached_paths` (9)

| CloudFront path pattern | Fetched by |
|---|---|
| `/api/koala_gains/etfs-v1/exchange/*/*/full-render` | `/etfs/{e}/{t}` (main report body) |
| `/api/koala_gains/etfs-v1/exchange/*/*/chart-data` | `/etfs/{e}/{t}` (price-chart slice) |
| `/api/koala_gains/etfs-v1/exchange/*/*/mor-info` | `/etfs/{e}/{t}/performance-returns` |
| `/api/koala_gains/etfs-v1/exchange/*/*/portfolio-holdings` | `/etfs/{e}/{t}/holdings` |
| `/api/koala_gains/etfs-v1/exchange/*/*/competition` | `/etfs/{e}/{t}/competition` |
| `/api/koala_gains/etfs-v1/exchange/*/*/performance-returns-data` | `/etfs/{e}/{t}/performance-returns` |
| `/api/koala_gains/etfs-v1/exchange/*/*/cost-efficiency-team-data` | `/etfs/{e}/{t}/cost-efficiency-team` |
| `/api/koala_gains/etfs-v1/exchange/*/*/risk-analysis-data` | `/etfs/{e}/{t}/risk-analysis` |
| `/api/koala_gains/etfs-v1/exchange/*/*/future-performance-outlook-data` | `/etfs/{e}/{t}/future-performance-outlook` |

**Not cached** (pass through the `Managed-CachingDisabled` default): the base `/exchange/{e}/{t}`
fast route (see the TL;DR for why), mutating routes (`PUT /exchange/{e}/{t}`,
`POST /save-report-callback`, the per-ticker/ETF `withAdmin` POSTs, etc.), admin GETs under the
same prefixes (`/generation-requests`, `/missing-reports`, `/listing`, …), and everything under
other API trees (scenarios, tariff-calculator, hts-codes, auth, portfolio-managers, daily-movers).

---

## Alignment audit — configured cache vs. what pages actually fetch (VERIFIED)

Traced every per-ticker and per-ETF report page's server-side `fetch()` calls
(`getBaseUrlForServerSidePages()` self-fetches) against the cache behaviors. Legend:
✅ cached & fetched (working), ⬜ deliberately uncached (base fast route — see TL;DR).
The **Cached?** column reflects the **post-realignment** state (this PR).

### Stocks — `/stocks/[exchange]/[ticker]` tree

| Page | Endpoint(s) it actually fetches (SSR) | Cached? |
|---|---|---|
| `…/[ticker]` (main) | base `/exchange/{e}/{t}?allowNull=true` | ⬜ |
| | `…/exchange/{e}/{t}/financial-info` | ✅ |
| | `…/exchange/{e}/{t}/quarterly-chart-data` | ✅ |
| | `…/exchange/{e}/{t}/price-history` | ✅ |
| | `…/exchange/{e}/{t}/competition-tickers` | ✅ |
| `…/business-and-moat` | `…/exchange/{e}/{t}/business-and-moat-data` | ✅ |
| `…/fair-value` | `…/exchange/{e}/{t}/fair-value-data` | ✅ |
| `…/financial-statement-analysis` | `…/exchange/{e}/{t}/financial-statement-analysis-data` | ✅ |
| `…/future-performance` | `…/exchange/{e}/{t}/future-performance-data` | ✅ |
| `…/past-performance` | `…/exchange/{e}/{t}/past-performance-data` | ✅ |
| `…/competition` | `…/exchange/{e}/{t}/competition-tickers` | ✅ |
| `…/management-team` | base `/exchange/{e}/{t}?allowNull=true` | ⬜ (page URL cached; no separate data endpoint) |

- **Removed as dead:** `/full-render` (page reverted to per-slice fetches), `/competition` and `/management-team` (both are POST+`withAdmin` routes — never valid GET-cache targets).
- **Added:** `/financial-info`, `/quarterly-chart-data`, `/price-history`, `/competition-tickers`.
- **Result:** the main `/stocks/{e}/{t}` page's 4 cached slices now hit the edge; only its base fast route stays uncached (by design).

### ETFs — `/etfs/[exchange]/[etf]` tree

| Page | Endpoint(s) it actually fetches (SSR) | Cached? |
|---|---|---|
| `…/[etf]` (main) | base `/exchange/{e}/{t}?allowNull=true` | ⬜ |
| | `…/exchange/{e}/{t}/full-render` | ✅ |
| | `…/exchange/{e}/{t}/chart-data` | ✅ |
| `…/performance-returns` | `…/exchange/{e}/{t}/performance-returns-data` | ✅ |
| | `…/exchange/{e}/{t}/mor-info` | ✅ |
| `…/cost-efficiency-team` | `…/exchange/{e}/{t}/cost-efficiency-team-data` | ✅ |
| `…/future-performance-outlook` | `…/exchange/{e}/{t}/future-performance-outlook-data` | ✅ |
| `…/risk-analysis` | `…/exchange/{e}/{t}/risk-analysis-data` | ✅ |
| `…/competition` | `…/exchange/{e}/{t}/competition` + base `?allowNull=true` | ✅ competition; ⬜ base |
| `…/holdings` | `…/exchange/{e}/{t}/portfolio-holdings` + base `?allowNull=true` | ✅ holdings; ⬜ base |

- **Removed as dead:** `/analysis` (only the `fetch-analysis.ts` CLI hits it — never a page).
- **Added:** the four `{category}-data` endpoints + `/competition`.
- **Result:** every ETF subpage's data endpoint is now cached; only the base fast route stays uncached (by design).

### Answer to "are we adding all necessary APIs there?"

**Now yes** — every public GET a report page fetches is cached, and the endpoints nothing fetches
were removed. The single intentional exception is the base `/exchange/{e}/{t}` fast route on both
trees, left uncached because CloudFront can't segment-anchor a wildcard without swallowing the
admin/mutation subtree (its payload is a cheap DB read anyway).

### What was changed (applied in this PR)

Each added endpoint was first confirmed a **public `withErrorHandlingV2` GET** (the cookie-stripping
policy would cache a `401`/admin response publicly otherwise):

- **`cloudfront.tf`** — `stocks_api_cached_paths`: removed `/full-render`, `/competition`, `/management-team`; added `/financial-info`, `/quarterly-chart-data`, `/price-history`, `/competition-tickers`. `etfs_api_cached_paths`: removed `/analysis`; added the four `{category}-data` endpoints + `/competition`.
- **`ticker-v1-cache-utils.ts`** — umbrella `revalidateTickerAndExchangeTag` now purges the per-ticker API subtree via one wildcard (covers all main-page slices); `revalidateTickerCompetitionTag` → `/competition-tickers`; `revalidateTickerManagementTeamTag` → page URL only (its data lives in the uncached base route).
- **`etf-cache-utils.ts`** — category helper now purges `/{slug}-data` (+ `/mor-info` for performance-returns); `revalidateEtfCompetitionTag` now also purges `/competition`.
- **`cloudfront-cache-utils.ts`** — `CACHED_PATH_PREFIXES` already covered the new endpoints at the prefix level; only its header comment was updated.

> **Deploy note:** the `cloudfront.tf` change only takes effect after a `terraform apply` of the
> `deployments/insights-ui` stack. Adding/removing `ordered_cache_behavior` blocks is an in-place
> distribution update (no recreate); allow a few minutes for the distribution to redeploy.

---

## 3. How each API endpoint is cached

All cached API behaviors share the `koalagains_one_week` cache policy and `Managed-AllViewer`
origin-request policy:

```hcl
cache_policy_id          = aws_cloudfront_cache_policy.koalagains_one_week.id
origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"  # Managed-AllViewer
allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
cached_methods           = ["GET", "HEAD"]
compress                 = true
```

`koalagains_one_week`:

| Parameter | Value | Effect |
|---|---|---|
| `min_ttl` = `default_ttl` = `max_ttl` | `518400` (6 days) | `min_ttl > 0` makes CloudFront **ignore the origin `Cache-Control`** — the `force-dynamic` app sends `no-store`, and we force-cache anyway. |
| `cookie_behavior` | `none` | Cookies are neither in the cache key nor forwarded. **This is the reason endpoints are enumerated, not wildcarded** (below). |
| `header_behavior` | `none` | No request header is in the cache key. |
| `query_string_behavior` | `all` | Every query string is in the key + forwarded (so `?dpl=…` chunk requests bucket separately). |
| Accept-Encoding brotli/gzip | enabled | Compressed variants keyed separately. |

**Why enumerate every endpoint instead of one `/api/…/tickers-v1/*` (or `/etfs-v1/*`) wildcard.**
The same prefixes host admin-protected GETs. The cache policy strips cookies before forwarding,
so an admin GET would reach the origin unauthenticated → `401`, and CloudFront would **cache that
401 publicly** and serve it to authenticated admins. Every cached path is hand-picked as a public
read endpoint with no per-user variance. Adding a new cached API endpoint therefore requires a
deliberate edit in **two** places (see §5).

**Method handling.** `cached_methods = ["GET", "HEAD"]` — CloudFront never caches POST/PUT/PATCH/
DELETE, so mutating calls pass through to the origin uncached even though `allowed_methods`
permits them.

**Error responses.** `custom_error_response { error_caching_min_ttl = 0 }` for 404/500/502/503/504
means a genuine API error (a real `404`/`500` from `withErrorHandlingV2`, or an origin/gateway
failure) is **re-fetched on the next request** rather than pinned for 6 days. Caveat carried over
from [`cloudfront-error-caching.md`](cloudfront-error-caching.md): a **200-status "soft" error/empty
body** is still force-cached for 6 days. For the API layer this is lower-risk than for pages
because `withErrorHandlingV2` returns real status codes, but any cached endpoint that returns
`200` with an empty/placeholder body on a miss would be pinned.

---

## 4. Why the API layer is cached (request flow)

```
Browser ──► CloudFront ──(page miss on /stocks/{e}/{t}/business-and-moat)──► Lightsail origin (SSR, force-dynamic)
                                                              │
                                    SSR self-fetches its data │  fetch(`${getBaseUrl()}/api/koala_gains/tickers-v1/exchange/{e}/{t}/business-and-moat-data`)
                                                              ▼
Browser ◄── CloudFront ◄───────────────────────────── CloudFront (API hit, warm) ──► (only on API miss) origin
```

Because every `/stocks/*` and `/etfs/*` page is `force-dynamic`, a CloudFront **page** miss always
triggers an origin SSR. That SSR fetches its data from the same-domain API endpoints
(`getBaseUrlForServerSidePages.ts`), which routes back out through CloudFront. Before these API
behaviors existed, those data fetches passed straight through to the origin. When the fetched
endpoint *is* cached (the diagram uses `/business-and-moat-data`, which is), a page miss on a
popular ticker resolves its data from the already-warm **API** cache, so the origin does DB/S3
work once per ~6 days per region instead of on every page miss.

**This benefit only materialises for the endpoints a page actually fetches**, which is why the
cached list was realigned to the pages' real fetches (see the
[Alignment audit](#alignment-audit--configured-cache-vs-what-pages-actually-fetch-verified)). The
main `/stocks/{e}/{t}` render fetches 5 endpoints; 4 are now cached, and only its base fast route
(a cheap DB read) still reaches the origin on each page miss.

---

## 5. Invalidation — kept in lockstep with the page purge

The source of truth for "which prefixes CloudFront caches" on the app side is
`CACHED_PATH_PREFIXES` in [`insights-ui/src/utils/cloudfront-cache-utils.ts`](../../insights-ui/src/utils/cloudfront-cache-utils.ts):

```ts
const CACHED_PATH_PREFIXES = [
  '/stocks/', '/etfs/', '/industry-tariff-report/', '/tariff-reports',
  '/api/koala_gains/tickers-v1/exchange/',
  '/api/koala_gains/tickers-v1/country/',
  '/api/koala_gains/etfs-v1/exchange/',
] as const;
```

`invalidateCloudFrontPaths()` filters every requested path against this list, so a call for an
uncached path is a silent no-op (doesn't waste the 1,000-path/month free quota). It runs behind
`waitUntil()` (fire-and-forget) for save flows; the admin "Invalidate cache" actions use the
awaited variant for real success/failure feedback.

**Every save-flow helper purges page + API together:**

| Helper (module) | Page path purged | API path purged |
|---|---|---|
| `revalidateTickerAndExchangeTag` (`ticker-v1-cache-utils.ts`) | `/stocks/{e}/{t}` | `…/tickers-v1/exchange/{e}/{t}*` (wildcard — covers all main-page slices) |
| `revalidateTickerCategoryReportTag` | `/stocks/{e}/{t}/{slug}` | `…/exchange/{e}/{t}/{slug}-data` |
| `revalidateTickerCompetitionTag` | `/stocks/{e}/{t}/competition` | `…/exchange/{e}/{t}/competition-tickers` |
| `revalidateTickerManagementTeamTag` | `/stocks/{e}/{t}/management-team` | — (data is in the uncached base route) |
| `revalidateAllTickerTags` | `/stocks/{e}/{t}*` (wildcard) | `…/exchange/{e}/{t}*` (wildcard) |
| `revalidateStocksPageTag` / `revalidateIndustryPageTag` | `/stocks/countries/{c}*`, industry pages | `…/country/{c}*`, `…/country/{c}/tickers/industries/{k}` |
| `revalidateEtfAndExchangeTag` (`etf-cache-utils.ts`) | `/etfs/{e}/{t}` | `…/etfs-v1/exchange/{e}/{t}/full-render` **and** `/chart-data` |
| `revalidateEtfCategoryReportTag` | `/etfs/{e}/{t}/{slug}` | `…/exchange/{e}/{t}/{slug}-data` (+ `/mor-info` for performance-returns) |
| `revalidateEtfCompetitionTag` | `/etfs/{e}/{t}/competition` | `…/exchange/{e}/{t}/competition` |
| `revalidateEtfHoldingsTag` | `/etfs/{e}/{t}/holdings` | `…/exchange/{e}/{t}/portfolio-holdings` |
| `revalidateAllEtfTags` / `…Awaited` | `/etfs/{e}/{t}*` (wildcard) | `…/etfs-v1/exchange/{e}/{t}*` (wildcard) |

The `revalidateTag()` half of each helper is **inert under `force-dynamic`** (nothing in Vercel/
Next Data Cache to invalidate) but is kept as free future-proofing. The `invalidateCloudFrontPaths()`
half is the live one. The `flush-cloudfront-cache` GitHub workflow's `flush_stocks` box wipes
`/stocks/*` + `/api/…/tickers-v1/exchange/*` + `/api/…/tickers-v1/country/*` in one run.

Each API purge target now matches a cached endpoint that its page actually fetches (post-realignment).
The umbrella `revalidateTickerAndExchangeTag` uses a single `…/exchange/{e}/{t}*` wildcard so it
covers every main-page slice (and any market-data refresh via `fetch-financial-data`) at 1 billable
path.

**To add a new cached API endpoint you must edit two places** (they are not generated from a single
source): (1) add the path pattern to `stocks_api_cached_paths` / `etfs_api_cached_paths` in
`cloudfront.tf`, and (2) confirm its prefix is in `CACHED_PATH_PREFIXES` and wire a `revalidate*`
helper to purge it. Omitting (2) means the endpoint is cached for 6 days but never purged on save.

---

## 6. Discrepancies found during this investigation

**Headline finding (functional): the configured API cache was misaligned with actual page fetches —
now FIXED in this PR.** The [Alignment audit](#alignment-audit--configured-cache-vs-what-pages-actually-fetch-verified)
is the full record — in short, 3 stock behaviors (`/full-render`, `/competition`, `/management-team`)
and 1 ETF behavior (`/analysis`) were dead, while the endpoints the report pages fetch on every
render (the 4 ETF `-data` category endpoints + `/competition`, and stocks `financial-info` /
`quarterly-chart-data` / `price-history` / `competition-tickers`) were uncached. The cached list and
the `revalidate*` helpers were realigned to the verified page fetches; the base `/exchange/{e}/{t}`
route remains intentionally uncached (CloudFront can't segment-anchor a wildcard).

The remaining items are documentation/comment drift from before the Lightsail migration and the
ETF-API-caching work — recorded so the next reader trusts the code over the older prose:

1. **`cloudfront-deploy-skew.md` says ETF API endpoints are *not* cached** ("ETF API endpoints are not yet behind CloudFront — candidate for a future phase"; "Scope: stocks only for now"). **Now false** — 5 ETF API behaviors exist in `cloudfront.tf`, are in `CACHED_PATH_PREFIXES`, and are purged by `etf-cache-utils.ts`.
2. **That doc describes the origin as Vercel** (`dodao-ui-insights-ui.vercel.app`) with Vercel Skew Protection as the deploy-skew safeguard. The distribution now fronts the **AWS Lightsail** origin (`var.aws_origin_hostname`); Skew Protection is Vercel-specific and no longer applies. (Deploy-skew for the API layer is a non-issue regardless — JSON responses reference no build-hashed chunks. For pages, chunk coherence now rests on S3 retaining old hashed assets — see `s3_static.tf` — not on Skew Protection.)
3. **Behavior count is stale** — that doc says "Fifteen cache behaviors (one default + fourteen ordered)". Actual after this PR: **28** (1 default + 7 literal ordered + 20 generated API). The doc also omits the `/` homepage behavior (now edge-cached with the 6-day policy, not `CachingDisabled` as the doc states) and the two admin carve-outs routed to `CachingDisabled` before the broad patterns: `/stocks/*/create` and `/etfs/*/financial-data`.
4. **Stale Terraform path in code comments** — `cloudfront-cache-utils.ts` and `etf-cache-utils.ts` referenced `dodao-api-v2-deployment/cloudfront.tf`; corrected to `deployments/insights-ui/cloudfront.tf` alongside this investigation. (`cloudfront-error-caching.md` still carries the old path in its prose header.)
5. **`cloudfront-cache-utils.ts` header comment listed only 4 ETF endpoints** (omitted `chart-data`); corrected to match the 5 in Terraform.

Items 1–5 are documentation fixes; the headline finding above is the one that needs an infra follow-up.

---

## 7. Quick verification

```bash
# A genuinely cached & fetched stocks endpoint (a `-data` subpage) — should cache:
curl -sI 'https://koalagains.com/api/koala_gains/tickers-v1/exchange/NYSE/RTX/business-and-moat-data' \
  | grep -iE 'HTTP|x-cache|age|content-type'
# Expect: HTTP/2 200 ; x-cache: Hit from cloudfront (after warm) ; age: <secs> ; application/json

# A cached & fetched ETF endpoint:
curl -sI 'https://koalagains.com/api/koala_gains/etfs-v1/exchange/NYSEARCA/VOO/full-render' \
  | grep -iE 'HTTP|x-cache|age'

# Newly cached in this PR — the main stock page's slices (after terraform apply + warm, expect Hit):
curl -sI 'https://koalagains.com/api/koala_gains/tickers-v1/exchange/NYSE/RTX/financial-info' | grep -iE 'HTTP|x-cache'
curl -sI 'https://koalagains.com/api/koala_gains/tickers-v1/exchange/NYSE/RTX/competition-tickers' | grep -iE 'HTTP|x-cache'

# The base fast route is intentionally NOT cached — expect Miss on every request:
curl -sI 'https://koalagains.com/api/koala_gains/tickers-v1/exchange/NYSE/RTX' | grep -iE 'HTTP|x-cache'

# An admin GET under the same prefix must NOT be cached (default CachingDisabled)
curl -sI 'https://koalagains.com/api/koala_gains/tickers-v1/generation-requests' \
  | grep -iE 'HTTP|x-cache'
# Expect: x-cache: Miss from cloudfront (or an auth redirect) — never a cached 401
```
