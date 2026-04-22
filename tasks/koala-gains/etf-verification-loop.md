# ETF Verification & Refinement Loops

Automates the two refinement loops described in Phase 3 of `etfs.md`:

- **Loop A — Prompt refinement** (run once per evaluation category): sample 2 diverse ETFs
  per group → trigger report generation **for that one category only** → wait → read the
  prompt markdown and the generated output → document findings → edit the prompt file
  **only if needed**.
- **Loop B — Analysis-factor refinement**: read the same generated analyses (reuse Loop A's
  output — no re-run needed) → judge whether the factors assigned to each ETF's group are
  actually relevant/useful for that ETF → document findings → edit
  `etf-analysis-factors-*.json` **only if needed**.

"No change" is always a valid outcome — if the analysis looks good for that ETF / group,
record that in the findings doc and move on. Don't edit prompt or factor files just to have
a diff.

The heavy lifting is done by scripts. Claude's only responsibility is **reviewing the prompt
file and the generated analyses, writing findings, and (optionally) editing the prompt /
factor JSON**. Picking ETFs, enqueuing generation, waiting, and fetching reports are all
script work.

---

## Prerequisites

- `AUTOMATION_SECRET` exported (source `discord-claude-bot/.env`). Required by all four
  scripts now that `sample-etfs` hits an admin-gated endpoint.
- Optional: `KOALAGAINS_API_BASE` (default `https://koalagains.com`). Point this at a local
  server if you're iterating against `http://localhost:3000`.
- Optional: `KOALAGAINS_SPACE_ID` (default `koala_gains`).
- `yarn` / `tsx` available in `insights-ui/`.

All commands below run from `insights-ui/`.

---

## Evaluation categories → prompt file mapping

Prompts live in `docs/ai-knowledge/insights-ui/etf-prompts/`. Claude edits these files
directly — there is nothing to push through an API.

| Report type (`EtfReportType`) | Analysis category          | Prompt file                                                               |
| ----------------------------- | -------------------------- | ------------------------------------------------------------------------- |
| `performance-and-returns`     | `PerformanceAndReturns`    | `docs/ai-knowledge/insights-ui/etf-prompts/past-returns.md`               |
| `cost-efficiency-and-team`    | `CostEfficiencyAndTeam`    | `docs/ai-knowledge/insights-ui/etf-prompts/cost-efficiency-team.md`       |
| `risk-analysis`               | `RiskAnalysis`             | `docs/ai-knowledge/insights-ui/etf-prompts/risk-analysis.md`              |
| `future-performance-outlook`  | `FuturePerformanceOutlook` | `docs/ai-knowledge/insights-ui/etf-prompts/future-performance-outlook.md` |

Background on the refinement philosophy lives in `etf-prompts/prompt-finalization-approach.md`.

Groups are defined in `insights-ui/src/etf-analysis-data/etf-analysis-categories.json`
(`groups[]`). The `sample-etfs` script draws 2 ETFs from each of the 8 groups → 16 ETFs
per iteration.

---

## Helper scripts (`src/scripts/etf-verification/`)

| Command                   | Purpose                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `yarn etf-verify:sample`  | Call `/groups/{key}/diverse-etfs` per group, pick 2 diverse ETFs (different Mor category or AUM) per group  |
| `yarn etf-verify:trigger` | POST `/generation-requests` to enqueue reports for a **single** category                                    |
| `yarn etf-verify:wait`    | GET `/generation-requests/by-ids?ids=…` until all settle                                                    |
| `yarn etf-verify:fetch`   | GET `/exchange/{ex}/{sym}/analysis` → one md per ETF, **only the category being reviewed**                  |

### Which API returns the "output we get"?

`GET /api/{space}/etfs-v1/exchange/{EXCHANGE}/{SYMBOL}/analysis` — returns every
category analysis the server has stored for that ETF. `yarn etf-verify:fetch --category <cat>`
filters the rendered markdown to a single category so Claude reviews only the slice that
belongs to the current loop iteration.

### Which API returns the diverse-ETF list?

`GET /api/{space}/etfs-v1/groups/{groupKey}/diverse-etfs?limit=10` — returns up to `limit`
ETFs in the group, round-robin-picked across distinct Morningstar categories and ranked by
AUM. Only ETFs with populated MOR data (parseable `overviewTotalAssets`) are returned.
`yarn etf-verify:sample --per-group 2` then takes the first two with different categories
(or materially different AUM as a fallback).

---

## Findings document (both loops write this)

