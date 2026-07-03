# Insights-UI Tasks

Active KoalaGains task lists. Two files — open work and closed work. Read the relevant
sections before starting work in that surface area.

- **[todo-tasks.md](todo-tasks.md)** — All open work across stocks, ETFs, scenarios, tariffs, and site-wide concerns, grouped under top-level headings.
- **[closed-tasks.md](closed-tasks.md)** — Completed work moved out of `todo-tasks.md` so the open list stays focused. Each entry is verified against the current codebase.
- **[research-add-new-report.md](research-add-new-report.md)** — Architecture map for "add a new report": the four report families, the runtime "Create New Report" flow, and the file checklist for adding a brand-new report _type_.
- **[commodities-report.md](commodities-report.md)** — Starting plan for a Commodities report type: sections, analysis factors, charts, the data we need + where to source it, and where to get the commodity list.

## Prompt-tuning + verification artifacts

The runbook + methodology live in [`../etf-prompt-improvement/`](../etf-prompt-improvement/) (knowledge, not active tasks):

- **[../etf-prompt-improvement/run-prompt-analysis.md](../etf-prompt-improvement/run-prompt-analysis.md)** — Runbook for `Claude, run prompt improvement analysis on <category>`.
- **[../etf-prompt-improvement/etf-verification-loop.md](../etf-prompt-improvement/etf-verification-loop.md)** — Two-loop methodology (prompt refinement + factor refinement) the runbook implements.
