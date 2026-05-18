# Stock Page Caching — Quick Reference

> **⚠️ Historical reference only.** This document describes the Phase-1 ISR / Data Cache tag map as it existed before the `force-dynamic` migration. Most of the architecture below is now **inert** — the tags still exist in code but `force-dynamic` ignores them. The canonical, current cache reference is [cloudfront-deploy-skew.md](cloudfront-deploy-skew.md). Read this file only if you're reading legacy code that references the tag helpers and want to know what they used to do.

## TL;DR

Each of the 8 pages under `/stocks/[exchange]/[ticker]` subscribes to exactly **one** cache tag. No fetch attaches more than one tag, and no tag is shared between pages — so a `revalidateTag(X)` call invalidates exactly one page's cache. The only "fan-out" invalidations are deliberate and named in code (e.g. `revalidateAllTickerTags`), not implicit through shared tags.

After PRs [#1472](https://github.com/RobinNagpal/dodao-ui/pull/1472), [#1473](https://github.com/RobinNagpal/dodao-ui/pull/1473), and the `/full-render` consolidation in this PR, one rebuild = **1 HTML + 1 Data Cache write = 2 cache writes per page**. Writes will lead reads only when the cron cadence (or admin actions) invalidate pages faster than crawlers can revisit them.

**Biggest remaining levers** (in order — see §6):

1. ETF pages still use the OLD stock architecture (~8 fetches per page sharing one tag across 4 subpages).
2. The `*/3 * * * *` `generate-ticker-v1-request` cron drives most invalidations.
3. `revalidateAllTickerTags` invalidates 8 pages per admin click — audit how often it fires.

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
