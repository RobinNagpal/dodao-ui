# CloudFront + Vercel Deploy Skew — "Something Went Wrong" on koalagains.com

## TL;DR

When CloudFront caches HTML in front of Vercel (e.g. `/stocks/*` cached for 1 week), a Vercel redeploy can leave the cached HTML pointing at chunk/module IDs the new build no longer recognizes. The result is a client-side React error and a "Something went wrong" page on routes the user can load directly on `dodao-ui-insights-ui.vercel.app` without issue.

The robust, deploy-safe fix has three parts:

1. **`deploymentId: process.env.VERCEL_DEPLOYMENT_ID`** in `next.config.js` — tags every chunk URL and RSC fetch with the build ID so the client can detect skew.
2. **Vercel Skew Protection** enabled in the project settings — keeps old deployments routable so requests carrying an old `dpl` still get matching old chunks.
3. **CloudFront cache policy with `min_ttl = 0`** — lets Vercel's `Cache-Control` shorten the CDN TTL, so genuinely stale HTML is bounded (no per-deploy invalidations needed).

Optional safety net: an `app/error.tsx` that reloads the page on chunk/module/hydration errors.

---

## 1. The problem in detail

Architecture:

```
Browser  ──►  CloudFront (cache /stocks/* for 1 week)  ──►  Vercel (Next.js App Router)
```

A single page response consists of:

- **HTML** — references specific chunk hashes (`/_next/static/chunks/<hash>.js`) and contains an RSC stream with numeric module IDs (e.g. `48:I[7186,[],"IconMark"]`) and slot references (`$L48`).
- **JS chunks** — content-hashed, immutable per build.

The HTML and the chunks are **tightly coupled to the build that produced them**. The numeric module IDs in the RSC payload are assigned per build; chunk hashes change when source changes. If a browser loads HTML from build N but JS from build N+1, React tries to mount slot `$L48` expecting one module and finds a different one. The result is a client-side error caught by Next.js's default error boundary → "Something went wrong."

### Why CloudFront makes this fail

Vercel's own ISR cache auto-invalidates on deploy, so direct hits to `*.vercel.app` always serve build-coherent HTML+JS pairs. CloudFront has no such hook — it caches whatever Vercel returned and holds it until the TTL expires. If the cache policy uses a long `min_ttl` (as the koalagains policy did: `min_ttl = max_ttl = 604800`), CloudFront **ignores** the origin's `Cache-Control` header entirely, so Next.js can't shorten the TTL from its end.

### Concrete symptom we hit

- `https://koalagains.com/stocks/NYSE/RTX` → "Something went wrong"
- `https://dodao-ui-insights-ui.vercel.app/stocks/NYSE/RTX` → renders fine

Diff between the two HTML responses showed different RSC module ID sets — the koalagains HTML was from an older build.

---

## 2. The fix

### 2a. Set `deploymentId` in `next.config.js`

```js
// next.config.js
module.exports = {
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
  // ...rest of config
};
```

`VERCEL_DEPLOYMENT_ID` is automatically populated by Vercel for every build. With this set, Next.js:

- Appends `?dpl=<id>` to every chunk URL in the rendered HTML.
- Sends `x-deployment-id: <id>` on client-side RSC fetches.
- On the client, if a navigation fetch returns a different deployment ID than the current page, Next.js triggers a **full page reload** instead of trying to reconcile mismatched modules.

This is Next.js's official mechanism for cross-deploy resilience. Reference: <https://nextjs.org/docs/app/api-reference/next-config-js/deploymentId>.

### 2b. Enable Vercel Skew Protection

Vercel Dashboard → Project → Settings → Advanced → **Skew Protection** → enable, choose a max-age (12h on Pro, longer on Enterprise).

What it does: when a request arrives with an old `?dpl=` or `x-deployment-id`, Vercel routes that request to the **matching old deployment** rather than the current one. So:

- Stale HTML cached by CloudFront still loads its matching chunks (Vercel serves them from the old build).
- Active user sessions complete cleanly even if a deploy lands mid-session.
- After the skew window expires, old chunks 404 → Next.js client catches it → full reload → fresh HTML.

Skew Protection is **not available on the Hobby plan**. The `deploymentId` reload behavior still helps without it (users get a refresh instead of a crash) but they may see one bad load before the reload.

