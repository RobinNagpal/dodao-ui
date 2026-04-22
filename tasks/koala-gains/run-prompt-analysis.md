# Run prompt improvement analysis — ETF evaluation categories

**How to invoke:** `Claude, run prompt improvement analysis on <category>` where
`<category>` is one of:

- `performance-and-returns`
- `cost-efficiency-and-team`
- `risk-analysis`
- `future-performance-outlook`

Claude: do exactly the 5 steps below in order. Do not skip, do not reorder, do not
improvise. Background context is in `etf-verification-loop.md` if you need it — otherwise
trust this file and move.

---

## Category → prompt file

| `<category>`                 | Prompt file to review & possibly edit                                     |
| ---------------------------- | ------------------------------------------------------------------------- |
| `performance-and-returns`    | `docs/ai-knowledge/insights-ui/etf-prompts/past-returns.md`               |
| `cost-efficiency-and-team`   | `docs/ai-knowledge/insights-ui/etf-prompts/cost-efficiency-team.md`       |
| `risk-analysis`              | `docs/ai-knowledge/insights-ui/etf-prompts/risk-analysis.md`              |
| `future-performance-outlook` | `docs/ai-knowledge/insights-ui/etf-prompts/future-performance-outlook.md` |

---

## Prerequisite

`AUTOMATION_SECRET` exported (source `discord-claude-bot/.env`).

All commands below run from `insights-ui/`.

---

## 1. Set env + pick ETFs (script)

```bash
export CATEGORY=<category>                                     # the arg the user gave
export ITER=1
export ITER_ROOT="$PWD/../tasks/koala-gains/etf-verification/$(date +%Y-%m-%d)-$CATEGORY"
mkdir -p "$ITER_ROOT/iter-$ITER"

yarn etf-verify:sample --per-group 2 --out "$ITER_ROOT/sample.json"
```

→ 16 ETFs (2 per group × 8 groups), different categories or AUM inside each group.

## 2. Enqueue generation for just this category (script)

```bash
yarn etf-verify:trigger \
  --in "$ITER_ROOT/sample.json" \
  --categories "$CATEGORY" \
  --out "$ITER_ROOT/iter-$ITER/requests.json"
```

## 3. Wait for the queue to settle (script)

```bash
yarn etf-verify:wait \
  --in "$ITER_ROOT/iter-$ITER/requests.json" \
  --interval-sec 20 \
  --timeout-min 90
```

## 4. Fetch analyses, filtered to this category (script)

```bash
yarn etf-verify:fetch \
  --in "$ITER_ROOT/sample.json" \
  --category "$CATEGORY" \
  --out-dir "$ITER_ROOT/iter-$ITER/reports"
```

## 5. Review + write findings + (maybe) edit prompt (Claude)

1. Open the prompt file from the table above.
2. Open every `reports/<group>/<SYMBOL>.md` produced in step 4.
3. Write `$ITER_ROOT/iter-$ITER/findings-A-$CATEGORY.md` using this template:

   ```markdown
   # ETF prompt review — $CATEGORY — iter-$ITER

   - **Date:** <YYYY-MM-DD>
   - **ETFs reviewed:** list `<group>: SYM1 (cat), SYM2 (cat)` for all 8 groups

   ## Per-ETF review

   ### SYM (group — category)
   - **What's good:** …
   - **What's missing / wrong:** …
   - **Verdict:** change needed / no change

   <repeat for each of the 16 ETFs>

   ## Final changes

   - `<prompt file path>` — <one-line summary>,
     or **"no change — prompt produced solid output across the sampled ETFs."**
   ```

4. If the findings identify concrete problems, edit the prompt markdown in-place. Keep
   placeholders (`{{symbol}}`, `{{categoryKey}}`, …) and overall structure — only
   change instructions / guardrails.
5. If the analysis looks good, **do not edit**. Record "no change" in `Final changes`.

---

## End-of-task output

After step 5, the branch should contain:

- `tasks/koala-gains/etf-verification/<date>-<category>/sample.json` and
  `iter-1/{requests.json, reports/, findings-A-<category>.md}`.
- Optionally an edit to the single prompt markdown file.

Commit with a short message (`prompt(etfs): …` or `docs(etfs): iter-N findings for
$CATEGORY`) and push. Open a PR if one doesn't exist on this branch yet.
