# Automated Report Generation (Stocks + ETFs)

Four CLI scripts that let Claude (or any automation) drive report generation one report at a time, by asking the server for a prompt and then handing the LLM's JSON answer back to the server to be saved.

## The idea in simple English

Generating a report has two parts:

1. **Build the prompt.** The server already knows which prompt template to use for each report type, and how to fill it in with the latest data for the stock or ETF. The server bakes everything into one final prompt string and hands it back.
2. **Save the answer.** The LLM returns a JSON response. The server validates it and writes it to the right analysis tables.

Claude runs one stock or ETF through all of its report types by looping: **get prompt → call LLM → save answer → repeat** for the next report type.

For ETFs there is one extra step: before the first report, Claude asks the server to make sure Morningstar (MOR) data is fresh. If any of the four MOR tables (quote, risk, people, portfolio) is empty, the server fires the Morningstar scrape lambda. Because that lambda is fire-and-forget, the script then waits 10 seconds so the rows are in the DB before the prompt is built.

## The four scripts

| Script | What it does |
| --- | --- |
| `yarn stocks:prompt` | Returns the final prompt for one stock + one report type. |
| `yarn stocks:save`   | Takes the LLM's JSON and saves the stock report. |
| `yarn etfs:prompt`   | Checks MOR data (triggers scrape + waits if missing), then returns the ETF prompt. |
| `yarn etfs:save`     | Takes the LLM's JSON and saves the ETF report. |

Report type slugs:

- **Stocks:** `financial-analysis`, `competition`, `business-and-moat`, `past-performance`, `future-growth`, `fair-value`, `future-risk`, `final-summary`
- **ETFs:** `performance-and-returns`, `cost-efficiency-and-team`, `risk-analysis`, `future-performance-outlook`, `index-strategy`, `competition`, `final-summary`

## Usage — stocks

```bash
# 1. Get the prompt (stdout = prompt, stderr = one-line summary)
yarn stocks:prompt --symbol AAPL --exchange NASDAQ \
  --report-type fair-value \
  --out /tmp/aapl-fair-value.prompt.txt

# 2. Hand the prompt to the LLM of your choice, get back JSON
#    Save that JSON to /tmp/aapl-fair-value.response.json

# 3. Store the response
yarn stocks:save --symbol AAPL --exchange NASDAQ \
  --report-type fair-value \
  --in /tmp/aapl-fair-value.response.json
```

Repeat steps 1–3 for each report type you want.

## Usage — ETFs

```bash
# 1. Get the prompt (this will trigger MOR scrape + wait 10s if needed)
yarn etfs:prompt --symbol SPY --exchange NYSEARCA \
  --report-type performance-and-returns \
  --out /tmp/spy-perf.prompt.txt

# 2. Call the LLM, save its JSON to a file

# 3. Store the response
yarn etfs:save --symbol SPY --exchange NYSEARCA \
  --report-type performance-and-returns \
  --in /tmp/spy-perf.response.json
```

`yarn etfs:prompt` extra flags:

- `--wait-ms 20000` — override the post-MOR-trigger sleep. The default is `20s`; at `10s` the first prompt's `morReturns` field was still empty because not all four Morningstar callbacks had landed.
- `--skip-mor-check` — skip the MOR check entirely (use when you know the data is fresh and want to avoid the extra round-trip).

## Where to store prompt/response files

Use a predictable folder-per-symbol layout so a later inspector can find the artifacts without guessing:

- ETFs: `/tmp/etfs/<EXCHANGE>/<SYMBOL>/` (e.g. `/tmp/etfs/NYSEARCA/SPUS/`)
- Stocks: `/tmp/stocks/<EXCHANGE>/<SYMBOL>/` (e.g. `/tmp/stocks/NASDAQ/AAPL/`)

Inside, name files `<NN>-<report-type>.prompt.txt` and `<NN>-<report-type>.response.json` so they sort in execution order.

## Agent-facing preamble on every prompt

