# KoalaGains — Open Tasks

Single source of truth for active KoalaGains work. Completed items live in
[`closed-tasks.md`](./closed-tasks.md).

---

## Stocks

### Detail page

- [ ] **Mobile layout audit** — fix overflow tables, cut-off charts, font/spacing/sticky-header/tap-target issues; verify after any restructure.
- [ ] **Move competition chart** directly under the Business & Moat section, with the competitors list adjacent.
- [ ] **SEO — "Crawled — currently not indexed" on `business-and-moat-sitemap.xml`** — export affected URLs, audit for thin/duplicative content, weak canonicals, render-blocked content, slow CWV, duplicate titles, sitemap hygiene; fix in priority order (unique per-ticker content → titles/meta → internal linking → SSR/canonical); re-submit validation; add weekly indexed-URL delta report and a pre-publish content-completeness gate; generalize fix to the other per-section sitemaps.

### Off-hours Claude Code automation

- [ ] **Off-hours report-refresh cron** (10 PM – 5 AM, local TZ documented) — pick oldest reports, batch + per-tick timeout, skip recently-refreshed, hard stop at window end, retry cap on failure, per-run log + admin failure surface, env-configurable window/batch/threshold/enable flag. Decide which report categories are in scope.
- [ ] **Internet-augmented generation** — prompts must use the web to fill missing inputs + pull latest (recent earnings, 8-Ks, exec changes, news, regulatory actions); cite source URL + `accessedAt`; restrict to reputable sources; persist `internetAugmented` flag + cited-URL count on each report; surface in admin; validate vs pre-cached baseline.
- [ ] **Off-hours recategorization** — separate scheduled job that sweeps every ticker, feeds taxonomy + company profile to Claude, applies high-confidence `changeTo` decisions, flags low-confidence for review, triggers report generation for new (sub)categories; cap recategorizations per run; per-stock audit trail; hysteresis guard against thrashing.

### Stock scenarios — finish + roll out

- [ ] **Phase 2 — reverse link on stock report pages**: new `GET /api/[spaceId]/stock-scenarios/for-symbol?symbol=...`; render "This stock appears in the following scenarios" block on `app/stocks/[exchange]/[ticker]/page.tsx` (title link, direction/timeframe/probability badges, role pill, per-link `expectedPriceChange`); cache-tag with `stockScenarioBySlugTag` + new per-symbol tag.
- [ ] **Phase 3 — seed content**: draft 15–30 stock scenarios in the markdown-parser format (5 winners + 5 losers + 5 most-exposed per scenario, smallest correct `countries[]`, pure-play tickers over diversified giants); import via admin "Import from doc".
- [ ] **Phase 4 — Claude-assisted draft + auto-refresh outlook**: Claude proposes candidate stocks + roles + priced-in assessment for human review (reuse `AUTOMATION_SECRET` POST `/api/stock-scenarios`); scheduled job revisits `outlookAsOfDate` > N weeks old and asks Claude whether thesis still holds.
- [ ] **Roll-out surfaces** (cross-cuts Phase 2): home-page entry point, link in main stocks nav, stock-scenarios sitemap route wired into the parent sitemap index, unique per-scenario titles/meta to pre-empt the SEO indexing trap.
- [ ] **Open questions to resolve before further schema work**: shared `Scenario` table vs parallel tables (stocks/ETFs); scenario numbering across asset classes; cross-asset section on detail page; delisted-ticker handling on link rows; sub-industry tagging for breadth; `countries[]` removal semantics (reject vs auto-archive orphans); default country filter on listing; FK target (`TickerV1` vs `Ticker` vs loose); ADR / dual-listing modelling; markdown parser format for non-US tickers; shared scenario enums rename + re-export shim; sitemap entries (also add for ETF scenarios); per-symbol reverse-link cache-tag name.

### Founder / management team — LinkedIn-sourced info

