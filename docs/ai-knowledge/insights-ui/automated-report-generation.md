# Automated Report Generation (Stocks + ETFs)

Four CLI scripts that let Claude (or any automation) drive report generation one report at a time, by asking the server for a prompt and then handing the LLM's JSON answer back to the server to be saved.

## The idea in simple English

Generating a report has two parts:

1. **Build the prompt.** The server already knows which prompt template to use for each report type, and how to fill it in with the latest data for the stock or ETF. The server bakes everything into one final prompt string and hands it back.
2. **Save the answer.** The LLM returns a JSON response. The server validates it and writes it to the right analysis tables.

Claude runs one stock or ETF through all of its report types by looping: **get prompt → call LLM → save answer → repeat** for the next report type.

For ETFs there is one extra step: before the first report, Claude asks the server to make sure Morningstar (MOR) data is fresh. If any of the four MOR tables (quote, risk, people, portfolio) is empty, the server fires the Morningstar scrape lambda. Because that lambda is fire-and-forget, the script then waits 20 seconds so the rows are in the DB before the prompt is built.

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

## When to use which flow

| User says… | Flow |
| --- | --- |
| "generate reports for `AAPL NASDAQ`" | Stock loop, all 8 stock report types |
| "generate reports for `SPUS NYSEARCA`" | ETF loop, all 7 ETF report types |
| "regenerate just `competition` for `SPY NYSEARCA`" | One-shot: prompt → LLM → save |
| "test the scripts" | Pick one ETF + one stock, run one report each as a smoke test |

## Setup (once per session)

The scripts require `AUTOMATION_SECRET` and Node 23+. Source the env and put node 23 on `PATH` at the start of the session:

```bash
set -a; source /home/ubuntu/discord-claude-bot/.env; set +a
export PATH="/home/ubuntu/.nvm/versions/node/v23.11.1/bin:$PATH"
```

Then `cd` into `insights-ui/` before running `yarn …`.

### Where to store prompt/response files

Use the standard per-symbol layout so a later inspector can find the artifacts without guessing:

- ETFs: `/tmp/etfs/<EXCHANGE>/<SYMBOL>/` (e.g. `/tmp/etfs/NYSEARCA/SPUS/`)
- Stocks: `/tmp/stocks/<EXCHANGE>/<SYMBOL>/` (e.g. `/tmp/stocks/NASDAQ/AAPL/`)

Name each file `<NN>-<report-type>.prompt.txt` and `<NN>-<report-type>.response.json` so they sort in execution order.

## ETF loop (7 report types)

Report types, in the order you should run them:

1. `performance-and-returns`
2. `cost-efficiency-and-team`
3. `risk-analysis`
4. `future-performance-outlook`
5. `index-strategy`
6. `competition`
7. `final-summary` — **must be last**, the prompt pulls the saved summaries and factor results from the first four.

### Step 1 — get the prompt

**First report only** — do not pass `--skip-mor-check`. The script will call `ensure-mor-info`, trigger the Morningstar scrape lambda for any missing MOR kinds, and sleep `20s` (default):

```bash
yarn etfs:prompt --symbol SPUS --exchange NYSEARCA \
  --report-type performance-and-returns \
  --out /tmp/etfs/NYSEARCA/SPUS/01-performance-and-returns.prompt.txt
```

**Reports 2–7** — add `--skip-mor-check`. The scrape has already been fired, and waiting another `20s` per report is wasted time:

```bash
yarn etfs:prompt --symbol SPUS --exchange NYSEARCA \
  --report-type cost-efficiency-and-team \
  --out /tmp/etfs/NYSEARCA/SPUS/02-cost-efficiency-and-team.prompt.txt \
  --skip-mor-check
```

`yarn etfs:prompt` extra flags:

- `--wait-ms 20000` — override the post-MOR-trigger sleep. The default is `20s`; at `10s` the first prompt's `morReturns` field was still empty because not all four Morningstar callbacks had landed.
- `--skip-mor-check` — skip the MOR check entirely (use when you know the data is fresh and want to avoid the extra round-trip).

### Step 2 — act as the LLM

Read the prompt file. It describes everything you need: the agent preamble (output rules, ETF only), the factor list, the output JSON schema, the input data blocks, the style rules. Write the response JSON to disk.

### Step 3 — save

```bash
yarn etfs:save --symbol SPUS --exchange NYSEARCA \
  --report-type performance-and-returns \
  --in /tmp/etfs/NYSEARCA/SPUS/01-performance-and-returns.response.json
```

