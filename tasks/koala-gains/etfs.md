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

### 3.3) Misc prompt updates

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

- [ ] **Trend entries** — each trend should capture:
  - Title + short description (e.g. "2026 — aging boomer retirement wave drives healthcare
    demand", "younger generation prefers experiences over ownership", "shift from ICE to EV",
    "re-shoring of semiconductor manufacturing", etc.).
  - Time horizon (near-term / multi-year / structural).
  - Evidence / sources (news, data, research) supporting the trend.
  - **Mapped ETFs**: symbols that should benefit, with a short thesis per ETF (why this ETF
    captures the trend — sector, geography, thematic tilt, holdings concentration).
  - **"Priced-in?" assessment**: our current view on whether the market has already factored
    this in, with rationale (valuation, flows, AUM trend, premium/discount to NAV).
  - Confidence rating.
  - Author + `createdAt` / `updatedAt`.
- [ ] **Page UI**:
  - Trends index (filter/sort by horizon, confidence, updatedAt, tag).
  - Trend detail page listing mapped ETFs and the thesis.
  - From an ETF's report page, link to the trends that reference it ("this ETF appears in
    the following trends").
- [ ] **Authoring flow**:
  - Admin can create/edit trends.
  - Optional: Claude-assisted draft — given a trend description, suggest candidate ETFs +
    initial thesis + "priced-in?" assessment for human review.
- [ ] **Storage**:
  - Prisma model for trends + a join table to ETFs (many-to-many with a thesis field).
- [ ] **Open questions**:
  - Should trends be shared between stocks and ETFs (single trend mapped to both), or kept
    as separate datasets? (See stock-side task for the symmetrical ask.)
  - How do we revisit / retire trends that played out or failed — lifecycle states
    (active / played-out / invalidated)?
