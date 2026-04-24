# Run prompt improvement analysis — ETF evaluation categories

**How to invoke:** `Claude, run prompt improvement analysis on <category>` where
`<category>` is one of:

- `performance-and-returns`
- `cost-efficiency-and-team`
- `risk-analysis`
- `future-performance-outlook`

Claude: do exactly the 5 steps below in order. Do not skip, do not reorder, do not
improvise. Background context on the original prompt + factor audit loops is in
`etf-verification-loop.md` in this folder — this runbook is the retail-review loop and
is self-contained.

> **Important — the prompt is NOT reviewed in this runbook.** Claude's job here is to
> review the **generated analyses** through a retail-investor lens and emit a review
> file. The prompt itself is edited in a **separate follow-up conversation** driven by
> the user, after they read the review. Do not edit the prompt file in this run.

---

## Inputs

**Hardcoded ETF list:** `insights-ui/src/etf-analysis-data/sample-etfs.json` — 16 ETFs
(2 per group × 8 groups), each with `{symbol, exchange, name, group, groupName, category}`.
Use it as-is for every run.

**Category → prompt file mapping** (for reference / the follow-up conversation — **not**
edited in this runbook):

| `<category>`                 | Prompt file                                                               |
| ---------------------------- | ------------------------------------------------------------------------- |
| `performance-and-returns`    | `docs/ai-knowledge/insights-ui/etf-prompts/past-returns.md`               |
| `cost-efficiency-and-team`   | `docs/ai-knowledge/insights-ui/etf-prompts/cost-efficiency-team.md`       |
| `risk-analysis`              | `docs/ai-knowledge/insights-ui/etf-prompts/risk-analysis.md`              |
| `future-performance-outlook` | `docs/ai-knowledge/insights-ui/etf-prompts/future-performance-outlook.md` |

**Prerequisite:** `AUTOMATION_SECRET` exported (source `discord-claude-bot/.env`).

All commands below run from `insights-ui/`.

---

## 1. Set env + prep iteration dir

```bash
export CATEGORY=<category>                                     # the arg the user gave
export ITER=1
export ITER_ROOT="$PWD/../tasks/koala-gains/etf-verification/$(date +%Y-%m-%d)-$CATEGORY"
export SAMPLE="$PWD/src/etf-analysis-data/sample-etfs.json"
mkdir -p "$ITER_ROOT/iter-$ITER"
```

## 2. Enqueue generation for just this category (script)

```bash
yarn etfs:trigger \
  --in "$SAMPLE" \
  --categories "$CATEGORY" \
  --out "$ITER_ROOT/iter-$ITER/requests.json"
```

## 3. Wait for the queue to settle (script)

```bash
yarn etfs:wait \
  --in "$ITER_ROOT/iter-$ITER/requests.json" \
  --interval-sec 20 \
  --timeout-min 90
```

## 4. Fetch analyses, filtered to this category (script)

```bash
yarn etfs:fetch \
  --in "$SAMPLE" \
  --category "$CATEGORY" \
  --out-dir "$ITER_ROOT/iter-$ITER/reports"
```

## 5. Retail-investor review of the 16 analyses (Claude)

> **Read every `reports/<group>/<SYMBOL>.md` produced in step 4. Forget the prompt.
> Review the analyses only.**

Follow these instructions verbatim — they are the review brief the user wants executed
every iteration:

```
Make a new review file where you analyze and review the all 16 ETFs analysis for
<CATEGORY>.

Forget the prompt context. You just need to review the analysis of these ETFs:

- Is this analysis relevant for this ETF?
- Is this analysis useful for the retail investor who wants to invest in this ETF?
- Is this analysis good if someone is reading this and has to make a decision on
  whether they want to invest in this ETF or not?

Don't cross-check the numbers. Most numbers and data points are correct. See if we
are presenting decisive information for those numbers. If we are explaining the
numbers well or not.

If we are saying this xyz ETF has return abc number of return in past, then is this
number good? That's the main question.

Review these all 16 ETFs analyses from every angle of a retail investor who wants
to invest into ETFs. Then list findings for each of the 16 ETFs. Per ETF, write
6-7 main sentences only, covering both good and bad things about the analysis we
have.
```

### Output file

Write the review to:

```
$ITER_ROOT/iter-$ITER/retail-investor-review.md
```

Recommended structure:

```markdown
# Retail-investor review — <category> analyses — iter-<N>

- **Date:** <YYYY-MM-DD>
- **Lens:** retail investor deciding whether to buy this ETF. Is the analysis
  decisive? Are the numbers explained (good / bad / typical)? What's missing for
  the decision?
- **Not checking:** raw numbers (assumed correct), prompt-rule violations, factor
  fit (those have their own loops).

## Per-ETF review

### SYM (group — category)

1. …one sentence…
2. …
3. …
4. …
5. …
6. …
7. (optional)

<repeat for all 16 ETFs, grouped by the 8 group headings from `sample-etfs.json`>

## Cross-cutting takeaways

- 4–6 bullets summarising the patterns that repeat across ETFs (common missing
  context, contradictions between the Pass/Fail list and the narrative, missing
  retail comparisons, missing tax notes, readability issues, etc.).
```

### What Claude does NOT do in this step

- Do NOT edit the prompt markdown.
- Do NOT edit the factor JSON.
- Do NOT cross-check numbers against external sources.
- Do NOT restructure the review into a prompt-rules audit — this review is purely
  retail-decision-usefulness. The prompt-side audit is a different loop (see
  `etf-verification-loop.md` → Loop A).

---

## End-of-task output (what this branch should contain)

```
tasks/koala-gains/etf-verification/<date>-<category>/iter-1/
├── requests.json                      # from step 2
├── reports/                           # from step 4 (16 markdowns)
│   ├── broad-equity/{SYM}.md
│   ├── sector-thematic-equity/{SYM}.md
│   ├── leveraged-inverse/{SYM}.md
│   ├── fixed-income-core/{SYM}.md
│   ├── fixed-income-credit/{SYM}.md
│   ├── muni/{SYM}.md
│   ├── alt-strategies/{SYM}.md
│   └── allocation-target-date/{SYM}.md
└── retail-investor-review.md          # from step 5
```

Commit with `docs(etfs): iter-<N> retail-investor review of 16 <category> analyses`
and push.

---

## What happens next (not part of this runbook)

The **user** reads `retail-investor-review.md` and starts a **follow-up conversation**
that asks Claude to translate the review findings into concrete edits to the prompt
markdown file for that category. That follow-up is where §6 of
`etf-verification-loop.md` (prompt tightening) happens.

This split exists on purpose: a clean review is hard to write when the author is
already thinking about prompt edits. Separating the two steps keeps each one honest.
