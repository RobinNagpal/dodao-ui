# ETF Verification & Refinement Loops

Automates the two refinement loops described in Phase 3 of `etfs.md`:

- **Loop A — Prompt refinement** (for each evaluation category): trigger report generation →
  wait → read reports → spot issues → rewrite the prompt → push a new active prompt version →
  repeat.
- **Loop B — Analysis-factor refinement** (no prompt changes): sample ETFs per group → read
  their factor results → propose factor JSON updates → edit `etf-analysis-factors-*.json` →
  repeat until the factor set feels right across the group.

Loop A requires a running KoalaGains server (uses live APIs + DB). Loop B is purely offline —
Claude reads JSON + cached reports and edits factor files in the worktree.

The loops are designed so Claude Code can **invoke the full cycle** by running the scripts
below in order. Each iteration is resumable; intermediate artifacts are written to disk.

---

## Prerequisites

- `AUTOMATION_SECRET` exported (source `discord-claude-bot/.env`). Needed for `trigger-generation`
  and `wait-for-generation` (both hit `withAdminOrToken` endpoints). Not required for
  `fetch-analysis`, `get-prompt`, `update-prompt`, or the optional tick endpoint.
- Optional: `KOALAGAINS_API_BASE` (default `https://koalagains.com`). Set to
  `http://localhost:3000` when running the loop against a local server.
- Optional: `KOALAGAINS_SPACE_ID` (default `koala_gains`).
- `yarn` / `tsx` available in `insights-ui/`.

All commands below run from `insights-ui/`.

> **Security caveat for `update-prompt`:** the `POST /api/{space}/prompts/{promptId}/versions`
> route is currently unauthenticated. Only run this loop in environments where that is
> acceptable (local dev, or trusted runner against prod). Tightening that route to
> `withAdminOrToken` is a follow-up.

---

## Evaluation categories (loop A) and prompt keys

| Report type (`EtfReportType`)     | Analysis category (`EtfAnalysisCategory`) | Prompt key (DB)                  |
| --------------------------------- | ----------------------------------------- | -------------------------------- |
| `performance-and-returns`         | `PerformanceAndReturns`                   | `US/etfs/performance-returns`    |
| `cost-efficiency-and-team`        | `CostEfficiencyAndTeam`                   | `US/etfs/cost-efficiency-team`   |
| `risk-analysis`                   | `RiskAnalysis`                            | `US/etfs/risk-analysis`          |
| `future-performance-outlook`      | `FuturePerformanceOutlook`                | `US/etfs/future-performance-outlook` |

Groups and "famous" seed ETFs per group live in
`insights-ui/src/etf-analysis-data/most-famous-etfs-by-group.json`.

---

## Helper scripts (all under `src/scripts/etf-verification/`)

| Command                              | Purpose                                                               |
| ------------------------------------ | --------------------------------------------------------------------- |
| `yarn etf-verify:sample`             | Sample N famous ETFs per group, write `{symbol, exchange, group, …}` JSON |
| `yarn etf-verify:trigger`            | Enqueue generation requests for a list of ETFs + categories           |
| `yarn etf-verify:wait`               | Poll until generation requests settle (Completed/Failed)              |
| `yarn etf-verify:fetch`              | For each ETF, pull its current category analyses and write markdown   |
| `yarn etf-verify:get-prompt`         | Dump the active prompt template(s) for the 4 evaluation categories    |
| `yarn etf-verify:update-prompt`      | Create a new `PromptVersion` from a file and activate it              |

All output paths below are suggested — any workspace dir is fine. Writes land outside `src/`
so they aren't picked up by the Next build.

---

## Loop A — automated prompt refinement

One iteration drives _all four_ evaluation-category prompts in parallel. Claude Code runs the
loop for `N` iterations (default 3; max ~5 before human review).

### A0. Setup (once per run)

```bash
export ITER_ROOT="$PWD/../tasks/koala-gains/etf-verification/$(date +%Y-%m-%d)"
mkdir -p "$ITER_ROOT"
yarn etf-verify:sample --per-group 3 --out "$ITER_ROOT/sample.json"
```

Pick 3–5 ETFs per group (sampling is deterministic — the first N from
`most-famous-etfs-by-group.json`).

### A1. Trigger generation for the 4 evaluation categories

```bash
yarn etf-verify:trigger \
  --in "$ITER_ROOT/sample.json" \
  --categories performance-and-returns,cost-efficiency-and-team,risk-analysis,future-performance-outlook \
  --out "$ITER_ROOT/iter-1/requests.json"
```

The POST endpoint merges flags into any existing `NotStarted` request for an ETF, so running
this a second time for the same ETFs does not create duplicates.

**File flow:** `sample.json` is the flat ETF list used by A3 (`fetch-analysis`). The
`requests.json` written by A1 holds the generation-request IDs and is consumed by A2
(`wait-for-generation`). Keep them separate — do not feed `requests.json` into `fetch-analysis`.

### A2. Wait for completion

```bash
yarn etf-verify:wait \
  --in "$ITER_ROOT/iter-1/requests.json" \
  --interval-sec 20 \
  --timeout-min 90
```

Pass `--tick` if your environment has no external cron hitting
`/api/{space}/etfs-v1/generate-etf-v1-request`.

### A3. Fetch current analyses

```bash
yarn etf-verify:fetch \
  --in "$ITER_ROOT/sample.json" \
  --out-dir "$ITER_ROOT/iter-1/reports"
```

