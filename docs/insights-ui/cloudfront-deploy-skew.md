# CloudFront + Vercel Caching Architecture for koalagains.com

How `/stocks/*` and `/etfs/*` get served today, why the architecture looks the way it does, the deploy-safe fix that resolved the "Something went wrong" bug, where CloudFront is still slow, and what we might do next.

## TL;DR

The caching architecture for `/stocks/*` and `/etfs/*` on koalagains.com has been through three phases, each solving a cost or correctness problem of the previous one:

1. **`force-static` + ISR (original)** — fast pages, but ISR writes and the deploy-time ISR flush made it the single biggest Vercel cost driver.
2. **CloudFront in front of Vercel** — absorbs hot-path traffic at the edge for ~6 days, but introduced a deploy-skew bug ("Something went wrong" on direct page loads after a Vercel deploy).
3. **`force-dynamic` + CloudFront + Vercel Skew Protection (current)** — zero ISR write cost, no deploy invalidations, the deploy-skew bug is fixed. CloudFront still has limitations (cold cache misses, no RSC navigation support) that are accepted trade-offs.

This doc is a single reference for that journey, the deploy-skew fix in detail, what's still slow, the constraints we operate under, and the options for the next iteration.

---

## 1. The journey

### Phase 1 — `force-static` + ISR (original)

Every `/stocks/[exchange]/[ticker]` and `/etfs/[exchange]/[etf]` page (and their sub-routes) used:

```ts
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;
```

Vercel pre-rendered these pages on first request and stored the HTML in its ISR cache. Reads were ~100ms HTML from Vercel's edge. Cache invalidation was driven by `revalidateTag()` calls from the `*/3 * * * *` regeneration cron and admin save endpoints.

**Why it became too expensive:**
- Per-page rebuild = **1 HTML write + 1 Data Cache write per tagged `fetch()`** (see [stock-page-caching.md](stock-page-caching.md) for the per-tag map).
- The 3-minute regeneration cron drove most invalidations across thousands of tickers.
- **Vercel flushes the ISR cache on every deploy.** Every deploy → all pre-rendered HTML thrown away → next first hit per page = a fresh rebuild = another write.

Across thousands of tickers and frequent invalidations, ISR writes became the dominant line item in the Vercel bill.

### Phase 2 — Add CloudFront in front of Vercel

To absorb hot-path traffic without bloating Vercel ISR writes further, AWS CloudFront was put in front of the Vercel origin for `/stocks/*` and `/etfs/*`, with an initial 7-day cache TTL (later tightened to 6 days — see Phase 3a).

Goals achieved:
- Hot pages serve from CloudFront edge — no Vercel origin hit
- TTL bounded so users see stale-but-recent content
- No per-deploy invalidations needed (per-deploy CloudFront invalidations are essentially free under 1,000 paths/month, but we wanted a no-ops design)

**The problem introduced:** Vercel's ISR cache auto-invalidates on every deploy. CloudFront has no such hook — it cached HTML from deploy N for up to 7 days, even after deploy N+1 went live. The cached HTML referenced chunk hashes and RSC module IDs from build N, but the JS bundles in production came from build N+1.

A user loading a stale CloudFront-cached page would get:
- HTML from build N → references chunks `abc.js`
- Browser fetches `/_next/static/chunks/abc.js` → Vercel may or may not still have it
- If gone or mismatched modules → React error boundary → **"Something went wrong"**

