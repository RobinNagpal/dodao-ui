# ETF Prompt Improvement

Methodology, runbook, and iterative review notes from the prompt-tuning loop — each file captures findings or process docs that feed back into the prompts in [`../etf-prompts/`](../etf-prompts/).

## Methodology + runbook

- **[etf-verification-loop.md](etf-verification-loop.md)** — Two-loop methodology (Loop A prompt refinement, Loop B analysis-factor refinement) plus the findings-document template every iteration writes.
- **[run-prompt-analysis.md](run-prompt-analysis.md)** — Operational runbook for `Claude, run prompt improvement analysis on <category>` — 5 steps from env setup through retail-investor review.

## Per-round review notes

- **[etfs-per-group.md](etfs-per-group.md)** — Representative 3–4 ETFs per analysis group used as the working set for drafting, testing, and validating the Past Returns prompt.
- **[asset-class-factors-review.md](asset-class-factors-review.md)** — Review of asset-class-specific analysis factors for `PerformanceAndReturns` (2026-04-16).
- **[missing-data-in-performance-prompt-input.md](missing-data-in-performance-prompt-input.md)** — Audit of missing input fields in the PerformanceAndReturns prompt (2026-04-16) — drives Mor-data scrape additions.
- **[prompt-improvement-past-returns.md](prompt-improvement-past-returns.md)** — Summary of prompt-improvement findings across all 11 representative ETFs (2026-04-16).
- **[past-returns-review-2026-04-20.md](past-returns-review-2026-04-20.md)** — Per-ETF review of the Past Returns prompt against prompt id `ba7c2d75-…` (2026-04-20).

Per-run findings are written to [`../tasks/etf-verification/`](../tasks/etf-verification/) (dated by run).
