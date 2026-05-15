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
| `/stocks/[exchange]/[ticker]` (main) | ISR (force-static) | `tickerAndExchangeTag(t,e)` — used by 6 fetches: `…/exchange/<e>/<t>?allowNull=true`, `…/similar-tickers`, `…/financial-info`, `…/quarterly-chart-data`, `…/price-history`, `…/competition-tickers` | `financial-info`, `quarterly-chart-data` (both call `ensureStockAnalyzerDataIsFresh` → may `upsert` `TickerV1StockAnalyzerScrapperInfo`), `price-history` (calls `ensurePriceHistoryIsFresh` → may `upsert` `TickerV1PriceHistory`) |
| `/stocks/[exchange]/[ticker]/business-and-moat` | ISR (force-static) | `tickerCategoryReportTag(t,e,BusinessAndMoat)` — used by 1 fetch: `…/business-and-moat-data` | None — `business-and-moat-data` reads `TickerV1CategoryAnalysisResult` only. (The separate `business-and-moat` API route — without `-data` — is a write-path scraper call used by the LLM pipeline; the page does not hit it.) |
| `/stocks/[exchange]/[ticker]/financial-statement-analysis` | ISR (force-static) | `tickerCategoryReportTag(t,e,FinancialStatementAnalysis)` — 1 fetch: `…/financial-statement-analysis-data` | None — reads `TickerV1CategoryAnalysisResult` only. |
| `/stocks/[exchange]/[ticker]/past-performance` | ISR (force-static) | `tickerCategoryReportTag(t,e,PastPerformance)` — 1 fetch: `…/past-performance-data` | None. |
| `/stocks/[exchange]/[ticker]/future-performance` | ISR (force-static) | `tickerCategoryReportTag(t,e,FutureGrowth)` — 1 fetch: `…/future-growth-data` (slug = `future-growth-data` in `performance-page-utils`) | None. |
| `/stocks/[exchange]/[ticker]/fair-value` | ISR (force-static) | `tickerCategoryReportTag(t,e,FairValue)` — 1 fetch: `…/fair-value-data` | None (fair-value-data is a DB-only read; the LLM-side `refreshMarketSummaryForFairValue` only runs in the report-generation pipeline, not on page render). |
| `/stocks/[exchange]/[ticker]/competition` | ISR (force-static) | `tickerCompetitionTag(t,e)` — 1 fetch: `…/competition-tickers` | None — `competition-tickers` reads `TickerV1VsCompetition` only. |
| `/stocks/[exchange]/[ticker]/management-team` | ISR (force-static) | `tickerManagementTeamTag(t,e)` — 1 fetch: `…/exchange/<e>/<t>?allowNull=true` (same endpoint as main page, but tagged narrowly so it gets its own Data Cache entry) | None. |

**Notes**

- The main page tags all six of its `fetch()` calls with the same umbrella tag. Each fetch is a separate Data Cache entry; they all rebuild together when the umbrella is invalidated.
- Each subpage subscribes to exactly one narrow tag, not the umbrella — so a financial-statement save invalidates the main page + financial-statement subpage and nothing else.
- `business-and-moat-data` ≠ `business-and-moat`. The page reads the `-data` route (DB-only). The non-`-data` route triggers a scraper write and is used only by the LLM generation pipeline.
- `not-found.tsx` for `/stocks/[exchange]/[ticker]` does its own week-long fetch with `tags: [getStocksPageTag('US')]` — a 404 response is itself cached.

## 2) Where the cache is invalidated (write side)

Everything below either calls one of the `revalidate*` helpers in `utils/ticker-v1-cache-utils.ts` or relies on a fetch-level `revalidate` window.

