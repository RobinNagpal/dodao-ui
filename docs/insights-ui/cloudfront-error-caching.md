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

## The 200-status soft-error gap — root cause was `loading.tsx` (now fixed for pages)

The harder case is that an error response carries **HTTP 200**, so CloudFront force-caches it for
6 days. Investigation (5 agents) pinned the exact mechanism, which is more specific than "the fetch
isn't awaited":

- The stock **page already `await`s** its existence check before returning JSX
  (`stocks/[exchange]/[ticker]/page.tsx:735`, `const tickerData = await tickerInfo`). The real
  culprit was the route's **`loading.tsx`**: in the App Router a `loading.tsx` wraps the segment in
  an implicit `<Suspense>`, so the instant the page component **suspends on that await**, Next.js
  flushes the loading fallback as the **HTTP 200 shell**. `notFound()` / a thrown error inside the
  awaited call then fires *after* 200 is already committed → a soft-200.
- The **ETF route has no `loading.tsx`**, so its identical `await … ; if (!etf) notFound()` blocks
  the response until it resolves and emits a **real 404**. This asymmetry is why a missing stock
  returned 200 while a missing ETF returned 404 — same code shape, different segment boundary.

**The fix (this change set):**

1. **Removed `stocks/[exchange]/[ticker]/loading.tsx`.** The awaited existence/redirect/throw at the
   top of the main page and every subpage now commits a genuine **404 / 308 / 500 before the first
   byte**, matching the already-correct ETF pages. The heavy sections still stream via the page's
   **inner** `<Suspense>` boundaries (charts, competition, similar tickers), so streaming UX is kept;
   only the full-page skeleton on a cold/uncached SSR render is traded for a short block on the one
   primary fetch (negligible behind the 6-day edge cache).
2. **`performance-page-utils.ts` no longer swallows 5xx.** `fetchPerformanceByExchange` /
   `fetchPerformanceAnyExchange` now **re-throw on `status >= 500` and on transport errors** (→ real
   500), and treat only 404/other non-OK as soft-empty (→ existing any-exchange fallback →
   `notFound()`). So a momentary DB outage on a subpage surfaces as an uncacheable 500 instead of a
   404 that would de-index a live ticker.

With genuine 404/500 statuses, the existing `error_caching_min_ttl=0` config keeps them out of the
edge cache automatically.

**Why headers can't substitute for this:** good *and* error pages both send `Cache-Control:
no-store`, and `min_ttl=6day` ignores it for all 2xx — so CloudFront cannot tell a good 200 from a
soft-error 200, and lowering `min_ttl` to 0 would stop caching good pages too. A Lambda@Edge
origin-response can't override `min_ttl` either, a CloudFront Function can't see the origin response,
and middleware has no DB access to make the existence decision. Returning a genuine non-2xx from the
app is the only robust fix.

### Remaining follow-ups (not in this change set)

1. **Per-entity GET API routes still return `200 + null/EMPTY` on a miss** (the cached secondary
   endpoints: stock category data, `competition-tickers`, `financial-info` / `price-history` /
   `quarterly-chart-data`; ETF `analysis` / `portfolio-holdings`). The *pages* now convert these to a
   404, but a **direct/crawler hit** to one of these cached API paths still caches "empty" for 6 days.
   Convert genuine misses to a thrown `notFoundError` → 404 (`withErrorHandlingV2` maps it), keeping
   the `allowNull=true` SSR contract on the three main entity routes (`tickers-v1/exchange/…`,
   `tickers-v1/[ticker]`, `etfs-v1/exchange/…`) and the consumed `full-render` payloads at 200. See
   the per-route inventory in the PR description.
2. **Supplementary streamed slices on the main stock page** (`fetchFinancialInfo`,
   `fetchQuarterlyChartData`, `fetchPriceHistory`, `fetchCompetitionData`) render `null` on error.
   Because they resolve *after* the 200 shell flushes, a throw there cannot change the committed
   status — so a DB blip on one of these still yields a 200 page with an empty supplementary section.
   The substantive report content comes from the pre-flush awaited fetch, so this is an accepted
   minor residual; closing it would require de-streaming those sections (losing the perf benefit).

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