Every iteration of either loop writes a single findings markdown so the review is auditable
and the decision not to change anything is still captured. Suggested location:
`$ITER_ROOT/iter-$ITER/findings-<loop>-<category-or-"factors">.md`.

Template:

```markdown
# ETF verification findings — <loop A or B> — <category or "factors"> — iter-<N>

- **Date:** 2026-04-22
- **Loop:** A (prompt) / B (factors)
- **Category in scope:** PerformanceAndReturns | CostEfficiencyAndTeam | RiskAnalysis |
  FuturePerformanceOutlook | (all — for Loop B)
- **ETFs reviewed:**
  - broad-equity: SPY (Large Blend), IWF (Large Growth)
  - fixed-income-core: AGG (Intermediate Core Bond), SHY (Short Government)
  - muni: MUB (Muni National Interm), SUB (Muni National Short)
  - …

## Per-ETF review

### SPY (broad-equity — Large Blend)

- **What's good:** …
- **What's missing / wrong:** …
- **Verdict:** change needed / no change

### AGG (fixed-income-core — Intermediate Core Bond)

- **What's good:** …
- **What's missing / wrong:** …
- **Verdict:** change needed / no change

…

## Final changes

<for Loop A>

- `docs/ai-knowledge/insights-ui/etf-prompts/past-returns.md` — <one-line summary>, or
  **"no change — prompt produced solid output across the sampled ETFs."**

<for Loop B>

- `insights-ui/src/etf-analysis-data/etf-analysis-factors-<category>.json` — <one-line summary>, or
  **"no change — factors assigned to each group fit the sampled ETFs."**
```

Keep entries short — the findings file is a record of the review, not a rewrite of the
report. If no change is made, the `Final changes` section still needs a line stating that
explicitly.

---

## Loop A — prompt refinement (run once per category)

Work on **one category at a time**. Pick a category (e.g. `performance-and-returns`), run
the full A1 → A5 sequence, write findings, optionally edit the prompt, then move on to the
next category.

### A1. Pick 2 diverse ETFs per group (→ 16 ETFs)

```bash
export CATEGORY=performance-and-returns    # or cost-efficiency-and-team / risk-analysis / future-performance-outlook
export ITER=1
export ITER_ROOT="$PWD/../tasks/koala-gains/etf-verification/$(date +%Y-%m-%d)-$CATEGORY"
mkdir -p "$ITER_ROOT/iter-$ITER"

yarn etf-verify:sample \
  --per-group 2 \
  --out "$ITER_ROOT/sample.json"
```

The script calls `/groups/{key}/diverse-etfs` for each of the 8 groups and takes 2 ETFs per
group. The two picks inside a group will differ by category (from `EtfStockAnalyzerInfo.category`)
where possible; if the group only has one category with data, it falls back to two ETFs with
materially different AUM. Output: `sample.json` with 16 rows, each `{symbol, exchange, name,
group, groupName, category, aum, aumNumeric}`.

### A2. Enqueue generation for **this category only**

```bash
yarn etf-verify:trigger \
  --in "$ITER_ROOT/sample.json" \
  --categories "$CATEGORY" \
  --out "$ITER_ROOT/iter-$ITER/requests.json"
```

`requests.json` contains the new generation-request IDs and is only consumed by A3. The
request also regenerates `index-strategy` / `final-summary` flags as `false` — exactly one
category fires.

### A3. Wait for the queue to settle

```bash
yarn etf-verify:wait \
  --in "$ITER_ROOT/iter-$ITER/requests.json" \
  --interval-sec 20 \
  --timeout-min 90
```

Pass `--tick` if your environment has no external cron hitting
`/api/{space}/etfs-v1/generate-etf-v1-request`.

### A4. Fetch the analyses for **this category only**

```bash
yarn etf-verify:fetch \
  --in "$ITER_ROOT/sample.json" \
  --category "$CATEGORY" \
  --out-dir "$ITER_ROOT/iter-$ITER/reports"
```

Produces `reports/<group>/<SYMBOL>.md` — each file contains just the single category
section Claude needs to review.

### A5. Review, write findings, optionally edit the prompt

Claude's work — **this is the only manual step in the loop**:

1. Opens the prompt file from the mapping table (e.g.
   `docs/ai-knowledge/insights-ui/etf-prompts/past-returns.md`).
