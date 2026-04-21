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

## What we need now (new tasks)

### A) Review and finalize category grouping

- [ ] **Review the current groups** in `etf-analysis-categories.json`.
  - Confirm each group is relevant and good to go.
  - Identify overlaps and ambiguous placements (ETFs that could belong to multiple groups).
  - Decide whether groups are **mutually exclusive** or **multi-tag**.
- [ ] **Finalize the final groups**

### B) Automated loop — finalize analysis factors AND prompts (per group + category)

_Replaces the previous manual sections for "finalize analysis factors" and "finalize prompts".
Uses the same iterative loop approach as section M ("Automated prompt-improvement loop"),
extended to also refine the factor set for each `(group, category)`._

Goal: build a lightweight automated wrapper that, for each `(group, evaluation category)`,
iteratively converges on (a) the right set of **analysis factors** and (b) the right
**prompt**, by generating output over many ETFs in the group and asking Claude to validate
and refine.

Categories in scope: `PerformanceAndReturns`, `CostEfficiencyAndTeam`, `RiskAnalysis`
(and any new category added later).

- [ ] **Loop design** — per iteration, per `(group, category)`:
  1. **Generate** analysis output for several ETFs in the group using the current factor list
     and current prompt.
  2. **Validate with Claude**: for each ETF, ask Claude whether the current factors are
     correct / complete / relevant for that ETF, and collect the findings.
  3. **Aggregate findings** across the sampled ETFs to distinguish ETF-specific noise from
     group-level gaps (factors missing for the whole group, factors that don't apply, unclear
     wording, etc.).
  4. **Update**: ask Claude to propose an updated factor list AND an updated prompt that
     addresses the findings.
  5. **Persist** the new factor JSON + prompt version with a version id + diff + notes.
  6. Repeat steps 1–5 up to a configurable `N` iterations (default 5, max ~10).
- [ ] **Sample coverage per run**:
  - Run across **all groups** defined in `etf-analysis-categories.json`.
  - Within each group, sample **many ETFs** (not just 2–3) so factor validation reflects the
    variety inside the group — target e.g. 5–10 ETFs per group.
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

### D) Build “Most famous ETFs” dataset (per group)

- [ ] **Identify the most famous ETFs** under each group.
  - Selection criteria: AUM, liquidity/volume, popularity/recognition, longevity, issuer reputation.
- [ ] **Add a JSON dataset** in codebase with:
  - `groupKey -> famousEtfs[]` (symbol, exchange, name, issuer, why-famous, optional AUM/expense ratio snapshot if available).
  - Keep it editable by humans and suitable for prompt conditioning.
- [ ] **Add minimal validation/types** for the JSON (runtime validation optional, TS types required).

### E) New report section: “Comparison with famous ETFs”

Goal: Compare the current ETF against the group’s famous ETFs and answer: “Why would we choose this ETF over those?”

- [ ] **Define input schema** for this section:
  - Current ETF summary (fees, AUM, performance, holdings concentration, tracking, risk metrics).
  - “Famous ETF set” from the JSON (and optionally their live-fetched stats if available).
  - Group context (what investors typically want from this group).
- [ ] **Define output schema** for this section:
  - Comparisons table/list (current vs each competitor).
  - “Choose this ETF if…” bullets.
  - “Prefer competitor if…” bullets.
  - Final recommendation + rationale + caveats.
- [ ] **Finalize prompt** for this section.
- [ ] **Database (Prisma) changes**:
  - Add a model to store this new section output per ETF (and per group/version).
  - Decide if results are stored as structured columns vs JSON blob + derived fields.
- [ ] **Pipeline changes**:
  - Add this as a new generation step (with dependencies on the 3 category analyses if required).
  - Add callback saving logic and status tracking.
- [ ] **UI changes**:
  - Add new section on ETF report page to display comparisons and “why choose” reasoning.

### F) Competition module (dynamic competitor picking + analysis)

Goal: A new “competition section” where competitors are selected based on same category/group and AUM proximity (and optionally liquidity, expense ratio band).

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
  - “Closest substitutes” and “best alternatives for X goal”.
- [ ] **UI**:
  - Separate page for competition analysis.
  - Competition chart similar to what we do for stocks (metric comparisons + tooltips).
  - “Similar ETFs” section on main ETF page linking to competitors.
- [ ] **Pipeline + storage**:
  - Prisma schema additions for competition analysis results.
  - Add generation step(s) + callback saving + caching.
- [ ] **Finalize prompt** for competition analysis.

### G) SEO, metadata, and sitemap automation