### 2c. Lower CloudFront `min_ttl` so origin headers are respected

Current koalagains cache policy (`cloudfront.tf`):

```hcl
default_ttl = 604800
max_ttl     = 604800
min_ttl     = 604800   # forces 1 week regardless of origin Cache-Control
```

Change to:

```hcl
default_ttl = 3600       # 1h if origin says nothing
max_ttl     = 604800     # cap at 1 week
min_ttl     = 0          # let origin shorten via Cache-Control
```

Then in Next.js routes (or `revalidate` exports), emit:

```
Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
```

CloudFront honors `s-maxage` and `stale-while-revalidate` when `min_ttl=0` and the cache policy doesn't strip them. Result:

- Hours 0–1 after a deploy: previously cached HTML may still serve (cached against the old `dpl`, which Skew Protection keeps working).
- Hour 1+: CloudFront refetches in the background, picks up the new build.
- No invalidations needed on deploy.

### 2d. Confirm CloudFront forwards the `?dpl=` query string

Already correct in the koalagains policy:

```hcl
query_strings_config {
  query_string_behavior = "all"
}
```

This is required so that requests for `/_next/static/chunks/abc.js?dpl=N` and `?dpl=N+1` are cached separately and forwarded to Vercel with the `dpl` value intact.

### 2e. Belt-and-suspenders: `app/error.tsx`

For the rare case skew protection doesn't cover (e.g. user on Hobby plan, or skew window exceeded), add a top-level error boundary that reloads on chunk-shaped errors:

```tsx
'use client';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    if (/chunk|module|hydration/i.test(error?.message ?? '')) {
      window.location.reload();
    }
  }, [error]);

  return (
    <html>
      <body>
        <div>Something went wrong. <button onClick={reset}>Retry</button></div>
      </body>
    </html>
  );
}
```

---

## 3. How the layers cooperate after the fix

| Scenario | What happens |
|---|---|
| User loads cached HTML built at deploy N, JS bundle at deploy N | Page renders normally — same build end-to-end. |
| User loads cached HTML from deploy N, current build is N+1 | Chunks load with `?dpl=N` → Vercel Skew Protection routes to deploy N's chunk files → page renders. |
| User navigates within stale (N) page; SSR fetch returns deploy N+1 | Next.js detects `dpl` mismatch → `window.location.reload()` → fresh HTML for N+1. |
| Skew Protection window exceeded; old chunks 404 | Client error → `app/error.tsx` catches → reload → fresh HTML. |
| Long-tail edge case (none of the above) | `app/error.tsx` shows graceful retry instead of bare "Something went wrong". |

---

## 4. Why this is the cost-efficient choice

Alternative considered: invalidate CloudFront on every deploy.

- AWS CloudFront pricing: first 1,000 invalidation paths per month are free; $0.005/path after.
- Path patterns with wildcards count as 1 path. `/stocks/*` + `/etfs/*` = 2 paths/deploy.
- Even 100 deploys/month = 200 paths = $0.

Invalidations are essentially free at this scale and are the simplest fix. But the `deploymentId` + Skew Protection combo is **architecturally correct** (Next.js was designed for this) and removes the operational dependency on a deploy hook reaching CloudFront. Use both belts and suspenders if you want — they don't conflict.

---

## 5. Where the pieces live

- **CloudFront cache policy** — `dodao-api-v2-deployment/cloudfront.tf` (the `koalagains_one_week` resource).
- **Distribution & origin request policy** — same file. The origin request policy is `Managed-AllViewer` (UUID `216adef6-5c7f-47e4-b989-5492eafa07d3`) so the original `Host: koalagains.com` reaches Vercel — required for NextAuth's origin detection (it reads `x-forwarded-host` on Vercel and ignores `NEXTAUTH_URL`).
- **`next.config.js`** — top of `insights-ui/`. Add `deploymentId` there.
- **Vercel Skew Protection** — Project Settings → Advanced (dashboard only, not in code).
- **Global error boundary** — `insights-ui/src/app/error.tsx` (create if absent).

Related doc: [stock-page-caching.md](stock-page-caching.md) covers the per-page tag map and ISR invalidation pattern that determines what Vercel serves to CloudFront in the first place.
