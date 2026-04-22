# ETF Verification & Refinement Loops

Automates the two refinement loops described in Phase 3 of `etfs.md`:

- **Loop A — Prompt refinement** (for each evaluation category): pick ETFs → trigger report
  generation → wait → read the current prompt (markdown file) and the generated output →
  document findings → edit the prompt file **only if needed**.
- **Loop B — Analysis-factor refinement**: read the same generated analyses (reuse Loop A's
  output — no re-run needed) → judge whether the factors assigned to each ETF's group are
  actually relevant/useful for that ETF → document findings → edit
  `etf-analysis-factors-*.json` **only if needed**.

"No change" is always a valid outcome — if the analysis looks good for that ETF / group,
record that in the findings doc and move on. Don't edit prompt or factor files just to have
a diff.

Both loops work entirely on **files in this repo** — prompts live as markdown, factors live
as JSON. No DB writes. The loops use live APIs only to (a) enqueue generation and (b) read
the output back.

---

## Prerequisites

- `AUTOMATION_SECRET` exported (source `discord-claude-bot/.env`). Required by
  `trigger-generation` and `wait-for-generation`.
- Optional: `KOALAGAINS_API_BASE` (default `https://koalagains.com`). Point this at a local
  server if you're iterating against `http://localhost:3000`.
- Optional: `KOALAGAINS_SPACE_ID` (default `koala_gains`).
- `yarn` / `tsx` available in `insights-ui/`.

All commands below run from `insights-ui/`.

---

## Evaluation categories → prompt file mapping

Prompts live in `docs/ai-knowledge/insights-ui/etf-prompts/`. Claude edits these files
directly — there is nothing to push through an API.

| Report type (`EtfReportType`)     | Analysis category            | Prompt file                                                    |
| --------------------------------- | ---------------------------- | -------------------------------------------------------------- |
| `performance-and-returns`         | `PerformanceAndReturns`      | `docs/ai-knowledge/insights-ui/etf-prompts/past-returns.md`    |
| `cost-efficiency-and-team`        | `CostEfficiencyAndTeam`      | `docs/ai-knowledge/insights-ui/etf-prompts/cost-efficiency-team.md` |
| `risk-analysis`                   | `RiskAnalysis`               | `docs/ai-knowledge/insights-ui/etf-prompts/risk-analysis.md`   |
| `future-performance-outlook`      | `FuturePerformanceOutlook`   | `docs/ai-knowledge/insights-ui/etf-prompts/future-performance-outlook.md` |

Background on the refinement philosophy lives in `etf-prompts/prompt-finalization-approach.md`.

Groups and the "famous" seed ETFs per group live in
`insights-ui/src/etf-analysis-data/most-famous-etfs-by-group.json`.

---

## Helper scripts (`src/scripts/etf-verification/`)

| Command                              | Purpose                                                                          |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `yarn etf-verify:sample`             | Sample N famous ETFs per group, write a JSON array                               |
| `yarn etf-verify:trigger`            | POST to `/api/{space}/etfs-v1/generation-requests` to enqueue reports            |
| `yarn etf-verify:wait`               | GET `/api/{space}/etfs-v1/generation-requests/by-ids?ids=…` until all settle     |
| `yarn etf-verify:fetch`              | GET `/api/{space}/etfs-v1/exchange/{exchange}/{symbol}/analysis` → one md per ETF |

### Which API returns the "output we get"?

`GET /api/{space}/etfs-v1/exchange/{EXCHANGE}/{SYMBOL}/analysis` — returns every
category analysis the server has stored for that ETF, including summary, overall analysis,
and per-factor Pass/Fail explanations. `yarn etf-verify:fetch` wraps this call and writes
one markdown file per ETF into `--out-dir <group>/<SYMBOL>.md` so Claude can read them
directly.

Compare that markdown against the prompt markdown to judge quality.

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
  - broad-equity: SPY, IWF, IWD
  - fixed-income-core: AGG, BND
  - muni: MUB, SUB
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

## Loop A — prompt refinement (file-based)

