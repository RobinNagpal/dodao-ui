# ETF prompt iteration workflow

How we iterate on the four ETF analysis prompts. Every category follows the same loop;
this doc is the single source of truth.

The four categories:

| Category                     | Prompt file                                  | Factor JSON                                                       |
| ---------------------------- | -------------------------------------------- | ----------------------------------------------------------------- |
| `performance-and-returns`    | `etf-prompts/past-returns.md`                | `etf-analysis-factors-performance-and-returns.json`               |
| `cost-efficiency-and-team`   | `etf-prompts/cost-efficiency-team.md`        | `etf-analysis-factors-cost-efficiency-and-team.json`              |
| `risk-analysis`              | `etf-prompts/risk-analysis.md`               | `etf-analysis-factors-risk-analysis.json`                         |
| `future-performance-outlook` | `etf-prompts/future-performance-outlook.md`  | `etf-analysis-factors-future-performance-outlook.json`            |

All factor JSONs and the category/group mapping (`etf-analysis-categories.json`) live
under `insights-ui/src/etf-analysis-data/`. Prompt markdowns live under
`docs/ai-knowledge/insights-ui/etf-prompts/`.

---

## The four-stage loop

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ 1. Generate      │ →  │ 2. Review        │ →  │ 3. Edit          │ →  │ 4. Re-verify     │
│    (scripts)     │    │    (Claude)      │    │    (Claude /     │    │    (next iter)   │
│                  │    │                  │    │     user)        │    │                  │
└──────────────────┘    └──────────────────┘    └──────────────────┘    └──────────────────┘
```

Each stage has one deliverable. Stages do not overlap — a clean review is harder to
write when you're already thinking about prompt edits, so the workflow forces the split.

### Stage 1 — Generate (scripts)

Driven by `tasks/koala-gains/run-prompt-analysis.md`. Uses the hardcoded 16-ETF sample
in `insights-ui/src/etf-analysis-data/sample-etfs.json` (2 ETFs × 8 groups).

Three script steps, all run from `insights-ui/`:

1. `yarn etf-verify:trigger --in sample-etfs.json --categories <category> --out requests.json`
   — POSTs a generation request to the server for each of the 16 ETFs, scoped to the
   one category in focus. Leaves index-strategy / final-summary generation off.
2. `yarn etf-verify:wait --in requests.json` — polls the server until every request
   settles (Completed / Failed / Missing). Typical runtime: 5–10 minutes for 16 ETFs.
3. `yarn etf-verify:fetch --in sample-etfs.json --category <category> --out-dir reports/`
   — pulls the analysis markdown for each ETF, filtered to the one category.

The output tree for an iteration:

```
tasks/koala-gains/etf-verification/<YYYY-MM-DD>-<category>/iter-<N>/
├── requests.json
└── reports/
    ├── broad-equity/{SYM1,SYM2}.md
    ├── sector-thematic-equity/{SYM1,SYM2}.md
    ├── leveraged-inverse/{SYM1,SYM2}.md
    ├── fixed-income-core/{SYM1,SYM2}.md
    ├── fixed-income-credit/{SYM1,SYM2}.md
    ├── muni/{SYM1,SYM2}.md
    ├── alt-strategies/{SYM1,SYM2}.md
    └── allocation-target-date/{SYM1,SYM2}.md
