# KoalaGains — Open Tasks

Single source of truth for active KoalaGains work. Completed items live in
[`closed-tasks.md`](./closed-tasks.md).

---

## Stocks

### Detail page

- [ ] **SEO — "Crawled — currently not indexed" on `business-and-moat-sitemap.xml`** — check why these pages are not getting indexed.

### Off-hours Claude Code automation

- [ ] **Off-hours report-refresh cron** — pick the oldest stock reports and regenerate them.
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

---

## ETFs

### Top priorities

- [ ] **Claude-Code Sonnet pipeline** — same idea as the off-hours stock refresh, but for ETFs: pick the ETFs whose reports are not generated yet and generate the whole ETF report.
- [ ] **ETF discoverability + internal linking** (after the list page lands):
  - Home page → ETFs: pick entry points (hero / nav / featured rail / "browse by category-group") so first-time visitors reach the ETFs list and representative detail pages in one click.


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

### Known limitations in the new 8-group taxonomy (follow-up cleanups)

- [ ] **Split strategy funds back out of `derivative-income`** — managed-futures / market-neutral / long-short (~50 funds) don't share a decision framework with the ~600 option-engineered payoff funds; prompt has to branch internally. Highest-impact follow-up.
- [ ] **Carve broad EM (EEM/VWO/IEMG, ~111 funds) out of `sector-thematic-equity`** — regional-diversification sleeve, not a thematic bet. Single-country EM (China/India/LatAm) stays in sector-thematic.
- [ ] **Re-introduce a floating-rate bond group** — TLT (-31% in 2022) and BIL (+1%) shouldn't share `investment-grade` factors; JAAA (+1%) and HYG (-11%) shouldn't share `credit-and-income` factors. Bundle bank loans + AAA CLO + ultrashort + money market separately.

---

## Claude integration

> Provider-level infra shared by stock, ETF, and tariff report generation. The Claude
> subscription OAuth path (`LLMProvider.CLAUDE`) and the provider/model selection UI
> (`llmConstants.ts`, `ClaudeModel`) have landed; these are the follow-ups on top of them.
> Do not add `LLM_PROVIDER`/`LLM_MODEL` env reads back in — defaults are fixed constants
> in `llmConstants.ts` and UI selections flow through explicitly.

### Surface Anthropic usage / rate-limit headers from the OAuth path

- [ ] **Capture the response headers** in `src/util/claude/claude-oauth-client.ts` — `callClaudeWithOAuth` returns the body-level token `usage` but never reads `response.headers`, so Anthropic's `anthropic-ratelimit-*` headers are discarded. Add a `rateLimit` field to `CallClaudeOAuthResult` (parsed from the headers) without changing the existing `text`/`usage`/`model` callers.
- [ ] **Confirm the real header names** before building any numeric gauge on top — this is the open blocker for usage pacing. Log the full raw header set from one live OAuth call and record the exact keys (unified vs input/output token buckets, reset timestamps, remaining-percent vs remaining-count) in `docs/insights-ui/` so downstream work isn't guessing.
- [ ] **Thread the values through** `getClaudeStructuredResult` and `getLLMResponse` so a generation run can read remaining budget after each call, without coupling the thin structured-output helper to bookkeeping.

### Usage-gated off-hours auto-generation

- [ ] **Pace nightly Claude generation against remaining subscription budget** — a scheduled enqueue endpoint (separate from the synchronous per-report path) that reads the surfaced rate-limit headers, stops enqueuing when remaining budget drops below a floor, and resumes after the reset window. Ties together the existing off-hours refresh tasks under Stocks and the ETF Claude-Code pipeline; blocked on the header work above.
- [ ] Open: per-model vs account-wide budget accounting when a run mixes Opus/Sonnet/Haiku; floor as absolute remaining vs percent; back-off strategy when a `429` is hit despite pacing.

---

## Trends page

> Decide once: shared `Trend` model linked to both stock and ETF join tables, or parallel
> `StockTrend` / `EtfTrend` models. Leaning shared (same underlying cause / analog).

- [ ] **Schema** (mirroring `EtfScenario` shapes): `Trend` (title, slug, summary markdown, direction `UPSIDE`/`DOWNSIDE`, timeframe `FUTURE`/`IN_PROGRESS`/`PAST`, probability bucket + optional %, priced-in bucket, expected price change + explanation + timeframe explanation, `outlookAsOfDate`, evidence/sources, archived, audit) + `TrendStockLink` / `TrendEtfLink` (with `role` = `WINNER`/`LOSER`/`MOST_EXPOSED`, per-asset role explanation + expected change, `sortOrder`). Space-scoped, cache-tag revalidation, Zod boundaries.
- [ ] **Authoring**: admin upsert modal (pattern: `UpsertEtfScenarioModal.tsx`); optional Claude-assisted draft; bulk markdown import (pattern: `etf-scenario-markdown-parser.ts`).
- [ ] **Trends index page** — card grid with direction/probability/timeframe badges; client-side filter bar.
- [ ] **Trend detail page** — cause, historical analog, priced-in + expected move box, winners/losers side-by-side, most-exposed section, outlook with `outlookAsOfDate`; JSON-LD Article schema.
- [ ] **Reverse links** — both stock and ETF detail pages link to the trends that reference them (do not defer the reverse link).
- [ ] Open: trend taxonomy beyond scenario fields (macro/demographic/generational/technological/regulatory)?

---

## Daily movers

### Dedupe historical duplicates + harden ingest

- [ ] In the past we may have mistakenly generated daily movers on weekends, which created duplicate entries — and the same thing will keep happening on future US holidays. Clean up the existing duplicates and stop creating new ones on non-trading days.

---

## Overall site

- [ ] **Dark/light theme toggle** — some users find current dark theme reports unreadable. Decide: global header vs per-report toggle; default theme for first-time visitors; persist per user (cookie / localStorage); print-friendly variant separate from light theme?
- [ ] **Traffic from AI platforms** (ChatGPT, Gemini, Perplexity) — content, structured data, brand/citation presence; track inbound referrals.
- [ ] **Search & analytics research** — export / summarize Google Search Console + Google Analytics (key reports, date range, segments) and run structured research (e.g. with Claude) on what to try next for overall traffic + quality users.

### Login improvements

- [ ] Add **LinkedIn** SSO + **Yahoo** SSO

### Social media content pipeline

- [ ] **Start with LinkedIn** — pick one ETF or stock, share its results, tag its manager or provider where possible, write a few lines about it, and attach a picture/poster.
- [ ] **Then move to X (Twitter)** — repeat the same simple post format once the LinkedIn flow is working.
