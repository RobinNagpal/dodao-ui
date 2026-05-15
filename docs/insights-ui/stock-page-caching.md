# Stock Page Caching — Quick Reference

## TL;DR

Each of the 8 pages under `/stocks/[exchange]/[ticker]` subscribes to exactly **one** cache tag. No fetch attaches more than one tag, and no tag is shared between pages — so a `revalidateTag(X)` call invalidates exactly one page's cache. The only "fan-out" invalidations are deliberate and named in code (e.g. `revalidateAllTickerTags`), not implicit through shared tags.

After PRs [#1472](https://github.com/RobinNagpal/dodao-ui/pull/1472), [#1473](https://github.com/RobinNagpal/dodao-ui/pull/1473), and the `/full-render` consolidation in this PR, one rebuild = **1 HTML + 1 Data Cache write = 2 cache writes per page**. The per-rebuild cost is at the floor.

Production sample: **281 reads / 1.8k writes / 818 unique paths** in a window with no regens and no admin actions. Math: ~1.1 rebuilds per path × 2 writes ≈ 1.8k writes; cache hit rate ~13%. Because no `revalidateTag` fired during that window, the rebuilds must come from cache state being reset by something other than an explicit invalidation. **The most likely cause is a production deployment in the same window** — Vercel resets ISR cache per build ID, so every first-visit-after-deploy is a cache miss. Multi-region cold caches and internal eviction are secondary candidates.

**Biggest immediate lever**:

1. **Reduce deploy frequency** to `main` (don't ship docs-only / dependabot-only PRs on their own), **or enable Vercel Skew Protection** so the ISR cache carries across deploys. Project-level setting, no code change.

**Lower-priority levers** (only relevant once deploy-driven resets stop dominating):

2. Lengthen the `*/3 * * * *` cron to `*/15` — ~5× reduction in cron-driven invalidations once regens start firing again.
3. Narrow `revalidateAllTickerTags` on admin "Edit stock details" — fires 8 tags on every text-only edit; only needs all 8 when `movedExchange` / `movedSymbol` / `isDeleted` change.
4. **ETF pages still use the OLD stock architecture** (~8 fetches per page sharing one tag across 4 subpages).

Diagnosis steps + full ranked solutions in §4.5.

---

## 1. The 8 pages and the 8 tags

Every per-ticker page is `force-static` with `revalidate = false` and `dynamicParams = true`. They render statically on first request and stay in Vercel's ISR cache until a tag they subscribe to is invalidated.

| Route | The single tag it subscribes to | Defined in |
|---|---|---|
| `/stocks/[exchange]/[ticker]` (main) | `tickerAndExchangeTag(t,e)` ("the umbrella") | `app/stocks/[exchange]/[ticker]/page.tsx` |
| `/stocks/[exchange]/[ticker]/business-and-moat` | `tickerCategoryReportTag(t,e,BusinessAndMoat)` | via `utils/performance-page-utils.ts` |
| `/stocks/[exchange]/[ticker]/financial-statement-analysis` | `tickerCategoryReportTag(t,e,FinancialStatementAnalysis)` | via `utils/performance-page-utils.ts` |
| `/stocks/[exchange]/[ticker]/past-performance` | `tickerCategoryReportTag(t,e,PastPerformance)` | via `utils/performance-page-utils.ts` |
| `/stocks/[exchange]/[ticker]/future-performance` | `tickerCategoryReportTag(t,e,FutureGrowth)` | via `utils/performance-page-utils.ts` |
| `/stocks/[exchange]/[ticker]/fair-value` | `tickerCategoryReportTag(t,e,FairValue)` | via `utils/performance-page-utils.ts` |
| `/stocks/[exchange]/[ticker]/competition` | `tickerCompetitionTag(t,e)` | `app/stocks/[exchange]/[ticker]/competition/page.tsx` |
| `/stocks/[exchange]/[ticker]/management-team` | `tickerManagementTeamTag(t,e)` | `app/stocks/[exchange]/[ticker]/management-team/page.tsx` |

The 5 `tickerCategoryReportTag(t,e,category)` values are **5 distinct tag strings** (one per category enum) — not a shared "generic" tag. The category parameter is baked into the tag string, so `tickerCategoryReportTag(AAPL,NASDAQ,BusinessAndMoat) !== tickerCategoryReportTag(AAPL,NASDAQ,FairValue)`.

## 2. Two questions, asked and answered

**Q1. Does any fetch attach more than one tag (like `tags: [narrow, generic]`)?**

**No.** Every cache-tagged `fetch()` in the stocks tree uses exactly one tag. Verified:

```bash
grep -rn 'next: { tags:' insights-ui/src/  # all entries are tags: [X] — single element
```

If anyone ever introduces `tags: [narrow, generic]`, flushing `generic` would cascade across every fetch that uses it. That's a footgun this codebase avoids today.

**Q2. Is any tag attached to more than one page?**

**No, within stocks.** Each of the 8 tags above appears in exactly one `fetch()` call in the codebase (plus its `revalidate*` helper). Flushing `tickerCompetitionTag(AAPL,NASDAQ)` rebuilds only `/stocks/NASDAQ/AAPL/competition`, never anything else.

**Yes, on other surfaces** — see §6 for `etfAndExchangeTag` (used by 8 fetches on one page **and** 3+ ETF subpages) and `getStocksPageTag` (used by home page, `/stocks`, `/stocks/countries/X`, and the 404 page).

**Q3. What about cascade invalidations like "edit ticker → all 8 pages rebuild"?**

Those exist, but they're **explicit, not implicit**. `revalidateAllTickerTags(t,e)` is a function that calls `revalidateTag` 8 times in a row, once per ticker tag. The cascade is named in code, not hidden behind a tag two fetches happen to share.

## 3. Who calls `revalidateTag` for each tag (write side)

All `revalidate*` helpers live in `utils/ticker-v1-cache-utils.ts`. Every save in `utils/analysis-reports/save-report-utils.ts` runs through `bumpUpdatedAtAndInvalidateCache` (`utils/ticker-v1-model-utils.ts`), which always fires the narrow tag and only defers the umbrella when `skipRevalidation: true` (used during intermediate steps of a multi-step regen — the last step always fires the umbrella).

### 3a. LLM report saves (`save-report-callback` route)

| Report type saved | Narrow tag fires | Umbrella fires |
|---|---|---|
| `BUSINESS_AND_MOAT` | `tickerCategoryReportTag(t,e,BusinessAndMoat)` | yes (deferred during partial regen) |
| `FINANCIAL_ANALYSIS` | `tickerCategoryReportTag(t,e,FinancialStatementAnalysis)` | yes (deferred) |
| `PAST_PERFORMANCE` | `tickerCategoryReportTag(t,e,PastPerformance)` | yes (deferred) |
| `FUTURE_GROWTH` | `tickerCategoryReportTag(t,e,FutureGrowth)` | yes (deferred) |
| `FAIR_VALUE` | `tickerCategoryReportTag(t,e,FairValue)` | yes (deferred) |
| `COMPETITION` | `tickerCompetitionTag(t,e)` | yes (deferred) |
| `MANAGEMENT_TEAM` | `tickerManagementTeamTag(t,e)` | yes (deferred) |
| `INVESTOR_ANALYSIS` | (none — no subpage uses it) | yes |
| `FINAL_SUMMARY` | (none) | yes |

### 3b. Admin actions

| Trigger | Tags fired |
|---|---|
| "Invalidate cache" button on ticker page (`StockActions.tsx`) | **all 8** via `revalidateAllTickerTags` |
| "Edit stock details" modal save (`StockActions.tsx#handleEditDetailsSaved`) | **all 8** via `revalidateAllTickerTags` |
| Admin PUT `/api/[spaceId]/tickers-v1/exchange/<e>/<t>` (edit `stockAnalyzeUrl` / set `movedExchange` / set `movedSymbol` / set `isDeleted`) | **all 8** via `revalidateAllTickerTags` |
| Admin "Refresh financial data" batch (`fetch-financial-data/route.ts`) | umbrella only — scraper data only feeds the main page |

### 3c. Time-based expiry (not a tag invalidation)

The single `…/full-render` fetch on the main page has `next: { revalidate: 8 * 24 * 60 * 60 }`. After 8 days the cache entry expires on its own — backstop so dormant tickers can refresh their underlying scraper / Yahoo data without an external invalidation. The Data Cache entry is the only thing that expires; the page HTML stays cached until a tag invalidation forces a rebuild.

### 3d. What does NOT invalidate any ticker tag

- `ensurePriceHistoryIsFresh`, `fetchAndUpdateStockAnalyzerData`, `refreshMarketSummaryForFairValue` — **intentionally none.** Per #1472, these used to call `revalidateTag` from the read path and were evicting the cache entry they were about to fill; that's removed.
- ETF / scenario / tariff / daily-mover / portfolio-manager saves — separate cache namespaces (`etf_*`, `koalagains:etf-scenario:*`, `tariff_*`, `koalagains:daily-movers:*`, `koalagains:portfolio-*`). None call `revalidateTicker*Tag`.

## 4. Cache-write math (after this PR)

A page rebuild costs **1 HTML ISR write + 1 Data Cache write (the single tagged fetch's response) = 2 cache writes**. Same for every page now — there are no pages with multiple tagged fetches in the stocks tree.

| Trigger | Pages invalidated | Cache writes when each invalidated page is next visited |
|---|---|---|
| Save 1 category report | 1 subpage + main page (umbrella) | 2 + 2 = **4** |
| Save competition | /competition + main page | **4** |
| Save management-team | /management-team + main page | **4** |
| Save investor analysis or final summary | main page only | **2** |
| Full 8-step regen (typical) | All 8 pages, each rebuilt once | 8 × 2 = **16** |
| Admin "Invalidate cache" / "Edit stock" / PUT | All 8 pages | **16** |
| Admin "Refresh financial data" batch | Main page only | **2** |

A pure cache hit serves the stored HTML + the stored Data Cache entry — both count as reads, neither writes.

## 4.5. "But writes still exceed reads after the consolidation" — read this first

Reported production sample for `/stocks/[exchange]/[ticker]`: **281 reads, 1.8k writes, 818 unique paths** in one window — with **no regens, no admin saves, and no admin invalidation clicks** during the window. The `*/3` cron fired but every tick was a no-op (no pending generation requests). So **no `revalidateTag` calls fired for ticker tags during the window.**

Decoded:

- **818 unique paths** = 818 different `[exchange]/[ticker]` URLs had cache activity in the window.
- **1.8k writes / 818 paths ≈ 2.2 writes per path.** With the consolidation, one rebuild costs 2 writes (1 HTML + 1 Data Cache). So **each ticker page was rebuilt ~1.1 times on average** in the window.
- **281 reads / 818 paths ≈ 0.34 reads per path.** Cache hit rate ≈ 13%.

If no `revalidateTag` fired, **why did 900-ish rebuilds happen?** Cache writes don't only happen when you call `revalidateTag`. They also happen any time the cache entry simply isn't there when a request arrives. The candidates that fit "no explicit invalidation but 800+ cold-cache misses":

### Root cause hypotheses, ranked by likelihood

**1. (Most likely) A production deployment during the window wiped the ISR cache.** Vercel's default behavior: every new deployment gets a fresh build ID, and the ISR cache is keyed by that build ID. Old cache entries from prior deployments are not transferred forward. After the deploy, the first request to every unique ticker URL is a cache miss → triggers a rebuild → 1 HTML write + 1 Data Cache write. With ~818 unique tickers crawled (likely Googlebot crawling sitemap entries) and one rebuild apiece, that's exactly **~1,636 writes** — matching the observed 1.8k. The ~280 tickers that got a second visit before any subsequent invalidation became the 281 reads.

   **How to verify:** Check Vercel's Deployments tab. If there was a deploy that fell inside this window (including auto-deploys from PR merges, dependabot bumps, or anything else that lands on `main`), this is your culprit. **Even one deploy per day produces this exact pattern on a heavily-crawled site.**

**2. (Second most likely) Multi-region ISR cold caches.** Vercel serves ISR pages from edge nodes that maintain their own per-region cache state. A ticker page cached in `iad1` (US East) needs to be rebuilt the first time it's served from `fra1` (Frankfurt), even though no tag was invalidated. The ~1.1 rebuilds per path number is consistent with: most pages served from one region (1 rebuild), a long tail served from two (2 rebuilds). For Googlebot specifically, this is common — Google crawls from a global pool of IPs and hits whichever edge region is closest.

   **How to verify:** Look at the per-region breakdown in Vercel's Edge Network analytics (if available) or filter logs by `x-vercel-id` prefix.

**3. (Possible) Vercel's internal cache eviction.** Vercel doesn't publish exact thresholds, but ISR cache entries can be evicted under storage pressure or by their internal LRU policy. For a site with thousands of static pages where each entry is relatively large (the consolidated `/full-render` response is the whole page payload), individual entries can get evicted on the timeline of hours-to-days even without an explicit `revalidateTag`. The first request after eviction = a rebuild.

   **How to verify:** Hard to verify directly. Look for a correlation between writes and time — if writes spike every 12-24 hours independent of deploys/admin activity, this is likely it.

**4. (Unlikely for this scale)** The 8-day `revalidate` backstop on the consolidated fetch. 818 tickers all hitting their 8-day expiry in the same window would require they were all originally cached on roughly the same day. Possible if there was a mass cache reset 8 days prior, but unlikely as a recurring driver.

**5. (Ruled out)** Any explicit `revalidateTag` path. The user confirmed no regens / admin actions in the window, and `grep -rn revalidateTag insights-ui/src/` shows the only ticker-tag callers are: `bumpUpdatedAtAndInvalidateCache` (fires only on saves), `revalidateAllTickerTags` (fires only on admin actions or admin PUT), `saveFinalSummaryResponse` (fires only on the last regen step), and `fetch-financial-data` (fires only on admin batch). With none of those triggered, no tag invalidation happened.

### Solutions, ranked by what actually addresses each hypothesis

| # | If the cause is… | Solution | Trade-off |
|---|---|---|---|
| 1 | **Deploy resets** (hypothesis 1) | Reduce deployment frequency on `main` (don't deploy docs-only or dependabot-only changes), or enable Vercel **Skew Protection** which preserves the ISR cache across compatible deployments. Skew Protection is a per-project setting; enable it from the Project → Settings → General → Skew Protection. | Skew Protection: small storage overhead. Reduced deploy frequency: slower iteration |
| 2 | **Multi-region cold caches** (hypothesis 2) | Move some routes to a single-region runtime so there's only one cache to fill. Or accept the 2-3× multiplier as a cost of global edge serving. | Single-region serving = higher latency for users far from that region |
| 3 | **Cache eviction** (hypothesis 3) | Increase the `revalidate` backstop from 8 days to something shorter (counter-intuitive — but a shorter backstop means more requests are "in-flight" stale-while-revalidate refreshes instead of cold misses, depending on Vercel's eviction model). Or switch to `unstable_cache` + Prisma to skip the HTTP/fetch-cache hop. | Marginal; might not move the needle |
| 4 | **8-day fetch expiry coinciding** (hypothesis 4) | Lengthen the backstop further (14d or 30d). Cheap to test. | Dormant tickers go even longer without refreshing scraper data |
| 5 | **Future regen / admin volume** (when it returns) | Lengthen `*/3` cron → `*/15`. Narrow `revalidateAllTickerTags` on admin "Edit stock" to only fire all-8-tags when moved/deleted state changes. Skip the umbrella for single-step partial regens. | Regen latency, admin sub-page staleness |

**The single most productive next step for this user**: check Vercel's Deployments tab for activity in the same window the metrics cover. If there was a deploy, the writes are 100% explained and the right fix is one of:

- **Reduce deploy frequency** to `main` (only deploy code that affects user-facing behavior; merge docs/dependabot PRs into a batched release).
- **Enable Vercel Skew Protection** to carry the ISR cache forward across deploys (project-level setting; no code change).

These are the two levers that flatten the write-spike-per-deploy pattern. Cron / admin-action tuning (the previous suggestions) only matters once deploys are no longer the dominant driver.

### How to confirm in 10 minutes

1. Open Vercel → Deployments. Filter by the window. Was there a successful Production deployment? If yes → **hypothesis 1 confirmed**, stop here.
2. If no deploys: open the Vercel logs for `/stocks/[exchange]/[ticker]` in the same window. Search for `Cache invalidated for`. Count occurrences. If you see 800+ entries, an explicit revalidate path exists that this audit missed — share the logs.
3. If no logs match and no deploys: look at the per-region breakdown of writes. If writes are split across 2+ regions, **hypothesis 2** is your answer.
4. If none of the above: hypothesis 3 (cache eviction) — confirm by sampling writes/reads in 1-hour buckets across a full week. A flat eviction rate independent of deploy/admin activity points there.

## 5. Mental model in five bullets

- **A coding save** → only that report's subpage + main page get rebuilt on the next view.
- **Admin "Invalidate cache" / "Edit stock" / "Mark moved or deleted"** → every page for that ticker rebuilds on its next view.
- **Admin "Refresh financial data"** → only the main page rebuilds.
- **8 days idle** → the main page's Data Cache entry expires once; scraper/Yahoo data refreshes on the next view.
- **Anything ETF / tariff / scenario / mover-related** → ticker caches untouched.

## 6. The next biggest culprits (in order of impact)

The stocks tree is structurally clean now. If overall Vercel costs are still too high, the highest-impact follow-ups are:

### 6a. ETF pages still use the **OLD** stock architecture (highest leverage)

`insights-ui/src/app/etfs/[exchange]/[etf]/page.tsx` issues **8 tagged fetches** per render — and each one uses the same `etfAndExchangeTag(s,e)`. Three subpages (`risk-analysis`, `holdings`, `cost-efficiency-team`) also subscribe to that same tag. So:

- One main-ETF-page rebuild = 1 HTML + 8 Data Cache writes = **9 cache writes**.
- One `revalidateEtfAndExchangeTag` call (fired by every ETF report save in `save-etf-report-utils.ts` — 4 sites — and by `fetch-financial-info` and `mor-info-callback`) invalidates **all 4 ETF surfaces for that ETF**.

This is the same anti-pattern that stocks just escaped. The fix is the same: a single `/etfs/[exchange]/[etf]/full-render` endpoint that consolidates the 8 fetches into one, and per-subpage narrow tags so a holdings save doesn't invalidate the risk-analysis page. Expected impact: ETF main-page cache writes drop ~4×.

### 6b. Cron cadence `*/3 * * * *`

`vercel.json` runs `generate-ticker-v1-request` 480 times/day. Each tick processes up to 10 regen requests. Most completed regens fire `FINAL_SUMMARY` at the end, which invalidates the umbrella tag → main page rebuilds. With ~200 tickers/hour going through some regen activity, that's roughly 100-120 umbrella invalidations/hour just from this cron. Moving to `*/10` would cut umbrella invalidations 3×; `*/15` would cut them 5×. Same for the ETF cron (also `*/3`). Trade-off: regen latency for tickers in the queue.

### 6c. Blast radius of `revalidateAllTickerTags`

Every admin click on "Invalidate cache" or "Edit stock details", plus every admin PUT that touches `stockAnalyzeUrl` / `movedExchange` / `movedSymbol` / `isDeleted`, fires **8 `revalidateTag` calls** — one per ticker page. Each invalidated page then costs 2 writes on its next view = **16 writes per admin click**. If admins use these heavily (or if a script loops over tickers calling the PUT route), this dominates everything else.

Quick audits worth running: how often is `cache-actions.ts#revalidateTickerCache` called per day (Vercel logs filter on `Cache invalidated for`)? Could the admin PUT route narrow its invalidation — e.g. only fire the umbrella when `stockAnalyzeUrl` changes, since `movedExchange` / `isDeleted` only need to invalidate pages whose render uses `enforceMovedRedirect` / `enforceDeletedTicker`?

### 6d. `getStocksPageTag(country)` is shared across multiple listing surfaces

| Page | Subscribes via |
|---|---|
| Home page (`/`) | `app/page.tsx` (top industries fetch + `unstable_cache` industries list) |
| `/stocks` | `app/stocks/page.tsx` |
| `/stocks/countries/[country]` | `app/stocks/countries/[country]/page.tsx` |
| `/stocks/[exchange]/[ticker]/not-found.tsx` | `app/stocks/[exchange]/[ticker]/not-found.tsx` |

Calling `revalidateStocksPageCache(country)` invalidates all of these for that country. Today the only caller is the "refresh stocks listing" admin action in `StocksGridPageActions.tsx` — low frequency — but it's worth flagging in case any save path adopts it later.

### 6e. Scraper-freshness work on every main-page rebuild

`/full-render` calls `ensureStockAnalyzerDataIsFresh` (which may `upsert TickerV1StockAnalyzerScrapperInfo`) and `ensurePriceHistoryIsFresh` (which may `upsert TickerV1PriceHistory`) on every rebuild. The 7d / 30d / 90d staleness windows in `stock-analyzer-scraper-utils.ts` should keep most of these as no-ops, but if the umbrella keeps invalidating faster than the staleness window, each rebuild does real DB writes + a Yahoo / Lambda call. Worth a 24h sample of `UPDATE TickerV1StockAnalyzerScrapperInfo` frequency to confirm.

## 7. Diagnostic checklist

When auditing later — in order:

1. `grep -rn "next: { tags:" insights-ui/src/` — every entry should be `tags: [X]` (one element). A `tags: [a, b]` slipping in is the #1 footgun for cascade invalidations.
2. `grep -rn "revalidateTag\b" insights-ui/src/` — callers should be limited to `save-report-utils.ts`, `cache-actions.ts`, the admin PUT route, `fetch-financial-data` route, and the equivalent ETF / scenario / tariff savers. Anything else (especially in a read path) is a regression of #1472.
3. `grep -rn 'tickerAndExchangeTag\|tickerCategoryReportTag\|tickerCompetitionTag\|tickerManagementTeamTag' insights-ui/src/` — each tag function should appear in exactly one page render (plus its `revalidate*` helper definition).
4. `grep -rn 'href={\`/stocks/' insights-ui/src/` — every `<Link>` to a stock page on a listing surface should pass `prefetch={false}` (otherwise App Router will trigger background prefetches that count as rebuilds after every invalidation).
5. `vercel.json` `crons` — `*/3` is the floor that drove the existing baseline; anything tighter will spike writes proportionally.
6. Sanity-check `revalidateAllTickerTags` callers (`grep -rn revalidateAllTickerTags insights-ui/src/`). Today: `cache-actions.ts#revalidateTickerCache` and the admin PUT route. Anything new = audit.