```

### Stage 2 — Review (Claude, pure retail-investor lens)

Claude reads every `reports/<group>/<SYM>.md` and writes a single review file:

```
tasks/koala-gains/etf-verification/<date>-<category>/iter-<N>/retail-investor-review.md
```

The review brief — this is what Claude is asked in step 5 of `run-prompt-analysis.md`:

> Make a new review file where you analyze and review all 16 ETFs analysis for
> `<category>`.
>
> Forget the prompt context. You just need to review the analysis of these ETFs:
>
> - Is this analysis relevant for this ETF?
> - Is this analysis useful for the retail investor who wants to invest in this ETF?
> - Is this analysis good if someone is reading this and has to make a decision on
>   whether they want to invest in this ETF or not?
>
> Don't cross-check the numbers. Most numbers and data points are correct. See if we
> are presenting decisive information for those numbers. If we are explaining the
> numbers well or not.
>
> If we are saying this xyz ETF has return abc number of return in past, then is
> this number good? That's the main question.
>
> Review these all 16 ETFs analyses from every angle of a retail investor who wants
> to invest into ETFs. Then list findings for each of the 16 ETFs. Per ETF, write
> 6-7 main sentences only, covering both good and bad things about the analysis we
> have.

**Stage 2 does not edit the prompt.** It only emits the review file. This is the most
common place the workflow goes wrong — it is tempting to jump straight to prompt edits,
but mixing review and edit produces a review that rationalises the edits.

File format: per-ETF block with 6–7 sentences covering what works and what's missing,
grouped under the 8 group headings from the sample file, followed by a
"cross-cutting takeaways" section summarising repeated patterns.

### Stage 3 — Edit (Claude + user, in a follow-up conversation)

After reading the review, the user starts a **new** Claude conversation (or continues in
the same thread) and asks for edits to the prompt markdown. The prompt the user
typically sends looks like:

> On the basis of `retail-investor-review.md`, make the appropriate and required changes
> in `<prompt-file>` so these issues do not come in ETF analysis.

Claude's job here is to translate review findings into prompt-rule changes. Typical
edit patterns across the four categories to date:

- Tighten factor Pass/Fail so it can't contradict the narrative verdict.
- Add an explicit "who this fits" retail use-case line to the closing paragraph.
- Require a retail-accessible comparison point for every headline number (cash / HYSA /
  T-bill / S&P 500 / category median / inflation).
- Add category-specific tax-treatment flags when they materially change the retail
  decision (e.g. commodity trusts → collectibles rate, covered-call → ordinary income,
  preferred stock → mixed QDI, national muni → state-tax angle).
- Require plain-English translation of beta / duration / leverage-multiplier ("beta 1.17
  = ~17% amplification of market moves"), not just the metric number.
- Expand the pre-emit checklist with the specific slips the review flagged.

Occasionally an edit goes to the **factor JSON** instead of (or alongside) the prompt —
for example, if the review shows a factor is a poor fit for a specific group, swap it
out. The JSON must keep exactly 5 factors per group for `performance-and-returns` (the
only group-based category); the other three are asset-class-based.

Frozen prompt copy: after editing the live prompt in the DB (if applicable) also update
the markdown copy under `docs/ai-knowledge/insights-ui/etf-prompts/<category>.md`. That
markdown copy is what Stage 1 of the next iteration will generate from.

### Stage 4 — Re-verify (next iteration)

Run Stage 1 again on the same 16 ETFs. The next `retail-investor-review.md` should be
shorter — that's the signal the prompt is converging. When a review produces no new
structural findings, only minor wording comments, the prompt is done for that iteration
cycle.

---

## Artefacts the branch accumulates per category

Each iteration round leaves three (sometimes four) files in the branch, all under
`tasks/koala-gains/etf-verification/<date>-<category>/iter-<N>/`:

| File                                    | Stage | Written by                    |
| --------------------------------------- | ----- | ----------------------------- |
| `requests.json`                         | 1     | `yarn etf-verify:trigger`     |
| `reports/<group>/<SYM>.md` × 16         | 1     | `yarn etf-verify:fetch`       |
| `findings-A-<category>.md`              | (opt) | Claude — prompt-audit pass    |
| `findings-B-factors.md`                 | (opt) | Claude — factor-JSON audit    |
| `retail-investor-review.md`             | 2     | Claude — retail lens          |

**`findings-A` and `findings-B` are optional.** They only appear when the iteration
explicitly runs Loop A (prompt audit) or Loop B (factor audit) from
`etf-verification-loop.md`. The default workflow described here is Loop C — the
retail-investor lens — which is the one the runbook in
`tasks/koala-gains/run-prompt-analysis.md` drives.

`requests.json` and the raw `reports/` directory can be dropped from the branch after
the iteration is done — their content is frozen in the findings and review files. Keep
them while the iteration is still in progress so Claude can re-read on demand without
re-triggering generation.

---

## Why keep the four categories in one branch

Iter-1 across all four categories was done in parallel branches
(`review-risk-analysis`, `prompt-review-cost-efficiency-team`,
`prompt-review-future-performance-outlook`, `prompts-review`) and then folded into a
single branch for review. The reason: the four prompts share recurring patterns (tone
guardrails, Pass/Fail-vs-narrative alignment, retail comparisons, tax flags), and a
single branch lets the user see all four prompt deltas together and merge one PR
instead of four. For iter-2 onward, either approach works — just pick one and be
consistent.

---

## Pitfalls that have bitten this workflow before

- **Mixing review and edit in one turn.** The review starts rationalising the edits
  the author already has in mind. Always write the review file, commit, start fresh for
  the edit conversation.
- **Editing the prompt when the factors are the problem.** If a factor produces thin
  content for every ETF in a group, editing the prompt can't fix it — the factor needs
  to be swapped or re-scoped in the JSON. Check both before editing.
- **Forgetting the server-side factor drift.** During iter-1 on
  `performance-and-returns`, a few ETFs (XLV, AGG, HYG, JEPI) got factors in the
  server-generated report that aren't in the repo JSON. That's a prod / repo sync issue,
  not a prompt issue. Flag it and move on; don't try to fix it from the prompt side.
- **Over-editing "just to have a diff".** "No change — prompt produced solid output
  across the sampled ETFs" is a valid outcome for any iter. Trust the review.
- **Dropping `sample-etfs.json` changes into an iter.** The 16-ETF list is sticky on
  purpose — re-using the same set across iterations makes the deltas comparable.
  Changing the sample ETFs between iterations produces a review that cannot be compared
  to the previous one.

---

## Related docs

- `tasks/koala-gains/run-prompt-analysis.md` — the operational runbook driven by
  `Claude, run prompt improvement analysis on <category>`.
- `tasks/koala-gains/etf-verification-loop.md` — the original Loop A (prompt) + Loop B
  (factor) reference. This doc is the higher-level workflow; the loop doc is the
  detailed reference.
- `docs/ai-knowledge/insights-ui/etf-prompts/prompt-finalization-approach.md` —
  historical notes on how the first version of each prompt was finalized (pre this
  retail-investor-review workflow).
