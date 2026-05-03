# Scenario Prompts

Reusable prompt templates for authoring stock and ETF market scenarios. These
are paired with `docs/insights-ui/scenario-authoring.md`, which covers the
scratch-file workflow, the required template, and the editorial conventions
(including "five winners, five losers"). Use these prompts when you want to
generate a specific section instead of writing it freehand.

## Prompts

- **[detailed-analysis.md](detailed-analysis.md)** — Generates the optional
  `detailedAnalysis` long-form section (Introduction; Market size, timeline,
  and probability; Value chain with sample tickers per layer; optional
  "What would change the call"). Works for both ETF and stock scenarios.
  Output goes into the `Detailed analysis` textarea in the admin upsert
  modal or the `detailedAnalysis` field of the upsert API.

## When NOT to use a prompt

- The required parser-driven sections (`summary`, winners / losers bullets)
  are deliberately authored freehand because they encode editorial judgment
  and source-grounded numbers. Don't mass-generate them — see
  `scenario-authoring.md`.
- If you don't have a strong, sourced read on a section yet, leave the
  field null. Thin placeholder content is worse than nothing.
