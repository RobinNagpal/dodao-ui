# Stock Prompts

Source-of-truth prompt text used by the stock analysis pipeline. Each prompt is rendered with placeholders like `{{symbol}}`, `{{name}}`, `{{exchange}}`, `{{industryKey}}`, and `{{subIndustryKey}}` before being sent to the LLM.

The prompts themselves live in the `prompt_versions` table and are managed via the `/prompts` admin UI; the files here are the human-readable, version-controlled copy used for review, iteration, and seeding new environments.

To preview the rendered prompt for a given ticker, run `yarn stocks:prompt --symbol <SYM> --exchange <EXCH> --report-type <slug>` from `insights-ui/`. See [`../automated-report-generation.md`](../automated-report-generation.md) for the full CLI workflow.

## Files

- **[management-team.md](management-team.md)** — Prompt for the `management-team` report. Covers current leadership, where the founders are now and why they are or are not on the management team, ownership and compensation alignment, insider buying/selling, past management issues (SEC investigations, lawsuits, abrupt departures, governance controversies, failed prior roles), capital allocation track record, and an `alignmentVerdict` (`OWNER_OPERATOR` / `STRONGLY_ALIGNED` / `ALIGNED` / `WEAKLY_ALIGNED` / `MISALIGNED`).
- **[stability.md](stability.md)** — Prompt for the `stability` report. Answers "what happens to this stock if the market drops `5%`, `15%` or `30%`". Produces a **short report** (`summary`, 2 paragraphs — the numbers, then the overall explanation) rendered on the main stock page, and a **long report** rendered on `/stocks/{exchange}/{ticker}/stability`: 2 paragraphs per scenario (first the industry + sub-industry, second the company) plus 2 overall paragraphs (`detailedAnalysis`). Also returns the expected price per scenario, a `resilienceVerdict` (`HIGHLY_RESILIENT` / `RESILIENT` / `MARKET_LIKE` / `VULNERABLE` / `HIGHLY_VULNERABLE`), and the `referencePrice` + `referencePriceAsOf` every expected price is measured from. Its input carries the industry and sub-industry names **and descriptions** plus a live market snapshot (price, `beta`, 52-week range, `P/E`), so the industry paragraph can say where that industry sits in its own cycle — one already near a bottom gives up far less than the market, a stretched one far more.

## Prompt key convention

Stock prompts are stored in `prompt_versions` under `prompts.key = US/public-equities-v1/<report-slug>`. The active version is loaded by `generatePromptForReportType()` in `src/utils/analysis-reports/prompt-generator-utils.ts`.

## Schema authoring gotcha: no non-string `enum`

The output schema file is handed to the model as its structured-output
`response_schema`, not just to Ajv. Gemini's schema type only allows `enum` on
`TYPE_STRING`, so a numeric enum (e.g. `enum: [5, 15, 30]` on a `type: number`
field) fails the whole request with
`Invalid value at 'generation_config.response_schema...enum[0]' (TYPE_STRING), 5`.
Pin numeric values with the description plus `minItems`/`maxItems` (and the
prompt text) instead — every `enum` in `insights-ui/schemas/**` is string-only.

## Related schemas

The output JSON each prompt produces is validated against a schema in [`insights-ui/schemas/analysis-factors/<report-slug>/`](../../../insights-ui/schemas/analysis-factors/). Keep the prompt's "output schema" block in sync with the YAML file there — they describe the same shape.