| Trigger | Source file | Which tags |
|---|---|---|
| LLM save: business/financial/past/future/fair-value factor result | `utils/analysis-reports/save-report-utils.ts` → `saveFactorAnalysisResponse` → `bumpUpdatedAtAndInvalidateCache(record, {kind:'category', category})` | `tickerCategoryReportTag(t,e,category)` always, `tickerAndExchangeTag(t,e)` unless `skipRevalidation` |
| LLM save: competition | `save-report-utils.ts` → `saveCompetitionAnalysisResponse` → `bumpUpdatedAtAndInvalidateCache(record, {kind:'competition'})` | `tickerCompetitionTag(t,e)` always, umbrella unless `skipRevalidation` |
| LLM save: management team | `save-report-utils.ts` → `saveManagementTeamResponse` → `bumpUpdatedAtAndInvalidateCache(record, {kind:'managementTeam'})` | `tickerManagementTeamTag(t,e)` always, umbrella unless `skipRevalidation` |
| LLM save: investor analysis | `save-report-utils.ts` → `saveInvestorAnalysisResponse` → `bumpUpdatedAtAndInvalidateCache(record, {kind:'core'})` | umbrella only (no subpage renders this slice) |
| LLM save: final summary | `save-report-utils.ts` → `saveFinalSummaryResponse` | umbrella only, unless `skipRevalidation` |
| Admin "Revalidate" button on a ticker page | `app/stocks/[exchange]/[ticker]/StockActions.tsx` → `cache-actions.ts#revalidateTickerCache` → `revalidateAllTickerTags` | umbrella + competition + management-team + all 5 category tags |
| Admin PUT to `…/exchange/<e>/<t>` (edit stockAnalyzeUrl / mark moved / mark deleted) | `app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/route.ts` putHandler | `revalidateAllTickerTags` — every per-ticker tag (moved/deleted state is enforced at the top of every per-ticker page render) |
| Admin "Refresh financial data" batch | `app/api/[spaceId]/tickers-v1/fetch-financial-data/route.ts` | umbrella only (scraper data only feeds the main page) |
| Time-based fetch revalidate on the main page's `financial-info`, `quarterly-chart-data`, `price-history` fetches | `app/stocks/[exchange]/[ticker]/page.tsx` (`EIGHT_DAYS_IN_SECONDS`) | Not a tag invalidation — just the three Data Cache entries expire after 8 days, forcing those three fetches to re-execute. The page HTML itself is not invalidated by this; it only rebuilds if one of those fetches' response actually changes downstream behavior (it doesn't, because the page already holds the rendered output). In practice this is a backstop for dormant tickers so the underlying scraper data can refresh without an external invalidation. |
| `ensurePriceHistoryIsFresh`, `fetchAndUpdateStockAnalyzerData`, `refreshMarketSummaryForFairValue` | `utils/price-history-utils.ts`, `utils/stock-analyzer-scraper-utils.ts` | **Intentionally none.** Per #1472, these used to call `revalidateTag` from the read path and were evicting the cache entry that was about to be filled — that's removed. |
| ETF-only cache invalidations | `utils/etf-*` files | Out of scope; don't touch ticker tags. |

**No-op for ticker caches** (worth confirming so they don't show up in future audits): tariff cache utils, ETF cache utils, scenario cache utils, daily-mover cache utils, portfolio-manager cache utils. None of those revalidate a `ticker_*` tag.

## 3) Why ISR writes can still exceed reads after #1472 + #1473

The merged work eliminated **unnecessary** invalidations (read-path revalidates, every-subpage-on-every-save, prefetch-driven rebuilds). It did **not** change the fact that, on a Vercel-style cache meter, the main ticker page now writes **one HTML entry plus six Data Cache entries per rebuild** — because the page render calls six distinct tagged `fetch()`es and each one is a separate cache entry under the unified Cache metric.

So for the main page, a single rebuild ≈ 7 cache writes. If the page is rebuilt R times and read V times in a window, the meter shows roughly `writes ≈ 7R`, `reads ≈ V`. For the meter to show `writes > reads` you only need `V < 7R` — i.e., fewer than 7 page views per rebuild on average. With the `*/3 * * * *` `generate-ticker-v1-request` cron processing up to 10 generation requests every 3 minutes, the umbrella tag for any ticker that finishes a regen during the window gets invalidated once — and the next view (often a single crawler hit, since `prefetch={false}` removed App-Router-driven prefetches) costs 7 writes for 1 read. With ~200 tickers/hour being processed by the cron, the 833 writes/hour on `/stocks/[exchange]/[ticker]` reported in production matches a roughly 100–120 invalidation/hour ratio with sparse organic traffic.

For `/competition`, one rebuild ≈ 2 writes (HTML + 1 Data Cache entry for `…/competition-tickers`). The observed 7.6K writes / 4.5K reads ≈ 1.7:1 maps to ~1.18 views per rebuild — same shape, smaller multiplier.

**This is expected for the current architecture.** The remaining levers to push writes down further:

- **Consolidate the main page's six `fetch()` calls into a single API.** Today the main page hits six internal endpoints during render; each is one Data Cache entry. A single `…/exchange/<e>/<t>/full-render` endpoint (or direct Prisma access from the server component, skipping HTTP) would collapse rebuild cost to 1 HTML + 1 Data Cache entry, dropping the multiplier from ~7× to ~2×. The 8-day backstop revalidate moves to the consolidated fetch.
- **Lengthen the cron cadence.** `*/3 * * * *` is 480 firings/day. Each firing that produces a `FINAL_SUMMARY` save invalidates one umbrella tag. Moving to `*/10` or batching multiple completed regens into a single revalidate call would cut umbrella invalidations by 3×. The `[Vercel cost optimization]` task in `docs/insights-ui/tasks/overall_task.md` already calls this out.
- **Decouple bot crawls from rebuilds.** Each first-view-after-invalidation pays the rebuild cost; subsequent views are pure reads. If Googlebot is the dominant traffic and visits each ticker page once before the next invalidation, you'll always have `writes:reads ≈ 7:1`. Either rate-limit invalidations to roughly the bot's recrawl cadence, or accept the multiplier and reduce the per-rebuild write count instead.
- **Move the read-path scraper writes off the page-render fetch path.** Today `…/financial-info`, `…/quarterly-chart-data`, and `…/price-history` each call `ensureStockAnalyzerDataIsFresh` / `ensurePriceHistoryIsFresh`, which can `upsert` rows when they're stale. The 8-day fetch revalidate means those upserts now fire at most every 8 days per dormant ticker — but on active tickers the umbrella keeps invalidating and each rebuild re-runs the freshness check. If the freshness windows in the scraper utils (7-day for summary, 30-day for dividends/quarter, 90-day for annual) are wider than the umbrella's typical invalidation cadence, the upserts are mostly no-ops and the DB-write count is fine; if they're tighter, they're piling on. Worth a 24h sample of `UPDATE TickerV1StockAnalyzerScrapperInfo` frequency to confirm.

The "fix" the user is asking about — getting reads > writes — is not achievable while the page architecture is "six tagged internal fetches per main-page render." Either consolidate fetches (large refactor) or accept that on a multi-fetch ISR page the cache-write count is dominated by `(fetches per page) × (rebuilds)`, not by user reads.

## 4) Quick diagnostic checklist

If a future audit shows the multipliers changing, check (in order):

1. Did anyone re-introduce a `revalidateTag` call from a read-path utility? `grep -rn revalidateTag src/` and look for callers that are *not* in `save-report-utils.ts`, `cache-actions.ts`, the admin PUT route, or the `fetch-financial-data` admin route.
2. Did anyone widen a save to use `revalidateAllTickerTags` where a narrow tag would do? Only the admin "Revalidate" button and the admin PUT (move/delete) should ever invoke that.
3. Did any new `<Link>` to `/stocks/[exchange]/[ticker]` drop `prefetch={false}`? `grep -rn 'href={\`/stocks/' src/` — every one of these on a listing surface should disable prefetch.
4. Did anyone add a tagged `fetch()` to the main page? Each one adds 1 to the per-rebuild write multiplier.
5. Did the cron cadence (`vercel.json` `crons`) get tightened? `*/3` is the floor that drove the existing baseline.
