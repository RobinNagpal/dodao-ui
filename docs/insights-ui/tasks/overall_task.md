# Site-wide Feedback

User feedback that applies across the whole site (stocks, ETFs, tariffs, scenarios, home).

## Reports are hard to read on dark theme

- Some users find reports unreadable on the current dark theme.
- Readability comes first; content polish is the second step.
- Possible fix: a theme-change (light/dark) toggle button.
- Applies site-wide — every report surface (stocks, ETFs, tariffs, scenarios), not just one page.

### Open questions

- Should the toggle live in the global header, or per-report?
- What is the default theme for first-time visitors?
- Persist the choice per user (cookie / localStorage)?
- Do we need a print-friendly variant separate from the light theme?

## Logged-in users & retention

Rough baseline: ~300 logged-in users, ~1k daily users, ~80 returning daily.

- How can we increase logged-in users?
- How can we grow returning daily users relative to one-time traffic?

## Traffic from AI platforms (ChatGPT, Gemini, Perplexity, etc.)

- How can we increase visits and referrals from these sources (content, structured data, brand/citation presence)?

## Search & analytics research

- Export or summarize **Google Search Console** and **Google Analytics** (key reports, date range, segments) and run structured research (e.g. with Claude) on what to try next to grow overall traffic and quality users.

## Vercel cost optimization

Goal: bring the KoalaGains Vercel bill down by attacking the highest-cost line items
(function invocations, function duration, image optimization, bandwidth, build minutes)
without regressing user-visible performance or feature behavior. The codebase has grown
fast and a lot of pages, crons, and API routes were wired up with default Vercel settings
— there is almost certainly low-hanging fruit on every dimension below.

This is **site-wide infrastructure work**, not a single-surface task. Touch stocks, ETFs,
tariffs, scenarios, and admin all in one pass — fragmenting it across surfaces will miss
the cross-cutting wins (shared cache utils, shared revalidation tags, the Vercel cron
list).

### Baseline + measurement (do this first)

- [ ] **Capture a baseline from the Vercel dashboard** before changing anything:
  - **Usage tab**: function invocations, function GB-hours (duration × memory), edge
    requests, image optimization (source images + transformations), bandwidth, build
    minutes — record totals + per-route top 10 for the last 30 days.
  - **Logs / observability**: which routes have the highest p50/p95 duration and the
    highest invocation count? Those are the targets.
  - Save a dated snapshot (e.g. `docs/insights-ui/vercel-cost-baseline-YYYY-MM-DD.md`)
    so we can measure delta after the optimization pass.
