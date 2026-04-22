# ETF Verification & Refinement Loops

Automates the two refinement loops described in Phase 3 of `etfs.md`:

- **Loop A — Prompt refinement** (for each evaluation category): pick ETFs → trigger report
  generation → wait → read the current prompt (markdown file) and the generated output →
  edit the prompt file → repeat.
- **Loop B — Analysis-factor refinement** (no prompt changes): sample ETFs per group → read
  their factor results → propose factor JSON updates → edit `etf-analysis-factors-*.json` →
  repeat until the factor set feels right across the group.

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

### A5. Edit the prompt file (if needed)

Claude edits the markdown file in-place with the Edit tool. Keep placeholder names
(`{{symbol}}`, `{{categoryKey}}`, …) and overall structure — only change the instructions /
guardrails. Commit the edit as a normal git diff on this branch.

### A6. Repeat

Re-run A2 → A4 with `ITER=2`, `ITER=3`, … Stop once a full pass produces no meaningful new
critiques (or after ~3 iterations — whichever comes first).

### Stop / review gate

Before merging, include in the PR description:

- The diff of each prompt file across iterations.
- One representative "before vs after" report pair per category.
- Any category where the loop stalled — flag for human review instead of another pass.

---

## Loop B — analysis-factor refinement (no prompt changes)

Factors live in `insights-ui/src/etf-analysis-data/etf-analysis-factors-*.json`. Claude
edits them in-place; no API required for the edit itself.

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

### B3. Critique factor fit per (group, category)

For each `(group, category)` combination, Claude reads the corresponding ETFs' factor
blocks (`#### factor_key — Pass/Fail`) and judges:

- **Missing:** factors this group/category clearly needs but the current list does not cover
  (e.g. "muni funds need tax-equivalent yield").
- **Not applicable:** factors currently assigned to this group that consistently produce
  vague / inapplicable results across all sampled ETFs.
- **Wording:** factor titles/descriptions/metrics unclear or wrong for this group.

Write findings to `iter-1/factor-critique-<category>.md`.

### B4. Edit the factor JSONs in-place

- `src/etf-analysis-data/etf-analysis-factors-performance-and-returns.json`
- `src/etf-analysis-data/etf-analysis-factors-cost-efficiency-and-team.json`
- `src/etf-analysis-data/etf-analysis-factors-risk-analysis.json`
- `src/etf-analysis-data/etf-analysis-factors-future-performance-outlook.json`

Rules (backward compatibility):

- Preserve `factorKey` values whenever the concept is unchanged.
- New factors get new snake_case keys.
- Only rename/remove keys deliberately — note the change in the PR description.
- `groups` arrays on each factor must reference keys that exist in `etf-analysis-categories.json`.

### B5. Re-run and stop when the group-level gaps dry up

Re-enqueue generation (`etf-verify:trigger` → `etf-verify:wait` → `etf-verify:fetch`) so the
new factor JSONs are picked up by the next report, then re-evaluate. End when factor
critiques no longer find group-level gaps.

---

## Error handling notes

- `trigger-generation` fails fast if `AUTOMATION_SECRET` is unset or any ETF symbol isn't in
  the DB. Clean up the sample file before retrying.
- `wait-for-generation` reports `Failed` requests with the list of failed steps; re-run
  `trigger-generation` for those ETFs to retry just the failed categories.
- Prompt + factor edits are plain git diffs — revert a bad round with `git checkout --`.