Expect `{"success": true}`. If the save errors, read the error carefully — it almost always points at a JSON parse issue or a missing schema field.

## Stock loop (8 report types)

Use `yarn stocks:prompt` / `yarn stocks:save` (no MOR check — stocks use the stock-analyzer scraper that is refreshed by a separate worker). Report-type order:

1. `financial-analysis`
2. `business-and-moat`
3. `past-performance`
4. `future-growth`
5. `fair-value`
6. `competition`
7. `future-risk`
8. `final-summary` — last, depends on the others.

Everything else is the same as the ETF loop: prompt → act as LLM → save, once per report type.

```bash
# 1. Get the prompt
yarn stocks:prompt --symbol AAPL --exchange NASDAQ \
  --report-type fair-value \
  --out /tmp/stocks/NASDAQ/AAPL/05-fair-value.prompt.txt

# 2. Act as the LLM, write /tmp/stocks/NASDAQ/AAPL/05-fair-value.response.json

# 3. Save
yarn stocks:save --symbol AAPL --exchange NASDAQ \
  --report-type fair-value \
  --in /tmp/stocks/NASDAQ/AAPL/05-fair-value.response.json
```

## Response JSON shape — per report type

The schemas below are the **minimum** shape each save call needs. Each prompt itself repeats this in full at the bottom of the prompt text; read it for the authoritative structure.

### Stock factor-analysis reports
(`financial-analysis`, `business-and-moat`, `past-performance`, `future-growth`, `fair-value`)

```json
{
  "overallSummary": "3–5 sentences",
  "overallAnalysisDetails": "3–4 paragraphs of markdown",
  "factors": [
    { "factorAnalysisKey": "<exact key from input>", "oneLineExplanation": "…", "detailedExplanation": "…", "result": "Pass" }
  ]
}
```

### Stock `competition`

```json
{
  "overallSummary": "…",
  "overallAnalysisDetails": "…",
  "competitionAnalysisArray": [
    { "companyName": "…", "companySymbol": "…", "exchangeSymbol": "NYSE|NASDAQ|BATS|NYSEARCA", "exchangeName": "…", "detailedComparison": "…" }
  ]
}
```

### Stock `future-risk`

```json
{ "summary": "…", "detailedAnalysis": "markdown paragraphs" }
```

### Stock `final-summary`

```json
{
  "finalSummary": "6–7 short lines",
  "metaDescription": "≤160 chars, SEO",
  "aboutReport": "2–3 sentences"
}
```

### ETF factor reports
(`performance-and-returns`, `cost-efficiency-and-team`, `risk-analysis`, `future-performance-outlook`)

Same shape as the stock factor reports above.

### ETF `index-strategy`

```json
{
  "indexStrategy": "4 paragraphs of markdown + a final \"Red Flags & Risks\" bulleted list",
  "similarEtfs": [
    { "symbol": "HLAL", "exchange": "NASDAQ" }
  ]
}
```

- `exchange` must be one of `BATS`, `NASDAQ`, `NYSE`, `NYSEARCA`.
- `symbol` and `exchange` must be uppercase.
- The server silently drops entries whose `(symbol, exchange)` pair doesn't exist in the `etfs` table — it is safe to list extra peers that may or may not be in the system.
- List at least 6 entries.

### ETF `competition`

```json
{
  "overallAnalysisDetails": "exactly 6 paragraphs of markdown",
  "competitionAnalysisArray": [
    { "companyName": "…", "companySymbol": "…", "exchangeSymbol": "…", "exchangeName": "…", "detailedComparison": "…" }
  ]
}
```

- Pick **4–6** peers. The prompt explicitly says 4 tight peers > 6 loose peers.

### ETF `final-summary`

```json
{ "summary": "single markdown paragraph, ~6–7 lines" }
```

(For ETFs, `final-summary` is just one field — no `metaDescription` or `aboutReport` like the stock side.)

## Agent-facing preamble on ETF prompts

`yarn etfs:prompt` prepends a short hardcoded instruction block (`AGENT_PROMPT_PREAMBLE` in `src/scripts/etfs/lib.ts`) to whatever the server returns. The rules are:

1. Do not mention any input field name or data-source label (`morOverview`, `morAnalysis`, `stockAnalyzerReturns`, `etfMorPortfolioInfo`, etc.) back to the reader — use the values, not the schema.
2. If a specific metric is missing, source it yourself from reputable public sources; do not write "not available" / "data is missing" or any variant.
3. Generate analysis in plain investor-facing English; never reference the input schema.

