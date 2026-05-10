# ETF Reports — KoalaGains (Next Tasks)

> Completed ETF work has been moved to [`etf-closed-tasks.md`](./etf-closed-tasks.md).
> This file tracks only what's still open.

## Top priorities (active work)

Work at the top of the stack right now — the items to push on next, ahead of the
phase-ordered list below.

- [ ] **1. Claude-Code pipeline to auto-generate stock + ETF reports with the
  Sonnet model**
  - Build an off-hours pipeline where Claude Code (running the **Sonnet** model, not
    a heavier model) is the generator for both stock and ETF reports.
  - Scope: pick the next batch of tickers/ETFs that need new or refreshed reports,
    invoke the right prompts through Claude Code, persist the output through the
    existing generation pipeline + callbacks, and log per-run results.
  - Leverages the `Prompt` / `PromptVersion` / `PromptInvocation` infra so we get
    versioning, status, raw I/O, and error capture for free.
  - Ties in with the stock "off-hours Claude Code cron" (see `stocks.md`) and the
    ETF generation-requests queue (1.4, closed) — the goal is one shared runner
    that drains both queues.
  - Definition of done: a scheduled run that, with no human in the loop, produces
    a night's worth of refreshed reports across stocks + ETFs using Sonnet, with
    logs we can review the next morning.
- [ ] **2. Split the Index & Strategy field into multiple structured fields**
  - Today **Index & Strategy** is a single blob that crams intro + strategy + other
    context into one field, which makes it hard to lay out cleanly on the detail
    page.
  - Break it into a set of separate fields — at minimum an `introParagraph` + a
    `strategy` field, plus a couple more to-be-decided fields (likely candidates:
    `indexMethodology`, `rebalanceApproach`, `replicationStyle`, `keyConstraints`
    — finalize during implementation).
  - Related to, but distinct from, the broader **`Strategy`** section as a whole;
    this task is specifically about the **Index & Strategy** feed / data shape.
  - Update the prompt, the output JSON contract, persistence, and the detail-page
    rendering together so the UI can present each sub-field with its own heading
    / layout slot. Run through the 3.2 tuning loop (closed) to sanity-check the
    split.
- [ ] **3. ETFs list page — `isComplete` filter + admin toggle**
  - Detail in section **1.6** below — surfaced here because it's active work and
    determines what first-time visitors see by default on the public ETFs list.
  - Make sure the `Etf.isComplete` derivation, the public default filter, the
    admin "include incomplete ETFs" toggle, and the per-row missing-data
    indicators all ship together rather than landing piecemeal.
- [ ] **4. ETF discoverability + internal linking**
  - Once the ETFs list page (item 3 / §1.6) is finalized, wire it into the rest
    of the site so ETF pages aren't an island.
  - **Home page → ETFs**: the main thing — pick the entry points (hero / nav /
    a featured-ETFs rail / "browse by category-group") so a first-time visitor
    on the home page can reach the ETFs list and a few representative ETF
    detail pages in one click.
  - **ETF detail page → stock reports**: for each holding that's a stock we
    already cover, link the ticker through to its stock report; otherwise leave
    it as plain text. Graceful when most holdings aren't covered.
  - **Stock detail page → ETF reports**: on a stock report, list the ETFs that
    hold this ticker (with weight if available) and link each to its ETF
    detail page. Cap to top N by weight to avoid clutter.
  - Also revisit cross-links from category / scenario / trends pages into the
    ETFs they reference so the link graph is dense rather than star-shaped.

---

## Phase 1 — Complete the ETF UI

### 1.6) ETFs list page — default to complete-data only + admin toggle

Goal: the public ETFs list page should only show ETFs that are **actually ready to read**
— every analysis category generated, every data field populated — so first-time visitors
don't click into half-empty reports. Admins need to see the full inventory (including
in-progress / failed / missing-data ETFs) to drive the generation queue, so we expose
that via a toggle instead of dropping the data from the page entirely.