Both `stocks:prompt` and `etfs:prompt` prepend a short hardcoded instruction block (`AGENT_PROMPT_PREAMBLE` in each script's `lib.ts`) to whatever the server returns. The rules are:

1. Do not mention any input field name or data-source label (e.g. `morOverview`, `morAnalysis`, `stockAnalyzerReturns`) back to the reader — use the values, not the schema.
2. If a specific metric is missing, source it yourself from reputable public sources; do not write "not available" / "data is missing" or any variant.
3. Generate analysis in plain investor-facing English; never reference the input schema.

These rules sit above the per-category prompt template. If you need to change them, edit `AGENT_PROMPT_PREAMBLE` in both `src/scripts/tickers/lib.ts` and `src/scripts/etfs/lib.ts`.

## How it works under the hood

### Stocks

- `stocks:prompt` → `POST /api/<spaceId>/tickers-v1/exchange/<exchange>/<ticker>/generate-prompt` with `{ reportType }`.
  - Handler: `generatePromptForReportType()` in `src/utils/analysis-reports/prompt-generator-utils.ts`.
  - It fetches the ticker, builds the category-specific input JSON (`prepareFairValueInputJson`, etc.), pulls the active `PromptVersion` for the matching key (`US/public-equities-v1/<slug>`), compiles the Handlebars template, and returns the final prompt string.
- `stocks:save` → `POST /api/<spaceId>/tickers-v1/exchange/<exchange>/<ticker>/save-json-report` with `{ llmResponse, reportType }`.
  - Validates the JSON against the per-report schema in `schemas/analysis-factors/…`.
  - Writes to `TickerV1CategoryAnalysisResult` + `TickerV1AnalysisCategoryFactorResult` (factor reports), `TickerV1VsCompetition` (competition), `TickerV1FutureRisk` (future-risk), or the base `TickerV1` row (final-summary).

### ETFs

- `etfs:prompt` first calls `POST /api/<spaceId>/etfs-v1/exchange/<exchange>/<etf>/ensure-mor-info`.
  - Handler: `ensureMorDataForAnalysis()` in `src/utils/etf-analysis-reports/mor-scrape-utils.ts`.
  - Counts rows in `EtfMorAnalyzerInfo`, `EtfMorRiskInfo`, `EtfMorPeopleInfo`, `EtfMorPortfolioInfo`. For every table with zero rows, triggers the Morningstar lambda (`ETF_MORN_LAMBDA_URL`) and returns the list of triggered kinds.
  - If the returned list is non-empty, the script sleeps 10s (configurable with `--wait-ms`) so the async lambda callbacks can finish upserting the rows.
- Then `etfs:prompt` calls `POST /api/<spaceId>/etfs-v1/exchange/<exchange>/<etf>/generate-prompt` with `{ reportType }`.
  - Handler: `generateEtfPromptForReportType()` in `src/utils/etf-analysis-reports/etf-prompt-generator-utils.ts` (mirrors the stock side).
  - Picks the input-JSON preparer (`preparePerformanceAndReturnsInputJson`, etc.), fetches the active prompt at the matching key (`US/etfs/<slug>` — see `ETF_PROMPT_KEYS`), compiles the template, returns the final prompt.
- `etfs:save` → `POST /api/<spaceId>/etfs-v1/exchange/<exchange>/<etf>/save-report-callback` with `{ llmResponse, additionalData: { reportType } }`.
  - Re-uses the endpoint the normal pipeline's lambda calls. Because we do **not** send a `generationRequestId`, the endpoint only persists the response — it does not chain-trigger the next step's lambda.
  - Writes to `EtfCategoryAnalysisResult` (+ factor results), `EtfVsCompetition`, or directly on the `Etf` row for index-strategy and final-summary.

## Authentication

- All four scripts forward `AUTOMATION_SECRET` as `x-automation-token`. Set it with `source path/to/discord-claude-bot/.env` (or `export AUTOMATION_SECRET=...`) before running.
- The ETF `ensure-mor-info` and `save-report-callback` endpoints are token-gated (`withAdminOrToken`). `generate-prompt` (both stocks and ETFs) and `save-json-report` (stocks) use `withErrorHandlingV2` and are open; the script still passes the header so the request logs attribute the call correctly.

## Files

- Scripts: `src/scripts/tickers/get-report-prompt.ts`, `src/scripts/tickers/save-report.ts`, `src/scripts/etfs/get-report-prompt.ts`, `src/scripts/etfs/save-report.ts`
- New endpoints: `src/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/generate-prompt/route.ts`, `src/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/ensure-mor-info/route.ts`
- New utility: `src/utils/etf-analysis-reports/etf-prompt-generator-utils.ts`
- Stock prompt utility (already in place): `src/utils/analysis-reports/prompt-generator-utils.ts`
- Stock save endpoint (already in place): `src/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/save-json-report/route.ts`
- Shared CLI helpers: `src/scripts/tickers/lib.ts`, `src/scripts/etfs/lib.ts`