ETF inputs fan out across many Morningstar-sourced sub-objects and those labels leak into the generated analysis without this reminder. The stock CLI does not prepend a preamble — stock prompts are already tight and the category templates handle this themselves. If you need to change the ETF rules, edit `AGENT_PROMPT_PREAMBLE` in `src/scripts/etfs/lib.ts`.

## Gotchas that only show up at run-time

From the SPUS / NYSEARCA test run — every one of these cost real time.

### 1. Escape double quotes inside JSON string values

LLM-written JSON frequently contains natural English double-quotes inside a string, which breaks `JSON.parse`:

```json
"detailedExplanation": "the tenure is "no turnover since launch" rather than…"
```

→ `SyntaxError: Expected ',' or '}' after property value in JSON at position 2606`

Rewrite internal quotes as single-quotes or escape them:

```json
"detailedExplanation": "the tenure is 'no turnover since launch' rather than…"
```

Before calling `etfs:save` / `stocks:save`, validate the file:

```bash
node -e "JSON.parse(require('fs').readFileSync('/tmp/…/file.json','utf-8')); console.log('valid');"
```

### 2. The first ETF prompt may arrive with partial MOR data

The `ensure-mor-info` lambda is fire-and-forget; callbacks upsert the four tables (`EtfMorAnalyzerInfo`, `EtfMorRiskInfo`, `EtfMorPeopleInfo`, `EtfMorPortfolioInfo`) asynchronously. The default wait is `20s`. If a later report still shows missing MOR data, bump the wait:

```bash
yarn etfs:prompt … --wait-ms 30000
```

The agent preamble tells the LLM to self-source missing metrics from public sources, so a thin data block is a soft degrade rather than a hard blocker.

### 3. Prompts can run to tens of KB

`future-performance-outlook` used to come back at `~63KB` for SPUS because the input JSON included the full `EtfMorPortfolioInfo.holdings` list. The prepare function now trims that to the top `10` holdings (`trimPortfolioHoldings` in `src/utils/etf-analysis-reports/etf-report-input-json-utils.ts`), which brings the prompt well under `~40KB`. Write to `--out <path>` always, even if you plan to read it back in the same step.

### 4. `final-summary` must be last

The `final-summary` prompt pulls the previously-saved category summaries and factor results from the DB. Running it before the other reports are saved gives you an empty or stale roll-up.

### 5. Token-gated endpoints need the automation secret

`ensure-mor-info`, `etfs:save` (`save-report-callback`), and the generation-requests POST are all token-gated. `requireAutomationSecret()` in the CLI will throw fast if the env var is missing — always source `.env` at the start of the session.

### 6. Node 23 is required

The monorepo `package.json` has `"engines": { "node": ">=23.11.0" }`. `yarn` refuses to run under Node 22. Put `/home/ubuntu/.nvm/versions/node/v23.11.1/bin` on `PATH` at the start, don't re-discover it every command.

## Copy-paste skeleton for a full ETF run

```bash
set -a; source /home/ubuntu/discord-claude-bot/.env; set +a
export PATH="/home/ubuntu/.nvm/versions/node/v23.11.1/bin:$PATH"
cd /home/ubuntu/discord-claude-bot/insights-ui/worktrees/<branch>/insights-ui

SYMBOL=SPUS
EXCHANGE=NYSEARCA
DIR=/tmp/etfs/${EXCHANGE}/${SYMBOL}
mkdir -p "$DIR"

# Report 1 — includes MOR check + 20s wait
yarn etfs:prompt --symbol $SYMBOL --exchange $EXCHANGE \
  --report-type performance-and-returns --out "$DIR/01-performance-and-returns.prompt.txt"

# <<< act as the LLM, write $DIR/01-performance-and-returns.response.json >>>

node -e "JSON.parse(require('fs').readFileSync('$DIR/01-performance-and-returns.response.json','utf-8')); console.log('valid');"
yarn etfs:save --symbol $SYMBOL --exchange $EXCHANGE \
  --report-type performance-and-returns --in "$DIR/01-performance-and-returns.response.json"

# Reports 2–6 — skip MOR re-check
# Reminder: in a real Claude session, run each step as a separate tool call so the
# LLM can read the prompt and write the response file between them — the loop below
# is illustrative only.
for RT in cost-efficiency-and-team risk-analysis future-performance-outlook index-strategy competition; do
  yarn etfs:prompt --symbol $SYMBOL --exchange $EXCHANGE \
    --report-type $RT --out "$DIR/XX-$RT.prompt.txt" --skip-mor-check
  # <<< act as the LLM >>>
  node -e "JSON.parse(require('fs').readFileSync('$DIR/XX-$RT.response.json','utf-8'));"
  yarn etfs:save --symbol $SYMBOL --exchange $EXCHANGE \
    --report-type $RT --in "$DIR/XX-$RT.response.json"
done

# Report 7 — final-summary, depends on the others
yarn etfs:prompt --symbol $SYMBOL --exchange $EXCHANGE \
  --report-type final-summary --out "$DIR/07-final-summary.prompt.txt" --skip-mor-check
# <<< act as the LLM >>>
yarn etfs:save --symbol $SYMBOL --exchange $EXCHANGE \
  --report-type final-summary --in "$DIR/07-final-summary.response.json"
```

