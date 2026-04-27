# ETF Reports — KoalaGains (Next Tasks)

> Completed ETF work has been moved to [`etf-closed-tasks.md`](./etf-closed-tasks.md).
> This file tracks only what's still open.

## Top priorities (active work)

Work at the top of the stack right now. Everything here supersedes the phase-ordered
list below — these are the four things to actually push on next.

- [ ] **1. End-to-end QA of the competition workflow + UI**
  - The whole Competition + Similar ETFs pipeline (section 1.2) has shipped — see
    `etf-closed-tasks.md`. Before moving on, actually exercise it in production:
  - Pick a handful of ETFs across different groups (equity, fixed-income, thematic,
    leveraged/inverse, etc.) and verify the competitor selection, the competition
    analysis narrative, the competition chart, the separate competition page, and
    the "Other similar ETFs" section on the main ETF page all render correctly and
    with plausible data.
  - Spot-check edge cases: ETFs with very few peers, ETFs in sparse categories, new
    / low-AUM ETFs, ETFs where an obvious competitor is missing.
  - File issues for any bad selections, broken charts, or weak narrative — feed
    those back into the prompt / selection logic rather than shipping more features
    on top.
- [ ] **2. Finalize the Admin ETF generation requests page** (currently in progress)
  - Most of 1.4 has landed (reload + auto-refresh, header columns, per-report-type
    "Missing" options, per-ETF "Generate All Analysis", sort/pagination/top-filter)
    — full list in `etf-closed-tasks.md`.
  - This item is the wrap-up pass: make sure the page is pleasant to operate day to
    day, catch anything rough edges that shipped with the recent batch, and
    reconcile the page behavior with what `etf-reports` and `etf-generation-requests`
    both expose.
- [ ] **3. Claude-Code pipeline to auto-generate stock + ETF reports with the
  Sonnet model**
  - Build an off-hours pipeline where Claude Code (running the **Sonnet** model, not
    a heavier model) is the generator for both stock and ETF reports.
  - Scope: pick the next batch of tickers/ETFs that need new or refreshed reports,
    invoke the right prompts through Claude Code, persist the output through the
    existing generation pipeline + callbacks, and log per-run results.
  - Leverages the `Prompt` / `PromptVersion` / `PromptInvocation` infra so we get
    versioning, status, raw I/O, and error capture for free.
  - Ties in with the stock "off-hours Claude Code cron" (see `stocks.md`) and the
    ETF generation-requests queue (1.4) — the goal is one shared runner that
    drains both queues.
  - Definition of done: a scheduled run that, with no human in the loop, produces
    a night's worth of refreshed reports across stocks + ETFs using Sonnet, with
    logs we can review the next morning.
- [ ] **4. Split the Index & Strategy field into multiple structured fields**
  - Today **Index & Strategy** is a single blob that crams intro + strategy + other
    context into one field, which makes it hard to lay out cleanly on the detail
    page.
  - Break it into a set of separate fields — at minimum an `introParagraph` + a
    `strategy` field, plus a couple more to-be-decided fields (likely candidates:
    `indexMethodology`, `rebalanceApproach`, `replicationStyle`, `keyConstraints`
    — finalize during implementation).
  - Related to, but distinct from, the broader Strategy-section restructuring in
    3.3.e: that task is about the `Strategy` section as a whole; this task is
    specifically about the **Index & Strategy** feed / data shape.
  - Update the prompt, the output JSON contract, persistence, and the detail-page
    rendering together so the UI can present each sub-field with its own heading
    / layout slot. Run through the 3.2 tuning loop to sanity-check the split.

---

## Priority order

1. **Complete the ETF UI** — ETF details page, competition, similar ETFs, famous-ETFs comparison, admin pages.
2. **Target audience / Goals**.
3. **Prompt and analysis-factor improvements** (automated loop) — includes category-grouping review.
4. **SEO, metadata, and sitemap automation**.

---

## Phase 1 — Complete the ETF UI

> **1.1 ETF Details Page layout**, **1.2 Competition + Similar ETFs**, and **1.4 Admin
> ETF generation requests page** have all shipped and moved to `etf-closed-tasks.md`.
> The remaining Phase 1 items are listed below.

### 1.3) Famous ETFs dataset + "Comparison with famous ETFs" section

Goal: for each group, maintain a hand-curated set of "famous" ETFs, and generate a section
that answers: "Why would we choose this ETF over those?"

- [ ] **Famous-ETF dataset**:
  - Identify the most famous ETFs under each group (AUM, liquidity/volume, popularity,
    longevity, issuer reputation).
  - Add a JSON dataset `groupKey -> famousEtfs[]` (symbol, exchange, name, issuer, why-famous,
    optional AUM/expense ratio snapshot).
  - Editable by humans, suitable for prompt conditioning.
  - TS types required; runtime validation optional.