- [ ] `keyPeople: { role, name, title, linkedinUrl, photoUrl?, tenureSinceYear?, isFounder, bio, source }[]` on each ticker (founders, CEO, CFO, COO/President, distinct board chair); `updatedAt` / `verifiedAt` audit fields.
- [ ] Acquisition strategy: **no LinkedIn scraping** — pull leadership from company About / 10-K / 20-F / proxy / IR via `scraping-lambdas`; enrich LinkedIn URL via admin curation or paid people-data provider.
- [ ] Render a **Leadership** block on the stock detail page (compact on main page, full list on per-section detail page); cards with photo, title, "Founder" badge, tenure, bio, LinkedIn icon (`nofollow noopener external`).
- [ ] Feed the block into Business & Moat prompt input and into the 10-bagger founder/owner-operator score.
- [ ] Quarterly re-ingest on off-hours runner; admin verification UI flags rows older than N months.
- [ ] Open: legal sign-off on storing only the public LinkedIn URL; minimum coverage threshold to render; `Person` table vs denormalized per ticker.

### 10-bagger shortlist — small-cap candidates filtered by Business & Moat

- [ ] Cast initial pool: small-cap band, Business & Moat ≥ 4, liquidity floor (≥ $1M ADV), data-complete + recent reports.
- [ ] Evaluate each survivor through 10-bagger lens: TAM/runway, unit economics + margin path, reinvestment ROIC, founder/owner-operator quality, niche dominance, optionality, concentration risks, catalysts, "why hasn't it rerated already?"
- [ ] Score 1–5 per lens dimension; require average ≥ 3.5 to make the shortlist; hand-pick top ~10 names.
- [ ] Surface at `/stocks/10-baggers` (or under a "Watchlist" area) — one card per name with score, market cap, 1-paragraph thesis; methodology + filters visible.
- [ ] Re-run quarterly on the off-hours Claude-Code runner; track entries added/removed/promoted/cut.
- [ ] Open: persist `tenBaggerScore` + subscores on `TickerV1` so the score is queryable independent of the shortlist; honorable-mentions tier vs hard cut; geographic scope (US-only first, Canadian small-caps after Canadian universe lands).

### Custom Reports ("random reports") per stock

> Source: PR #1318 description has full spec.

- [ ] **Data model**: `TickerV1CustomReport` (title, userQuestion, optional `templateKey`, denormalized latest answer markdown/JSON/sources/runId, status, archived, audit); `TickerV1CustomReportRun` linked to `PromptInvocation`; optional `TickerV1CustomReportTemplate` for curated templates.
- [ ] **API** under `/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/custom-reports`: `GET` list, `POST` create (kicks off first Run), `GET /[reportId]` with all Runs, `POST /[reportId]/regenerate`, `PATCH /[reportId]`; admin templates route; thin handlers, work in `src/utils/analysis-reports/custom-report-utils.ts`.
- [ ] **Prompt infra**: all LLM calls via `getLLMResponseForPromptViaInvocation` with single generic `promptKey: 'US/public-equities-v1/custom-report'`; `inputJson` carries ticker context + user's question or resolved template.
- [ ] **Output**: `answerMarkdown` + `answerJson: { summary, keyPoints[], verdict?, confidence?, sources?[] }`.
- [ ] **UI**: Custom Reports section on V1 stock detail page (card grid, empty state, [+ New Report] button); sub-page `custom-reports/[reportId]/page.tsx` (markdown render, sources, Regenerate, collapsed Runs history); new-report modal (From template vs Free-form tabs); admin template CRUD.
- [ ] **Flow** (v1 synchronous): create Report + first Run, await `getLLMResponseForPromptViaInvocation`, populate Run + denormalized fields on success; keep prior successful answer on failure.
- [ ] **Permissions/quotas**: space-scoped membership check; per-user quota per ticker per day; hard output-length cap; no recursive web-research tools in v1; archive-only.
- [ ] **Phased rollout**: P0 schema + admin templates → P1 list/detail/from-template modal → P2 free-form behind flag + quota → P3 streaming + web-search citations + history diff.
- [ ] Open: streaming vs spinner (default spinner); free-form at launch (default behind flag); citations design; cross-ticker reports out of scope.

### Daily top movers — dedupe historical duplicates + harden ingest