## Verifying a run

After saving, spot-check the public GET endpoints:

```bash
curl -s "https://koalagains.com/api/koala_gains/etfs-v1/exchange/$EXCHANGE/$SYMBOL/analysis"   | jq '.'
curl -s "https://koalagains.com/api/koala_gains/etfs-v1/exchange/$EXCHANGE/$SYMBOL/competition" | jq '.'
```

For stocks, the analysis route is `/api/koala_gains/tickers-v1/exchange/$EXCHANGE/$SYMBOL/analysis` and the per-category routes return per-factor detail.

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
  - If the returned list is non-empty, the script sleeps `20s` (configurable with `--wait-ms`) so the async lambda callbacks can finish upserting the rows.
- Then `etfs:prompt` calls `POST /api/<spaceId>/etfs-v1/exchange/<exchange>/<etf>/generate-prompt` with `{ reportType }`.
  - Handler: `generateEtfPromptForReportType()` in `src/utils/etf-analysis-reports/etf-prompt-generator-utils.ts` (mirrors the stock side).
  - Picks the input-JSON preparer (`preparePerformanceAndReturnsInputJson`, etc.), fetches the active prompt at the matching key (`US/etfs/<slug>` — see `ETF_PROMPT_KEYS`), compiles the template, returns the final prompt.
- `etfs:save` → `POST /api/<spaceId>/etfs-v1/exchange/<exchange>/<etf>/save-report-callback` with `{ llmResponse, additionalData: { reportType } }`.
  - Re-uses the endpoint the normal pipeline's lambda calls. Because we do **not** send a `generationRequestId`, the endpoint only persists the response — it does not chain-trigger the next step's lambda.
  - Writes to `EtfCategoryAnalysisResult` (+ factor results), `EtfVsCompetition`, or directly on the `Etf` row for index-strategy and final-summary.

## Authentication

- All four scripts forward `AUTOMATION_SECRET` as `x-automation-token`. Set it with `source path/to/discord-claude-bot/.env` (or `export AUTOMATION_SECRET=...`) before running.
- The ETF `ensure-mor-info` and `save-report-callback` endpoints are token-gated (`withAdminOrToken`). `generate-prompt` (both stocks and ETFs) and `save-json-report` (stocks) use `withErrorHandlingV2` and are open; the script still passes the header so request logs attribute the call correctly.

## Files

- Scripts: `src/scripts/tickers/get-report-prompt.ts`, `src/scripts/tickers/save-report.ts`, `src/scripts/etfs/get-report-prompt.ts`, `src/scripts/etfs/save-report.ts`
- ETF endpoints: `src/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/generate-prompt/route.ts`, `src/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/ensure-mor-info/route.ts`
- ETF prompt utility: `src/utils/etf-analysis-reports/etf-prompt-generator-utils.ts`
- ETF input-JSON preparers (including `trimPortfolioHoldings`): `src/utils/etf-analysis-reports/etf-report-input-json-utils.ts`
- Stock prompt utility: `src/utils/analysis-reports/prompt-generator-utils.ts`
- Stock save endpoint: `src/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/save-json-report/route.ts`
- Shared CLI helpers: `src/scripts/tickers/lib.ts`, `src/scripts/etfs/lib.ts` (the ETF one also carries `AGENT_PROMPT_PREAMBLE`)

## Neighbouring docs

- [`stock-analysis/generate-stock-reports.md`](stock-analysis/generate-stock-reports.md) — the `yarn stocks:trigger` path, which enqueues server-side LLM jobs rather than driving them from the agent. Use that when you want the server's pipeline to do the generation; use the scripts above when the agent itself is the LLM.
- [`etf-analysis/generate-etf-reports.md`](etf-analysis/generate-etf-reports.md) — the same server-side pipeline for ETFs.
