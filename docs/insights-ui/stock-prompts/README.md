# Stock Prompts

Source-of-truth prompt text used by the stock analysis pipeline. Each prompt is rendered with placeholders like `{{symbol}}`, `{{name}}`, `{{exchange}}`, `{{industryKey}}`, and `{{subIndustryKey}}` before being sent to the LLM.

The prompts themselves live in the `prompt_versions` table and are managed via the `/prompts` admin UI; the files here are the human-readable, version-controlled copy used for review, iteration, and seeding new environments.

To preview the rendered prompt for a given ticker, run `yarn stocks:prompt --symbol <SYM> --exchange <EXCH> --report-type <slug>` from `insights-ui/`. See [`../automated-report-generation.md`](../automated-report-generation.md) for the full CLI workflow.

## Files

- **[management-team.md](management-team.md)** — Prompt for the `management-team` report. Covers current leadership, where the founders are now and why they are or are not on the management team, ownership and compensation alignment, insider buying/selling, past management issues (SEC investigations, lawsuits, abrupt departures, governance controversies, failed prior roles), capital allocation track record, and an `alignmentVerdict` (`OWNER_OPERATOR` / `STRONGLY_ALIGNED` / `ALIGNED` / `WEAKLY_ALIGNED` / `MISALIGNED`).

## Prompt key convention

Stock prompts are stored in `prompt_versions` under `prompts.key = US/public-equities-v1/<report-slug>`. The active version is loaded by `generatePromptForReportType()` in `src/utils/analysis-reports/prompt-generator-utils.ts`.

## Related schemas

The output JSON each prompt produces is validated against a schema in [`insights-ui/schemas/analysis-factors/<report-slug>/`](../../../insights-ui/schemas/analysis-factors/). Keep the prompt's "output schema" block in sync with the YAML file there — they describe the same shape.