- [ ] **De-duplicate `daily_top_losers` / `daily_top_gainers`** — historical bug wrote multiple near-identical rows for the same ticker across weekends + US market holidays (~23% of loser rows belong to a `(symbol, %change)` cluster; 140 clusters, 344 rows). Each row got its own UUID, its own sitemap entry, and its own LLM-rewritten article, so GSC reports them as "Duplicate without user-selected canonical". Approach: add a nullable `canonicalId` self-FK to both tables; backfill the earliest-`createdAt` row per `(spaceId, symbol, percentageChange)` cluster as canonical, point the rest at it; in `app/daily-top-movers/top-(losers|gainers)/details/[id]/page.tsx` `permanentRedirect()` when `canonicalId` is set; filter `sitemap.xml/route.ts` and the list APIs feeding `RelatedDailyMovers` on `canonicalId IS NULL`. Validate with sitemap row-count drop + GSC duplicate-bucket shrink over 2–4 weeks.
- [ ] **Stop creating new duplicates on US market holidays** — Mon-Fri cron (`deployments/insights-ui/scheduler.tf`) still fires on Good Friday / Presidents' Day / Memorial Day etc.; screener returns the prior trading day's data, callback writes a new row. Fix in `app/api/[spaceId]/tickers-v1/screener-callback/route.ts`: skip writes when a row already exists for `(spaceId, symbol)` with the same `percentageChange` within the last ~3 days. Or upgrade the unique constraint from `@@unique([spaceId, symbol, createdAt])` to a derived `marketDate` column so it's idempotent by definition.

### Login improvements

- [ ] Add **LinkedIn** SSO + **Yahoo** SSO; account-linking when a new provider matches an existing email; keep login sheet tidy (top 3–4 most-used).
- [ ] Post-login resume — after sign-in from the click-count gate, complete the action the user was taking.
- [ ] Telemetry — events for click counted / gate shown / gate→login / gate dismissed; admin dashboard for conversion rate.
- [ ] Open: gate threshold (2 vs 3) behind a config flag for A/B; soft banner before hard gate; never re-show gate to logged-in users.

---

## ETFs

### Top priorities

- [ ] **Claude-Code Sonnet pipeline** — off-hours runner where Claude Code (Sonnet) generates stock + ETF reports through the existing prompt/`PromptInvocation` infra; one shared runner drains both queues. DOD: scheduled run produces a night's worth of refreshed reports without human in the loop.
- [ ] **Split the Index & Strategy field** into structured sub-fields: at minimum `introParagraph` + `strategy`, plus 2–3 of `indexMethodology` / `rebalanceApproach` / `replicationStyle` / `keyConstraints` (finalize during implementation). Update prompt, output JSON contract, persistence, and detail-page rendering together; sanity-check via the 3.2 tuning loop.
- [ ] **ETFs list page — `isComplete` filter + admin toggle**
  - Define "complete" precisely (all core data fields populated; every evaluation-category report generated and non-failed: Performance, Cost & Team, Risk, Summary, Index & Strategy, Future Outlook; Final Summary generated). Persist as `Etf.isComplete` updated by the generation pipeline.
  - Default public list filters to `isComplete = true`; also applies to sitemap + any featured rails.
  - Admin "Include incomplete ETFs" toggle (localStorage-persisted) reveals all ETFs with a per-row 6-dot completeness indicator + quick links into 1.4 generation requests.
  - Incomplete ETFs remain reachable by URL (no 404) but omitted from default list/sitemap/search; detail page shows neutral "report in progress" state for missing sections.
- [ ] **ETF discoverability + internal linking** (after the list page lands):
  - Home page → ETFs: pick entry points (hero / nav / featured rail / "browse by category-group") so first-time visitors reach the ETFs list and representative detail pages in one click.
  - ETF detail → stock reports: link each covered holding's ticker through; plain text otherwise.
  - Stock detail → ETF reports: list top-N (by weight) ETFs that hold the ticker.
  - Revisit cross-links from category / scenario / trends pages so the link graph is dense.

