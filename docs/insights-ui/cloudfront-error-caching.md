# CloudFront error-page caching — prevention & detection

How koalagains.com's CloudFront (`EZI5H8FKNE9R1`, managed by
`dodao-api-v2-deployment/cloudfront.tf`) handles **error / not-found** responses, what's been
done to stop a transient failure from being pinned at the edge for 6 days, the **residual gap**
that still needs an app change, and a **runbook to detect and purge** already-cached error pages.

Related: [`cloudfront-deploy-skew.md`](cloudfront-deploy-skew.md) (why we force-cache at all) and
[`aws-deployment.md`](aws-deployment.md).

---

## The mechanism (why error pages can get stuck)

The `koalagains_one_week` cache policy sets `min = default = max = 518400s` (6 days). Because
`min_ttl > 0`, **CloudFront ignores the origin's `Cache-Control` for 2xx/3xx** and caches them for
6 days regardless — that's the deliberate trick that force-caches the `force-dynamic` app (which
sends `Cache-Control: no-store`).

Crucially, this 6-day TTL applies **only to responses CloudFront treats as success (2xx/3xx)**.
For **4xx/5xx** CloudFront uses a *separate* path — the **Error Caching Minimum TTL** — not the
cache policy.

So there are two very different cases:

| Response | Cached by the 6-day policy? | How long |
|---|---|---|
| **Genuine 4xx/5xx** (origin/container down, gateway error, API route's real 404/500) | No — uses error-caching TTL | now **0s** (see fix below); was ~10s default |
| **200-status "soft" error/not-found page** (a page that renders an error/empty body but with HTTP 200) | **Yes** | **6 days** ⚠️ |

## What was fixed (genuine errors)

`dodao-api-v2-deployment/cloudfront.tf` now sets `error_caching_min_ttl = 0` via
`custom_error_response` for `404, 500, 502, 503, 504` (pass-through — no `response_code` /
`response_page_path`, so the app's own status + body still reach the user). A genuine error is
re-fetched on the next request instead of being held at the edge. This covers:

- The origin/container being down, gateway timeouts (502/503/504).
- API routes under `withErrorHandlingV2` that return a real `404` (Prisma `P2025` / `NotFoundError`)
  or `500` (unexpected throw).

This is a safe, additive, distribution-wide change with **zero impact on good 2xx caching**.

## The residual gap (200-status soft errors) — needs an app change

The harder case, **confirmed empirically**, is that several insights-ui responses are an error but
carry **HTTP 200**, so CloudFront force-caches them for 6 days:

1. **Page not-found / DB-down renders as 200.** `/stocks/[exchange]/[ticker]` and
   `/etfs/[exchange]/[etf]` are `force-dynamic` and stream via Suspense. The existence/main-data
   fetch is **not awaited before the shell flushes** (e.g. `getTickerOrRedirect(params)` is passed
   to streaming as a promise, not `await`ed), so `notFound()` / a thrown error fires **after** the
   200 shell is already committed. Live check: `GET https://koalagains.com/stocks/NASDAQ/<missing>`
   returns **HTTP 200**, not 404.
2. **`full-render` / `allowNull` API endpoints return `200 + null/EMPTY`** for a missing entity
   instead of a 404. These endpoints are now CloudFront-cached (stocks + ETFs), so a direct/crawler
   hit to a missing symbol caches "empty" for 6 days.
3. **Suspense slice fetchers swallow 5xx** (`if (!res.ok) return null`), rendering a degraded-but-200
   page when a section's data is momentarily unavailable.

**Why headers can't fix this:** good *and* error pages both send `Cache-Control: no-store`
(verified), and `min_ttl=6day` ignores it for all 2xx — so CloudFront cannot tell a good 200 from
a soft-error 200, and lowering `min_ttl` to 0 would stop caching good pages too. A Lambda@Edge
origin-response can't override `min_ttl` either. **The only real fix is to make these responses a
genuine non-2xx** so they fall into the (now zero-TTL) error path.

### Recommended follow-up (app)

Lowest-risk, highest-value, in priority order — none are "one-liners", so they're tracked as
follow-ups rather than bundled with the infra fix:

1. **Make the entity-existence check produce a 404 *before* streaming.** `await` the primary
   ticker/ETF fetch at the top of the page (so `notFound()` / a throw sets the response status
   before the first Suspense shell flushes). Cost: the first *uncached* SSR render blocks on the
   main fetch — negligible in practice since the page is force-cached at the edge. Verify the
   `use(promise)` consumers still work.
2. **Return `404` from the `full-render` / per-entity GET routes on a miss** (throw the shared
   `NotFoundError` so `withErrorHandlingV2` maps it to 404) and map that 404 → `notFound()` in the
   page fetcher. Keep the `allowNull=true` contract for the SSR fallback path.
3. **Don't swallow 5xx in the slice fetchers** — only treat 404/empty as soft-null.

With those, the existing `error_caching_min_ttl=0` config purges them automatically.

---

## Detection & cleanup runbook (find error pages already cached)

### Detect

**1. Direct probe (fastest, no setup).** Cache state + error markers in the body:
```bash
for url in \
  https://koalagains.com/stocks/NASDAQ/AAPL \
  https://koalagains.com/etfs/NASDAQ/<symbol> ; do
  echo "== $url =="
  curl -s -D - -o /tmp/b.html "$url" | grep -iE '^HTTP/|x-cache|age:'
  grep -iqE 'something went wrong|not found|technical difficulties' /tmp/b.html && echo ">>> likely POISONED"
done
```
`HTTP/2 200` + `x-cache: Hit from cloudfront` + an error/empty body = a poisoned entry; `age:` is
how long it's been cached. For API endpoints, a cached `200` whose body is `null`/empty is the tell.

**2. CloudFront access logs (at scale).** If standard logging to S3 is enabled, query with Athena:
```sql
SELECT date, time, cs_uri_stem, sc_status, sc_bytes, x_edge_result_type
FROM cloudfront_logs
WHERE x_edge_result_type IN ('Hit','RefreshHit')                 -- served from edge cache
  AND ( sc_status >= 400 OR (sc_status = 200 AND sc_bytes < 8000) )  -- error status, or tiny 200 = likely error page
  AND ( cs_uri_stem LIKE '/stocks/%' OR cs_uri_stem LIKE '/etfs/%'
        OR cs_uri_stem LIKE '/api/koala_gains/%-v1/%' )
ORDER BY date, time;
```
(The `sc_bytes < 8000` heuristic catches 200 error/not-found pages — far smaller than a real
report. If access logging isn't enabled on `EZI5H8FKNE9R1`, add a `logging_config` block first.)

**3. CloudWatch to bound the window.** The distribution's `4xxErrorRate` / `5xxErrorRate` metrics
show outage spikes; anything cached during a spike window (cross-referenced with DB/Lightsail
incident times) and still within 6 days of it is a cleanup candidate.

### Clean up (reuse existing tooling — no new code)

- **A family at a time:** the `flush-cloudfront-cache` GitHub workflow (tick `flush_stocks` /
  `flush_etfs` / `flush_tariffs`).
- **Specific paths:** `invalidateCloudFrontPathsAwaited([...])` from
  `insights-ui/src/utils/cloudfront-cache-utils.ts` (already filters to cached prefixes and reports
  sent/skipped/failed), or the admin "Invalidate cache" page.
- **Verify:** re-run probe #1 — expect `x-cache: Miss`/`RefreshHit` then a real body/status.