- [ ] **Section input schema**:
  - Current ETF summary (fees, AUM, performance, holdings concentration, tracking, risk).
  - "Famous ETF set" from the JSON (optionally with live-fetched stats).
  - Group context (what investors typically want from this group).
- [ ] **Section output schema**:
  - Comparisons table/list (current vs each famous ETF).
  - "Choose this ETF if…" bullets.
  - "Prefer competitor if…" bullets.
  - Final recommendation + rationale + caveats.
- [ ] **Finalize prompt** for this section.
- [ ] **Database (Prisma) changes**:
  - Model to store this section's output per ETF (per group/version).
  - Decide structured columns vs JSON blob + derived fields.
- [ ] **Pipeline changes**:
  - New generation step (dependencies on the 3 category analyses if required).
  - Callback saving + status tracking.
- [ ] **UI**: new section on ETF report page showing comparisons and "why choose" reasoning.

### 1.5) Custom Reports ("random reports") per ETF

Mirror of the stock Custom Reports feature — see the stock design doc
`docs/ai-knowledge/projects/insights-ui/requirements/req-001-stock-custom-reports.md`
(PR #1318) for the full spec; the ETF version should reuse the same shape, just scoped to
an `Etf` instead of a `TickerV1`.

Goal: let a user (or curator) attach **arbitrary, free-form investigation reports** to a
single ETF — e.g. "Why is QQQI's premium to NAV widening?", "How does this sector ETF hold
up in a 50% China-tariff scenario?", "What happens to this fund if 10y yields spike?". Each
ETF has **0..N** Custom Reports; each is a one-shot prompt → one-shot answer with
regeneration history.

- [ ] **Data model** (new Prisma tables, mirror the stock ones):
  - `EtfCustomReport` — one row per report on an ETF; `title`, `userQuestion`, optional
    `templateKey`, denormalized `latestAnswerMarkdown` / `latestAnswerJson` /
    `latestSources` / `latestRunId`, `status` (`NotStarted` / `InProgress` / `Completed` /
    `Failed`), `archived` soft-delete, audit fields.
  - `EtfCustomReportRun` — one row per LLM invocation; links to `PromptInvocation`; keeps
    history so we can compare answers over time.
  - Optional `EtfCustomReportTemplate` — curated pre-written prompts with placeholders
    (e.g. "Explain a premium/discount-to-NAV change") users can pick from.
  - Backref `Etf.customReports`.
- [ ] **API** — under an ETF-scoped namespace, same shape as the stock routes:
  - `GET` list, `POST` create (kicks off first Run), `GET /[reportId]` detail with all Runs,
    `POST /[reportId]/regenerate`, `PATCH /[reportId]` (title / archive).
  - Admin route for curated ETF templates.
  - Thin handlers; work in `src/utils/analysis-reports/etf-custom-report-utils.ts`.
- [ ] **Prompt infra reuse**:
  - Go through `getLLMResponseForPromptViaInvocation` with a single generic system prompt
    (e.g. `promptKey: 'US/etfs-v1/custom-report'`).
  - `inputJson` carries ETF context (symbol / name / issuer / category-group / strategy,
    holdings summary, 30d price move, recent news) **plus** the user's question or resolved
    template.
  - Get `Prompt` / `PromptVersion` / `PromptInvocation` versioning, status, model id, error
    capture, raw I/O for free.
- [ ] **Output shape** the LLM must return:
  - `answerMarkdown` — long-form rendering on the detail page.
  - `answerJson`: `{ summary, keyPoints[], verdict?: 'Bullish'|'Bearish'|'Neutral',
    confidence?: 'Low'|'Medium'|'High', sources?: { title, url }[] }`.
- [ ] **UI**:
  - Add a **"Custom Reports"** section to the ETF detail page (section 1.1) — `[+ New
    Report]` button, card grid of existing reports, empty state.
  - New sub-page `app/etfs/[exchange]/[symbol]/custom-reports/[reportId]/page.tsx` with full
    markdown render, sources list, "Regenerate" (permission-gated), collapsed history panel.
  - **New-report modal** with two tabs: **From template** (dropdown + preview) and
    **Free-form** (title + question textarea). Optimistic UI, poll until `Completed`.
  - Admin CRUD page for curated ETF templates.
- [ ] **Generation flow** (v1 = synchronous inside the POST handler):
  1. Load ETF; insert Report (`NotStarted`) + first Run (`InProgress`); return
     `201 { reportId, runId }`.
  2. `await` `getLLMResponseForPromptViaInvocation`.
  3. On success: populate Run, flip Report to `Completed`, update denormalized latest-*
     fields + `latestRunId`.
  4. On failure: store `errorMessage`, mark Run `Failed`; keep prior successful answer if
     one existed, else mark Report `Failed`.
- [ ] **Permissions / quotas / abuse**:
  - Space-scoped via existing membership check.
  - Per-user quota: cap N Custom Reports per ETF per user per day (config-driven).
  - Hard output-length cap in the system prompt; no recursive web-research tools in v1.
  - Archive-only (no row deletion) in v1; only creator or admin can edit/archive.
- [ ] **Phased rollout** (mirrors the stock phasing):
  - **P0**: schema + migration + admin curated-template CRUD.
  - **P1**: list + detail + create-from-template modal on the ETF detail page.
  - **P2**: free-form prompt behind a feature flag; per-user quota enforced.
  - **P3**: streaming answers, web-search citations, history diff view.
- [ ] **Open questions**:
  - Should stock and ETF Custom Reports share a **single** `CustomReport(+Run)` table with a
    polymorphic `subjectType` + `subjectId` column, or stay as two parallel table families?
    Parallel is simpler; unified is DRYer and lets cross-asset reports happen later.
  - ETF-specific template examples to seed (premium/NAV, holdings concentration, tracking
    error, sector-rotation scenarios).

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
  - **Final Summary** + `introParagraph` (3.3.d) are generated.
  - Once 2.1 ships: at least one matched `EtfEtfTargetGroupLink` row exists.
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

### 1.7) Populate Canadian ETFs from Stock Analyzer

Goal: expand the ETF inventory beyond US-listed funds by ingesting **all Canadian
ETFs** from **Stock Analyzer** (stockanalysis.com), so TSX / NEO / Cboe Canada-listed
funds show up alongside US listings in the same pipeline.

- [ ] **Source the full Canadian ETF universe from Stock Analyzer**:
  - Pull the complete list of Canadian ETFs (e.g. via
    `stockanalysis.com/list/exchange-traded-funds/` filtered to Canada, or the
    Canadian-specific page if one exists).
  - Capture per-ETF: symbol, exchange (TSX / NEO / Cboe Canada), name, issuer,
    category, AUM, expense ratio, inception, currency, and anything else Stock
    Analyzer surfaces that we already use for US ETFs.
  - Land the raw extract in the `scraping-lambdas` repo (or wherever the existing
    ETF scraping lives) — keep the implementation consistent with how US ETFs
    are pulled today.
- [ ] **Schema / model adjustments to support Canadian ETFs**:
  - Confirm the `Etf` model has fields that already accommodate non-US listings
    (exchange, currency, country) — extend if not.
  - Make sure unique keys handle the same ticker on different exchanges (e.g.
    a US `XYZ` and a TSX `XYZ.TO` must coexist).
  - Decide URL/slug shape for Canadian ETFs (likely
    `/etfs/TSX/<symbol>`, `/etfs/NEO/<symbol>`, `/etfs/CBOE/<symbol>`) and align
    with the existing exchange-prefixed routes.
- [ ] **Wire Canadian ETFs into the existing pipeline**:
  - Map each ingested ETF to a category-group from
    `etf-analysis-categories.json` (extend the categories if Canadian-specific
    ones are needed — e.g. Canadian fixed-income, currency-hedged S&P/TSX
    products).
  - Run them through the standard generation flow (Performance, Cost & Team,
    Risk, Summary, Index & Strategy, Future Outlook) so reports are produced
    on the same cadence as US ETFs.
  - Respect the `Etf.isComplete` rule from 1.6 — Canadian ETFs only appear on
    the public list once their data + reports are fully populated.
- [ ] **Backfill + ongoing refresh**:
  - One-shot backfill for the full Canadian ETF list.
  - Add to the off-hours / scheduled refresh so new Canadian ETFs (and updates
    to existing ones) flow in automatically.
- [ ] **Validation**:
  - Spot-check a sample of Canadian ETFs end-to-end (data populated, reports
    generated, detail page renders, holdings present where available).
  - Confirm sitemap + SEO metadata are correct for the Canadian URLs (no
    accidental cross-links to US-only canonicals).
- [ ] **Open questions**:
  - Holdings data for Canadian ETFs — does Stock Analyzer expose them, or do
    we need a secondary source (issuer site, FTP feed)?
  - Currency display — are Canadian-ETF prices shown in CAD by default, with
    a USD toggle, or both?

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
  - Once 3.3.f is in place, the per-category `overallAnalysis` for Cost & Team
    can reference these structured fields in the Final Summary.
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

## Phase 2 — Target audience / Goals

Goal: Tag each ETF with the investor goals it satisfies, and surface those goals in the
analysis output.

- [ ] **Define a goals/target-audience taxonomy** for ETFs. Examples:
  - "Fixed income with no downside"
  - "Fixed income with low risk"
  - "High yield with moderate or high risk"
- [ ] **Capture matching goals during ETF analysis**:
  - When generating an ETF report, determine which goals from the taxonomy this ETF meets.
  - Persist the matched goals on the ETF record.
- [ ] **Open question — equity goal representation**:
  - Decide how to represent goals for equity-style ETFs (e.g. country/region funds like
    India / China ETFs) where the "goal" is more thematic/exposure-based than risk-return
    based.
  - Propose candidate goal labels for equity (e.g. "Emerging-market equity exposure",
    "Single-country thematic exposure", "Sector tilt").

### 2.1) Target-investor groups (data model + prompt wiring)

Goal: tag each ETF with the **target investor groups** it fits — i.e. which kinds of
investors (by goals / risk profile / mandate) should realistically consider this ETF.
This is a concrete, persisted extension of the taxonomy above, covering **both retail
and institutional** investors.

Key shape:
- **Many-to-many** — one ETF maps to **multiple** target groups, and one target group
  maps to **many** ETFs.
- A target group can also be linked to an ETF **category-group** (e.g. the whole
  "short-duration treasuries" group fits "capital-preservation" target investors), so
  matches can be inferred at the group level and then refined per ETF.
- Covers retail personas (e.g. "Income-focused retiree", "Young DCA investor",
  "High-yield / high-risk speculator") **and** institutional personas (e.g. "Corporate
  treasury — cash management", "Pension fund — liability-matching", "Insurance — core
  fixed income", "Endowment — long-duration equity growth").

- [ ] **Decide granularity — group-level vs. category-level vs. per-ETF**:
  - Open question: do target-groups attach to each **category-group** in
    `etf-analysis-categories.json`, to each **individual ETF**, or **both** (category
    sets the default, ETF can override / extend)?
  - Resolve this before finalizing the Prisma schema.
- [ ] **Define the target-group taxonomy** (seed data):
  - Retail buckets — income, growth, capital preservation, speculation, thematic
    exposure, tax-advantaged (munis), ESG, etc. Each bucket has a `key`, human label,
    short description, and a risk/goal profile.
  - Institutional buckets — corporate treasury, insurance general account, pension
    (DB / DC), endowment, sovereign wealth, asset manager sleeve, family office,
    RIA model-portfolio bucket, etc.
  - Mark each bucket as `retail` | `institutional` | `both` via an
    `investorType` enum so UI + prompts can filter.
- [ ] **Prisma schema** — add new models for target groups and the many-to-many links:
  - `EtfTargetGroup` — one row per target-group taxonomy entry. Fields: `id`, `key`
    (stable slug), `label`, `description`, `investorType` enum
    (`RETAIL` | `INSTITUTIONAL` | `BOTH`), `riskProfile` (e.g.
    `LOW` | `MEDIUM` | `HIGH`), `goalProfile` (e.g. `INCOME` | `GROWTH` |
    `PRESERVATION` | `SPECULATION` | `THEMATIC` | `TAX_ADVANTAGED` | `ESG` |
    `LIABILITY_MATCHING` | `CASH_MANAGEMENT`), `displayOrder`, audit fields.
  - `EtfEtfTargetGroupLink` — many-to-many between `Etf` and `EtfTargetGroup`.
    Fields: `etfId`, `targetGroupId`, `source` enum (`MANUAL` | `PROMPT` |
    `CATEGORY_GROUP`), `confidence` (`LOW` | `MEDIUM` | `HIGH`), optional
    `rationale` text, audit fields.
  - `EtfCategoryGroupTargetGroupLink` (only if we decide category-level attachment
    is in scope) — many-to-many between an ETF category-group (from
    `etf-analysis-categories.json`) and `EtfTargetGroup`.
  - Backrefs: `Etf.targetGroups`, `EtfTargetGroup.etfs`.
  - Seed the taxonomy via a migration / seed script so the list is versioned in the
    repo, not typed into prod.
- [ ] **Wire into prompts** so the LLM produces and reasons about target groups:
  - Extend the ETF analysis prompt(s) (at minimum the Summary / Final-Summary prompt,
    and ideally Index-&-Strategy + Performance + Risk) so the model is told the full
    target-group taxonomy and asked to return the list of matching groups for this
    ETF **with a 1-line rationale each**, plus a confidence tag.
  - Update the output schema / JSON contract of those prompts to include a
    `targetGroups: [{ key, rationale, confidence }]` array.
  - On save, resolve `key` → `EtfTargetGroup.id` and upsert the
    `EtfEtfTargetGroupLink` rows with `source = PROMPT`.
  - Separately, allow an admin to manually add / remove target-group links
    (`source = MANUAL`) that the prompt run won't overwrite.
- [ ] **Surface target groups in the UI** (detail page + filters):
  - Show matched target-groups as chips on the ETF detail page (section 1.1), grouped
    by retail vs. institutional, each with its rationale in a tooltip / expandable row.
  - Add a **"Find ETFs for this investor profile"** filter on ETF list / search pages
    driven by `EtfTargetGroup.key`.
- [ ] **Validation + QA loop**:
  - Spot-check the prompt output across a handful of ETFs per category-group and
    confirm the target-group assignments are sensible before turning on bulk
    backfill.
  - Add the target-group assignment into the **automated factor/prompt tuning loop**
    (Phase 3.2) so we can iterate on it alongside the analysis factors.

---

## Phase 3 — Prompt and analysis-factor improvements

> 3.1 (review + finalize category grouping) and 3.2 (automated factor/prompt tuning loop)
> are already shipped — see `etf-closed-tasks.md`. The tuning loop is still referenced
> from the open sub-items below (3.3.*) as the validation harness for new prompt changes.

### 3.3) Improve ETF report quality

Umbrella for report-quality fixes that go beyond factor/prompt tuning. Sub-items below
share a common goal: a reader should be able to **finish an ETF report and know whether
they should buy it or not**, for their specific profile, against a clearly named
benchmark.

#### 3.3.a) Explicit category context

Goal: fix a recurring quality issue where ETF reports (especially **Risk**, but also
**Performance**, **Cost & Team**, and **Final Summary**) make a lot of statements like
*"this ETF underperforms its category on drawdowns"* or *"fees are slightly above the
category average"* without ever telling the reader **which category** the ETF is being
compared against, or **what the category's actual numbers are**. This makes the
comparison feel vague and unprofessional — the user sees "vs. category" everywhere but
has no idea what the category is or how it stacks up quantitatively.

Fix this end-to-end: either stop referencing the category entirely, or surface the
category name **and** its quantitative baseline so every comparison is grounded.

- [ ] **Audit every category reference** in existing outputs:
  - Scan recent reports across Performance, Cost & Team, Risk, and Final Summary for
    phrases like "vs. category", "category average", "above/below its category",
    "compared to peers in its category", etc.
  - Catalog how often each prompt leans on an un-named / un-quantified category
    comparison.
- [ ] **Decide the policy per prompt** (discuss + commit to one path per section):
  - **Option A — drop category references**: rewrite prompts so they only make
    comparisons against concrete, named benchmarks (SPY, AGG, the fund's index, a
    named peer) and never against an abstract "category" the reader can't see.
  - **Option B — show the category + its numbers**: every time a prompt says "vs.
    category", require it to state:
    1. the **category name** (exact group from `etf-analysis-categories.json`), and
    2. the **quantitative baseline** it's comparing against (e.g. category median /
       average / percentile for that specific metric — expense ratio, max drawdown,
       Sharpe, 3yr return, etc.).
  - Default recommendation: **Option B** for Performance & Risk (the comparison is
    informative when grounded), **Option A** for Cost & Team where category means
    less.
- [ ] **Data the prompt needs for Option B** — before the prompt can cite real
  category numbers, the generation pipeline must pass them in:
  - Compute per-category aggregates (median / average / percentile buckets) for the
    metrics we actually quote — expense ratio, AUM, flows, max drawdown, volatility,
    Sharpe, 1yr / 3yr / 5yr return, yield, etc.
  - Persist these on the category-group record (or in a sibling
    `EtfCategoryGroupStats` table) so the generation run can hydrate the prompt
    input with `{ categoryName, categoryStats: { ... } }`.
  - Keep `categoryStatsAsOf` on the record so the prompt can cite "as of
    YYYY-MM-DD".
- [ ] **Update the prompts** to enforce the new rule:
  - Add an explicit instruction: *"Any comparison phrased as 'vs. category',
    'category average', 'above/below category', etc. MUST either (a) be removed, or
    (b) name the exact category and cite its numeric baseline with units and an
    as-of date. Never say 'vs. category' without both."*
  - Extend the output JSON schema so every category-comparison claim carries the
    `categoryName`, the `metric`, the ETF's `value`, the `categoryValue`, and a
    `source` (e.g. `"internal-aggregate-2026-04"`).
  - Run this through the **automated factor/prompt tuning loop** (Section 3.2) so
    regressions get caught.
- [ ] **Surface the category in the UI** — a category page:
  - New route `app/etfs/categories/[categoryKey]/page.tsx` showing: category label,
    plain-English description, member-ETF list, the aggregate stats used in
    prompts, and sparklines / distributions for expense ratio, return, drawdown,
    etc.
  - On the ETF detail page (section 1.1), link every category mention to that
    page so the reader can see exactly what "the category" is.
  - Add category pages to the sitemap generation in Phase 4.

#### 3.3.b) Handle Morningstar categories as a first-class concept

Goal: Morningstar categories (e.g. "Large Blend", "Intermediate Core Bond", "Foreign
Large Growth") are the de-facto industry taxonomy that investors, issuers, and
screeners already use. Our internal category-groups are useful, but reports that
reference "the category" without reconciling against Morningstar feel amateur. We
should treat Morningstar category as a **first-class field** on each ETF, expose it in
the UI, and use it in prompts alongside (or in place of) our internal group where
appropriate.

- [ ] **Capture the Morningstar category on each ETF**:
  - Add a `morningstarCategory` field (and optional `morningstarCategoryId`) to the
    `Etf` Prisma model.
  - Source this from our existing data provider / scraping pipeline (confirm which
    source actually carries it — check `scraping-lambdas` outputs).
  - Backfill historic ETFs and keep it updated on refresh.
- [ ] **Resolve the relationship to our internal category-groups**:
  - Decide whether our internal groups are a **superset**, a **re-mapping**, or a
    **complementary tag** to Morningstar categories.
  - Persist a `morningstarCategory -> internalGroupKey` mapping so we can pivot
    reports either way without re-querying every run.
  - Flag ETFs where Morningstar assigns them to a category that doesn't match our
    internal group (audit + reconcile).
- [ ] **Use Morningstar categories in prompts**:
  - When Option B in 3.3.a applies (cite category + numbers), prefer the
    **Morningstar category name** in the user-facing text because readers
    recognize it. Keep the internal group for our own analytics.
  - Compute per-Morningstar-category aggregates (median expense ratio, median
    drawdown, etc.) the same way we do for internal groups in 3.3.a, or at least
    define which one is the source of truth for the comparison numbers.
- [ ] **Surface Morningstar category in the UI**:
  - Show it on the ETF detail page header next to ticker / issuer / internal group.
  - Link it to the category page (3.3.a) — either the same page shared across
    Morningstar + internal, or a sibling page scoped to the Morningstar category.

#### 3.3.c) Cross-check reports against the target-audience feature

Goal: once the **target-investor-groups** feature (see section 2.1) is live, the
reports themselves must let each targeted segment — specific slices of retail, plus
specific slices of institutional — walk away with a clear **"yes, this fits me"** or
**"no, skip this one"** verdict. Today the reports are written in a generic voice; a
retiree looking for income and a pension fund doing liability-matching read the same
paragraphs and neither gets a confident answer.

- [ ] **Make target-audience a live input to the prompts**:
  - Pass the **matched target-groups** (`EtfEtfTargetGroupLink` rows from 2.1) into
    the analysis prompts as structured input, not just as tags stored on the side.
  - Extend the **Final Summary** prompt so it ends with a **per-target-group verdict
    block**: for each matched target-group, emit `{ targetGroupKey, fit:
    'Good'|'Acceptable'|'Poor', reason, cautions[] }`.
  - Where the report already says things like "this is suitable for income
    investors", require the prompt to name the **exact target-group key**, not a
    generic persona.
- [ ] **Cross-check existing reports after target-groups ships**:
  - After 2.1 is merged and back-filled, run a pass across generated reports to
    verify every matched target-group is actually addressed in the narrative.
  - Flag reports where the matched target-groups don't appear (or appear only as
    vague hand-waving) and route them back through regeneration.
  - Add this check to the **automated factor/prompt tuning loop** (3.2) so future
    regressions are caught.
- [ ] **Surface per-audience verdicts in the UI**:
  - Add a **"Is this ETF right for you?"** panel to the ETF detail page (section
    1.1) that lists each matched target-group with its fit verdict + one-line
    rationale from the prompt output.
  - Group retail vs. institutional verdicts separately (retail block visible by
    default, institutional block collapsible).
- [ ] **Definition of done** for this sub-section:
  - A retail retiree, a young DCA investor, and a corporate-treasury analyst can
    each open the same ETF report and within 30 seconds point to the line that tells
    them whether to buy or skip — with a named rationale.

#### 3.3.d) Report layout — Final Summary + Intro, then charts, then Strategy, then analysis

Goal: revisit how **Final Summary** and **Strategy** are displayed on the ETF detail
page so the top of the page reads well. Two failure modes today:

1. If we show **only Final Summary** at the top and nothing about the ETF itself, the
   reader has no idea what the fund is before the verdict — it feels jarring and is
   hard to follow.
2. If we put **Strategy at the top too**, before the charts, the pre-chart block
   becomes a wall of text and the page feels long and bureaucratic.

Proposed structure (refines the layout already in section 1.1):

1. **Final Summary** — the existing verdict block (already generated).
2. **Intro paragraph** — **new field** — a short, 1-paragraph, plain-English
   description of *what the ETF is*: issuer, what it tracks / holds, basic shape
   (equity/fixed-income/sector/thematic), who it's built for. This is the "so what
   is this thing?" block that currently doesn't exist.
3. **Charts** — price chart, spider chart, any headline visuals.
4. **Strategy** — 2–3 paragraphs (not a full essay) explaining the fund's
   strategy, index, rebalance approach, and how it actually delivers its
   exposure.
5. **Evaluation-category blocks** — ratings + narrative for each analysis
   category (Performance, Cost & Team, Risk, Future Outlook, etc.).

Tasks:

- [ ] **Add `introParagraph`** as a new field on the ETF analysis output:
  - Short (≈80–150 words), plain-English, no jargon, no verdict language.
  - Must describe the ETF in its own right (issuer, strategy family, what it holds,
    headline stats) — **not** opinionate. Verdict lives in Final Summary.
  - Persist on the `Etf` (or the Final-Summary record) so it's available to the
    detail page and to SEO metadata.
- [ ] **Update the generation prompt(s)** to produce `introParagraph` alongside
  Final Summary:
  - Decide whether it comes out of the Final-Summary prompt or a new tiny "intro"
    prompt; prefer bundling with Final Summary to keep one round-trip.
  - Extend the output JSON schema accordingly; backfill across existing ETFs after
    rollout.
- [ ] **Revise Strategy so it's not long-form at the top**:
  - Target: 2–3 focused paragraphs, not an essay.
  - Place it **after** the charts, not before.
  - If the existing Strategy content is longer, move the deep-dive into the
    **per-category detail page** (section 1.1) and keep only the summary on the
    main detail page.
- [ ] **Update the detail-page component order** (section 1.1) to match:
  Final Summary → Intro paragraph → Charts → Strategy → Evaluation categories →
  other sections (competition, similar, famous-ETF comparison, target-audience
  panel, etc.).
- [ ] **Cross-check with section 1.1 and 3.3.c**:
  - Reconcile this ordering with the ordering currently listed in 1.1 so there is
    one canonical layout, not two.
  - Make sure the **"Is this ETF right for you?"** panel from 3.3.c has a clear
    slot in this order (suggested: right after Final Summary + Intro, before
    charts — or just after charts — pick one and document it).

#### 3.3.e) Improve Strategy section — split into structured fields + per-group shape

Goal: today the **Strategy** section is stored as **one** free-form field that packs
roughly five different things into a single blob:

1. **Intro** — what the fund is (overlaps with 3.3.d's `introParagraph`).
2. **Peer / competitive context** — how it sits versus peers in the same group.
3. **Strategy proper** — index, mandate, how exposure is actually delivered.
4. **Up/down conditions** — which macro, rate, or market conditions make it rise
   or fall.
5. **Three major risks** — the top risks associated with the fund.

Treating these as one blob makes the section hard to render cleanly, hard to reuse
(e.g. in competition tables, in the "Is this ETF right for you?" panel, in
per-category detail pages), and hard to validate in the prompt-tuning loop.

- [ ] **Break Strategy into 5–6 structured fields** on the ETF analysis output
  (names are indicative — finalize during implementation):
  - `strategyIntro` — consolidate with the 3.3.d `introParagraph` if the content
    overlaps; otherwise keep as a short strategy-focused intro.
  - `peerContext` — 1–2 paragraphs on where the fund sits relative to its group /
    Morningstar category peers (ties into 3.3.a + 3.3.b).
  - `strategyDescription` — the index / mandate / replication approach.
  - `upDownConditions` — structured rather than prose:
    `{ upsideDrivers: string[], downsideDrivers: string[], sensitivity:
    { rates?: 'High'|'Medium'|'Low', usdStrength?: ..., oilPrice?: ..., etc. } }`.
  - `topRisks` — an array of exactly N (default 3) risks, each
    `{ title, description, severity: 'High'|'Medium'|'Low' }`.
  - (Optional) `keyMetrics` — small K/V block (index, rebalance cadence, currency
    hedging, leverage factor, options-overlay details, etc.) so the UI can render
    it as a quick-facts panel.
- [ ] **Check which fields apply to which groups** — **not every field is
  universal**:
  - Equity ETFs: all of the above apply; `upDownConditions.sensitivity` leans on
    sectors / factors / regions.
  - Fixed-income ETFs: `upDownConditions.sensitivity` must include
    duration / credit-quality / curve-shape fields; `topRisks` shape differs
    (credit risk, duration risk, convexity risk).
  - Commodities ETFs: contango/backwardation, spot vs futures, roll yield.
  - Leveraged / inverse / options-income ETFs: volatility drag, decay, strike
    selection, call-overwrite cadence — these deserve their own fields.
  - Currency ETFs: rate differentials, carry.
  - Catalog the full set of groups from `etf-analysis-categories.json` and mark
    which fields are **required**, **optional**, or **n/a** per group.
- [ ] **Pick a storage shape** (open decision — pick one, document the rationale):
  - **Option A — single `strategy` JSON column** on `Etf` / the analysis record,
    with a TypeScript discriminated union keyed by `strategyType` / group. Zod
    schema per group validates shape before save.
  - **Option B — one `EtfStrategy` table** with the common fields as columns, plus
    a small `details` JSON column for group-specific extras.
  - **Option C — multiple tables per group family** (`EtfEquityStrategy`,
    `EtfFixedIncomeStrategy`, …). Cleanest schema, most migration cost.
  - Default recommendation: **Option A** (JSON + Zod) to start, revisit to
    Option B if querying structured sub-fields becomes common.
- [ ] **Prompt changes to emit the structured shape**:
  - Update the Strategy prompt to return each field separately instead of one
    markdown blob.
  - Add a Zod-validated JSON contract so prompt regressions fail loudly instead
    of silently producing malformed strategy sections.
  - Run this through the **automated factor/prompt tuning loop** (section 3.2)
    per group so the shape converges.
- [ ] **UI rendering** — once fields are separate, the detail page can:
  - Render **Strategy** as a tight 2–3-paragraph block (from
    `strategyDescription` + `peerContext`) per 3.3.d's layout goals.
  - Render **up/down conditions** as a small two-column list or sensitivity table.
  - Render **top risks** as a compact card list with severity badges.
  - Hoist a 1-line "strategy TL;DR" up near Final Summary if needed.
- [ ] **Migration / backfill**:
  - Keep the legacy single-field Strategy readable during transition (read-only
    fallback) until all ETFs are regenerated into the new shape.
  - After backfill, remove the legacy field.
- [ ] **Decide placement** — sibling section vs. expansion of 3.3.d:
  - Either (a) restructure the existing **Strategy** section on the detail page
    using these new fields (preferred, aligns with 3.3.d), or (b) add a new
    sibling section **"Improve Strategy"** next to Final Summary that renders the
    structured output. Pick one during implementation; don't ship both.

#### 3.3.f) Final Summary — simplify input schema + finalize prompt

Goal: the **Final Summary** generation currently receives the **entire** set of
analysis factors (every factor from Performance, Cost & Team, Risk, Future Outlook,
Index & Strategy, etc.) as its input. That's far more context than it needs — Final
Summary is a synthesis, not a re-analysis, so it should only consume the
**per-category overall analysis** and produce a clean top-level verdict from that.
This both shrinks the prompt (cheaper + faster) and reduces the model's temptation
to re-derive / second-guess category conclusions.

- [ ] **Slim the Final Summary input schema**:
  - Remove all per-factor detail (factor keys, per-factor scores, per-factor
    narratives, raw numerical inputs) from the Final Summary prompt input.
  - Pass **only** the per-category `overallAnalysis` (one synthesized paragraph
    per evaluation category: Performance, Cost & Team, Risk, Future Outlook,
    Index & Strategy, etc.) plus the small set of identity fields the prompt
    actually needs (symbol, name, issuer, category-group, Morningstar category,
    matched target-groups).
  - Document the new contract — `{ etfIdentity, perCategoryOverallAnalysis:
    Record<categoryKey, string>, matchedTargetGroups, generationDate }` — and
    enforce it with a Zod schema.
- [ ] **Stop re-fetching what we don't need**:
  - Update the Final Summary generation call site so it doesn't load full factor
    JSON from the DB just to throw it away; fetch only the `overallAnalysis`
    fields.
- [ ] **Finalize the Final Summary prompt**:
  - Rewrite the prompt around the slimmed input — it can reference each
    category's `overallAnalysis` by key and weave them into a single verdict
    without inventing or re-ranking underlying factors.
  - Keep alignment with the surrounding report-quality tasks:
    - Include the report-generation date (3.4 bullet).
    - Name the category / Morningstar category when it compares (3.3.a / 3.3.b).
    - Emit the per-target-group verdict block (3.3.c).
    - Emit the `introParagraph` alongside, if we bundle intro generation here
      (3.3.d).
  - Run the finalized prompt through the **automated factor/prompt tuning loop**
    (3.2) so the synthesis quality is tracked over iterations.
- [ ] **Validation**:
  - Spot-check across several ETFs from different groups that the slimmed input
    still produces Final Summaries at least as good as the current version, and
    no worse on category-accuracy or target-audience fit.
  - Regression watch: confirm no Final Summary relies on a factor-level detail
    that only existed in the old input schema.

### 3.4) Misc prompt updates

- [ ] **Include the report-generation date** in the **Final Summary** section of each prompt
  so the date appears in the generated output.

---

## Phase 4 — SEO, metadata, and sitemap automation

- [ ] **SEO/metadata review** after new sections:
  - Ensure titles/descriptions include comparison + competition keywords where appropriate.
  - Confirm structured data (JSON-LD) remains valid and updated.
- [ ] **Daily generation + sitemap updates**:
  - Generate 5–10 ETFs daily.
  - Push generated ETF URLs to sitemap (or sitemap index) automatically.

---

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
  - **Underlying cause** (markdown) — why the trend is happening.
  - **Historical analog** (markdown) — past equivalent shift (e.g. baby-boomer entry into
    housing market in the 1970s, post-WWII suburbanization, early-internet adoption curve).
    This is borrowed directly from scenarios and is high-value for trends.
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
  - **Outlook** (markdown) + **`outlookAsOfDate`** — "last reviewed" date so readers know how
    fresh the thesis is.
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