### A1. Pick ETFs

```bash
export ITER=1
export ITER_ROOT="$PWD/../tasks/koala-gains/etf-verification/$(date +%Y-%m-%d)"
mkdir -p "$ITER_ROOT/iter-$ITER"
yarn etf-verify:sample --per-group 3 --out "$ITER_ROOT/sample.json"
```

### A2. Enqueue report generation for the 4 evaluation categories

```bash
yarn etf-verify:trigger \
  --in "$ITER_ROOT/sample.json" \
  --categories performance-and-returns,cost-efficiency-and-team,risk-analysis,future-performance-outlook \
  --out "$ITER_ROOT/iter-$ITER/requests.json"
```

`requests.json` contains the new generation-request IDs and is only consumed by A3.

### A3. Wait for the queue to settle

```bash
yarn etf-verify:wait \
  --in "$ITER_ROOT/iter-$ITER/requests.json" \
  --interval-sec 20 \
  --timeout-min 90
```

Pass `--tick` if your environment has no external cron hitting
`/api/{space}/etfs-v1/generate-etf-v1-request`.

### A4. Read the prompt and the generated output

```bash
yarn etf-verify:fetch \
  --in "$ITER_ROOT/sample.json" \
  --out-dir "$ITER_ROOT/iter-$ITER/reports"
```

Produces `reports/<group>/<SYMBOL>.md` with all four category sections rendered.

Claude then, for **each evaluation category**:

1. Opens the prompt file from the mapping table (e.g. `docs/ai-knowledge/insights-ui/etf-prompts/past-returns.md`).
2. Opens the corresponding section inside each `reports/<group>/<SYMBOL>.md`.
3. Notes concrete gaps — vague claims, missing metrics, wrong comparisons, boilerplate,
   group-level blind spots (e.g. "leveraged-inverse reports never mention daily-reset decay"),
   inconsistencies between factor Pass/Fail and the narrative.
4. Writes a findings document using the template above:
   `$ITER_ROOT/iter-$ITER/findings-A-<category>.md`.

### A5. Edit the prompt file (only if the findings call for it)

If the findings doc identified concrete problems, edit the prompt markdown in-place with the
Edit tool. Keep placeholder names (`{{symbol}}`, `{{categoryKey}}`, …) and overall structure;
only change the instructions / guardrails. Commit the edit as a normal git diff on this
branch.

If the analysis looks good for the sampled ETFs, do **not** edit the prompt. Record "no
change" in the findings `Final changes` section and move on.

### A6. Repeat

Re-run A2 → A4 with `ITER=2`, `ITER=3`, … Stop once a full pass produces no meaningful new
critiques (or after ~3 iterations — whichever comes first).

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
yarn etf-verify:sample --per-group 5 --out "$ITER_ROOT/sample.json"
yarn etf-verify:fetch  --in "$ITER_ROOT/sample.json" --out-dir "$ITER_ROOT/reports"
```

### B2. Review factor fit per ETF

For each ETF in `reports/<group>/<SYMBOL>.md`, Claude reads the `#### factor_key — Pass/Fail`
blocks under every category and judges, specifically for **that ETF in its group**:

- Are the factors currently assigned to this group genuinely relevant and useful for this
  ETF?
- Is anything missing — an angle that matters for this group but has no factor today (e.g.
  "muni funds should score tax-equivalent yield")?
- Is anything not applicable — a factor that consistently produces vague / inapplicable
  output for ETFs in this group?

Write findings using the template above:
`$ITER_ROOT/iter-$ITER/findings-B-factors.md` — one file covering all four categories, with
a per-ETF "good / missing / verdict" block plus a final summary per `(group, category)`.

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

- `trigger-generation` fails fast if `AUTOMATION_SECRET` is unset or any ETF symbol isn't in
  the DB. Clean up the sample file before retrying.
- `wait-for-generation` reports `Failed` requests with the list of failed steps; re-run
  `trigger-generation` for those ETFs to retry just the failed categories.
- Prompt + factor edits are plain git diffs — revert a bad round with `git checkout --`.
