# Stock Page Caching — Where, By What, and How It's Cleared

A reference for every cache that sits between a request to `/stocks/[exchange]/[ticker]` (and its subpages) and the database. Per-route table at the top, then a write-side / invalidation-side table, then an answer to the standing question **"why are writes > reads on Vercel's ISR meter when most reports were merged days ago?"**

The behavior here is the result of three merged PRs:

- [#1472](https://github.com/RobinNagpal/dodao-ui/pull/1472) — split umbrella tag into per-subpage tags, removed read-path `revalidateTag` calls, added `prefetch={false}` to every ticker-bound `<Link>`.
- [#1473](https://github.com/RobinNagpal/dodao-ui/pull/1473) — narrow tag always fires; `skipRevalidation` defers only the umbrella; `fetch-financial-data` admin route is umbrella-only; financial fetches get an 8-day time-based revalidate as a backstop for dormant tickers.
- [#1450](https://github.com/RobinNagpal/dodao-ui/pull/1450) (ETFs, listed for completeness) — cache-buster query param on a tagged fetch whose response shape changed.

## 1) Per-route caching map

Every per-ticker page is `force-static` with `revalidate = false` and `dynamicParams = true` — they are statically rendered on first request, stored in Vercel's ISR cache, then rebuilt on demand when one of their subscribed tags is invalidated. There is **no time-based ISR revalidate** on any of these routes; rebuilds happen only via tag invalidation. The 8-day fetch-level revalidate on three specific upstream fetches in the main page is a separate backstop (see §3).

| Route | Page-level cache | `fetch()` tags inside the page render | DB-write API routes pulled in during render |
|---|---|---|---|
| `/stocks/[exchange]/[ticker]` (main) | ISR (force-static) | `tickerAndExchangeTag(t,e)` — **1 fetch**: `…/exchange/<e>/<t>/full-render` (consolidates ticker, similar, financial-info, quarterly-chart, price-history, competition into one tagged Data Cache entry with an 8-day backstop `revalidate`). | `full-render` (calls `ensureStockAnalyzerDataIsFresh` once → may `upsert` `TickerV1StockAnalyzerScrapperInfo`, and `ensurePriceHistoryIsFresh` once → may `upsert` `TickerV1PriceHistory`). Both functions still skip `revalidateTag` per #1472 so they don't evict the cache entry being filled. |
| `/stocks/[exchange]/[ticker]/business-and-moat` | ISR (force-static) | `tickerCategoryReportTag(t,e,BusinessAndMoat)` — used by 1 fetch: `…/business-and-moat-data` | None — `business-and-moat-data` reads `TickerV1CategoryAnalysisResult` only. (The separate `business-and-moat` API route — without `-data` — is a write-path scraper call used by the LLM pipeline; the page does not hit it.) |
| `/stocks/[exchange]/[ticker]/financial-statement-analysis` | ISR (force-static) | `tickerCategoryReportTag(t,e,FinancialStatementAnalysis)` — 1 fetch: `…/financial-statement-analysis-data` | None — reads `TickerV1CategoryAnalysisResult` only. |
| `/stocks/[exchange]/[ticker]/past-performance` | ISR (force-static) | `tickerCategoryReportTag(t,e,PastPerformance)` — 1 fetch: `…/past-performance-data` | None. |
| `/stocks/[exchange]/[ticker]/future-performance` | ISR (force-static) | `tickerCategoryReportTag(t,e,FutureGrowth)` — 1 fetch: `…/future-growth-data` (slug = `future-growth-data` in `performance-page-utils`) | None. |
| `/stocks/[exchange]/[ticker]/fair-value` | ISR (force-static) | `tickerCategoryReportTag(t,e,FairValue)` — 1 fetch: `…/fair-value-data` | None (fair-value-data is a DB-only read; the LLM-side `refreshMarketSummaryForFairValue` only runs in the report-generation pipeline, not on page render). |
| `/stocks/[exchange]/[ticker]/competition` | ISR (force-static) | `tickerCompetitionTag(t,e)` — 1 fetch: `…/competition-tickers` | None — `competition-tickers` reads `TickerV1VsCompetition` only. |
| `/stocks/[exchange]/[ticker]/management-team` | ISR (force-static) | `tickerManagementTeamTag(t,e)` — 1 fetch: `…/exchange/<e>/<t>?allowNull=true` (same endpoint as main page, but tagged narrowly so it gets its own Data Cache entry) | None. |

**Notes**

- The main page now issues a single tagged fetch to `…/full-render`. Previously it called six (ticker, similar, financial-info, quarterly-chart, price-history, competition) — each producing its own Data Cache entry; consolidating dropped the per-rebuild cache-write cost from 1 HTML + 6 Data Cache entries to 1 HTML + 1 Data Cache entry.
- Each subpage subscribes to exactly one narrow tag, not the umbrella — so a financial-statement save invalidates the main page + financial-statement subpage and nothing else.
- `business-and-moat-data` ≠ `business-and-moat`. The page reads the `-data` route (DB-only). The non-`-data` route triggers a scraper write and is used only by the LLM generation pipeline.
- `not-found.tsx` for `/stocks/[exchange]/[ticker]` does its own week-long fetch with `tags: [getStocksPageTag('US')]` — a 404 response is itself cached.

## 2) Where the cache is invalidated (write side)

Three classes of trigger: LLM report saves during the regen pipeline, admin actions on the ticker page, and a time-based fetch-cache expiry. All `revalidate*` helpers are in `utils/ticker-v1-cache-utils.ts`.

### 2a) LLM report saves

Every save runs through `bumpUpdatedAtAndInvalidateCache` (`utils/ticker-v1-model-utils.ts`), called from the matching saver in `utils/analysis-reports/save-report-utils.ts`. The narrow subpage tag always fires immediately; the umbrella is deferred (skipped) during intermediate steps of a multi-step regen — the last step of the pipeline always fires the umbrella.

| Report type saved (via `save-report-callback`) | Narrow tag invalidated | Umbrella `tickerAndExchangeTag` |
|---|---|---|
| `BUSINESS_AND_MOAT` | `tickerCategoryReportTag(t,e,BusinessAndMoat)` | yes (deferred during partial regen) |
| `FINANCIAL_ANALYSIS` | `tickerCategoryReportTag(t,e,FinancialStatementAnalysis)` | yes (deferred) |
| `PAST_PERFORMANCE` | `tickerCategoryReportTag(t,e,PastPerformance)` | yes (deferred) |
| `FUTURE_GROWTH` | `tickerCategoryReportTag(t,e,FutureGrowth)` | yes (deferred) |
| `FAIR_VALUE` | `tickerCategoryReportTag(t,e,FairValue)` | yes (deferred) |
| `COMPETITION` | `tickerCompetitionTag(t,e)` | yes (deferred) |
| `MANAGEMENT_TEAM` | `tickerManagementTeamTag(t,e)` | yes (deferred) |
| `INVESTOR_ANALYSIS` | (none — no subpage renders this slice) | yes |
| `FINAL_SUMMARY` | (none) | yes |

So a full 8-step regen invalidates each touched narrow tag once + the umbrella once at the end. A partial regen (e.g. only `BUSINESS_AND_MOAT`) invalidates only that one narrow tag + the umbrella.

### 2b) Admin actions

| Trigger | Source | Tags invalidated |
|---|---|---|
| "Invalidate cache" button on ticker page | `StockActions.tsx#handleDropdownSelect('invalidate-cache')` → `cache-actions.ts#revalidateTickerCache` → `revalidateAllTickerTags` | **everything** (umbrella + competition + management-team + all 5 category tags) |
| "Edit stock details" modal save | `StockActions.tsx#handleEditDetailsSaved` → `revalidateTickerCache` | **everything** |
| Admin PUT `/api/[spaceId]/tickers-v1/exchange/<e>/<t>` (edit `stockAnalyzeUrl`, set `movedExchange` / `movedSymbol` / `isDeleted`) | `exchange/[exchange]/[ticker]/route.ts` putHandler → `revalidateAllTickerTags` | **everything** (moved/deleted state is enforced at the top of every per-ticker page render) |
| Admin "Refresh financial data" batch | `app/api/[spaceId]/tickers-v1/fetch-financial-data/route.ts` → `revalidateTickerAndExchangeTag` | umbrella only (scraper data only feeds the main page) |

### 2c) Time-based fetch-cache expiry (not a tag invalidation)

| Trigger | Effect |
|---|---|
| 8-day `revalidate` on the consolidated `…/full-render` fetch (`app/stocks/[exchange]/[ticker]/page.tsx`, `EIGHT_DAYS_IN_SECONDS`) | The single Data Cache entry expires after 8 days, forcing the consolidated fetch to re-execute on the next request. Backstop so dormant tickers can refresh their underlying scraper / Yahoo data without an external invalidation. |

### 2d) What does NOT invalidate ticker caches

- `ensurePriceHistoryIsFresh`, `fetchAndUpdateStockAnalyzerData`, `refreshMarketSummaryForFairValue` — **intentionally none.** Per #1472 these used to call `revalidateTag` from the read path and were evicting the cache entry they were about to fill; that's removed.
- ETF saves, scenarios, tariffs, daily-movers, portfolio-managers — separate cache namespaces (`etf_*`, `koalagains:etf-scenario:*`, `tariff_*`, `koalagains:daily-movers:*`, `koalagains:portfolio-*`). None of them call a `revalidateTicker*Tag` helper.

### 2e) Mental model

- **A coding save** → only that report's subpage + main page rebuild.
- **Admin "revalidate" / "edit ticker" / "mark moved or deleted"** → every page for that ticker rebuilds.
- **Admin "refresh financial data"** → only main page rebuilds.
- **8 days idle** → main page Data Cache entry expires once, scraper data refreshes on next view.
- **Anything ETF / tariff / scenario / mover-related** → ticker caches untouched.

## 3) Why ISR writes used to exceed reads (and what changed)

PRs #1472 and #1473 eliminated **unnecessary** invalidations (read-path revalidates, every-subpage-on-every-save, prefetch-driven rebuilds). They did not, however, change the fact that the main ticker page was issuing **six separately-tagged `fetch()`es per render** — and on Vercel's unified Cache Writes meter, each tagged fetch is its own Data Cache entry. So each rebuild used to cost **1 HTML ISR write + 6 Data Cache writes = 7 cache writes per rebuild**, while a single view only counted as ~1 read. With the `*/3 * * * *` `generate-ticker-v1-request` cron processing up to 10 generation requests every 3 minutes (~200 tickers/hour), the 833 writes/hour on `/stocks/[exchange]/[ticker]` reported in production mapped roughly to 100–120 invalidations/hour × 7 cache writes each + sparse organic reads.

For `/competition`, one rebuild ≈ 2 writes (HTML + 1 Data Cache entry for `…/competition-tickers`). The observed 7.6K writes / 4.5K reads ≈ 1.7:1 maps to ~1.18 views per rebuild — same shape, smaller multiplier.

**Consolidating the six fetches into one `…/full-render` endpoint dropped the main page's per-rebuild multiplier from ~7× to ~2×.** A single tagged fetch ⇒ a single Data Cache entry ⇒ one HTML write + one Data Cache write per rebuild. With the same invalidation cadence, the projected steady-state shifts from ~833 writes/hour to ~240 writes/hour on the main page, putting reads ahead of writes whenever the average ticker gets more than ~2 views between umbrella invalidations.

**Remaining levers** if writes still need to come down further:

- **Lengthen the cron cadence.** `*/3 * * * *` is 480 firings/day. Each firing that produces a `FINAL_SUMMARY` save invalidates one umbrella tag. Moving to `*/10` or batching multiple completed regens into a single revalidate call would cut umbrella invalidations by 3×. The `[Vercel cost optimization]` task in `docs/insights-ui/tasks/overall_task.md` already calls this out.
- **Decouple bot crawls from rebuilds.** Each first-view-after-invalidation pays the rebuild cost; subsequent views are pure reads. If Googlebot is the dominant traffic and visits each ticker page once before the next invalidation, you'll see `writes:reads ≈ 2:1` indefinitely. Either rate-limit invalidations to roughly the bot's recrawl cadence, or accept the 2× multiplier as the floor for one-tagged-fetch-per-page ISR.
- **Audit scraper-freshness work during rebuild.** `…/full-render` calls `ensureStockAnalyzerDataIsFresh` and `ensurePriceHistoryIsFresh` once per rebuild. The 7d / 30d / 90d staleness windows in `stock-analyzer-scraper-utils.ts` should keep most of those calls as no-ops, but worth a 24h sample of `UPDATE TickerV1StockAnalyzerScrapperInfo` frequency to confirm.
- **(Optional) Skip HTTP entirely.** Replacing the `…/full-render` fetch with direct Prisma access wrapped in `unstable_cache` would remove the in-region HTTP round-trip while keeping the single Data Cache entry. Lower latency on cold builds; same cache-write count.

## 4) Quick diagnostic checklist

If a future audit shows the multipliers changing, check (in order):

1. Did anyone re-introduce a `revalidateTag` call from a read-path utility? `grep -rn revalidateTag src/` and look for callers that are *not* in `save-report-utils.ts`, `cache-actions.ts`, the admin PUT route, or the `fetch-financial-data` admin route.
2. Did anyone widen a save to use `revalidateAllTickerTags` where a narrow tag would do? Only the admin "Revalidate" button and the admin PUT (move/delete) should ever invoke that.
3. Did any new `<Link>` to `/stocks/[exchange]/[ticker]` drop `prefetch={false}`? `grep -rn 'href={\`/stocks/' src/` — every one of these on a listing surface should disable prefetch.
4. Did anyone add a tagged `fetch()` to the main page (or bypass `…/full-render`)? Each new tagged fetch adds 1 to the per-rebuild write multiplier.
5. Did the cron cadence (`vercel.json` `crons`) get tightened? `*/3` is the floor that drove the existing baseline.
