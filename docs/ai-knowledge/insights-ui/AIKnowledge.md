# Insights-UI Knowledge

Topical reference docs for the Insights-UI (KoalaGains) app — patterns, prompts, runbooks, and analysis methodology that aren't tied to a single feature spec. For per-feature requirements / todos / specs, see [`../projects/insights-ui/`](../projects/insights-ui/) instead.

## Subfolders

- **[etf-analysis/](etf-analysis/)** — How the ETF analysis pipeline works end-to-end: report generation, market scenarios, implementation checklists. See [etf-analysis/AIKnowledge.md](etf-analysis/AIKnowledge.md).
- **[stock-analysis/](stock-analysis/)** — Runbooks for adding new stocks (`yarn stocks:add`) and triggering stock report generation (`yarn stocks:trigger`). See [stock-analysis/AIKnowledge.md](stock-analysis/AIKnowledge.md).
- **[etf-prompts/](etf-prompts/)** — Source-of-truth prompt text for each ETF analysis category (past returns, cost & efficiency, risk, future outlook, intro/strategy) plus the prompt-finalization approach. See [etf-prompts/AIKnowledge.md](etf-prompts/AIKnowledge.md).
- **[etf-prompt-improvement/](etf-prompt-improvement/)** — Iterative prompt-review notes, factor-set reviews, and per-ETF audits captured during the prompt-tuning loop. See [etf-prompt-improvement/AIKnowledge.md](etf-prompt-improvement/AIKnowledge.md).
- **[downside-analysis/](downside-analysis/)** — Equity downside / drawdown framework with per-ticker case studies (the 31-stock study). See [downside-analysis/AIKnowledge.md](downside-analysis/AIKnowledge.md).

## Top-level files

- **[tariffs-functionality.md](tariffs-functionality.md)** — Comprehensive overview of the tariffs analysis subsystem: pipeline, data structures, UI components, S3 storage, admin flow.
- **[tariff-usecases.md](tariff-usecases.md)** — Catalog of real-world use cases for people who need tariff information; informs feature prioritization.
- **[new-tariff-features.md](new-tariff-features.md)** — Highest-value tariff features to implement next, with market mapping.
- **[automated-report-generation.md](automated-report-generation.md)** — Four CLI scripts (`stocks:prompt`, `stocks:save`, `etfs:prompt`, `etfs:save`) that let Claude drive stock + ETF report generation one report type at a time: ask server for prompt → call LLM → hand JSON back to server to save.
- **[automated-report-generation-playbook.md](automated-report-generation-playbook.md)** — Agent playbook for driving the full 7-ETF / 8-stock loop end-to-end: setup, report order, per-type response JSON shapes, and the run-time gotchas (JSON-escape quotes, partial MOR data on first prompt, `final-summary` must be last).