Direct hits to `dodao-ui-insights-ui.vercel.app` worked fine (Vercel's own cache is build-coherent). Only the CloudFront-fronted path failed. See section 3 for the full diagnosis.

### Phase 3 — Fix deploy skew + drop ISR entirely (current state)

Two changes locked in:

**3a. Enable Vercel Skew Protection (7-day window) + tighten CloudFront TTL to 6 days.** When a request arrives with an old `?dpl=` query parameter or `x-deployment-id` header, Vercel routes it to the matching old deployment. Stale CloudFront HTML now finds matching chunks. CloudFront TTL is intentionally 1 day under the 7-day Skew Protection window so HTML in CloudFront never outlives a routable deployment.

**3b. All pages flipped to `force-dynamic`.**

```ts
// before
export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = false;

// after
export const dynamic = 'force-dynamic';
```

`force-dynamic` disables both ISR HTML writes and Data Cache writes from fetches inside the route. All existing `next: { tags: [...] }` and `revalidateTag(...)` calls in cache helpers and admin routes become inert no-ops. They're left in place as dead code to keep the PR scope small; they'll be cleaned up in a follow-up once metrics confirm writes have dropped to ~0.

**Cost outcome:**

| | Before | After |
|---|---|---|
| ISR HTML writes | High (one per page rebuild) | ~0 |
| Data Cache writes | High (one per tagged fetch per rebuild) | ~0 (tagged fetches in `force-dynamic` routes don't cache) |
| Deploy invalidations needed | Conceptually yes (avoided in prod) | No |
| Vercel function invocations | Low (mostly ISR cache hits) | Higher on CloudFront cache misses (compute, not writes) |
| Net Vercel cost | Dominated by writes | Dominated by compute on cold misses |

---

## 2. Current architecture (post-Phase-3)

```
Browser  ──►  CloudFront (cache /stocks/*, /etfs/* for 6 days)  ──►  Vercel (Next.js App Router)
                │                                                       │
                ├─ default behavior: CachingDisabled (passthrough)       ├─ all pages force-dynamic
                ├─ /stocks/*: cache 6 days                               ├─ Vercel Skew Protection: 7 days
                └─ /etfs/*:   cache 6 days                               └─ no ISR / no Data Cache writes
```

Key pieces:
- **CloudFront cache policy** `koalagains_one_week` — `min_ttl = max_ttl = default_ttl = 518400` (6 days). Defined in `dodao-api-v2-deployment/cloudfront.tf`.
- **Origin request policy** `Managed-AllViewer` (UUID `216adef6-5c7f-47e4-b989-5492eafa07d3`) — forwards the original `Host: koalagains.com` so NextAuth's OAuth flow works (it reads `x-forwarded-host` on Vercel and ignores `NEXTAUTH_URL`).
- **Vercel Skew Protection** — enabled in the Vercel dashboard at Project → Settings → Advanced. 7-day max age.
- **`app/error.tsx`** — top-level error boundary that catches client-side render errors. Can be enhanced to reload on chunk/module errors (belt-and-suspenders).

---

## 3. The deploy-skew bug + fix (in detail)

### Why it happened

A single page response consists of:
- **HTML** — references specific chunk hashes (`/_next/static/chunks/<hash>.js`) and contains an RSC stream with numeric module IDs (e.g. `48:I[7186,[],"IconMark"]`) and slot references (`$L48`).
- **JS chunks** — content-hashed, immutable per build.

The HTML and the chunks are **tightly coupled to the build that produced them**. The numeric module IDs in the RSC payload are assigned per build; chunk hashes change when source changes. If a browser loads HTML from build N but JS from build N+1, React tries to mount slot `$L48` expecting one module and finds a different one. The result is a client-side error caught by Next.js's default error boundary → "Something went wrong."

Vercel's own ISR cache auto-invalidates on deploy, so direct hits to `*.vercel.app` always serve build-coherent HTML+JS pairs. CloudFront has no such hook — it caches whatever Vercel returned and holds it until the TTL expires. With a long `min_ttl` (the original `min_ttl = max_ttl = 604800`), CloudFront **ignores** the origin's `Cache-Control` header entirely, so Next.js can't shorten the TTL from its end either.

Concrete symptom:
- `https://koalagains.com/stocks/NYSE/RTX` → "Something went wrong"
- `https://dodao-ui-insights-ui.vercel.app/stocks/NYSE/RTX` → renders fine

### The fix

#### 3a. Enable Vercel Skew Protection

Vercel Dashboard → Project → Settings → Advanced → **Skew Protection** → enable, choose max age (default 1 day; we use 7 days).

What it does: when a request arrives with an old `?dpl=` or `x-deployment-id`, Vercel routes that request to the **matching old deployment** rather than the current one. So:

- Stale HTML cached by CloudFront still loads its matching chunks (Vercel serves them from the old build).
- Active user sessions complete cleanly even if a deploy lands mid-session.
- After the skew window expires, old chunks 404 → Next.js client catches it → full reload → fresh HTML.

Available on **Pro and Enterprise** plans (not Hobby). Included free; no per-use charge. Default 1-day max age; configurable up to your Deployment Retention limit.

#### 3b. Set CloudFront TTL inside the Skew Protection window

```hcl
default_ttl = 518400   # 6 days
max_ttl     = 518400   # 6 days
min_ttl     = 518400   # 6 days
```

6 < 7 gives a 1-day safety margin: cached HTML in CloudFront can never reference a deployment that's already aged out of Skew Protection.

#### 3c. (Implicit) Next.js Skew Protection is automatic on Next 14.1.4+

For Next.js 14.1.4+ on Vercel, **no `next.config.js` change is needed.** When Skew Protection is toggled on in the dashboard, Vercel auto-injects `VERCEL_DEPLOYMENT_ID` into the build, and Next.js automatically:

- Appends `?dpl=<id>` to every chunk URL in the rendered HTML.
- Sends `x-deployment-id: <id>` on framework-managed RSC fetches.
- On client-side mismatch, triggers a full page reload instead of a hydration crash.

(`deploymentId: process.env.VERCEL_DEPLOYMENT_ID` in `next.config.js` is only needed for `vercel build` + `vercel deploy --prebuilt` workflows or Next.js < 14.1.4. Insights-UI is on Next 15.5.7 and standard Vercel build, so no config needed.)

CloudFront's query-string behavior (`query_string_behavior = "all"`) ensures `?dpl=` is preserved in the cache key and forwarded to Vercel — required for Skew Protection routing to work.

#### 3d. (Optional) Global error boundary for any uncovered edge case

```tsx
'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    if (/chunk|module|hydration/i.test(error?.message ?? '')) {
      window.location.reload();
    }
  }, [error]);
  return <html><body><div>Something went wrong. <button onClick={reset}>Retry</button></div></body></html>;
}
```

### How the layers cooperate after the fix

| Scenario | What happens |
|---|---|
| User loads cached HTML built at deploy N, JS bundle at deploy N | Page renders normally — same build end-to-end. |
| User loads cached HTML from deploy N, current build is N+1 | Chunks load with `?dpl=N` → Vercel Skew Protection routes to deploy N's chunk files → page renders. |
| User navigates within stale (N) page; SSR fetch returns deploy N+1 | Next.js detects `dpl` mismatch → `window.location.reload()` → fresh HTML for N+1. |
| Skew Protection window exceeded; old chunks 404 | Client error → `app/error.tsx` catches → reload → fresh HTML. |

---

## 4. Where CloudFront is slow today

Hot, cached pages are fast (~100ms). Several scenarios still hit Vercel's full-render path, which means a fresh SSR with DB + S3 + LLM-report fetches (typically 1–5s):

| Scenario | Why slow |
|---|---|
| **First request per CloudFront edge region** | CloudFront has ~218 edge locations; each maintains its own cache. The first user in eu-west-3 to hit `/stocks/NASDAQ/AAPL` pays the cold-cache cost even if us-east-1 has it cached. |
| **6-day TTL expiry** | Hot pages re-fetch from origin once per ~6 days. That one request is slow; subsequent requests in the same region are fast again. |
| **LRU eviction** | CloudFront edge caches have finite size. Less-popular pages get evicted before their TTL expires. |
| **Long-tail tickers / ETFs** | Pages visited rarely (most of the catalog) likely aren't cached anywhere. Every visit is a cold render. |
| **RSC client-side navigation** | When a user clicks an internal link, Next.js fetches an RSC payload (`text/x-component`). CloudFront's cache key doesn't include the `RSC` header, so CloudFront returns cached HTML for those requests. Next.js detects the content-type mismatch and **falls back to a full browser navigation** (works, but slower and less seamless than an in-place client transition). |
| **New routes** | A newly added ticker or ETF has no cache anywhere. First visit per region is slow. |
| **Crawler hitting many pages quickly** | Each new path = cold render. Crawler load can drive a wave of slow Vercel responses. |

A cold full render of `/stocks/NYSE/RTX` typically takes 1–5 seconds (Postgres + S3 reads, occasionally LLM-report fetches). A warm CloudFront cache hit returns in <100ms.

---

## 5. Cache constraints

The architecture is designed around hard constraints:

1. **Don't flush the cache on every deploy.** Per-deploy invalidations are operationally annoying (need a CI hook into CloudFront, paths to maintain, deploy hooks to keep working). Skew Protection + 6-day TTL gives us deploy correctness without invalidation.
2. **Keep Vercel ISR write cost at ~0.** Achieved via `force-dynamic` on all dynamic pages. Was the original cost driver; now eliminated.
3. **Keep Vercel function invocation cost low.** CloudFront absorbs hot-path requests so most user visits don't reach a Vercel function. Cold-cache requests still do — those are the cost we accept in exchange for not running ISR.
4. **Accept staleness within bounds.** Up to 6 days of stale content is acceptable for stock/ETF analysis pages; LLM-generated reports don't need to be minute-fresh.
5. **No CloudFront invalidations as a routine operational tool.** Reserved for emergencies (e.g., shipping a critical correctness fix that needs to reach users immediately).

Future changes should preserve all five. Anything that requires per-deploy invalidations, brings ISR writes back, or significantly raises Vercel function invocations needs an explicit cost-benefit argument before adoption.

---

## 6. Next options

Three live possibilities for the next iteration. The shared goal is to improve client-side navigation perf (the "RSC nav falls back to full reload" issue from section 4) without breaking the constraints in section 5.

### Option A — Cache RSC payloads at CloudFront via header-stripping CloudFront Function

A CloudFront Function strips `Next-Router-State-Tree`, `Next-Url`, and `Next-Router-Prefetch` from RSC requests before the cache-key calculation and origin forward. Vercel returns the "full" RSC payload (unaffected by router state). CloudFront caches it under a cache key that varies only on presence of the `RSC` header.

- **Pro:** Client-side nav becomes seamless (RSC cached at edge, ~50ms transitions).
- **Con:** Vercel's RSC responses have per-request structural variance (random React keys, occasional chunk-boundary differences observed in testing — see "Testing notes" below). Caching is *probably* safe but not provably so across all edge cases.
- **Risk:** A future Next.js version could introduce new variance headers we don't strip; silent breakage.
- **Bandwidth:** Always-cache-the-full-payload means prefetches download ~1.4MB instead of the ~18KB partial-prefetch payload — 77× more bandwidth per prefetched link.

### Option B — Selective Cache-Control via Next.js middleware

Set CloudFront `min_ttl = 0` so origin headers control caching. Add `insights-ui/src/middleware.ts`:

```ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const isRsc = request.headers.get('rsc') === '1';
  if (!isRsc && /^\/(stocks|etfs)\//.test(request.nextUrl.pathname)) {
    response.headers.set('Cache-Control', 'public, s-maxage=518400, stale-while-revalidate=86400');
  }
  return response;
}
```

HTML responses get explicit `s-maxage=518400` → CloudFront caches 6 days. RSC responses keep Vercel's default `private, no-store` → CloudFront passes them through to Vercel every time.

- **Pro:** Architecturally clean — uses standard `Cache-Control` semantics, no header trickery, no fragile assumptions about Next.js internals. Client-side nav is seamless because RSC always reaches Vercel fresh.
- **Con:** Every navigation triggers a Vercel function invocation (no edge caching for RSC navigation requests).
- **Trade-off:** Vercel function-invocation cost increases roughly in proportion to nav-heavy usage. May or may not be material depending on traffic patterns.

### Option C — Status quo

Do nothing. Client-side nav falls back to full page reloads (which work fine via the cached HTML — they're just slightly less seamless than transitions). Direct page loads stay fast. Long-tail and cold-cache pages stay slow on first hit per region.

- **Pro:** Zero engineering work, zero risk.
- **Con:** Slightly degraded nav UX (a 300ms full reload from CloudFront cache vs a 50ms seamless transition).

### Picking among these

The default should be **Option C** unless someone is specifically complaining about nav perf. Cost-asymmetry favors doing nothing: getting Option A wrong shows users broken pages; Option C just gives them a slower-but-correct nav.

If nav perf becomes a priority, **Option B** is the lower-risk path. **Option A** should be approached cautiously, ideally rolled out on one path pattern first (e.g., `/stocks/[exchange]/[ticker]` only) and watched for chunk-load / hydration errors before expanding.

### Testing notes (for whoever picks up Option A)

When deciding on Option A, run these checks against Vercel origin before committing to the approach:

```bash
# Are RSC responses byte-stable across identical requests? (Test: 10 calls, count unique MD5s)
for i in 1 2 3 4 5 6 7 8 9 10; do
  curl -s -H "RSC: 1" https://dodao-ui-insights-ui.vercel.app/stocks/NYSE/RTX > /tmp/rsc_$i.txt
done
md5 /tmp/rsc_*.txt | awk '{print $NF}' | sort | uniq -c
# Expectation: all 10 will differ (random React keys). That's OK.

# Are RSC responses structurally stable after normalizing random tokens? (Run 3, normalize, diff)
# If 2 of 3 still differ structurally, caching is risky — see Test 8 results in PR discussion.

# Does Next-Router-Prefetch change the response shape? (Yes — 18KB vs 1.4MB)
curl -sI -H "RSC: 1" -H "Next-Router-Prefetch: 1" https://dodao-ui-insights-ui.vercel.app/stocks/NYSE/RTX | grep -i content-length
curl -sI -H "RSC: 1"                                   https://dodao-ui-insights-ui.vercel.app/stocks/NYSE/RTX | grep -i content-length
# If those differ a lot, you MUST strip Next-Router-Prefetch in the CloudFront Function or
# the cache will be poisoned by whichever variant got cached first.
```

---

## 7. Where the pieces live

- **CloudFront cache policy** — `dodao-api-v2-deployment/cloudfront.tf` (the `koalagains_one_week` resource).
- **CloudFront distribution & origin request policy** — same file. Origin request policy is `Managed-AllViewer` (`216adef6-5c7f-47e4-b989-5492eafa07d3`).
- **CloudFront Function (www → apex redirect)** — same file. If Option A is adopted, the header-stripping logic goes in this function.
- **`force-dynamic` exports** — every page under `app/stocks/**`, `app/etfs/**`, `app/etf-scenarios/**`, `app/stock-scenarios/**`, `app/etf-investors/**`, `app/hts-codes/**`, `app/tariff-calculator/**`.
- **Vercel Skew Protection** — Vercel Project Settings → Advanced (dashboard only, not in code).
- **Global error boundary** — `insights-ui/src/app/error.tsx`.
- **(Dead code, to be cleaned up later)** — cache helper modules (`utils/ticker-v1-cache-utils.ts`, `utils/etf-cache-utils.ts`, etc.), admin invalidation routes, the `*/3 * * * *` regeneration cron still calls `revalidateTag` (no-op under `force-dynamic`).

Related doc: [stock-page-caching.md](stock-page-caching.md) covers the per-page tag map and ISR invalidation pattern as they existed before Phase 3. Most of the tag plumbing it describes is now inert dead code under `force-dynamic` but still useful as a record of the previous design.