2. Opens every `reports/<group>/<SYMBOL>.md` produced in A4.
3. Notes concrete gaps — vague claims, missing metrics, wrong comparisons, boilerplate,
   group-level blind spots (e.g. "leveraged-inverse reports never mention daily-reset
   decay"), inconsistencies between factor Pass/Fail and the narrative.
4. Writes `$ITER_ROOT/iter-$ITER/findings-A-$CATEGORY.md` using the template above.
5. If the findings identify concrete problems, edits the prompt markdown in-place with the
   Edit tool. Keep placeholder names (`{{symbol}}`, `{{categoryKey}}`, …) and overall
   structure; only change instructions / guardrails.
6. If the analysis looks good for the sampled ETFs, **do not** edit the prompt. Record "no
   change" in the findings `Final changes` section.

### A6. Repeat for the next category

Reset `CATEGORY` and start again from A1. Do all four categories in turn, each in its own
`$ITER_ROOT` directory so the findings and reports for each category are segregated.

### Stop / review gate

Before merging, include in the PR description:

- The diff of each prompt file across iterations.
- One representative "before vs after" report pair per category.
- Any category where the loop stalled — flag for human review instead of another pass.

---

## Loop B — analysis-factor review

The factors JSONs live in `insights-ui/src/etf-analysis-data/etf-analysis-factors-*.json`
and are assigned **per group** (each factor lists the groups it applies to). Loop B is pure
review and optional edit — it does **not** re-trigger generation. Reuse whatever reports
Loop A already produced (or fetch fresh ones once if none exist).

### B1. Read the analyses

Use the reports written by `yarn etf-verify:fetch` (from Loop A, or from a single fetch run
if Loop A hasn't been run):

```bash
# Only needed if no reports dir exists yet:
export CATEGORY=performance-and-returns
export ITER_ROOT="$PWD/../tasks/koala-gains/etf-verification/$(date +%Y-%m-%d)-$CATEGORY"
yarn etf-verify:sample --per-group 2 --out "$ITER_ROOT/sample.json"
yarn etf-verify:fetch  --in "$ITER_ROOT/sample.json" --category "$CATEGORY" --out-dir "$ITER_ROOT/reports"
```

### B2. Review factor fit per ETF

For each ETF in `reports/<group>/<SYMBOL>.md`, Claude reads the `#### factor_key — Pass/Fail`
blocks under the category in scope and judges, specifically for **that ETF in its group**:

- Are the factors currently assigned to this group genuinely relevant and useful for this
  ETF?
- Is anything missing — an angle that matters for this group but has no factor today (e.g.
  "muni funds should score tax-equivalent yield")?
- Is anything not applicable — a factor that consistently produces vague / inapplicable
  output for ETFs in this group?

Write findings using the template above:
`$ITER_ROOT/iter-$ITER/findings-B-factors.md` — one file per category, with a per-ETF
"good / missing / verdict" block plus a final summary per `(group, category)`.

### B3. Edit the factor JSONs (only if the findings call for it)

If the findings identify concrete fixes, edit the JSON files in-place:

- `src/etf-analysis-data/etf-analysis-factors-performance-and-returns.json`
- `src/etf-analysis-data/etf-analysis-factors-cost-efficiency-and-team.json`
- `src/etf-analysis-data/etf-analysis-factors-risk-analysis.json`
- `src/etf-analysis-data/etf-analysis-factors-future-performance-outlook.json`

Rules:

- Preserve `factorKey` values whenever the concept is unchanged.
- New factors get new snake_case keys.
- Only rename/remove keys deliberately — note it in the PR description.
- `groups` arrays on each factor must reference keys that exist in
  `etf-analysis-categories.json`.

If the factors look fine across the sampled ETFs, do **not** edit. Record "no change" in the
findings `Final changes` section.

> **Verification only — no re-run.** Loop B does not re-trigger generation after editing.
> The new factors will take effect on the next normal generation (the server statically
> imports these JSON files, so a prod deploy is still required before end-users see the
> effect), but that's outside the scope of this review loop.

---

## Error handling notes

- All four scripts fail fast if `AUTOMATION_SECRET` is unset.
- `sample-etfs` warns if a group returns fewer than `--per-group` diverse ETFs with MOR
  data. If a group is consistently empty, populate its ETFs' MOR tables first (the
  generation-requests POST now auto-fires the scrape lambda when MOR data is missing, so
  just running A2 once will backfill).
- `wait-for-generation` reports `Failed` requests with the list of failed steps; re-run
  `trigger-generation` for those ETFs to retry.
- Prompt + factor edits are plain git diffs — revert a bad round with `git checkout --`.
