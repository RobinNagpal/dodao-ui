# Stock Page Caching — Quick Reference

## TL;DR

Each of the 8 pages under `/stocks/[exchange]/[ticker]` subscribes to exactly **one** cache tag. No fetch attaches more than one tag, and no tag is shared between pages — so a `revalidateTag(X)` call invalidates exactly one page's cache. The only "fan-out" invalidations are deliberate and named in code (e.g. `revalidateAllTickerTags`), not implicit through shared tags.

After PRs [#1472](https://github.com/RobinNagpal/dodao-ui/pull/1472), [#1473](https://github.com/RobinNagpal/dodao-ui/pull/1473), and the `/full-render` consolidation in this PR, one rebuild = **1 HTML + 1 Data Cache write = 2 cache writes per page**. The per-rebuild cost is now at the floor.

The remaining `writes > reads` mismatch is **structural**: the cron + admin actions invalidate pages faster than people visit them. Production sample: 281 reads vs 1.8k writes across 818 unique paths in one window → each ticker page is rebuilt ~1.1 times and read ~0.34 times. Cache hit rate ≈ 13%. See **§4.5** for the math and ranked solutions.

**Biggest remaining levers** (in order):

1. **Lengthen the `*/3 * * * *` cron to `*/15`** — one-line change to `insights-ui/vercel.json`, ~5× reduction in cron-driven invalidations.
2. **Narrow `revalidateAllTickerTags` on admin "Edit stock details"** — currently fires 8 tags on every text-only edit; only needs all 8 when `movedExchange` / `movedSymbol` / `isDeleted` change.
3. **ETF pages still use the OLD stock architecture** (~8 fetches per page sharing one tag across 4 subpages — same anti-pattern stocks just escaped).

Full ranked list with code pointers and trade-offs lives in §4.5 and §6.

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

Reported production sample for `/stocks/[exchange]/[ticker]`: **281 reads, 1.8k writes, 818 unique paths** in one window. Decoded:

- **818 unique paths** = 818 different `[exchange]/[ticker]` combinations had cache activity in the window.
- **1.8k writes / 818 paths ≈ 2.2 writes per path.** With the consolidation, one rebuild costs 2 writes (1 HTML + 1 Data Cache). So **each ticker page was rebuilt ~1.1 times on average** in the window. That's near the theoretical floor — you can't rebuild less than once per invalidation cycle.
- **281 reads / 818 paths ≈ 0.34 reads per path.** Each unique ticker page was served from cache fewer than once on average between rebuilds.
- **Cache hit rate = 281 / (1.8k + 281) ≈ 13%.** Most requests to a ticker page hit a cold cache.

The consolidation already collapsed the per-rebuild cost from 7 writes → 2 writes. The remaining mismatch is structural: **invalidations are happening faster than people visit the pages**. As long as that's true, writes will exceed reads no matter how cheap each rebuild becomes — you can't get reads above writes when the average ticker is being invalidated more often than it's being read.

### Root cause

For any per-page `writes:reads` ratio under ISR with on-demand invalidation:

```
writes_per_path  ≈  invalidations_per_path × writes_per_rebuild
reads_per_path   ≈  total_visits_per_path − invalidations_per_path
ratio            =  writes_per_path / reads_per_path
```

With the consolidation, `writes_per_rebuild = 2`. With ~1.1 invalidations per active ticker per window and only ~1.45 total visits per active ticker (1.1 trigger-rebuild visits + 0.34 cache-hit visits), the ratio is locked at ≈ 6.4× regardless of per-rebuild cost. **The lever has shifted from "per-rebuild cost" to "invalidations per path vs. visits per path".**

Concretely, the 818 active paths in the window are tickers that were touched by:

1. A cron-driven regen pipeline completing (umbrella fires on `FINAL_SUMMARY` save) — biggest contributor.
2. A category / competition / management-team save firing a narrow tag → subpage rebuild → if the subpage is `/stocks/[exchange]/[ticker]/X`, it shows up under that route, not the main route, so it doesn't bloat the main-route count. But the umbrella also fires at the end of the same regen → main route +1 rebuild.
3. Admin actions (`revalidateAllTickerTags`, `revalidateTickerCache` button, admin PUT, `fetch-financial-data` batch) — one click fires the umbrella; check the Vercel function logs for `Cache invalidated for` to count how often.

### Solutions, ranked by expected impact

Each one trades off against either freshness, regen latency, or admin ergonomics.

| # | Solution | Mechanism | Expected writes reduction | Trade-off |
|---|---|---|---|---|
| 1 | **Lengthen the `*/3 * * * *` cron to `*/15`** (`insights-ui/vercel.json`) | Fewer regen pipelines complete per hour → fewer umbrella invalidations | **5×** on cron-driven invalidations | Up to 15-minute additional latency before a queued ticker starts its regen |
| 2 | **Batch admin invalidations.** `revalidateAllTickerTags` is a sledgehammer — admin "Edit stock details" fires it on every save even when only the `summary` text changed. Narrow it: only fire all-8-tags when `movedExchange` / `movedSymbol` / `isDeleted` actually change; otherwise fire only `tickerAndExchangeTag` (umbrella) since text-only edits only affect the main aggregate page. | Cuts per-admin-action invalidations from 8 → 1 for the common case | **8×** on admin-driven invalidations | Subpages stay stale briefly after a text-only edit. Acceptable since the subpages don't render `summary` at all. |
| 3 | **Stop firing the umbrella on every regen step's last invocation.** Today every completed pipeline fires the umbrella, even for partial regens triggered by `createSingleAnalysisBackgroundRequest` (admin "Generate just Fair Value"). For a single-step regen, the umbrella is redundant — the narrow tag already invalidates the main page's view of that slice via the consolidated `/full-render` fetch (which subscribes to the umbrella). Audit `save-report-callback/route.ts`: if there was only one step in the request, skip the umbrella. | Cuts umbrella invalidations on partial regens roughly in half | **2-3×** on partial-regen-driven invalidations | None significant — main page won't rebuild on partial regens, but the consolidated fetch already pulls in the new data when something else invalidates the umbrella |
| 4 | **Switch `/full-render` to direct Prisma + `unstable_cache`** instead of fetch-to-self HTTP. The cache entry becomes one `unstable_cache` blob tagged with the umbrella, no internal HTTP round-trip, and the rebuild is slightly faster — same write count but lower per-rebuild cost. | Marginal write reduction; bigger win is reduced function GB-seconds | **~10%** | None; same cache surface |
| 5 | **Audit `fetch-financial-data` batch usage.** Every batch call invalidates one umbrella per ticker in the request. If the admin runs a 500-ticker batch, that's 500 umbrella invalidations in one shot — directly explains a chunk of the 818 unique paths in the window. Run it less often or skip the revalidate when the underlying data didn't actually change. | Depends on usage; could be the entire reason | Variable | None |

If you do #1 + #2 + #3 together, the projected steady-state for the main page drops from 1.8k writes / window to roughly 300–400 writes / window, while reads stay roughly the same. At that point reads should match or exceed writes. **#1 is the single biggest immediate lever and is a one-line change to `vercel.json`.**

### What won't move the needle

- More aggressive per-fetch consolidation. The main page is already at 1 tagged fetch.
- Bot detection (see prior session — saves at most one rebuild per invalidation, at the cost of slower bot responses and SEO risk).
- Longer `revalidate` window on the consolidated fetch. The 8-day backstop only fires for dormant tickers; active tickers' invalidations already win that race.

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