Produces `iter-1/reports/<group>/<SYMBOL>.md` with all four category sections rendered.

### A4. Claude critiques reports (per category)

Claude Code (you) reads all `reports/<group>/<SYMBOL>.md` files and, for **each evaluation
category**, writes a critique to `iter-1/critiques/<category>.md` covering:

- Concrete flaws observed across ETFs (vagueness, boilerplate, factual weakness, missing
  metrics, wrong comparisons, inconsistent verdict logic, etc.).
- Group-level patterns (e.g. "leveraged-inverse reports never mention daily-reset decay").
- What the prompt should explicitly ask for that it currently doesn't.

### A5. Fetch the current prompts

```bash
yarn etf-verify:get-prompt --out-dir "$ITER_ROOT/iter-1/prompts-before"
```

Produces `US__etfs__performance-returns.prompt.md` (and `.meta.json`) for each of the four
prompts.

### A6. Claude rewrites each prompt

For each of the four categories, Claude Code writes a new template to
`iter-1/prompts-after/<safe-key>.prompt.md`, applying the critique. Keep placeholder names
and overall structure — only change content.

### A7. Push new prompt versions

```bash
for KEY in \
  US/etfs/performance-returns \
  US/etfs/cost-efficiency-team \
  US/etfs/risk-analysis \
  US/etfs/future-performance-outlook; do
  SAFE=$(echo "$KEY" | sed 's|[/:]|__|g')
  yarn etf-verify:update-prompt \
    --key "$KEY" \
    --file "$ITER_ROOT/iter-1/prompts-after/$SAFE.prompt.md" \
    --message "iter-1 automated refinement"
done
```

`update-prompt` creates a new `PromptVersion` with an auto-incremented version number and
sets it as the active version.

### A8. Repeat for iter-2, iter-3, …

Re-run A1–A7 pointing at `iter-2/`, `iter-3/`, ... Stop after N iterations (default 3) and
surface the final prompts + a diff summary for human review before leaving them active.

### Stop / review gate

At the end of the final iteration, include:

- Diff of `prompts-before → prompts-after` for each of the 4 categories.
- List of the most common critique themes that drove the changes.
- Any category where quality did **not** improve — those may need a human-in-the-loop review
  instead of another automated iteration.

---

## Loop B — analysis-factor refinement (no prompt changes)

The factor JSONs live as files — no API needed. Claude edits them in-place. The loop is:

### B1. Sample 4–5 ETFs per group

```bash
export FACTOR_ROOT="$PWD/../tasks/koala-gains/etf-verification/factors-$(date +%Y-%m-%d)"
mkdir -p "$FACTOR_ROOT"
yarn etf-verify:sample --per-group 5 --out "$FACTOR_ROOT/sample.json"
```

### B2. Fetch each sampled ETF's current analysis

```bash
yarn etf-verify:fetch \
  --in "$FACTOR_ROOT/sample.json" \
  --out-dir "$FACTOR_ROOT/iter-1/reports"
```

### B3. Claude evaluates factor fit per group + category

For each `(group, category)` combination, Claude reads the corresponding ETFs' factor
results (`#### factor_key — Pass/Fail` blocks in `<SYMBOL>.md`) and judges:

- **Missing:** what this group/category clearly needs that the current factor list does not
  cover (e.g. "muni funds need tax-equivalent yield; not represented").
- **Not applicable:** factors currently assigned to this group that consistently produce
  vague / inapplicable results across all sampled ETFs.
- **Wording:** factor titles/descriptions/metrics that are unclear or wrong for this group.

Write findings to `iter-1/factor-critique-<category>.md`.

### B4. Claude edits the factor JSONs

Edit in the worktree (not via API):

- `src/etf-analysis-data/etf-analysis-factors-performance-and-returns.json`
- `src/etf-analysis-data/etf-analysis-factors-cost-efficiency-and-team.json`
- `src/etf-analysis-data/etf-analysis-factors-risk-analysis.json`
- `src/etf-analysis-data/etf-analysis-factors-future-performance-outlook.json`

Rules (backward compatibility):

- Preserve `factorKey` values whenever the concept is unchanged.
- New factors get new snake_case keys.
- Only rename/remove keys deliberately — note the change in the PR description.
- `groups` arrays on each factor must reference keys that exist in
  `etf-analysis-categories.json`.

### B5. Re-run the loop without touching prompts

Re-enqueue generation (`etf-verify:trigger` → `etf-verify:wait`) so the new factor JSONs are
picked up by the next report, then fetch again and re-evaluate. The loop ends when the factor
critiques stop finding group-level gaps.

### B6. Final artifacts

At the end of loop B, produce:

- A summary of factors added / removed / renamed per category (grouped by category + group).
- The final JSONs committed on the branch.
- A list of ETFs that still produced weak factor output — flag these as candidates for a
  follow-up data-quality task rather than another factor iteration.

---

## Error handling notes

- `trigger-generation` calls fail fast if `AUTOMATION_SECRET` is unset or any ETF symbol is
  not found in the DB. Clean up the sample file before retrying.
- `wait-for-generation` reports `Failed` requests with the list of failed steps; rerun
  `trigger-generation` for those ETFs to retry just the failed categories.
- `update-prompt` creates a new version every call — the old versions remain in the DB and
  can be reactivated via the admin UI if an automated refinement regresses quality.
- Factor edits are plain git diffs — revert with `git checkout --` if a round goes wrong.
