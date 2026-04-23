# ETF Reports — KoalaGains (Status + Next Tasks)

## Status (already done) ✅

- [x] All ETF financial-data is fetched and available for report generation.
- [x] Report generation pipeline is working end-to-end.
- [x] UI exists for ETF detail report page plus 3 separate category pages.
- [x] ETF categories are divided into groups in `insights-ui/src/etf-analysis-data/etf-analysis-categories.json`.
- [x] Analysis factors exist per category:
  - `insights-ui/src/etf-analysis-data/etf-analysis-factors-performance-and-returns.json`
  - `insights-ui/src/etf-analysis-data/etf-analysis-factors-cost-efficiency-and-team.json`
  - `insights-ui/src/etf-analysis-data/etf-analysis-factors-risk-analysis.json`
- [x] Price chart section is done.
- [x] Introductory paragraphs are done (including index & strategy fields).

## Priority order

1. **Complete the ETF UI** — ETF details page, competition, similar ETFs, famous-ETFs comparison, admin pages.
2. **Target audience / Goals**.
3. **Prompt and analysis-factor improvements** (automated loop) — includes category-grouping review.
4. **SEO, metadata, and sitemap automation**.

---

## Phase 1 — Complete the ETF UI

### 1.1) ETF Details Page layout

Example page: https://koalagains.com/etfs/NASDAQ/QQQI

Reorder/extend the ETF details page so sections appear in this order:

- [ ] **Final Summary** (shown first).
- [ ] **Stock analysis info (left) + spider chart (right)** in a two-column layout.
- [ ] **Price chart**.
- [ ] **Strategy** with a proper heading.
- [ ] **Other sections** below.
- [ ] **Per-category detail pages**: add a dedicated details page for each of the evaluation categories.
- [ ] **Admin three-dots menu** (per section / evaluation category / report):
  - Show a three-dots menu visible only to admins.
  - Menu options let the admin trigger generation of any report from that dropdown.
  - Triggered reports should be queued/added into the **ETF generation requests** list.
- [ ] **Admin-only `updatedAt` timestamp**:
  - Display the `updatedAt` datetime for each section / evaluation category / report.
  - Visible only to admin users.
- [ ] **ETF holdings section**:
  - Show the ETF's underlying **holdings** on the details page (ticker, name, weight %,
    sector, optional country/region).
  - Sort by weight descending; show a clear default of top N (e.g. 10 or 25) with a "view
    all holdings" expand / link to a full list.
  - Include summary stats above the table: total holdings count, top-10 concentration %,
    sector/geography breakdown (mini bar or pie).
  - Link each holding's ticker to our stock report page where one exists; otherwise show as
    plain text.
  - Handle ETFs where we don't yet have holdings data (graceful empty state, don't break
    the page).
  - Confirm the data source (existing ingestion vs new) and refresh cadence.

### 1.2) Competition + Similar ETFs

Goal: build a competition section for ETFs (mirroring what we have for stocks) where
competitors are selected based on same category/group and AUM proximity (and optionally
liquidity, expense-ratio band), plus a lightweight "similar ETFs" block on the main ETF page.

- [ ] **Competitor selection logic**:
  - Rules: same group/category, similar AUM size bands, optional issuer diversity.
  - Cap competitor count (e.g., 5–10) and define tie-breakers.
- [ ] **Generate competition analysis**:
  - Narrative + key differentiators (fees, AUM, liquidity, tracking, holdings concentration, risk).
- [ ] **Define input schema**:
  - Current ETF + selected competitors with comparable metrics.
  - Group context and scoring preferences.
- [ ] **Define output schema**:
  - Ranked competitor list + rationale.
  - Chart-ready series (for competition chart).
  - "Closest substitutes" and "best alternatives for X goal".
- [ ] **Finalize prompt** for competition analysis.
- [ ] **Pipeline + storage**:
  - Prisma schema additions for competition analysis results.
  - Add generation step(s) + callback saving + caching.
- [ ] **UI**:
  - Separate page for competition analysis.
  - **Competition chart** similar to what we do for stocks (metric comparisons + tooltips).
  - **"Other similar ETFs" section** on the main ETF page — curated/auto-selected set with
    quick links and key stats, linking to the full competition page.

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

### 1.4) Admin — ETF generation requests page

Page: https://koalagains.com/admin-v1/etf-generation-requests

- [ ] **Sort reports by `updatedAt` descending** in each section.
- [ ] **Add pagination** to each section.
- [ ] **Add a top filter** that matches generation reports by entered **name** or **symbol**.
- [ ] **Reload icon + auto-refresh**:
  - Show a reload icon on the page that refreshes the data on click.
  - Auto-refresh the page every **30 seconds**.
  - Provide a control to **stop / start** the auto-refresh.
- [ ] **Header columns — include every report type** (page: `https://koalagains.com/admin-v1/etf-reports`):
  - Today the table header only shows **Performance**, **Cost & Team**, and **Risk**.
  - Add the missing report-type columns so the header covers **all** types we generate:
    **Performance**, **Cost & Team**, **Risk**, **Summary**, **Index & Strategy**, and
    **Future Outlook** (Future Outlook is currently absent from the header).
  - Each column should reflect the per-ETF status for that specific report type
    (generated / missing / in-progress / failed).