- [ ] **Define "complete" precisely** — an ETF qualifies for the default list only if:
  - All core data fields are populated (name, issuer, category-group, AUM, expense
    ratio, holdings if we ingest them, price series, etc. — enumerate the required
    set during implementation).
  - Every evaluation-category report is generated and non-failed: **Performance**,
    **Cost & Team**, **Risk**, **Summary**, **Index & Strategy**, **Future Outlook**
    (i.e. the full set referenced in 1.4's header-columns task).
  - **Final Summary** is generated.
  - Persist this as a derived boolean (e.g. `Etf.isComplete`) updated by the
    generation pipeline whenever a report/field lands, so the list query is a cheap
    index lookup rather than a multi-join per request.
- [ ] **Default public list** filters to `isComplete = true`:
  - Apply this filter to the list page, to the sitemap (Phase 4), and to any
    featured/trending rails that draw from the ETF pool.
  - Keep pagination, sort, and search behavior the same — they just operate on the
    filtered pool.
- [ ] **Admin toggle** to reveal incomplete ETFs:
  - Visible only to admin users. Label: something like **"Include incomplete
    ETFs"** (default: off).
  - When on, the list shows **all** ETFs regardless of `isComplete`, and each row
    renders a compact **completeness indicator** (e.g. a 6-dot status strip — one
    dot per report type + data — with tooltip on hover showing what's missing).
  - Provide quick-action links from each incomplete row into the **admin ETF
    generation requests page** (1.4) to enqueue the missing report type(s).
  - Persist the admin toggle state in local storage so it survives reloads within
    the session.
- [ ] **Non-admin behavior for incomplete ETFs**:
  - They remain reachable by direct URL (don't 404), but omitted from the default
    list, sitemap, and search results.
  - On their detail page, show a neutral "report in progress" state for the
    missing sections rather than broken / empty components.

### 1.8) Active-ETF management team — LinkedIn-sourced info

Goal: for **actively-managed** ETFs, surface the **portfolio managers + key
investment team** with their LinkedIn profiles, tenure on the fund, and a short bio.
Active-ETF outcomes are driven by the people running the strategy, so showing the
team is essential context for readers. Skip this surface for **passive / index
ETFs** — for those, the index methodology matters far more than any one person, so
the leadership block would be noise.

This is the ETF-side parallel of the stock task in `stocks.md` — share data shapes,
ingestion infra, and refresh cadence wherever it makes sense.

- [ ] **Eligibility — active ETFs only**:
  - Add an `Etf.isActive` (or reuse an existing flag like `managementStyle =
    'ACTIVE' | 'PASSIVE' | 'SEMI_ACTIVE'`) so we can filter cleanly.
  - Render the leadership block only when active (or semi-active where a named
    PM is publicly disclosed); suppress entirely otherwise.
- [ ] **Data shape — per ETF** (mirror the stock model from `stocks.md`):
  - `keyPeople: { role, name, title, linkedinUrl, photoUrl?, fundTenureSinceYear?,
    isLeadPM: boolean, bio, source }[]`.
  - Roles: **Lead PM**, **co-PMs**, optional **head of strategy / sector lead**.
  - `source`, `updatedAt`, `verifiedAt` audit fields (same as stocks).
- [ ] **Acquisition strategy** (no LinkedIn scraping):
  - Primary sources: ETF **prospectus**, **Statement of Additional Information
    (SAI)**, issuer **Leadership** / **Strategy team** page, fund fact sheets.
  - Build the LinkedIn URL on top via the same resolver pattern used for stocks
    — admin curation, paid people-data provider, or links the issuer publishes.
  - Reuse the `scraping-lambdas` extractor that pulls the leadership table from
    a structured page; ETF differs only in source URLs and field labels.
- [ ] **Surfacing on the ETF detail page**:
  - Add a **"Investment Team"** block on the active-ETF detail page (place under
    Strategy or alongside Cost & Team — that's where the analysis already
    references team quality).
  - Card per person: photo (where licensed), name, title, "Lead PM" badge,
    fund-tenure, 1–2 sentence bio, LinkedIn icon link (rel=`nofollow noopener
    external`).
- [ ] **Use the data in analysis**:
  - Pass the team block into the **Cost & Team** prompt input so the team
    narrative cites actual PM tenure / experience instead of vague language.
    The per-category `overallAnalysis` for Cost & Team should be able to
    reference these structured fields when Final Summary synthesizes verdicts.
- [ ] **Refresh + verification**:
  - Quarterly re-ingest on the same off-hours runner used for stocks — issuers
    publish PM changes via prospectus supplements; pick those up.
  - Admin verification UI flags rows older than N months for human review.
- [ ] **Open questions / risks**:
  - **Compliance** — same constraint as stocks: store the public LinkedIn URL,
    do not cache scraped LinkedIn HTML / photos.
  - **Coverage threshold** — minimum set of people required to render the block
    (e.g. at least one named PM); below threshold, suppress.
  - **Cross-fund PMs** — same PM often runs multiple ETFs at the same issuer.
    Decide whether to model `Person` as its own table with ETF links (and
    optionally cross-link to stock leadership rows), or denormalize per ETF.
  - **Index ETFs** — confirm we never render the team block for purely passive
    products even if data exists; the goal is to highlight where the team
    *actually* drives outcomes.

---

## Phase 3 — Prompt and analysis-factor improvements

> 3.1 (review + finalize category grouping) and 3.2 (automated factor/prompt tuning loop)
> are already shipped — see `etf-closed-tasks.md`.

### 3.4) Misc prompt updates

- [ ] **Include the report-generation date** in the **Final Summary** section of each prompt
  so the date appears in the generated output.

---

### 3.5) Comparison "base" per ETF group — open questions

Goal: pick the right **comparison base** for each ETF group so reports always have a
named benchmark to anchor performance / risk / cost claims alongside any category-relative
stats the prompts emit. Equity has
S&P Global as the working answer; the other groups are still undecided.

- [ ] **Fixed-income base — pick one (or a small set)**:
  - Candidates: AGG / BND (broad US aggregate), ICE BofA index family, Bloomberg Global
    Aggregate, or per-segment indices keyed on duration / credit quality (treasuries
    short / intermediate / long, IG corporate, HY, muni, EM debt).
  - Decide whether one base covers the whole `fixed-income-*` group or each subgroup
    needs its own; the "right" answer is probably 3–4 bases keyed to duration + credit.
- [ ] **Per-group base selection — record the call**:
  - For every group in `etf-analysis-categories.json` (broad equity, sectors, factor /
    style, fixed-income-core, muni, leveraged-inverse, commodities, alternatives,
    crypto, multi-asset, currency, etc.), pick a **primary base** + an optional
    **secondary** base, plus a one-line rationale.
  - Equity sub-groups: confirm S&P Global also covers sector / style / factor ETFs, or
    spec a sector-specific benchmark (e.g. each S&P Select sector index for the matching
    sector ETF group).
  - Commodities: GSCI / Bloomberg Commodity Index, or per-commodity base (USO ↔ WTI
    spot, GLD ↔ gold spot)?
  - Alternatives / multi-asset / managed-futures: there isn't a clean public benchmark —
    decide between (a) a 60/40 or risk-parity proxy, (b) the relevant HFR sub-index,
    (c) skip the base and lean on category aggregates baked into prompts / data.
  - Crypto: BTC / ETH spot, or a crypto-index ETF, or both?
  - Currency: DXY for USD, vs. trade-weighted indices for cross-currency funds.
- [ ] **How the base is used in the report** — tighten the contract:
  - Performance comparisons over fixed windows (1y / 3y / 5y total return, max drawdown,
    Sharpe) computed **vs. the chosen base** for that group, alongside the category
    aggregates emitted for the ETF's category group (when available).
  - Where it makes sense, surface beta / tracking error / correlation **vs. the base**
    (most useful for equity + fixed-income; less for alternatives / crypto).
- [ ] **Storage**:
  - Likely a new JSON next to the existing analysis data (e.g.
    `insights-ui/src/etf-analysis-data/etf-comparison-bases.json`) keyed by group, with
    `{ primary: { symbol, name, source }, secondary?, rationale }`.
  - Reference the JSON from the generation pipeline so prompts get
    `{ comparisonBase: { symbol, name, ... } }` injected.
- [ ] **Prompt impact**:
  - Once bases are settled, every prompt that uses "vs. category" / "vs. peers" gets
    paired with "vs. {comparisonBase.name} ({comparisonBase.symbol})" so reports anchor
    on a real index, not a vague peer set.

---

## Phase 4 — SEO, metadata, and sitemap automation

- [ ] **SEO/metadata review** after new sections:
  - Ensure titles/descriptions include comparison + competition keywords where appropriate.
  - Confirm structured data (JSON-LD) remains valid and updated.
- [ ] **Daily generation + sitemap updates**:
  - Generate 5–10 ETFs daily.
  - Push generated ETF URLs to sitemap (or sitemap index) automatically.

---

## Social media content — convert ETF reports + scenarios into posts

Goal: turn the work we already produce (ETF reports, **ETF scenarios**, competition
+ similar-ETF analysis, active-ETF team profiles, ETF trends) into a steady cadence
of **social media content** that drives traffic back to KoalaGains. The content
engine should be cheap to run (built on top of artifacts we already generate) and
consistent enough that we ship something useful every week without a one-off
scramble.

Paired with the stock-side task in `stocks.md` — share templates, queue, and
posting infra. Don't build two parallel systems; only the source artifacts differ.

- [ ] **Content sources we can mine** (today + planned):
  - **ETF scenarios** (already shipped — `EtfScenario` + `EtfScenarioEtfLink`):
    each scenario card / detail page is a natural post — direction, timeframe,
    probability, priced-in bucket, expected move, winners/losers list — a great
    fit for hook + bullets + chart.
  - **Competition / similar-ETF analysis** (1.2, closed): "If you own X, also look
    at Y" — cheaper-fee alternative, lower-risk substitute, narrower-mandate
    alternative, etc. Each comparison row is post-worthy.
  - **Active-ETF investment team profiles** (1.8): short LinkedIn-style "PM
    spotlight" posts using the `keyPeople` data — strongest on LinkedIn given the
    audience overlap.
  - **ETF trends** (Trends page below): each trend → multiple posts (the trend
    itself, ETF winners, ETF losers, "priced-in?" angle).
  - **Verdict / Final-Summary changes** when an ETF is regenerated: the diff itself
    is post-worthy.
- [ ] **Content templates** — share with the stock pipeline; ETF-specific shapes:
  - **Scenario card post** — same shape as stock-side, sourced from
    `EtfScenario`.
  - **"Cheaper / safer / narrower alternative to X"** — pull straight from the
    competition + similar-ETF output.
  - **PM spotlight** (active ETFs only — never for index/passive funds).
  - **Trend post** — trend + 2–3 ETF winners + link to the trend page.
- [ ] **Platform mix**: same primary (LinkedIn + X), same secondary tier as the
  stock side. Stock + ETF content shares the same queue and the same week's
  schedule — alternate / interleave so the audience sees both flavors and the
  feed isn't all one asset class.
- [ ] **Production pipeline**:
  - Reuse the **post-draft generator** + **content queue** built for the stock
    side (`stocks.md`); only the input adapter differs (ETF artifact id →
    template inputs).
  - Drafts → human review → schedule → publish → UTM-attributed traffic.
- [ ] **Cadence + governance**:
  - Mix into the same minimum-weekly cadence target as stocks — e.g. of the N
    posts per week, ~half are ETF-sourced and ~half stock-sourced; tune by what
    actually performs.
  - Compliance pass on every post — no advice phrasing, disclaimers where
    appropriate, claims grounded in the underlying ETF report.
- [ ] **Measurement**:
  - Per-platform engagement + per-ETF-artifact attribution into the same
    dashboard the stock side uses.
  - High-engagement scenarios feed back into off-hours refresh prioritization
    (don't let a hit post link to a stale report).
- [ ] **Open questions**:
  - Active-ETF PM spotlights are LinkedIn-leaning; check whether they pull
    enough engagement on X to be worth cross-posting or should stay
    LinkedIn-only.
  - Cross-link with the stock social pipeline (`stocks.md`): confirmed shared
    queue + templates; ETF differs only in the input adapter.

## Trends page (ETFs)

Goal: a dedicated page where we record long-running **trends** — macro, demographic,
generational, technological, regulatory — and map each trend to the **ETFs** that would
likely benefit if the trend plays out. The value is in catching trends whose implications are
**not yet priced in**, so we (and readers) can identify candidates ahead of the move.

The ETF **scenarios** feature (see `insights-ui/prisma/schema.prisma` `EtfScenario` +
`EtfScenarioEtfLink`, and `src/types/etfScenarioEnums.ts`) already solves a very similar
shape — probability, timeframe, priced-in, expected price change, winners/losers, historical
analog. We should **borrow its schema and UI patterns** rather than invent new ones.

- [ ] **Trend entries** — each trend should capture (mirrors `EtfScenario` fields where
  sensible):
  - **Title** + short description (e.g. "2026 — aging boomer retirement wave drives healthcare
    demand", "younger generation prefers experiences over ownership", "shift from ICE to EV",
    "re-shoring of semiconductor manufacturing", etc.).
  - **Slug** — stable URL-safe identifier, derived from title on create (same pattern as
    scenarios).
  - **Summary** (markdown, 4–5 paragraphs) — folds the underlying cause / mechanism, the
    historical analog (e.g. baby-boomer entry into housing in the 1970s, post-WWII
    suburbanization, early-internet adoption curve), magnitude, and the dated outlook into
    a single narrative. Same shape as `EtfScenario.summary`.
  - **Direction** — `UPSIDE` / `DOWNSIDE` (reuse `EtfScenarioDirection`): does the trend lift
    or depress the mapped ETFs?
  - **Timeframe / lifecycle** — `FUTURE` / `IN_PROGRESS` / `PAST` (reuse
    `EtfScenarioTimeframe`). Replaces the earlier "active / played-out / invalidated"
    question — `PAST` ≈ played out.
  - **Probability bucket** — `HIGH` (>40%) / `MEDIUM` (20–40%) / `LOW` (<20%) (reuse
    `EtfScenarioProbabilityBucket`).
  - **Probability percentage** (optional int 0–100) — numeric override when we have a
    sharper estimate.
  - **Priced-in bucket** — `NOT_PRICED_IN` / `PARTIALLY_PRICED_IN` / `MOSTLY_PRICED_IN` /
    `FULLY_PRICED_IN` / `OVER_PRICED_IN` (reuse `EtfScenarioPricedInBucket`).
  - **Expected price change** (int %) + **expectedPriceChangeExplanation** (markdown) +
    **priceChangeTimeframeExplanation** (markdown) — same trio scenarios use.
  - **`outlookAsOfDate`** — "last reviewed" date so readers know how fresh the thesis is.
    The dated outlook itself lives inside the **Summary** field above (same shape as
    `EtfScenario`).
  - **Evidence / sources** (markdown or structured list) — news, data, research supporting
    the trend. (Scenarios embed this inside the markdown fields; we can do the same or make
    it structured.)
  - **Archived** boolean — soft-delete, same pattern as scenarios.
  - **Author** + `createdAt` / `updatedAt` (audit timestamps).
- [ ] **Mapped ETFs** (join table, mirror `EtfScenarioEtfLink`):
  - `trendId`, `etfId`, `symbol`, `exchange`.
  - **Role** — `WINNER` / `LOSER` / `MOST_EXPOSED` (reuse `EtfScenarioRole`). Winners benefit
    from the trend, losers suffer, most-exposed are high-sensitivity for risk management.
  - **Role explanation** (markdown) — per-ETF thesis: why this ETF captures the trend
    (sector, geography, thematic tilt, holdings concentration).
  - **Expected price change** (int %) + explanation (markdown) — ETF-specific move, separate
    from the trend-level estimate.
  - `sortOrder` for display order within a role group.
- [ ] **Page UI** (mirror the scenarios pages):
  - **Trends index** (`/trends` or `/etf-trends`) — card grid with direction / probability /
    timeframe badges, one-line excerpt. Client-side filter bar like
    `EtfScenarioFiltersBar` (direction, probability, timeframe, search).
  - **Trend detail page** — underlying cause, historical analog, priced-in + expected move
    box, winners/losers side-by-side, most-exposed section, outlook with `outlookAsOfDate`,
    JSON-LD Article schema for SEO.
  - **From an ETF's report page**, link to the trends that reference it ("This ETF appears in
    the following trends"). Scenarios explicitly deferred this reverse link — do not skip it
    here.
- [ ] **Authoring flow**:
  - Admin can create/edit trends via an upsert modal (pattern:
    `UpsertEtfScenarioModal.tsx`).
  - Optional: Claude-assisted draft — given a trend description, suggest candidate ETFs +
    initial thesis + "priced-in?" assessment for human review. (Scenarios are fully
    hand-authored today; trends can lean on Claude more since we're generating them
    ongoing.)
  - Consider a bulk markdown import (pattern: `etf-scenario-markdown-parser.ts`) so we can
    draft trends in a markdown doc and import.
- [ ] **Storage + caching**:
  - Prisma models: `EtfTrend` + `EtfTrendEtfLink` (shapes mirror the scenario models).
  - Space-scoped (`spaceId`), cache-tag revalidation on create/update (pattern:
    `etf-scenario-cache-utils.ts`).
  - Zod schemas at API boundaries.
- [ ] **Open questions**:
  - Should trends be **shared** between stocks and ETFs (one trend, linked to both stock and
    ETF join tables), or **parallel datasets**? (See stock-side task for the symmetrical
    ask.) Leaning towards shared, since the underlying cause / historical analog is
    identical — only the mapped assets differ.
  - Do trends need a separate "trend category" taxonomy (macro / demographic / generational /
    technological / regulatory) for filtering, beyond what scenarios have?

## Suggestion — Connect ETFs to the home page + add categorization

Right now ETFs feel disconnected from the rest of the site. We have detail pages for each ETF (`/etfs/[exchange]/[etf]` plus `competition`, `cost-efficiency-team`, `future-performance-outlook`, `holdings`, `performance-returns`, `risk-analysis`) and one flat listing page (`/etfs`), but:

- The **home page** (`/`) only shows stocks by industry. There is no entry point to ETFs from there.
- The **`/etfs` listing** dumps all 7,000+ ETFs in one page, with no grouping.
- We have no **category pages** or **country pages** for ETFs, even though stocks have both (`/stocks/industries/[industry]`, `/stocks/countries/[country]`).

Suggested next steps (small, in order):

- [ ] **1. Add an ETF section on the home page**
  - Mirror what we do for stocks: a small showcase block that links into ETFs.
  - Group by **`category`** (Morningstar category — many values, useful), not `assetClass` (only 6, too coarse).
  - Each card links to the matching category page.

- [ ] **2. Group the `/etfs` listing by category**
  - Stop showing all ETFs in one flat grid.
  - Show top categories first, with a "View all" link per category.
  - Keep the full search/filter for power users, but the default view should be category-led, like `/stocks` is industry-led.

- [ ] **3. Add ETF category pages**
  - New route: `/etfs/categories/[category]` (and an index `/etfs/categories`).
  - Same shape as `/stocks/industries/[industry]`.
  - Sitemap + SEO metadata per category.

- [ ] **4. Add ETF country pages (later)**
  - New route: `/etfs/countries/[country]` (mirrors `/stocks/countries/[country]`).
  - We already store `country` and `region` on `EtfStockAnalyzerInfo`, so the data is there.
  - Lower priority than category — most users will look up an ETF by what it holds, not where it's listed. Do this once category pages are live and we see demand.

- [ ] **5. Cross-link from ETF detail pages**
  - On every ETF detail page, link the category name to its category page, and (later) the country to its country page.
  - Add a small "Related ETFs in this category" block at the bottom of the main detail page.

**Open questions:**

- Use `category` (Morningstar) or do we want our own taxonomy? `category` is good enough to start; revisit only if it gets messy.
- Do we need both `/etfs/categories/[category]` *and* country pages on day one? Probably no — ship category first, see if country demand follows.
- Should the home page show ETFs alongside stocks in the same showcase, or in a separate section? Separate section is clearer for users.