- [ ] **Set a target**: pick a concrete % reduction goal per line item (e.g. "halve
  function invocations from crons, cut image-optimization cost by 60%, keep duration
  flat or better"). Without a target it's impossible to tell when this task is done.

### 1. Cron jobs — invocation reduction

The `insights-ui/vercel.json` cron block currently runs four schedules, two of which
fire every 3 minutes (`generate-ticker-v1-request`, `generate-etf-v1-request`). That's
~28,800 invocations/month per `*/3` cron just for the heartbeat — most of those ticks
likely return early because there's nothing in the queue.

- [ ] **Audit each cron** in `insights-ui/vercel.json`:
  - What's the actual hit rate when the cron *does* find work vs. returns early?
    (Instrument the handler to log `queued: N` vs `queued: 0` and aggregate.)
  - Can the `*/3` cadence drop to `*/10` or `*/15` without hurting latency on the
    queue it drains? Generation jobs are minute-scale themselves — 3-min polling is
    overkill.
  - For the 11pm daily-movers crons, confirm they actually need to run on weekends
    (`* * 1-5` already restricts to weekdays — but double-check timezone interpretation
    and consider `0 23 * * 1-5` vs `0 23 * * 2-6` if the underlying data is published
    after-hours US/Eastern).
- [ ] **Consolidate where it makes sense**:
  - The two `generate-*-v1-request` crons are nearly identical heartbeats over
    different queues — consider a single dispatcher cron that drains both and any
    future generation queue, instead of N crons per queue type.
  - Each cron path is a separate function invocation — fewer paths = fewer cold
    starts.
- [ ] **Move long-running work off Vercel**:
  - The off-hours stock-refresh cron (see `stocks.md`) and the Sonnet auto-gen pipeline
    (see `etfs.md` item 1) should run on the **Discord-bot host** (the same machine
    running this Claude Code worktree workflow), not as a Vercel cron — Vercel
    function duration is metered, the bot host is fixed-cost.
  - Vercel crons are best at "wake up, check a queue, return fast" — anything that
    burns minutes per tick belongs on a worker.

### 2. Function duration + memory — duration reduction

Vercel bills GB-hours = memory × duration. The pages that run a lot **and** run long
dominate the bill.

- [ ] **Identify the top 10 routes by GB-hours**:
  - From Vercel Observability, sort functions by `total duration × memory` over the
    last 30 days. Most cost lives in the top 10.
  - For each, decide: can it be made static / ISR (eliminate the invocation
    entirely), can the query be cached upstream, or can the function memory be
    lowered (default is 1024MB — many simple routes don't need that)?
- [ ] **Tune `memory` per-route via route segment config**:
  - Next.js App Router supports `export const maxDuration` and (on Vercel)
    `export const runtime = 'edge' | 'nodejs'` plus per-function memory tuning in
    `vercel.json`'s `functions` block.
  - Light read-only API routes (e.g. JSON-LD endpoints, simple metadata fetches)
    can drop to 256-512MB without slowdown.
  - Heavy generation paths (Claude calls, large DB joins) stay at 1024MB+ — don't
    starve them.
- [ ] **Look for accidental dynamic rendering**:
  - Any page that reads `cookies()` / `headers()` or hits `fetch(..., { cache: 'no-store' })`
    becomes dynamic and runs on every request. Audit pages under `/stocks`, `/etfs`,
    `/etf-scenarios`, `/stock-scenarios`, `/tariff-reports`, `/industry-tariff-report`
    for accidental dynamics — most should be static or ISR.
  - `grep` for `dynamic = 'force-dynamic'`, `revalidate = 0`, and `fetch(...no-store)`
    across `src/app` and justify or remove each.

### 3. Static + ISR — move pages off the per-request meter

The cheapest invocation is the one that doesn't happen. Every stock detail page,
ETF detail page, tariff chapter page, and scenario page is a candidate for ISR
(`export const revalidate = N`) or full static generation (`generateStaticParams`).

- [ ] **Inventory dynamic-vs-static across `src/app`**:
  - Stock + ETF detail pages: confirm they all set a sensible `revalidate` (hours, not
    seconds). A stock report doesn't change between requests — there's no reason it
    should re-render per visit.
  - Tariff chapter pages: same. Tariff data updates on a known cadence.
  - Scenario detail pages: same — scenarios change on admin edit, which the
    `etf-scenario-cache-utils.ts` / `tariff-report-cache-utils.ts` revalidation
    already handles via tags.
- [ ] **Confirm `revalidateTag` is firing on writes**:
  - Every admin write that mutates a report / scenario / tariff should call
    `revalidateTag(...)` so ISR pages refresh on-demand instead of waiting for the
    next stale revalidation window.
  - Audit the cache-utils files (`utils/*cache-utils.ts`) and make sure every
    mutation path calls the right tag — a missed call means stale pages **plus**
    eventually a forced re-render that costs an invocation.
- [ ] **Sitemap + listing pages**:
  - `/sitemap.xml` and high-traffic listing pages should be ISR with a long
    revalidate window (e.g. 6h / 24h), not dynamic.

### 4. Image optimization — biggest hidden cost

Vercel charges per **source image** transformed *and* per transformation. A site with
thousands of stock logos / ETF charts / fund cards can rack up image-optimization cost
fast.

- [ ] **Audit `next/image` usage**:
  - Every `<Image>` we render against a remote host (e.g. raw.githubusercontent.com
    via `next.config.ts` `images.remotePatterns`) becomes a Vercel-optimized image.
  - Count unique source URLs in production — if it's > ~5k, the bill is non-trivial.
- [ ] **Self-host static assets** (logos, icons, hero images, default chart images)
  in `public/` or a CDN like Cloudflare R2 + a stable URL — those bypass Vercel
  image optimization entirely.
- [ ] **Use `unoptimized` for tiny / already-sized images**:
  - Logos rendered at a single size from a small source don't need Vercel's optimizer.
  - Add `unoptimized` prop or set `images.unoptimized = true` for specific paths.
- [ ] **Restrict transformations**:
  - Pin `<Image>` `sizes` so we only ask for the breakpoints we actually use —
    fewer variants = fewer transformations.
- [ ] **Consider an `<img>` tag** for ultra-low-value places where Vercel optimization
  isn't worth it (e.g. tiny avatars in admin tables).

### 5. Bandwidth — payload reduction

- [ ] **Largest API responses**:
  - Sort API routes by response size — anything > 100KB per call against a high-RPM
    route is bandwidth that adds up. Trim fields the UI doesn't render, paginate
    where we currently dump full lists.
- [ ] **`/etfs` listing page** — the 7,000+ ETF dump is a bandwidth + render-cost
  concern called out in `etfs.md` (item §1.6, §A2). Paginating / category-grouping
  fixes a UX issue **and** drops payload.
- [ ] **Brotli / gzip**: Vercel handles this automatically, but verify by checking
  `content-encoding` on representative responses.

### 6. Build minutes — pipeline tuning

- [ ] **Cache `node_modules` + Next.js `.next/cache`** between builds (Vercel does
  this by default but missing caches are common after dependency churn).
- [ ] **Trim build-time work**:
  - `generateStaticParams` for surfaces with thousands of slugs (every stock, every
    ETF) extends build time linearly. Cap the build-time pre-render set to "popular"
    tickers/ETFs and let the rest land via on-demand ISR.
- [ ] **Skip CI for docs-only changes**:
  - Add a path filter on the GitHub Actions / Vercel build trigger so PRs that only
    touch `docs/`, `*.md`, or `knowledge/` don't trigger a Vercel build.

### 7. Database + external calls — indirect but real

These don't appear on the Vercel bill directly but drive function duration (and
therefore GB-hours).

- [ ] **Slow Prisma queries**:
  - Audit the top-duration routes from §2 for missing indices, N+1 patterns, or
    queries that pull more than the UI needs. Each saved ms × invocations/month =
    real money.
- [ ] **External API timeouts**:
  - Any `fetch(...)` to a slow third-party (yfinance proxy, GitHub raw, etc.)
    extends function duration. Add timeouts + retries with backoff so a slow
    upstream doesn't bill us for a 10s hang.

### Definition of done

- [ ] Baseline + post-change snapshot files exist in `docs/insights-ui/` and the
  delta is documented (per line item: invocations, duration, image-opt, bandwidth,
  build minutes).
- [ ] Vercel cron block is reviewed and either reduced in cadence or consolidated.
- [ ] Top-10 routes by GB-hours each have a documented decision: keep as-is /
  cache / lower memory / move off Vercel.
- [ ] No more "force-dynamic" pages without an explicit reason in a comment / commit
  message.
- [ ] Image-optimization audit done; static/self-hosted assets moved out of
  `next/image` where it makes sense.
- [ ] At least one follow-up bill cycle observed to confirm the savings actually
  landed.

### Open questions

- Do we have a per-month Vercel budget target, or is this just "cut what we can"?
  A target shapes how aggressive the changes are (e.g. cron consolidation vs. moving
  cron work entirely to the Discord-bot host).
- Which features are we **unwilling** to regress on perf to save money? Pages that
  serve as SEO landing surfaces (home, category pages, sitemap) should not get
  ISR windows so long that fresh content lags.
- Should we move the generation runner entirely off Vercel (Discord-bot host /
  dedicated worker) and leave Vercel only serving the read path? That's the
  biggest single lever — worth its own decision before doing the smaller cleanups.
