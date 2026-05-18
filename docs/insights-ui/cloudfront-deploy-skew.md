# Caching Architecture for koalagains.com (CloudFront + Vercel + Next.js)

The single reference for everything cache-related on koalagains.com: how each layer works today, why the architecture looks the way it does, the deploy-skew bug that nearly broke the site and how it was fixed, where CloudFront is still slow, what constraints we operate under, what the now-inert ISR tag plumbing in the code is for (and why it's safe to ignore), and the three options for the next iteration.

> **Scope.** This doc supersedes the cache content in [stock-page-caching.md](stock-page-caching.md). That file is preserved as a historical record of the pre-`force-dynamic` ISR tag map — useful when reading legacy code that still references those tags — but its mental model is no longer current. If you only have time to read one doc, read this one.

---

## Table of contents

1. [TL;DR](#tldr)
2. [Glossary of cache layers](#glossary-of-cache-layers)
3. [The journey: how we got to today's architecture](#the-journey-how-we-got-to-todays-architecture)
4. [Current architecture (post-Phase-3)](#current-architecture-post-phase-3)
5. [CloudFront configuration deep dive](#cloudfront-configuration-deep-dive)
6. [Vercel-side configuration](#vercel-side-configuration)
7. [The deploy-skew bug, in detail](#the-deploy-skew-bug-in-detail)
8. [The deploy-skew fix](#the-deploy-skew-fix)
9. [Where CloudFront is slow today](#where-cloudfront-is-slow-today)
10. [Cache constraints](#cache-constraints)
11. [Next options](#next-options)
12. [Inert / dead-code cache plumbing (historical reference)](#inert--dead-code-cache-plumbing-historical-reference)
13. [Operational guide](#operational-guide)
14. [Where the pieces live (file paths)](#where-the-pieces-live-file-paths)

---

## TL;DR

The caching architecture for `/stocks/*` and `/etfs/*` on koalagains.com has been through three phases:

1. **Phase 1 — `force-static` + Vercel ISR (original).** Fast page loads but the dominant Vercel cost driver: every page rebuild wrote a new HTML entry + one Data Cache entry per tagged `fetch()`, and **the ISR cache was flushed on every deploy** so every deploy triggered a wave of rebuilds.
2. **Phase 2 — Add CloudFront in front of Vercel for `/stocks/*` and `/etfs/*`.** CloudFront absorbed hot traffic at the edge for 7 days, but introduced a deploy-skew bug ("Something went wrong" on direct page loads after a Vercel deploy) because CloudFront cached HTML from build N while live JS chunks came from build N+1.
3. **Phase 3 — `force-dynamic` + CloudFront (6-day TTL) + Vercel Skew Protection (7-day window).** Zero ISR writes, no deploy invalidations, deploy-skew bug fixed. Long-tail and cold-cache pages still pay a full SSR cost on first visit per region — accepted trade-off in exchange for the cost savings.

Current state: cheap, deploy-safe, with known soft spots (cold cache per region, RSC client-side nav falls back to full reload). Sections 9–11 cover the slow paths and the options for closing them.

---

## Glossary of cache layers

The phrase "the cache" hides at least five distinct things in this stack. The journey makes more sense once these are crisp:

| Layer | What it caches | Where it lives | When it writes | When it invalidates |
|---|---|---|---|---|
| **Browser HTTP cache** | Static assets (JS/CSS/images) | Each user's browser | First load | Per `Cache-Control` (long-lived for hashed chunks) |
| **CloudFront edge cache** | Whatever Vercel returned for `/stocks/*`, `/etfs/*` | ~218 CloudFront PoPs, each isolated | First request per PoP (cache miss → write) | TTL expiry (currently 6 days), LRU eviction, manual invalidation |
| **Vercel ISR cache** | Pre-rendered HTML for `force-static` pages | Vercel's CDN | Page rebuild (after invalidation or first request) | `revalidateTag()`, `revalidatePath()`, time-based, **deploy** |
| **Vercel Data Cache** | Individual `fetch()` response bodies | Vercel's compute layer | Each uncached, opted-in fetch (`next: { tags }` / `revalidate`) | `revalidateTag()` matching one of the fetch's tags, time-based, **deploy** |
| **Next.js client-side cache** | RSC payloads for in-session navigation | Each user's browser memory | Successful client navigation or prefetch | Page reload, deployment-id mismatch |

**The two we paid for** before Phase 3 were ISR HTML writes and Data Cache writes. They were both **flushed on every deploy** — meaning every deploy triggered a fresh wave of writes as pages were re-hit and re-rendered.

`force-dynamic` (Phase 3) **turns off ISR HTML writes and Data Cache writes for the affected routes**. Browser cache, CloudFront cache, and client-side cache continue to operate.

---

## The journey: how we got to today's architecture

### Phase 1 — `force-static` + Vercel ISR (original)

Every per-ticker and per-ETF page used:

```ts
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;
```

This pre-rendered each page on first request, stored the HTML in Vercel's ISR cache, and held it until a tag invalidation forced a rebuild. Reads were ~100ms HTML from Vercel's edge.

**Why this was attractive.** Reads were nearly free, pages were always cached after the first hit, and Vercel's edge handled global distribution automatically.

**Why this became too expensive.** Three compounding factors:

1. **One rebuild = 1 HTML write + 1 Data Cache write per tagged `fetch()`.** Stocks pages had been consolidated (PRs [#1472](https://github.com/RobinNagpal/dodao-ui/pull/1472) / [#1473](https://github.com/RobinNagpal/dodao-ui/pull/1473)) so each page had exactly one tagged fetch — 2 writes per rebuild. ETF pages still had the old pattern: 8 tagged fetches on the main page, all sharing one tag — **9 writes per rebuild for the main ETF page**, and the shared tag rebuilt 4 ETF surfaces every time it was invalidated.
2. **The `*/3 * * * *` `generate-ticker-v1-request` cron drove the invalidation rate.** It fires 480 times/day; each tick processes up to 10 regen requests; most regens end with a `FINAL_SUMMARY` save that invalidates the umbrella tag → main page rebuilds. Roughly 100–120 umbrella invalidations per hour. The equivalent ETF cron (`generate-etf-v1-request`, also `*/3`) did the same on the ETF side.
3. **Vercel flushes the ISR cache on every deploy.** Every deploy invalidates all pre-rendered HTML. On the next crawl pass, every popular page rebuilds. With many deploys per week, this alone was a heavy write load.

ISR writes became the single biggest line item on the Vercel bill.

### Phase 2 — Add CloudFront in front of Vercel

To absorb hot-path traffic without further bloating ISR writes, AWS CloudFront was put in front of the Vercel origin for `/stocks/*` and `/etfs/*`. The initial cache policy was **7-day TTL** on those routes; the default behavior (everything else) stayed at `Managed-CachingDisabled` so non-cached paths passed through to Vercel unchanged.

**Architecture goals:**
- Hot pages served from CloudFront edge — no Vercel origin hit
- TTL bounded so users see stale-but-recent content
- No per-deploy CloudFront invalidations (those are free under 1,000 paths/month but we wanted an ops-free design)

**The deploy-skew bug.** Vercel's own ISR cache auto-invalidates on deploy, so direct hits to `*.vercel.app` always served build-coherent HTML+JS pairs. CloudFront has no such hook — it kept the HTML from deploy N for up to 7 days, even after deploy N+1 went live.

A page response is two coupled things:
- **HTML** with chunk URLs (`/_next/static/chunks/<hash>.js`) and an RSC stream with numeric module IDs (`48:I[7186,[],"IconMark"]`) and slot references (`$L48`).
- **JS chunks** — content-hashed, immutable per build.

After a deploy, the cached HTML still references chunk hashes and module IDs from build N. The JS bundles now in production come from build N+1. A user loading the stale page would get:

- HTML from build N → references `/_next/static/chunks/abc.js`
- Browser fetches that chunk → Vercel may have it (Skew Protection) or may not
- If missing, or if modules don't line up → React error → `app/error.tsx` → **"Something went wrong"**

Direct hits to `dodao-ui-insights-ui.vercel.app/stocks/NYSE/RTX` worked fine. Only `koalagains.com/stocks/NYSE/RTX` (CloudFront-fronted) failed. See section 7 for the full diagnosis.

### Phase 3 — Fix deploy skew, then drop ISR entirely

Two locked-in changes:

#### 3a. Enable Vercel Skew Protection (7-day window) + tighten CloudFront TTL to 6 days

Vercel Skew Protection lets old deployments stay routable for the configured window. When a request arrives with an old `?dpl=` query parameter or `x-deployment-id` header, Vercel routes it to the matching old deployment. Stale CloudFront HTML now finds matching chunks. CloudFront TTL is intentionally 1 day inside the 7-day Skew Protection window so HTML in CloudFront can never outlive a routable deployment.

#### 3b. Flip every previously-`force-static` page to `force-dynamic`

```ts
// before
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

// after
export const dynamic = 'force-dynamic';
```

`force-dynamic` disables both ISR HTML writes and Data Cache writes from fetches inside the route. All existing `next: { tags: [...] }` and `revalidateTag(...)` calls in cache helpers, save endpoints, and crons become inert no-ops. They're left in place as dead code (see section 12) so the disable-ISR PR scope stays small; cleanup happens in a follow-up once write metrics confirm the drop.

**Cost outcome:**

| Cost dimension | Before | After |
|---|---|---|
| ISR HTML writes | High (one per page rebuild, hundreds per hour) | ~0 |
| Data Cache writes | High (one per tagged fetch per rebuild) | ~0 (force-dynamic ignores tag opt-ins) |
| Deploy-time wave of rebuilds | Yes, every deploy | None (no ISR to flush) |
| Deploy invalidations needed | Conceptually yes (avoided in prod) | No |
| Vercel function invocations | Low (mostly ISR hits) | Higher on CloudFront misses (compute, not writes) |
| CloudFront cache write/read | Same | Same |
| Net Vercel cost driver | Writes | Compute on cold misses |

---

## Current architecture (post-Phase-3)

```
                                       (per region, isolated)
                                    ┌──────────────────────────┐
                                    │  CloudFront edge cache   │
Browser (any region)  ───── HTTPS ──┤  /stocks/* : 6-day TTL   │
                                    │  /etfs/*   : 6-day TTL   │
                                    │  everything else: pass   │
                                    └────────────┬─────────────┘
                                                 │ cache miss
                                                 │ (or non-cached path)
                                                 ▼
                                    ┌──────────────────────────┐
                                    │  CloudFront Function:    │  ← viewer-request stage
                                    │  www.koalagains.com →    │     redirect, then forward
                                    │  apex                    │
                                    └────────────┬─────────────┘
                                                 │
                                                 ▼
                                    ┌──────────────────────────┐
                                    │  Vercel (Next.js 15.5.7) │
                                    │  - All pages force-dynamic
                                    │  - Skew Protection 7-day │
                                    │  - Standard Vercel build │
                                    └──────────────────────────┘
```

Key invariants:

- **`/stocks/*` and `/etfs/*` are the only paths cached at CloudFront**, for 6 days. Everything else (API routes, `_next/static`, OAuth callbacks, admin routes) passes through unchanged.
- **All headers are forwarded to Vercel** via the `Managed-AllViewer` origin request policy — crucial because NextAuth on Vercel derives the OAuth `redirect_uri` from the `Host` header.
- **Query strings are part of the cache key** (`query_string_behavior = "all"`) — required so `?dpl=N` and `?dpl=N+1` chunk requests cache separately.
- **CloudFront's `min_ttl = 518400` (6 days)** overrides Vercel's `Cache-Control: no-store` on dynamic responses. We force CloudFront to cache despite Vercel saying "don't cache."
- **No headers are in the cache key** (`header_behavior = "none"`) — meaning an HTML request and an RSC request to the same URL share a cache entry. This is the root cause of the "RSC navigation falls back to full reload" behavior described in section 9.

---

## CloudFront configuration deep dive

Defined in `dodao-api-v2-deployment/cloudfront.tf`.

### Distribution

```hcl
resource "aws_cloudfront_distribution" "koalagains" {
  enabled         = true
  is_ipv6_enabled = true
  http_version    = "http2and3"
  price_class     = "PriceClass_100"   # US, Canada, Europe edge locations only
  aliases         = ["koalagains.com", "www.koalagains.com"]
  ...
}
```

`PriceClass_100` is the cheapest tier — it uses edges in US, Canada, and Europe only. Users in Asia / South America / Africa get routed to the nearest of those, which is slower but materially cheaper. If we expand traffic in other regions, this is the lever to raise.

### Origin

```hcl
origin {
  domain_name = "dodao-ui-insights-ui.vercel.app"
  origin_id   = "vercel-insights-ui"
  custom_origin_config {
    http_port              = 80
    https_port             = 443
    origin_protocol_policy = "https-only"
    origin_ssl_protocols   = ["TLSv1.2"]
  }
}
```

Single origin: the Vercel project's `*.vercel.app` URL. We use HTTPS-only to origin so the Vercel-issued cert is verified by CloudFront on each forward.

### Cache policy `koalagains_one_week` (custom)

```hcl
resource "aws_cloudfront_cache_policy" "koalagains_one_week" {
  name        = "koalagains-one-week"
  comment     = "Cache /stocks/* and /etfs/* for 6 days (under Vercel Skew Protection's 7-day window)"
  default_ttl = 518400   # 6 days
  max_ttl     = 518400   # 6 days
  min_ttl     = 518400   # 6 days, also overrides origin Cache-Control

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"   # cookies not in cache key, not forwarded
    }
    headers_config {
      header_behavior = "none"   # no headers in cache key
    }
    query_strings_config {
      query_string_behavior = "all"   # all query strings in cache key + forwarded
    }
  }
}
```

**Why `min_ttl = max_ttl = default_ttl`.** With `min_ttl > 0`, CloudFront ignores `s-maxage`, `max-age`, and `no-cache` in origin's `Cache-Control`. We deliberately want this: Vercel sends `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` on dynamic pages, which would otherwise prevent caching. Setting all three TTLs to 6 days forces 6-day caching regardless.

**Why 6 days, not 7.** Vercel Skew Protection retains deployments for 7 days. If CloudFront cached HTML for 7+ days, an edge case could serve HTML referencing a deployment that's already aged out → chunk 404 → "Something went wrong." 6 < 7 buys a 1-day safety margin.

**Why `header_behavior = "none"`.** Adding any header to the cache key splits the cache (potentially per-user), reducing hit rate. We deliberately keep no headers in the key — at the cost of the RSC-vs-HTML cache collision (section 9, last row).

### Origin request policy `Managed-AllViewer` (UUID `216adef6-5c7f-47e4-b989-5492eafa07d3`)

This is a CloudFront-managed policy that forwards **all** viewer headers, cookies, and query strings to the origin. The cache key is governed separately by the cache policy above.

**Why we need it.** NextAuth on Vercel derives the OAuth `redirect_uri` from `x-forwarded-host` (which Vercel populates from the incoming `Host` header). The previous origin request policy was `Managed-AllViewerExceptHostHeader`, which stripped the `Host` header → Vercel saw `dodao-ui-insights-ui.vercel.app` → Google's OAuth callback URL ended up at the vercel.app domain instead of `koalagains.com` → `Error 400: redirect_uri_mismatch`. The fix was switching to `Managed-AllViewer`.

The trade-off: with the Host header forwarded, Vercel sees the real domain (which is what we want) but Vercel's edge can't easily distinguish CloudFront-fronted traffic from direct traffic. We don't currently need that distinction, so the trade-off is fine.

### Cache behaviors

Three cache behaviors on the distribution:

#### Default behavior — `Managed-CachingDisabled`

```hcl
default_cache_behavior {
  target_origin_id       = "vercel-insights-ui"
  viewer_protocol_policy = "redirect-to-https"
  allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
  cached_methods         = ["GET", "HEAD"]
  compress               = true

  cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"  # Managed-CachingDisabled
  origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"  # Managed-AllViewer

  # CloudFront Function: redirect www → apex
  function_association { event_type = "viewer-request"; function_arn = ... }
}
```

This matches **everything except** `/stocks/*` and `/etfs/*`. With `Managed-CachingDisabled`, CloudFront forwards every request to Vercel without caching. Used for:

- API routes (`/api/*`)
- Static assets (`/_next/static/*`) — Vercel handles their long-cache headers, CloudFront passes through
- OAuth callbacks (`/api/auth/*`)
- Admin routes
- The home page (`/`)
- Listing pages (`/stocks`, `/etfs`, etc.)

The `redirect-to-https` viewer protocol policy ensures all HTTP requests get 301'd to HTTPS at CloudFront before they ever reach Vercel.

#### `/stocks/*` ordered behavior

```hcl
ordered_cache_behavior {
  path_pattern             = "/stocks/*"
  cache_policy_id          = aws_cloudfront_cache_policy.koalagains_one_week.id
  origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"
  allowed_methods          = ["GET", "HEAD"]   # POST etc. not allowed for cached behavior
  cached_methods           = ["GET", "HEAD"]
  compress                 = true
  ...
}
```

Caches `/stocks/*` for 6 days (HTML responses). POST/PUT/etc. are not allowed in this behavior — those would need to go through `/api/*`, which matches the default `CachingDisabled` behavior.

#### `/etfs/*` ordered behavior

Identical configuration to `/stocks/*`. Same cache policy, same origin request policy.

### CloudFront Function — `koalagains-www-to-apex`

```js
function handler(event) {
  var request = event.request;
  var host = request.headers.host && request.headers.host.value;
  if (host === 'www.koalagains.com') {
    var qs = '';
    for (var k in request.querystring) {
      qs += (qs ? '&' : '?') + k + '=' + request.querystring[k].value;
    }
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://koalagains.com' + request.uri + qs }
      }
    };
  }
  return request;
}
```

Attached as a `viewer-request` function on all three cache behaviors. Runs **before** the cache lookup, so the redirect happens at the edge without ever touching the cache or origin. If you ever need to add header normalization (Option A in section 11), this is the function to extend.

### TLS

Cert is `aws_acm_certificate.koalagains` (in `us-east-1` for CloudFront), DNS-validated via Route53. The cert covers both `koalagains.com` and `www.koalagains.com`. Minimum TLS version is 1.2.

### DNS

- `koalagains.com` → A and AAAA ALIAS records pointing at the CloudFront distribution
- `www.koalagains.com` → CNAME pointing at the CloudFront distribution (the CloudFront Function does the actual redirect)

### Pricing

CloudFront pricing:
- **Data transfer out**: ~$0.085/GB (US/EU edges)
- **HTTPS requests**: $0.0100 per 10,000 requests
- **Invalidations**: First 1,000 paths/month free; $0.005/path after

Path-pattern invalidations (e.g., `/stocks/*`) count as **1 path each**. Even invalidating both `/stocks/*` and `/etfs/*` on every deploy = 2 paths/deploy. 500 deploys/month = 1,000 paths = $0. Invalidation cost is effectively zero at our scale — but we still avoid them to keep the operational design simple.

---

## Vercel-side configuration

### `force-dynamic` on every previously-`force-static` page

37 pages flipped to:

```ts
export const dynamic = 'force-dynamic';
```

What `force-dynamic` does:
- Marks the route as dynamically rendered — no ISR, no pre-rendering at build time, no HTML stored in Vercel's cache.
- Each request triggers a fresh server-side render.
- All `fetch()` calls inside the route default to `cache: 'no-store'`.
- Existing `next: { tags: [...] }` and `next: { revalidate: ... }` opt-ins are ignored — fetches don't write to the Data Cache.
- Existing `revalidateTag()` calls become no-ops (there's nothing in the cache to invalidate).

The full list of routes is in `app/stocks/**`, `app/etfs/**`, `app/etf-scenarios/**`, `app/stock-scenarios/**`, `app/etf-investors/**`, `app/hts-codes/**`, and `app/tariff-calculator/*` — see the PR that introduced this for the file list, or grep for `export const dynamic = 'force-dynamic'`.

### Vercel Skew Protection

Enabled at **Vercel Dashboard → Project (insights-ui) → Settings → Advanced → Skew Protection**.

- Max age: **7 days** (raised from initial 12 hours after observing that some users keep tabs open longer).
- Available on Pro and Enterprise plans (not Hobby). Included free; no per-use charge.
- Auto-bumped to 60 days for Googlebot / Bingbot requests (Vercel's built-in long crawler window).

When Skew Protection is on, Vercel auto-injects `VERCEL_DEPLOYMENT_ID` at build time, and Next.js 14.1.4+ automatically:
- Appends `?dpl=<deployment-id>` to every chunk URL in rendered HTML.
- Sends `x-deployment-id: <deployment-id>` on framework-managed RSC fetches.
- On the client, detects deployment-id mismatch and triggers `window.location.reload()` instead of trying to hydrate against a mismatched build.

**No `next.config.ts` change needed.** Setting `deploymentId: process.env.VERCEL_DEPLOYMENT_ID` manually is only needed for `vercel build` + `vercel deploy --prebuilt` workflows or Next.js < 14.1.4. We're on Next 15.5.7 with standard Vercel build, so the dashboard toggle is enough.

### `app/error.tsx` — global error boundary

```tsx
// insights-ui/src/app/error.tsx
'use client';
import Link from 'next/link';
import { Container } from '@/components/home-page/Container';
import { GridPattern } from '@/components/home-page/GridPattern';

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="relative flex flex-auto items-center">
      ...
      <h1>Something went wrong</h1>
      <p>We're experiencing technical difficulties. Please try again later.</p>
      <Link href="/">Go back home →</Link>
    </div>
  );
}
```

Catches client-side render errors. **This is the page users saw when the deploy-skew bug fired.** As a safety-net enhancement, this could be made to reload on chunk/module/hydration errors:

```tsx
useEffect(() => {
  if (/chunk|module|hydration/i.test(error?.message ?? '')) {
    window.location.reload();
  }
}, [error]);
```

Not yet adopted — Skew Protection handles the realistic cases.

### Auth and the Host header

NextAuth's origin detection (`next-auth@4.24.11/src/utils/detect-origin.ts`):

```ts
export function detectOrigin(forwardedHost, protocol) {
  if (process.env.VERCEL ?? process.env.AUTH_TRUST_HOST)
    return `${protocol === "http" ? "http" : "https"}://${forwardedHost}`
  return process.env.NEXTAUTH_URL
}
```

On Vercel, NextAuth **ignores `NEXTAUTH_URL` entirely** and uses `x-forwarded-host`. Vercel populates `x-forwarded-host` from the incoming `Host` header.

This is why the `Managed-AllViewer` origin request policy is non-negotiable. With `Managed-AllViewerExceptHostHeader` (the original choice), CloudFront stripped `Host` before forwarding, Vercel saw its own `*.vercel.app` host, NextAuth derived a `redirect_uri` pointing at `dodao-ui-insights-ui.vercel.app`, and Google's OAuth flow rejected the mismatch.

Cookie domain quirk: `insights-ui/src/app/api/auth/[...nextauth]/authOptions.ts` overrides the shared web-core default (`.tidbitshub.org`) with `undefined` for production cookies — so the browser sets the cookie scoped to the current origin (`koalagains.com`). Don't be surprised by the override; it's correct.

### `vercel.json` — crons

```json
{
  "crons": [
    { "path": "/api/koala_gains/tickers-v1/generate-ticker-v1-request",   "schedule": "*/3 * * * *" },
    { "path": "/api/koala_gains/tickers-v1/generate-daily-top-gainers",   "schedule": "0 23 * * 1-5" },
    { "path": "/api/koala_gains/tickers-v1/generate-daily-top-losers",    "schedule": "0 23 * * 1-5" },
    { "path": "/api/koala_gains/etfs-v1/generate-etf-v1-request",         "schedule": "*/3 * * * *" }
  ]
}
```

The `*/3` ticker and ETF crons are the ones that used to drive most ISR invalidations. They still fire `revalidateTag()` calls at the end of each report save (no-op under `force-dynamic`). The crons themselves still do real work (report generation) — only the cache-invalidation lines are inert. Don't disable the crons; just leave the inert `revalidate*` calls alone.

---

## The deploy-skew bug, in detail

### Mechanism

Every Next.js page response is two coupled pieces:

1. **HTML** — references specific chunk hashes:
   ```html
   <link rel="stylesheet" href="/_next/static/css/df7ec49d70eea1a5.css?dpl=dpl_FN1vQxYhCoCbv9ushUoYy18V7JaZ">
   <script src="/_next/static/chunks/main-app-abc123.js">
   ```
   …and contains an inline RSC stream with **numeric module IDs assigned per build**:
   ```
   48:I[7186,[],"IconMark"]
   ...
   ["$","span",null,{"children":"$L48"}]
   ```

2. **JS chunks** — content-hashed, immutable per build. The browser fetches the chunks the HTML references.

The numeric module IDs in the RSC payload are **not stable across builds**. Build N might assign `48` to `IconMark`; build N+1 might use `47` or `52`. If a browser loads HTML from build N but the JS bundle from build N+1, React tries to mount slot `$L48` expecting one module and finds a different one. The result: client-side React error → caught by `app/error.tsx` → **"Something went wrong"**.

### How CloudFront made this fail

Vercel's own ISR auto-invalidates on deploy. Direct hits to `*.vercel.app` always serve build-coherent HTML+JS pairs.

CloudFront has no deploy hook. It cached HTML from deploy N for the full TTL (initially 7 days). After deploy N+1 went live:

- Old HTML in CloudFront → references `/_next/static/chunks/X-build-N.js`
- Browser fetches `X-build-N.js` → request hits Vercel
- Without Skew Protection: Vercel only has build N+1 files → 404 on `X-build-N.js`, or worse, serves files with build-N+1 module IDs
- React tries to mount mismatched modules → error boundary fires

The long `min_ttl = 604800` meant Vercel's `Cache-Control: no-store` was ignored by CloudFront — Next.js couldn't shorten the staleness from its end.

### Concrete symptom

- `https://koalagains.com/stocks/NYSE/RTX` → "Something went wrong"
- `https://dodao-ui-insights-ui.vercel.app/stocks/NYSE/RTX` → renders fine

### Diagnostic methodology

If this recurs, the diagnosis pattern is:

```bash
# Compare CloudFront response to direct Vercel response
curl -s https://koalagains.com/stocks/NYSE/RTX > /tmp/cf.html
curl -s https://dodao-ui-insights-ui.vercel.app/stocks/NYSE/RTX > /tmp/vercel.html

# Are they the same build? Look for the dpl= query parameter on chunk URLs
grep -o 'dpl=[a-zA-Z0-9_]*' /tmp/cf.html | sort -u
grep -o 'dpl=[a-zA-Z0-9_]*' /tmp/vercel.html | sort -u

# If they differ, CloudFront is serving a stale deploy's HTML.
# Check Skew Protection is keeping that deploy alive:
curl -sI https://dodao-ui-insights-ui.vercel.app/_next/static/chunks/<old-hash>.js?dpl=<old-dpl>
# If 200 → Skew Protection working. If 404 → Skew window exceeded.
```

---

## The deploy-skew fix

Three changes locked in (3a–3c). Optional safety net 3d.

### 3a. Enable Vercel Skew Protection (7 days)

Vercel Dashboard → Project → Settings → Advanced → **Skew Protection** → enable, **set max age to 7 days**.

What it does: when a request arrives with an old `?dpl=` or `x-deployment-id`, Vercel routes it to the **matching old deployment**. Stale HTML cached by CloudFront still loads its matching chunks (Vercel serves them from the old build).

| User scenario | Behavior |
|---|---|
| Load CloudFront-cached HTML from deploy N (current build also N) | Page renders normally. |
| Load CloudFront-cached HTML from deploy N (current build is N+1) | Chunks load with `?dpl=N` → Skew Protection routes to deploy N → page renders. |
| Navigate in-session; RSC fetch returns deploy N+1 with new `x-deployment-id` | Next.js detects dpl mismatch → `window.location.reload()` → fresh HTML for N+1. |
| Skew window exceeded; old chunks 404 | Client error → `app/error.tsx` → user sees "Something went wrong"; reload-on-chunk-error pattern catches it gracefully. |

### 3b. Tighten CloudFront TTL to 6 days (inside the Skew Protection window)

```hcl
default_ttl = 518400   # was 604800
max_ttl     = 518400
min_ttl     = 518400
```

6 < 7 ensures cached HTML never references a deployment that's already aged out.

### 3c. Confirm CloudFront forwards `?dpl=` in the cache key

Already correct in the cache policy:

```hcl
query_strings_config {
  query_string_behavior = "all"
}
```

So `/_next/static/chunks/abc.js?dpl=N` and `?dpl=N+1` are cached as separate entries, and the `dpl` value reaches Vercel intact for Skew Protection routing.

### 3d. Optional belt-and-suspenders: reload on chunk-shaped errors

Enhance `app/error.tsx`:

```tsx
useEffect(() => {
  if (/chunk|module|hydration/i.test(error?.message ?? '')) {
    window.location.reload();
  }
}, [error]);
```

Catches the rare edge case where Skew Protection didn't cover the request (e.g., a user with a tab open longer than the 7-day window).

### Verification steps after applying the fix

```bash
# 1. Confirm Skew Protection is on and the build sees a deployment ID
curl -s https://dodao-ui-insights-ui.vercel.app/ | grep -o 'dpl=[a-zA-Z0-9_]*' | head -1
# Expect: a deployment-id string

# 2. Confirm chunk URLs in the rendered HTML include ?dpl=
curl -s https://koalagains.com/stocks/NYSE/RTX | grep -o '/_next/static/chunks/[^"]*' | head -3
# Expect: each chunk URL includes ?dpl=dpl_...

# 3. Confirm the CloudFront cache TTL is current
terraform state show aws_cloudfront_cache_policy.koalagains_one_week | grep _ttl
# Expect: all three = 518400

# 4. (After a deploy) confirm an old dpl still resolves via Skew Protection
curl -sI "https://dodao-ui-insights-ui.vercel.app/_next/static/chunks/<some-chunk-hash>.js?dpl=<old-deployment-id>"
# Expect: 200 (within the 7-day window)
```

---

## Where CloudFront is slow today

Hot, cached pages are fast (~100ms from a warm CloudFront edge). Several scenarios still hit Vercel's full-render path, which means a fresh SSR with DB + S3 + LLM-report fetches (typically 1–5s for a stock or ETF detail page):

| Scenario | Why slow | Frequency |
|---|---|---|
| **First request per CloudFront edge region** | CloudFront has ~218 PoPs; each maintains its own cache. The first user in eu-west-3 to hit `/stocks/NASDAQ/AAPL` pays the cold-cache cost even if us-east-1 has it cached. | One per (PoP × URL) per cache lifetime |
| **6-day TTL expiry** | Hot pages re-fetch from origin once per ~6 days. That one request is slow; subsequent requests in the same region are fast again. | Per (URL × region) every ~6 days |
| **LRU eviction** | CloudFront edge caches are finite. Less-popular pages get evicted before TTL. | Continuous on long-tail pages |
| **Long-tail tickers / ETFs** | Pages visited rarely (most of the ~5,000-ticker catalog) likely aren't cached anywhere. Every visit is a cold render. | High — most catalog pages fall here |
| **RSC client-side navigation** | When a user clicks an internal link, Next.js fetches an RSC payload (`text/x-component`). CloudFront's cache key doesn't include the `RSC` header, so CloudFront returns cached HTML for those requests. Next.js detects the content-type mismatch and **falls back to a full browser navigation** — works correctly, just slower / less seamless than an in-place client transition. | Every internal nav click |
| **Default-behavior paths** (everything other than `/stocks/*` and `/etfs/*`) | The default behavior is `Managed-CachingDisabled`; every request reaches Vercel | Per request on home / listings / API |
| **New routes** | A newly-added ticker / ETF has no cache anywhere. First visit per region is slow. | Per new route × regions |
| **Crawler hitting many pages quickly** | Each new path = cold render. Crawler load can drive a wave of slow Vercel responses. | Periodic (search-engine recrawl cycles) |

A cold full render of `/stocks/NYSE/RTX` typically takes 1–5 seconds (Postgres queries + S3 reads + occasionally LLM-report fetches). A warm CloudFront hit returns in <100ms. The 10–50× gap between cold and warm is why hot-path traffic absorption at CloudFront matters.

### The RSC navigation collision in detail

This deserves its own treatment because it surprised us during diagnosis:

When a user clicks a `<Link>` in Next.js App Router, the client doesn't request the destination URL as HTML — it sends a fetch with `Accept: text/x-component` and `RSC: 1` header. Vercel responds with a streamed RSC payload (different format from HTML, smaller, designed for in-place tree updates).

CloudFront's cache key includes path + query string but **not** the `RSC` header. So:

- User A loads `/stocks/NYSE/RTX` as HTML → CloudFront caches HTML under key `(/stocks/NYSE/RTX, no qs)`.
- User B clicks a link to `/stocks/NYSE/RTX` → Next.js sends `RSC: 1` → CloudFront cache hit on same key → returns the cached HTML.
- Next.js client sees `text/html` instead of `text/x-component` → discards the response → falls back to `window.location.href = '/stocks/NYSE/RTX'` → full browser navigation.

The fallback works correctly (the user does get to the right page from cache), but it's a full page reload instead of a seamless transition.

This is acceptable today but is the main motivation for Option A in section 11.

---

## Cache constraints

The architecture is designed around five hard constraints. Any future change should preserve all five:

1. **Don't flush the cache on every deploy.** Per-deploy CloudFront invalidations are operationally annoying (CI hook, paths to maintain, deploy hooks to keep working) and they create a thundering-herd of cold-cache renders on the next traffic wave. Skew Protection + 6-day TTL gives us deploy correctness without invalidation.
2. **Keep Vercel ISR write cost at ~0.** Achieved via `force-dynamic`. Was the original cost driver; eliminated.
3. **Keep Vercel function-invocation cost low.** CloudFront absorbs hot-path requests so most user visits don't reach a Vercel function. Cold-cache, long-tail, and uncached-behavior requests still do — that's the compute cost we accept in exchange for not running ISR.
4. **Accept staleness within bounds.** Up to 6 days of stale content is acceptable for stock/ETF analysis pages. LLM-generated reports don't need to be minute-fresh; price data is fetched at render time so it's never cached.
5. **Reserve CloudFront invalidations for emergencies.** Shipping a critical correctness fix that must reach users immediately is fine. Routine "I just deployed" invalidations are not.

Anything that requires per-deploy invalidations, brings ISR writes back, or significantly raises function invocations needs an explicit cost-benefit argument before adoption.

---

## Next options

Three live possibilities for the next iteration. The shared target is to close the "RSC nav falls back to full reload" slow path from section 9.

### Option A — Cache RSC payloads at CloudFront via header-stripping CloudFront Function

Extend the existing `koalagains-www-to-apex` CloudFront Function to also strip `Next-Router-State-Tree`, `Next-Url`, and `Next-Router-Prefetch` headers from RSC requests. Then whitelist `RSC` in the cache policy's `headers_config` so HTML and RSC requests bucket separately.

```js
function handler(event) {
  var request = event.request;
  // existing www → apex logic ...

  if (request.headers.rsc) {
    delete request.headers['next-router-state-tree'];
    delete request.headers['next-url'];
    delete request.headers['next-router-prefetch'];
  }
  return request;
}
```

```hcl
headers_config {
  header_behavior = "whitelist"
  headers { items = ["RSC"] }
}
```

**Theory**: with state-tree headers stripped, Vercel returns the "full" RSC payload (~1.4MB) regardless of caller. CloudFront caches it under a key that varies only on the presence of the `RSC` header. All users with `RSC: 1` get the same cached payload; all users without get the cached HTML.

**Empirical risks discovered during testing** (against `https://dodao-ui-insights-ui.vercel.app/stocks/NYSE/RTX`):

- **RSC payloads are not byte-identical across identical requests** — 10 identical-header requests produced 10 unique MD5s. Variance is in random React component keys (e.g., `PmgtD_a0FfLClc0NjU4tWv`). Keys are used for React reconciliation within a single render only, so cached keys should be safe.
- **Beyond random keys, ~33% of identical requests had structural variance** — different stream chunk boundaries from Vercel's internal scheduling. Probably safe to cache (Next.js client handles arbitrary valid RSC streams) but not provable.
- **`Next-Router-Prefetch: 1` causes massive variance**: 1.37MB payload (without) vs 18KB (with). Cache must always hold the full version — strip this header or risk poisoning the cache with a partial-prefetch payload.
- **77× bandwidth on prefetches.** Default prefetch downloads 18KB; under this scheme, every prefetched link downloads 1.4MB.

**Verdict.** Probably works for typical cases. Fragile against future Next.js versions adding new variance headers. Approach with a cautious rollout (one path pattern first, watched for chunk-load errors).

### Option B — Selective `Cache-Control` via Next.js middleware

Make CloudFront respect origin Cache-Control:

```hcl
default_ttl = 3600     # 1h fallback
max_ttl     = 518400   # cap at 6 days
min_ttl     = 0        # ← key change: let origin headers shorten TTL
```

Then add `insights-ui/src/middleware.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const isRsc = request.headers.get('rsc') === '1';
  if (!isRsc && /^\/(stocks|etfs)\//.test(request.nextUrl.pathname)) {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=518400, stale-while-revalidate=86400',
    );
  }
  return response;
}
```

**Effect**: HTML responses get explicit `s-maxage=518400` → CloudFront caches 6 days. RSC responses keep Vercel's default `private, no-cache, no-store` → CloudFront passes them through to Vercel every time.

**Pros**: Architecturally clean, uses standard HTTP semantics, no header trickery, no Next.js-internals fragility. Client-side nav becomes seamless (RSC always reaches Vercel fresh).

**Cons**: Every nav fetch = a Vercel function invocation (no edge caching for RSC). Could materially raise function-invocation cost for nav-heavy traffic.

### Option C — Status quo

Do nothing. Client-side nav keeps falling back to full page reloads (which work correctly via the cached HTML — they're just slightly less seamless than a transition). Direct page loads stay fast. Long-tail and cold-cache pages stay slow on first hit per region.

**Pros**: Zero engineering work, zero risk.

**Cons**: ~300ms full reload on internal nav vs ~50ms seamless transition.

### Picking among these

The default should be **Option C** unless someone is specifically complaining about nav perf. Cost asymmetry favors doing nothing: a buggy Option A could ship broken pages to users; Option C just gives them slower-but-correct navigation.

If nav perf becomes a priority, **Option B** is the lower-risk path. Option A should be tried only after running the verification commands in the [Operational guide](#operational-guide) and observing the structural-variance behavior firsthand.

---

## Inert / dead-code cache plumbing (historical reference)

After Phase 3, the following code still exists but does nothing at runtime. This section is the map you'd need when reading legacy code that still references tag helpers, so you don't accidentally re-enable them.

### The stock-page tag map (from the Phase-1 ISR architecture)

Each per-ticker page used to subscribe to exactly one cache tag. Under `force-dynamic`, none of these tags do anything, but the helpers and call sites are still present.

| Route | Tag it used to subscribe to | Helper |
|---|---|---|
| `/stocks/[exchange]/[ticker]` (main) | `tickerAndExchangeTag(t,e)` | `utils/ticker-v1-cache-utils.ts` |
| `/stocks/[exchange]/[ticker]/business-and-moat` | `tickerCategoryReportTag(t,e,BusinessAndMoat)` | via `utils/performance-page-utils.ts` |
| `/stocks/[exchange]/[ticker]/financial-statement-analysis` | `tickerCategoryReportTag(t,e,FinancialStatementAnalysis)` | same |
| `/stocks/[exchange]/[ticker]/past-performance` | `tickerCategoryReportTag(t,e,PastPerformance)` | same |
| `/stocks/[exchange]/[ticker]/future-performance` | `tickerCategoryReportTag(t,e,FutureGrowth)` | same |
| `/stocks/[exchange]/[ticker]/fair-value` | `tickerCategoryReportTag(t,e,FairValue)` | same |
| `/stocks/[exchange]/[ticker]/competition` | `tickerCompetitionTag(t,e)` | `app/.../competition/page.tsx` |
| `/stocks/[exchange]/[ticker]/management-team` | `tickerManagementTeamTag(t,e)` | `app/.../management-team/page.tsx` |

`revalidateAllTickerTags(t,e)` calls `revalidateTag` 8 times (one per tag above). Still wired up in:
- `StockActions.tsx` (admin "Invalidate cache" button)
- `StockActions.tsx#handleEditDetailsSaved` (admin "Edit stock details" modal save)
- Admin `PUT /api/[spaceId]/tickers-v1/exchange/<e>/<t>` (edit URL, mark moved/deleted)
- `save-report-callback` route (after each LLM report save)

All still fire on the same triggers; all are inert under `force-dynamic`. Vercel logs may still show "Cache invalidated for ticker_..." messages — they're cosmetic now.

### The ETF tag (was the next biggest culprit in Phase 1)

`insights-ui/src/app/etfs/[exchange]/[etf]/page.tsx` and its three subpages (`risk-analysis`, `holdings`, `cost-efficiency-team`) all subscribed to the same `etfAndExchangeTag(s,e)`. Main ETF page had 8 tagged fetches (the old anti-pattern stocks escaped in PRs #1472/#1473).

In Phase 1, one main-ETF-page rebuild = 1 HTML + 8 Data Cache writes = **9 cache writes**. One `revalidateEtfAndExchangeTag` call invalidated all 4 ETF surfaces. After Phase 3, all of this is inert.

### Cron jobs that still fire `revalidateTag` (no-op)

```json
{ "path": "/api/koala_gains/tickers-v1/generate-ticker-v1-request", "schedule": "*/3 * * * *" }
{ "path": "/api/koala_gains/etfs-v1/generate-etf-v1-request",       "schedule": "*/3 * * * *" }
```

Both still do real work (queue and process regen requests). The `revalidateTag` calls at the end of each report save are inert. **Don't disable the crons** — they're still generating the data the dynamic pages render. Just leave them alone.

### Cache helper modules (inert)

All of these export helpers like `getXTag()` and `revalidateXTag()`. The helpers still execute; the underlying `revalidateTag` calls do nothing under `force-dynamic`:

- `utils/ticker-v1-cache-utils.ts`
- `utils/etf-cache-utils.ts`
- `utils/etf-scenario-cache-utils.ts`
- `utils/stock-scenario-cache-utils.ts`
- `utils/tariff-report-cache-utils.ts`
- `utils/tariff-calculator/cache-tags.ts`
- `utils/ticker-full-render-utils.ts`
- `utils/tariff-cross-links/hts-chapter-ref.ts`

Cleanup is a follow-up PR. Pattern: delete the helper, delete its callers, remove the `tags` array from each `fetch()`, remove `unstable_cache` wrappers.

### `unstable_cache` usage (inert under force-dynamic)

Four files use `unstable_cache` for function-result memoization in Vercel's Data Cache:
- `app/page.tsx`
- `utils/tariff-reports/tariff-reports-listing.ts`
- `utils/tariff-cross-links/hts-chapter-ref.ts`
- `scripts/industry-tariff-reports/tariff-report-repository.ts`

Of these, `app/page.tsx` is not `force-dynamic` and could still write to Data Cache. The others either are dynamic routes or are scripts (not page renders). Worth a sanity check during cleanup.

---

## Operational guide

### Verifying the cache is behaving correctly

```bash
# What is CloudFront serving for an HTML request?
curl -sI https://koalagains.com/stocks/NYSE/RTX | grep -iE 'HTTP|content-type|x-cache|x-vercel|age|cache-control'
# Expect:
#   HTTP/2 200
#   content-type: text/html; charset=utf-8
#   x-cache: Hit from cloudfront    (or Miss)
#   x-vercel-cache: HIT             (or MISS — irrelevant under force-dynamic)
#   age: <seconds since cache write>

# What does CloudFront serve for an RSC request?
curl -sI -H 'RSC: 1' https://koalagains.com/stocks/NYSE/RTX | grep -iE 'content-type|x-cache'
# Today: returns text/html (cached HTML), not text/x-component.
# After Option A or B: would return text/x-component.

# What does Vercel return directly?
curl -sI https://dodao-ui-insights-ui.vercel.app/stocks/NYSE/RTX | grep -iE 'content-type|x-vercel-cache|cache-control'
# Expect under force-dynamic:
#   content-type: text/html
#   cache-control: private, no-cache, no-store, max-age=0, must-revalidate
#   x-vercel-cache: MISS (no ISR hit possible)

# Compare CloudFront-served HTML to Vercel-direct HTML to detect stale cache
curl -s https://koalagains.com/stocks/NYSE/RTX | grep -o 'dpl=[a-zA-Z0-9_]*' | head -1
curl -s https://dodao-ui-insights-ui.vercel.app/stocks/NYSE/RTX | grep -o 'dpl=[a-zA-Z0-9_]*' | head -1
# If they differ: CloudFront has a stale build's HTML.
# As long as the CloudFront dpl is within the 7-day Skew Protection window, this is fine.
```

### Monitoring Vercel-side write metrics

Vercel Dashboard → Project → **Observability** → check:
- **ISR cache writes** — should be ~0 after Phase 3. Spikes here indicate a page lost `force-dynamic`.
- **Data Cache writes** — should be very low. Some `unstable_cache` writes still happen on a few non-dynamic surfaces.
- **Function invocations** — will be higher than pre-Phase-3 (CloudFront misses now hit functions). Compare against the cost of the ISR writes you saved.
- **Build duration / build minutes** — unchanged by these changes.

### Monitoring CloudFront-side metrics

CloudFront console → distribution `EZI5H8FKNE9R1` → **Metrics**:
- **Total requests** — baseline traffic.
- **Cache hit rate** — should be high for `/stocks/*` and `/etfs/*` after the cache warms up (multiple days). Default behavior is 0% cache hit rate (CachingDisabled).
- **Origin latency** — when CloudFront misses, this is the SSR time at Vercel. Watch for regressions if you change query patterns.

### When to use CloudFront invalidations (emergency only)

```bash
aws cloudfront create-invalidation \
  --distribution-id EZI5H8FKNE9R1 \
  --paths "/stocks/*" "/etfs/*"
```

Cost: 2 paths from your monthly 1,000 free quota. Effectively free.

**When to do this:**
- Shipping an emergency correctness fix that needs to reach users immediately
- Pulling a published page that should not be visible (legal, security, etc.)

**When NOT to do this:**
- After a normal deploy (Skew Protection + 6-day TTL handles this)
- To "freshen" data (LLM reports update on their own when the cron regenerates and the TTL expires)
- Because someone asks "can we just clear the cache" — push back and ask why

### Debugging when a user reports "Something went wrong"

1. Get the URL the user hit. Reproduce on koalagains.com vs the vercel.app domain.
2. If only koalagains fails: deploy-skew is likely. Check the `dpl=` query strings as in the diagnostic block above.
3. If both fail: it's a Vercel-side render error. Check Vercel logs for the function invocation for that route.
4. If skew is the cause and Skew Protection is on: confirm the user's tab was inside the 7-day window. If outside, that's the expected edge case — `app/error.tsx` reload-on-chunk-error would catch it.
5. As a last resort, invalidate `/stocks/*` `/etfs/*` to flush stale HTML. Note this as an incident, not a routine.

---

## Where the pieces live (file paths)

### Infrastructure (Terraform)

- `dodao-api-v2-deployment/cloudfront.tf` — the entire CloudFront stack: ACM cert, Route53 records, cache policy `koalagains_one_week`, the `koalagains-www-to-apex` CloudFront Function, the distribution, the three cache behaviors.

### Vercel-side (Next.js)

- `insights-ui/src/app/**/page.tsx` (37 routes) — `export const dynamic = 'force-dynamic';`
- `insights-ui/src/app/error.tsx` — global client-side error boundary. The page users saw when the deploy-skew bug fired.
- `insights-ui/src/app/api/auth/[...nextauth]/authOptions.ts` — NextAuth config; cookie domain override; the file that documents why we need the Host header from CloudFront.
- `insights-ui/vercel.json` — cron schedules (the `*/3` ones drove invalidations in Phase 1; still fire, now no-op for cache).
- `insights-ui/next.config.ts` — no `deploymentId` needed (Vercel + Next.js ≥14.1.4 handles it automatically).

### Vercel dashboard (not in code)

- **Skew Protection** — Project Settings → Advanced → Skew Protection → **7 days**.
- **Custom domains** — `koalagains.com` and `www.koalagains.com` must remain attached to the project so Vercel routes by Host header (CloudFront forwards Host via AllViewer).
- **Environment variables** — `NEXTAUTH_URL=https://koalagains.com` (ignored on Vercel but useful for local dev), `COOKIE_DOMAIN` not set.

### Inert plumbing to clean up later

See [section 12](#inert--dead-code-cache-plumbing-historical-reference). One follow-up PR can delete the cache helpers, drop the tag arrays from `fetch()` calls, and remove `revalidateTag` calls from save endpoints and crons.

### Related docs

- [stock-page-caching.md](stock-page-caching.md) — historical reference for the Phase-1 ISR tag map. Useful if you're reading legacy code that still references the tags. Superseded by this doc for current architecture.
- Vercel's docs on [Skew Protection](https://vercel.com/docs/skew-protection) and [deploymentId](https://nextjs.org/docs/app/api-reference/next-config-js/deploymentId).
- AWS docs on [CloudFront cache policies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html) and [CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html).
