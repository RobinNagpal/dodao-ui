# Insights-UI Tasks

Active KoalaGains task lists — open work, closed work, per-surface roadmaps. These files drive ongoing development; read the relevant one before starting work in that surface area.

## Open task lists

- **[overall_task.md](overall_task.md)** — Site-wide tasks + user feedback that apply across stocks, ETFs, tariffs, scenarios.
- **[etfs.md](etfs.md)** — Top open ETF tasks (custom reports, ETFs listing page, active-management surfacing, prompt + factor improvements, comparison-base open questions, SEO, social media, trends).
- **[stocks.md](stocks.md)** — Open stock-side tasks (scenarios Phase 2/3/4 + open questions, 10-bagger shortlist, founder/management lookups, social media, off-hours refresh, recategorization, internet-augmented Claude Code generation).
- **[tariffs.md](tariffs.md)** — Open tariff tasks.
- **[optional_tariff_features.md](optional_tariff_features.md)** — Highest-value tariff features to consider next, with market mapping. Treat as a backlog of feature ideas, not committed work.

## Closed / archive

- **[etf-closed-tasks.md](etf-closed-tasks.md)** — Completed ETF work, moved out of `etfs.md` so the open list stays focused.

## Prompt-tuning + verification artifacts

The runbook + methodology have moved out of `tasks/` into [`../etf-prompt-improvement/`](../etf-prompt-improvement/) (knowledge, not active tasks):

- **[../etf-prompt-improvement/run-prompt-analysis.md](../etf-prompt-improvement/run-prompt-analysis.md)** — Runbook for `Claude, run prompt improvement analysis on <category>`.
- **[../etf-prompt-improvement/etf-verification-loop.md](../etf-prompt-improvement/etf-verification-loop.md)** — Two-loop methodology (prompt refinement + factor refinement) the runbook implements.

Per-run findings still land here:

- **[etf-verification/](etf-verification/)** — Dated per-run output (e.g. `2026-04-22-past-returns/findings-A-performance-and-returns.md`).
