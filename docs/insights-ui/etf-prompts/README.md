# ETF Prompts

Source-of-truth prompt text used by the ETF analysis pipeline. Each per-category prompt is rendered with `{{symbol}}`, `{{name}}`, `{{exchange}}`, and `{{categoryKey}}` placeholders before being sent to the LLM.

## These ETF prompts are now read directly from the app (not the DB)

The Past Returns / Cost & Team / Risk / Future Outlook / Index-Strategy prompts are **no longer copied into the DB** — the code reads them at render time from version-controlled markdown in the app at **`insights-ui/etf-prompts/`** (`resolveEtfPromptTemplate` in `etf-prompt-template-utils.ts`). Edit those files to change the live prompts; no DB sync step. They live inside the app (not here under `docs/`) because `docs/` does not ship with the Next deployment, while app-root dirs like `etf-prompts/`, `schemas/`, and `blogs/` do.

- `insights-ui/etf-prompts/past-returns.md` — `PerformanceAndReturns`.
- `insights-ui/etf-prompts/cost-efficiency-team.md` — `CostEfficiencyAndTeam`.
- `insights-ui/etf-prompts/risk-analysis.md` — `RiskAnalysis`.
- `insights-ui/etf-prompts/future-performance-outlook.md` — `FuturePerformanceOutlook`.
- `insights-ui/etf-prompts/index-strategy.md` — `IndexStrategy` (the plain-English intro / index-strategy summary that precedes the per-category deep dives).

## DB-backed prompt docs (still source-of-truth here, copied into the DB manually)
- **[competition.md](competition.md)** — Prompt for the `Competition` analysis. Picks 4–6 genuine peer ETFs and compares the target against them on mandate fit, fees, tracking, and risk/return. Takes ETF identity only — no financial data — and expects the LLM to source peer facts from reputable public sources.
- **[prompt-finalization-approach.md](prompt-finalization-approach.md)** — How we iterate on a prompt: the loop used to finalize the Past Returns prompt, applicable to every other ETF analysis category.