- [ ] **SEO/metadata review** after new sections:
  - Ensure titles/descriptions include comparison + competition keywords where appropriate.
  - Confirm structured data (JSON-LD) remains valid and updated.
- [ ] **Daily generation + sitemap updates**:
  - Generate 5–10 ETFs daily.
  - Push generated ETF URLs to sitemap (or sitemap index) automatically.

### H) Admin: ETF generation requests page

Page: https://koalagains.com/admin-v1/etf-generation-requests

- [ ] **Sort reports by `updatedAt` descending** in each section.
- [ ] **Add pagination** to each section.
- [ ] **Add a top filter** that matches generation reports by entered **name** or **symbol**.
- [ ] **Reload icon + auto-refresh**:
  - Show a reload icon on the page that refreshes the data on click.
  - Auto-refresh the page every **30 seconds**.
  - Provide a control to **stop / start** the auto-refresh.

### I) Prompt updates

- [ ] **Include the report-generation date** in the **Final Summary** section of each prompt so the date appears in the generated output.

### J) ETF Details Page layout

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

### K) Competition / Similar ETFs

- [ ] **Competition section** for ETFs (mirroring what we have for stocks):
  - Build the competition section end-to-end.
  - Include a **competition chart** comparing key metrics across competitors.
- [ ] **"Other similar ETFs" section** on the main ETF page:
  - Show a curated/auto-selected set of similar ETFs with quick links and key stats.

### L) Target audience / Goals

Goal: Tag each ETF with the investor goals it satisfies, and surface those goals in the analysis output.

- [ ] **Define a goals/target-audience taxonomy** for ETFs. Examples:
  - "Fixed income with no downside"
  - "Fixed income with low risk"
  - "High yield with moderate or high risk"
- [ ] **Capture matching goals during ETF analysis**:
  - When generating an ETF report, determine which goals from the taxonomy this ETF meets.
  - Persist the matched goals on the ETF record.
- [ ] **Open question — equity goal representation**:
  - Decide how to represent goals for equity-style ETFs (e.g. country/region funds like India / China ETFs) where the "goal" is more thematic/exposure-based than risk-return based.
  - Propose candidate goal labels for equity (e.g. "Emerging-market equity exposure", "Single-country thematic exposure", "Sector tilt").

### M) Automated prompt-improvement loop

Goal: build a lightweight wrapper that iteratively improves the prompts for each evaluation
category by repeatedly generating a report, critiquing it, and asking Claude to rewrite the
prompt. Running this loop 5–10 times per (group, category) should converge on higher-quality,
more consistent prompts.

- [ ] **Loop design** — a small script/CLI that does the following per iteration:
  1. **Generate** a report for a given `(group, ETF, evaluation category)` using the current
     prompt.
  2. **Read** the generated response.
  3. **Critique** via Claude: ask Claude what is missing, inconsistent, vague, or factually weak
     in the response, and record those findings.
  4. **Update the prompt**: ask Claude to rewrite the prompt so it addresses the findings from
     step 3.
  5. **Persist** the new prompt version (with a version id + diff + notes).
  6. Repeat steps 1–5 up to a configurable `N` iterations (default 5, max ~10).
- [ ] **Sample coverage per run**:
  - Run the loop across **all groups**.
  - Within each group, run it over **a few representative ETFs** (e.g. 2–3 per group) so the
    critique isn't fit to a single ETF.
- [ ] **Categories covered**: run independently for each of the 3 evaluation categories
  (`PerformanceAndReturns`, `CostEfficiencyAndTeam`, `RiskAnalysis`) and later any new
  sections (e.g. "Comparison with famous ETFs", "Competition").
- [ ] **Inputs / configuration**:
  - Which groups, which ETFs per group, which category, how many iterations.
  - Current prompt file path(s) as the starting point.
- [ ] **Outputs / artifacts per iteration**:
  - The generated report.
  - The critique notes ("what's missing").
  - The new prompt (with version id and a short changelog entry).
  - A final summary comparing first vs last iteration.
- [ ] **Storage layout** for iteration artifacts (suggested):
  - `tasks/koala-gains/prompt-tuning/<category>/<group>/<iteration>/{prompt.md, report.md, critique.md}`
    or equivalent under the repo / a dedicated runs directory.
- [ ] **Light wrapper only** — do NOT build a heavy framework:
  - Reuse existing generation pipeline / CLI where possible.
  - The wrapper just orchestrates generate → critique → rewrite → save.
- [ ] **Stop / review gate**:
  - After N iterations, stop and present the final prompt for human review before it replaces
    the live prompt.
