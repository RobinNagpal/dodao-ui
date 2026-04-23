# ETF Reports — Closed Tasks

Completed ETF work, moved out of `etfs.md` so the open-task list stays focused on what's
still pending. Organized under the same headings as `etfs.md` for traceability.

---

## Status (foundational) ✅

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

---

## Phase 1 — Complete the ETF UI

### 1.1) ETF Details Page layout — completed items

- [x] **Final Summary** (shown first).
- [x] **Other sections** below.
- [x] **Per-category detail pages**: dedicated details page for each of the evaluation
  categories.
- [x] **Admin three-dots menu** (per section / evaluation category / report):
  - Three-dots menu visible only to admins.
  - Menu options let the admin trigger generation of any report from that dropdown.
  - Triggered reports are queued/added into the **ETF generation requests** list.
- [x] **Admin-only `updatedAt` timestamp**:
  - `updatedAt` datetime displayed for each section / evaluation category / report.
  - Visible only to admin users.
- [x] **ETF holdings section**:
  - ETF's underlying **holdings** shown on the details page (ticker, name, weight %,
    sector, optional country/region).
  - Sorted by weight descending; default top N (e.g. 10 or 25) with a "view all holdings"
    expand / link to a full list.
  - Summary stats above the table: total holdings count, top-10 concentration %,
    sector/geography breakdown.
  - Each holding's ticker links to our stock report page where one exists; otherwise
    shown as plain text.
  - Graceful empty state for ETFs without holdings data.
  - Data source + refresh cadence confirmed.

### 1.2) Competition + Similar ETFs — completed items

- [x] **Pipeline + storage**:
  - Prisma schema additions for competition / similar-ETF analysis results.
  - Generation step(s) + callback saving + caching wired up.
- [x] **"Other similar ETFs" section** on the main ETF page — curated/auto-selected set
  with quick links and key stats, linking to the full competition page.

### 1.4) Admin — ETF generation requests page — completed items

Page: https://koalagains.com/admin-v1/etf-generation-requests (+ `/admin-v1/etf-reports`)

- [x] **Reload icon + auto-refresh**:
  - Reload icon refreshes the data on click.
  - Auto-refresh every **30 seconds**.
  - Control to **stop / start** the auto-refresh.
- [x] **Header columns — include every report type**:
  - Header now covers **Performance**, **Cost & Team**, **Risk**, **Summary**, **Index
    & Strategy**, and **Future Outlook**.
  - Each column reflects the per-ETF status for that specific report type.
- [x] **"Select missing" dropdown — split into per-report-type options**:
  - Generic **"Missing Analysis"** entry removed.
  - Replaced with one option per report type (Missing Performance, Missing Cost & Team,
    Missing Risk, Missing Summary, Missing Index & Strategy, Missing Future Outlook).
  - New **"Missing All Analysis"** option that selects only ETFs where all report types
    are missing.
- [x] **Per-ETF "Generate All Analysis" — generates every report type**:
  - Now enqueues generation requests for **every** supported report type (Performance,
    Cost & Team, Risk, Summary, Index & Strategy, Future Outlook).
  - Existing per-type generation options retained alongside it.

---

## Phase 3 — Prompt and analysis-factor improvements — completed items

### 3.1) Review and finalize category grouping (prerequisite) ✅

- [x] **Review the current groups** in `etf-analysis-categories.json`:
  - Each group confirmed as relevant.
  - Overlaps / ambiguous placements identified.
  - Decision on **mutually exclusive** vs **multi-tag** made.
- [x] **Finalize the final groups**.

### 3.2) Automated loop — finalize analysis factors AND prompts (per group + category) ✅

The whole workflow described in `etfs.md` section 3.2 is implemented:

- [x] **Loop design** — per iteration, per `(group, category)`:
  1. Generate analysis output for several ETFs in the group.
  2. Validate with Claude (correct / complete / relevant, gaps, inconsistencies).
  3. Aggregate findings across sampled ETFs (ETF-specific noise vs. group-level gaps).
  4. Update — Claude proposes a new factor list + updated prompt.
  5. Persist the new factor JSON + prompt version with version id + diff + notes.
  6. Repeat up to a configurable `N` iterations (default 5, max ~10).
- [x] **Sample coverage per run** — all groups, 5–10 ETFs per group.
- [x] **Inputs / configuration** — groups, ETFs per group, category, iteration count,
  starting factor JSONs + starting prompt files.
- [x] **Outputs / artifacts per iteration** — generated reports, validation notes,
  aggregated findings, new factor JSON + new prompt, changelog entries, end-of-run
  summary.
- [x] **Storage layout** —
  `tasks/koala-gains/prompt-tuning/<category>/<group>/<iteration>/...`
- [x] **Backward-compatibility guardrails** — stable keys, deliberate renames only.
- [x] **Mapping finalization** — final
  `groupKey -> { performanceAndReturnsFactors, costEfficiencyAndTeamFactors, riskAnalysisFactors }`
  mapping produced at loop end.
- [x] **Light wrapper only** — reuses the existing generation pipeline/CLI.
- [x] **Stop / review gate** — final factor JSON + prompt presented for human review
  before replacing live versions.
