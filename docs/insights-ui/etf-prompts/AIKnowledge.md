# ETF Prompts

Source-of-truth prompt text used by the ETF analysis pipeline. Each per-category prompt is rendered with `{{symbol}}`, `{{name}}`, `{{exchange}}`, and `{{categoryKey}}` placeholders before being sent to the LLM.

## Files

- **[past-returns.md](past-returns.md)** — Prompt for the `PerformanceAndReturns` category. Frames the analysis for a retail investor wanting a clear historical-performance read.
- **[cost-efficiency-team.md](cost-efficiency-team.md)** — Prompt for the `CostEfficiencyAndTeam` category. Frames the analysis for a retail investor wanting a clear cost & efficiency read.
- **[risk-analysis.md](risk-analysis.md)** — Prompt for the `RiskAnalysis` category. Frames the analysis for a retail investor wanting a clear risk read.
- **[future-performance-outlook.md](future-performance-outlook.md)** — Prompt for the `FuturePerformanceOutlook` category. Frames a forward-looking 6–12 month positioning read.
- **[intro-strategy.md](intro-strategy.md)** — Prompt for the plain-English intro / index-strategy summary section that precedes the per-category deep dives.
- **[competition.md](competition.md)** — Prompt for the `Competition` analysis. Picks 4–6 genuine peer ETFs and compares the target against them on mandate fit, fees, tracking, and risk/return. Takes ETF identity only — no financial data — and expects the LLM to source peer facts from reputable public sources.
- **[prompt-finalization-approach.md](prompt-finalization-approach.md)** — How we iterate on a prompt: the loop used to finalize the Past Returns prompt, applicable to every other ETF analysis category.