- [ ] **"Select missing" dropdown — split the generic option into per-report-type options**:
  - Current behavior: the dropdown has a single **"Missing Analysis"** option that selects
    every ETF missing **any** of the 4 report types it knows about. This is too coarse and
    also out of sync with the full set of report types.
  - Remove the generic **"Missing Analysis"** entry.
  - Replace it with **one option per report type**, each of which selects only the ETFs
    missing **that specific** report type:
    - Missing Performance
    - Missing Cost & Team
    - Missing Risk
    - Missing Summary
    - Missing Index & Strategy
    - Missing Future Outlook
  - Add a new **"Missing All Analysis"** option that selects only ETFs where **all** of the
    above report types are missing (i.e. the ETF has nothing generated yet).
- [ ] **Per-ETF "Generate All Analysis" — actually generate every report type**:
  - Current behavior: when an admin opens the per-ETF actions menu, the **"Generate All
    Analysis"** option only kicks off a subset of the report types.
  - Fix so that **"Generate All Analysis"** for a single ETF enqueues generation requests for
    **every** report type we support (Performance, Cost & Team, Risk, Summary, Index &
    Strategy, Future Outlook), not just the ones it currently covers.
  - Keep the existing per-type generation options alongside it (so admins can still generate
    just one report type for an ETF).

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

### 3.1) Review and finalize category grouping (prerequisite)

- [ ] **Review the current groups** in `etf-analysis-categories.json`:
  - Confirm each group is relevant and good to go.
  - Identify overlaps and ambiguous placements (ETFs that could belong to multiple groups).
  - Decide whether groups are **mutually exclusive** or **multi-tag**.
- [ ] **Finalize the final groups**.

### 3.2) Automated loop — finalize analysis factors AND prompts (per group + category)

Goal: build a lightweight automated wrapper that, for each `(group, evaluation category)`,
iteratively converges on (a) the right set of **analysis factors** and (b) the right
**prompt**, by generating output over many ETFs in the group and asking Claude to validate
and refine.

Categories in scope: `PerformanceAndReturns`, `CostEfficiencyAndTeam`, `RiskAnalysis`
(and any new category added later — e.g. competition, famous-ETF comparison).

- [ ] **Loop design** — per iteration, per `(group, category)`:
  1. **Generate** analysis output for several ETFs in the group using the current factor list
     and current prompt.
  2. **Validate with Claude**: for each ETF, ask Claude whether the current factors are
     correct / complete / relevant for that ETF, and whether the report is missing anything,
     inconsistent, vague, or factually weak. Record findings.
  3. **Aggregate findings** across the sampled ETFs to distinguish ETF-specific noise from
     group-level gaps (factors missing for the whole group, factors that don't apply, unclear
     wording, etc.).
  4. **Update**: ask Claude to propose an updated factor list AND an updated prompt that
     addresses the findings.
  5. **Persist** the new factor JSON + prompt version with a version id + diff + notes.
  6. Repeat steps 1–5 up to a configurable `N` iterations (default 5, max ~10).
- [ ] **Sample coverage per run**:
  - Run across **all groups** defined in `etf-analysis-categories.json`.
  - Within each group, sample **many ETFs** (target 5–10 per group) so factor validation
    reflects the variety inside the group.
- [ ] **Inputs / configuration**:
  - Groups to cover, ETFs per group, category, iteration count.
  - Starting factor JSONs:
    - `insights-ui/src/etf-analysis-data/etf-analysis-factors-performance-and-returns.json`
    - `insights-ui/src/etf-analysis-data/etf-analysis-factors-cost-efficiency-and-team.json`
    - `insights-ui/src/etf-analysis-data/etf-analysis-factors-risk-analysis.json`
  - Starting prompt files for each category.
- [ ] **Outputs / artifacts per iteration**:
  - Generated reports for each sampled ETF.
  - Claude's factor-validation notes per ETF + aggregated group-level findings.
  - New factor JSON (proposed) + new prompt (proposed), each with a changelog entry.
  - End-of-run summary comparing first vs last iteration (factors added/removed/renamed,
    prompt diff).
- [ ] **Storage layout** (suggested):
  - `tasks/koala-gains/prompt-tuning/<category>/<group>/<iteration>/{factors.json, prompt.md, reports/<etfSymbol>.md, critique.md}`
- [ ] **Backward-compatibility guardrails**:
  - Preserve factor **keys** where the concept is unchanged (so existing saved results don't
    break).
  - Only rename/remove keys deliberately, and record the migration in the changelog.
- [ ] **Mapping finalization** — at loop end, produce the final
  `groupKey -> { performanceAndReturnsFactors, costEfficiencyAndTeamFactors, riskAnalysisFactors }`
  mapping.
- [ ] **Light wrapper only** — reuse the existing generation pipeline/CLI; the wrapper just
  orchestrates generate → validate → refine → save.
- [ ] **Stop / review gate**:
  - After N iterations, stop and present the final factor JSON + prompt for human review
    before they replace the live versions.

### 3.3) Improve ETF report quality — explicit category context

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