### Performance optimization (parity with stock-page perf work)

> Stocks had a multi-PR perf pass — cache fan-out (#1472, #1473), `force-dynamic` ISR-off migration (#1499), CloudFront page+API caching (#1501, #1504), the `/full-render` consolidation that hurt Lighthouse and got reverted in favor of per-slice Suspense streaming (#1486 → #1507), and a 1w→2w revalidate bump (#1423). ETFs got partial parity at the CloudFront-API layer via #1581 (enumerates `/full-render`, `/analysis`, `/mor-info`, `/portfolio-holdings`) and at the ISR-off layer via #1499 (all 22 ETF pages now carry `force-dynamic`). Several other landed stock optimizations were NOT carried over. Walk the stock perf series end-to-end and apply each surviving (non-reverted) win to ETF surfaces. **Do not revert `force-dynamic` or add `generateStaticParams` — that is the model #1499 chose, with CloudFront in front absorbing hot traffic.**

- [ ] **Baseline measurement** — for 3 representative ETFs (a popular passive like VOO, an active fund, a thinly-traded one) and 2 listing URLs (`/etfs`, `/etfs/groups/[group]`), capture median of 5 Lighthouse runs (FCP / LCP / TBT / Speed Index / CLS), Vercel Cache Writes:Reads ratio over 24h, and CloudFront `x-cache` hit-rate. Persist to `docs/insights-ui/etf-page-caching.md` (paralleling `stock-page-caching.md`) so each follow-up PR can append a delta row.
- [ ] **Restore per-slice Suspense streaming on `/etfs/[exchange]/[etf]`** (mirror of #1507's revert of #1486 on the stock page). Today `insights-ui/src/app/etfs/[exchange]/[etf]/page.tsx` (line 148) does a single `await fetchEtfFullRender(...)` and blocks all HTML emission on the full payload — only the radar chart is in a `<Suspense>`. This is the exact pattern stocks reverted because it pushed FCP to 4.2s / LCP to 13.3s on Lighthouse. Split back into a lightweight ETF-identity fetch awaited up-front for shell + redirect, plus per-slice fetches (`financialInfo`, `priceHistory` / `performanceMetrics`, `keyFacts`, `holdings`, `analysis`, `similarEtfs`, `competition`, `keyMetrics`) wrapped in `<Suspense fallback={<Skeleton />}>` boundaries so shell + skeletons paint immediately. Use the post-#1507 stock page (`insights-ui/src/app/stocks/[exchange]/[ticker]/page.tsx`) as the template. After this, decide what to do with the now-orphaned `/full-render` endpoint, `etf-full-render-utils.ts`, and the CloudFront cache behavior added by #1581 — leave as harmless dead weight or remove in a follow-up PR (mirror of the "Dead code after this PR" note in #1507).
- [ ] **Lazy-load chart.js on ETF pages** (mirror of stocks' `PriceChartLazy.tsx` + `QuarterlyMetricsChartLazy.tsx`). `insights-ui/src/components/etf-reportsv1/EtfChartTabs.tsx` imports `PriceChart` directly (line 4) and registers `chart.js` at module top (line 5) — chart.js lands in the main bundle even when the user never opens a chart tab. Wrap chart bodies in `next/dynamic` (`ssr: false`) so chart.js is code-split out. Audit every other ETF surface that renders a chart (`EtfRadarChart`, `EtfCompetitionChartSection`, `performance-returns` / `future-performance-outlook` / `risk-analysis` subpages) for the same issue.
- [ ] **`prefetch={false}` on every ETF-bound `<Link>`** (mirror of #1472 part 3 for stock cards). Listing pages (`/etfs`, `/etfs/groups/[group]`, `/etfs/categories/[category]`, `/etfs/countries/[country]`, `/etfs/asset-classes/[assetClass]`, `/etfs/providers/[provider]`, plus `SimilarEtfs` and any ETF card grid) render dozens of cards each; App Router prefetches every link in the viewport, wasting bandwidth and reheating SSR after invalidations. Audit every `<Link href={...etf...}>` and add `prefetch={false}`.
- [ ] **Extend cached-fetch `revalidate` from 1w to 2w on ETF surfaces** (mirror of #1423, which explicitly excluded ETFs). Walk every `next: { revalidate: ... }` in the ETF page tree (`etf-cache-utils.ts`, ETF listing + detail + sub-page + scenarios fetches) and bump 1w (`604800`) → 2w (`1209600`); `TWO_WEEKS_IN_SECONDS` is already exported from `etf-cache-utils.ts` — switch any remaining 1w callers to it. Skip fetches where a tighter cadence is intentional (price-history / analyzer freshness) per #1473's reasoning.
- [ ] **Audit ETF cache-tag fan-out** (mirror of #1472 parts 1+2 and #1473). Confirm `etf-cache-utils.ts` follows the umbrella + per-subpage narrow-tag split landed for stocks: a partial regen touching one ETF analysis category should NOT invalidate every other category subpage or `/competition` / `/holdings`. Verify no read-path utility (price/performance freshener, analyzer-data refresher) calls `revalidate*` while serving an API request (the bug fixed in #1472 part 1). Verify `bumpUpdatedAtAndInvalidateCache` fires the narrow tag immediately and only defers the umbrella under `skipRevalidation` (#1473 part 1). Document findings in `etf-page-caching.md`.
- [ ] **Validate `force-dynamic` + CloudFront edge are actually paying off on ETFs**. All 22 ETF pages already carry `force-dynamic` (#1499) and #1581 added CloudFront API caching for `/full-render`, `/analysis`, `/mor-info`, `/portfolio-holdings`. Confirm via Vercel metrics that Cache Writes on `/etfs/*` are flat (no ISR HTML writes) and via response headers that CloudFront `x-cache: Hit from cloudfront` fires on a warm second hit for both `/etfs/{exchange}/{etf}` and the four cached API endpoints. If hit-rate is low, follow the diagnostic checklist in `docs/insights-ui/cloudfront-deploy-skew.md`. **Keep `force-dynamic` in place** — do not flip back to `force-static` / ISR.
- [ ] **Re-measure + document gains** — after each PR lands, re-run the baseline harness above and append a delta row to `etf-page-caching.md`. Stop pulling further levers once Lighthouse LCP < 5s on the detail page and CloudFront hit-rate on the cached API paths is healthy.

### Active-ETF management team — LinkedIn-sourced info (ETF-side parallel to stock task)

- [ ] Filter to active ETFs only via `Etf.isActive` (or `managementStyle` enum); suppress entirely for passive/index.
- [ ] `keyPeople` shape mirrors the stock model (`role`, `name`, `title`, `linkedinUrl`, `photoUrl?`, `fundTenureSinceYear?`, `isLeadPM`, `bio`, `source`).
- [ ] Acquisition: prospectus / SAI / issuer Leadership pages / fund fact sheets; reuse `scraping-lambdas` extractor; LinkedIn URL enriched on top.
- [ ] Investment Team block on active-ETF detail page (under Strategy or alongside Cost & Team); cards same shape as stocks.
- [ ] Feed the block into the Cost & Team prompt input so the team narrative grounds in real PM tenure.
- [ ] Quarterly re-ingest; admin verification UI for stale rows.
- [ ] Open: compliance (store URL only); coverage threshold; cross-fund PM modelling (`Person` table vs denormalized); confirm we never render for passive products.

### Misc prompt updates

- [ ] Include the **report-generation date** in the Final Summary prompt so the date appears in the output.

### Simplify analysis factors + prompt instructions

- [ ] **Trim `etf-analysis-factors-*.json`** — current factor descriptions in `insights-ui/src/etf-analysis-data/etf-analysis-factors-{performance-and-returns,cost-efficiency-and-team,risk-analysis,future-performance-outlook}.json` carry long edge-case clauses per factor (leveraged decay, futures-roll, peer-group caveats, etc.). Tighten each `factorDescription` to a single short paragraph that names what is being measured and how to read it; push group-/asset-class-specific edge-case guidance into the live prompt body or into a small companion notes block so the factor JSON stays scannable.
- [ ] **Simplify the per-prompt instruction blocks** in the live ETF analysis prompts (Past Returns, Cost Efficiency & Team, Risk Analysis, Future Performance Outlook, Index & Strategy, Final Summary). Cut duplicated boilerplate across prompts, deduplicate guidance that already appears in factor JSON, and keep each prompt's "instructions" section focused on the rules the LLM actually needs at generation time (output schema discipline, citation rules, what to skip when data is missing).
- [ ] Re-run the prompt-finalization loop (`docs/insights-ui/etf-prompts/prompt-finalization-approach.md`) against the representative-ETF set after each pass; verify outputs don't regress on edge cases that were previously inlined in the factor descriptions.
- [ ] Open: do the same simplification pass on stock analysis factors / instructions, or keep that as a follow-up after the ETF pass is validated?

### Comparison "base" per ETF group — open questions

- [ ] Pick a fixed-income base (one vs 3–4 keyed to duration + credit): AGG/BND, ICE BofA family, Bloomberg Global Aggregate, or per-segment.
- [ ] For every group in `etf-analysis-categories.json` (broad equity, sectors, factor/style, fixed-income-core, muni, leveraged-inverse, commodities, alternatives, crypto, multi-asset, currency, etc.) pick **primary + optional secondary** base with one-line rationale. Equity sub-groups: confirm S&P Global vs sector-specific. Commodities: GSCI / BCOM vs per-commodity spot. Alternatives / multi-asset: 60/40 proxy, HFR sub-index, or skip. Crypto: BTC/ETH spot vs crypto-index ETF. Currency: DXY vs trade-weighted.
- [ ] Tighten how the base is used in the report — performance comparisons (1y/3y/5y total return, max DD, Sharpe) vs base + category aggregates; surface beta / tracking error / correlation where it makes sense.
- [ ] Storage: `insights-ui/src/etf-analysis-data/etf-comparison-bases.json` keyed by group with `{ primary: { symbol, name, source }, secondary?, rationale }`; injected into generation pipeline.
- [ ] Prompt impact: every "vs. category" claim paired with "vs. {comparisonBase.name} ({comparisonBase.symbol})".

### Phase 4 — SEO, metadata, sitemap

- [ ] SEO/metadata review after new sections — titles/descriptions cover comparison + competition keywords; JSON-LD remains valid and updated.
- [ ] Daily generation + sitemap updates — generate 5–10 ETFs daily; push generated URLs to sitemap (or sitemap index) automatically.

### Suggestion — Connect ETFs to the home page + categorization

> ETF category pages and country pages exist (see closed-tasks). Remaining:

- [ ] **Add an ETF section on the home page** — mirror stocks-by-industry; group by `category` (Morningstar), cards link to category pages.
- [ ] **Group the `/etfs` listing by category** — top categories first with "View all" per category; keep full search/filter behind a power-user view.
- [ ] **Add ETF country pages** (later) — `/etfs/countries/[country]` route exists; finish data wiring + sitemap + SEO once category pages are battle-tested.
- [ ] **Cross-link from ETF detail pages** — category name links to the category page; small "Related ETFs in this category" block at the bottom.

### ETF listing pages — UI fixes

- [ ] **Audit + fix UI issues across the ETF listing surfaces** — `/etfs` (index), `/etfs/categories` (+ `[category]`), `/etfs/countries` (+ `[country]`), `/etfs/asset-classes` (+ `[assetClass]`), `/etfs/groups` (+ `[group]`), `/etfs/providers` (+ `[provider]`). Walk each page on desktop + mobile and capture concrete issues here as sub-bullets before scheduling fixes: layout/spacing, card alignment, header + breadcrumb consistency across the sub-listing variants, empty/loading/error states, sort + filter UX, pagination, and dark/light theme rendering. Cross-check against the `isComplete` filter behavior once that lands.

### Known limitations in the new 8-group taxonomy (follow-up cleanups)

- [ ] **Split strategy funds back out of `derivative-income`** — managed-futures / market-neutral / long-short (~50 funds) don't share a decision framework with the ~600 option-engineered payoff funds; prompt has to branch internally. Highest-impact follow-up.
- [ ] **Carve broad EM (EEM/VWO/IEMG, ~111 funds) out of `sector-thematic-equity`** — regional-diversification sleeve, not a thematic bet. Single-country EM (China/India/LatAm) stays in sector-thematic.
- [ ] **Re-introduce a floating-rate bond group** — TLT (-31% in 2022) and BIL (+1%) shouldn't share `investment-grade` factors; JAAA (+1%) and HYG (-11%) shouldn't share `credit-and-income` factors. Bundle bank loans + AAA CLO + ultrashort + money market separately.

---

## Stocks & ETFs common

### Trends page

> Decide once: shared `Trend` model linked to both stock and ETF join tables, or parallel
> `StockTrend` / `EtfTrend` models. Leaning shared (same underlying cause / analog).

- [ ] **Schema** (mirroring `EtfScenario` shapes): `Trend` (title, slug, summary markdown, direction `UPSIDE`/`DOWNSIDE`, timeframe `FUTURE`/`IN_PROGRESS`/`PAST`, probability bucket + optional %, priced-in bucket, expected price change + explanation + timeframe explanation, `outlookAsOfDate`, evidence/sources, archived, audit) + `TrendStockLink` / `TrendEtfLink` (with `role` = `WINNER`/`LOSER`/`MOST_EXPOSED`, per-asset role explanation + expected change, `sortOrder`). Space-scoped, cache-tag revalidation, Zod boundaries.
- [ ] **Authoring**: admin upsert modal (pattern: `UpsertEtfScenarioModal.tsx`); optional Claude-assisted draft; bulk markdown import (pattern: `etf-scenario-markdown-parser.ts`).
- [ ] **Trends index page** — card grid with direction/probability/timeframe badges; client-side filter bar.
- [ ] **Trend detail page** — cause, historical analog, priced-in + expected move box, winners/losers side-by-side, most-exposed section, outlook with `outlookAsOfDate`; JSON-LD Article schema.
- [ ] **Reverse links** — both stock and ETF detail pages link to the trends that reference them (do not defer the reverse link).
- [ ] Open: trend taxonomy beyond scenario fields (macro/demographic/generational/technological/regulatory)?

### Social media content pipeline

- [ ] **Sources to mine**: stock + ETF scenarios, 10-bagger shortlist, founder + PM profiles, off-hours-refreshed reports (verdict / fair-value diffs), trends.
- [ ] **Templates**: scenario card post; top-N post; founder / PM spotlight; verdict-change post; trend post.
- [ ] **Platforms**: start LinkedIn + X (primary); Reddit (relevant subs), Threads, YouTube Shorts / IG Reels (secondary, after the first two are humming).
- [ ] **Pipeline**: post-draft generator via existing prompt infra; lightweight admin content queue (review, edit, platforms, schedule); push to a scheduling tool (Buffer / Hootsuite / Hypefury, or in-house thin scheduler); UTM-tagged links back to KoalaGains.
- [ ] **Cadence + governance**: weekly minimum mixing stock + ETF; one weekly queue owner; compliance pass on every post (no advice phrasing, disclaimers, claims grounded in reports).
- [ ] **Measurement**: per-platform impressions/engagement/clicks + per-source-artifact attribution; high engagement feeds off-hours refresh prioritization so winning posts don't link to stale reports.
- [ ] Open: build vs buy scheduler; single voice vs platform-tailored; share queue + templates with ETF pipeline (only input adapter differs).

---

## Tariffs

### Refresh + simplify reports

- [ ] **Top-of-page snapshot block** (above the fold): industry + countries headline; headline tariff numbers (current rate, rate N months ago, delta); "Last updated YYYY-MM-DD"; 3 bullets ("What's new", "Who's affected", "What to watch").
- [ ] **Cut body length** — consolidate boilerplate into linked explainer pages; replace dense tables with focused charts; target 800–1500 words per report.
- [ ] **In-page navigation** — sticky TOC / section jump nav; per-subsection anchor links.
- [ ] **Mobile pass** — verify headline numbers, charts, snapshot block render cleanly on a phone before shipping.
- [ ] **Reader actions** — "subscribe for updates on this industry/country" CTA tied into the click-count login gate; "share" / "copy link" affordance for the most-shared sections.

### Internal linking pass (standalone single PR)

- [ ] Confirm home + hub surfaces link to `/tariff-reports` and a curated set of high-traffic industry covers (one click from home to the most popular tariff reports).
- [ ] Server-render every link (no client-only `useEffect` rails).
- [ ] Reuse the existing `tariff_report:<INDUSTRYID>` cache tag; if a link block reads from a different source (ETF index, stock index) tag the fetch with that source's tag too.
- [ ] Stable anchors derived from country / area slug (not generated index) so inbound links don't rot on regeneration.
- [ ] Guard outbound links — only render when the target exists.

### Operational + measurement

- [ ] Capture baselines (organic sessions, time on page, bounce, scroll depth, indexed-URL count for tariff sitemaps); monitor Search Console for tariff URLs after refresh; watch for the same "Crawled — currently not indexed" pattern.
- [ ] Sitemap hygiene — `industry-tariff-report/sitemap.xml` only lists URLs with refreshed content above a minimum quality bar (`isComplete`-style); `lastmod` reflects refresh time, not build time.
- [ ] Engagement check 2 weeks post-PR: rail-click events + indexed-URL delta documented in `../tariffs/`.

### Strategic-intelligence features

> Lower build effort, high leverage in the current architecture — reuse what the pipeline
> already produces (industry impact, country-specific tariff updates, company impact
> categorization).

- [ ] **Country-pair compare view** — Industry × Exporter × Importer (+ compare-against), delta view, AI explanation of why the lane matters and which company archetypes win/lose.
- [ ] **Company impact screener** — Company → tariff exposure (positive/negative by industry area + country, "why impacted" snippets, link back to industry sub-section that justified it).
- [ ] **Freshness + evidence panel** on every tariff claim block — data vintage, source links, "what changed" diff across report versions.
- [ ] **Watchlists + alert digests** — subscribe to industries / country pairs / companies / major-change triggers (new trade remedy, tariff jump > threshold); daily/weekly digest.
- [ ] **Standardized tariff exposure scorecard** at the top of each report — shock intensity, trade-lane concentration, company vulnerability (heuristics, not econometric).
- [ ] **Related-industry spillover navigation** using `TariffIndustryDefinition` adjacency — upstream/downstream + spillover summary cached per pair.
- [ ] **Schema'd export bundle** — PDF / MD / JSON exports for consultants and teams.
- [ ] **Trade-remedy and NTM overlay** — country-pair callout + structured link panel into a trade-remedy explorer by product/year.
- [ ] **Bilateral change feed** using tariff-actions data — filterable "what changed this week" by country pair + HS6 → industry; effective dates, prior/current rates, "industry implication" summary.
- [ ] **Scenario simulator lite** — choose baseline + alternative source lanes → tariff delta + shipping + pass-through % → sensitivity plot + narrative.
- [ ] **Rules-of-origin assistant layer** (rolls up #16) — guided rules narrative across agreements, not raw legal text.

---

## Site-wide / Other

- [ ] **Dark/light theme toggle** — some users find current dark theme reports unreadable. Decide: global header vs per-report toggle; default theme for first-time visitors; persist per user (cookie / localStorage); print-friendly variant separate from light theme?
- [ ] **Logged-in user growth + daily-returning retention** — baseline ~300 logged-in / ~1k DAU / ~80 returning. Define hypotheses + experiments; tie to login gate, watchlists, alert digests.
- [ ] **Traffic from AI platforms** (ChatGPT, Gemini, Perplexity) — content, structured data, brand/citation presence; track inbound referrals.
- [ ] **Search & analytics research** — export / summarize Google Search Console + Google Analytics (key reports, date range, segments) and run structured research (e.g. with Claude) on what to try next for overall traffic + quality users.
