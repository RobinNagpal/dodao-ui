# Insights-UI Knowledge

Topical reference docs for the Insights-UI (KoalaGains) app — patterns, prompts, runbooks, analysis methodology, plus the active task lists that drive ongoing work.

## Subfolders

- **[etf-analysis/](etf-analysis/)** — How the ETF analysis pipeline works end-to-end: report generation and the ETF Scenarios system (winner / loser model + admin/automation paths). See [etf-analysis/README.md](etf-analysis/README.md).
- **[stock-analysis/](stock-analysis/)** — Runbooks for adding new stocks (`yarn stocks:add`) and triggering stock report generation (`yarn stocks:trigger`). See [stock-analysis/README.md](stock-analysis/README.md).
- **[etf-prompts/](etf-prompts/)** — Source-of-truth prompt text for each ETF analysis category (past returns, cost & efficiency, risk, future outlook, intro/strategy, competition) plus the prompt-finalization approach. See [etf-prompts/README.md](etf-prompts/README.md).
- **[scenario-prompts/](scenario-prompts/)** — Reusable prompt templates for stock & ETF scenario authoring. Currently: `detailed-analysis.md` for generating the optional `detailedAnalysis` long-form section.
- **[etf-prompt-improvement/](etf-prompt-improvement/)** — Methodology + runbook for the prompt-tuning loop (`etf-verification-loop.md`, `run-prompt-analysis.md`) plus iterative prompt-review notes, factor-set reviews, and per-ETF audits. See [etf-prompt-improvement/README.md](etf-prompt-improvement/README.md).
- **[tariffs/](tariffs/)** — Reference docs for the tariffs subsystem: pipeline, data structures, UI components, S3 storage, admin flow, and the use-case catalog that drives feature prioritization.
- **[tasks/](tasks/)** — Active KoalaGains task lists (open + closed work, per surface): ETFs, stocks, tariffs, scenarios, prompt tuning, plus open questions and per-page checklists.

## Top-level files

- **[automated-report-generation.md](automated-report-generation.md)** — Five CLI scripts (`stocks:prompt`, `stocks:save`, `stocks:list-oldest`, `etfs:prompt`, `etfs:save`) that let Claude drive the full 7-ETF / 8-stock report-generation loop, plus a "refresh the N stocks with the oldest reports" batch flow: setup, report order, per-type response JSON shapes, run-time gotchas (JSON-escape quotes, partial MOR data on first prompt, `final-summary` must be last), and the end-to-end copy-paste skeleton.
- **[scenario-authoring.md](scenario-authoring.md)** — How to draft a new stock or ETF market scenario: scratch-file workflow under `/tmp/scenarios/{stocks,etfs}/<slug>.md`, the required content template (dates, magnitude, per-industry impact numbers, asymmetric winners / losers), per-stock bullet syntax, the outlook phrasing the parser keys off, and the editorial "five winners, five losers" convention.
