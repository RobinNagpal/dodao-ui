# Automated Report Generation — Agent Playbook

Step-by-step playbook for Claude (or any LLM agent) to generate the full set of reports for a given stock or ETF using the four CLI scripts (`stocks:prompt`, `stocks:save`, `etfs:prompt`, `etfs:save`). The reference doc for **how the scripts work** is [`automated-report-generation.md`](automated-report-generation.md); this file is the **how to actually drive a run end-to-end** companion, including the gotchas that only surface during a real run.

Tested end-to-end on `2026-04-24` for **SPUS / NYSEARCA** — all seven ETF reports generated and persisted successfully using only the four CLI scripts.

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

Then `cd` into `insights-ui/` before running `yarn …`. Use absolute paths for the prompt/response files so you can sanity-check them later.

```bash
mkdir -p /tmp/<symbol>-reports
```

## ETF loop (7 report types)

Report types, in the order you should run them:

1. `performance-and-returns`
2. `cost-efficiency-and-team`
3. `risk-analysis`
4. `future-performance-outlook`
5. `index-strategy`
6. `competition`
7. `final-summary` — **must be last**, the prompt pulls the saved summaries and factor results from the first four.

For **each** report type, do three things:

### Step 1 — get the prompt

**First report only** — do not pass `--skip-mor-check`. The script will call `ensure-mor-info`, trigger the Morningstar scrape lambda for any missing MOR kinds, and sleep `10s`:

```bash
yarn etfs:prompt --symbol SPUS --exchange NYSEARCA \
  --report-type performance-and-returns \
  --out /tmp/SPUS-reports/01-performance-and-returns.prompt.txt
```

**Reports 2–7** — add `--skip-mor-check`. The scrape has already been fired, and waiting another `10s` per report is wasted time:

```bash
yarn etfs:prompt --symbol SPUS --exchange NYSEARCA \
  --report-type cost-efficiency-and-team \
  --out /tmp/SPUS-reports/02-cost-efficiency-and-team.prompt.txt \
  --skip-mor-check
```

### Step 2 — act as the LLM

Read the prompt file. It describes everything you need: the factor list, the output JSON schema, the input data blocks, the style rules. Write the response JSON to disk.

### Step 3 — save

```bash
yarn etfs:save --symbol SPUS --exchange NYSEARCA \
  --report-type performance-and-returns \
  --in /tmp/SPUS-reports/01-performance-and-returns.response.json
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
- For a Shariah-screened fund like SPUS, prefer the true Shariah peers (HLAL, SPWO, UMMA, SPTE, SPSK) plus one plain conventional anchor (VOO / SPY) so retail readers see both the in-screen peer set and the non-screen baseline.

### ETF `final-summary`

```json
{ "summary": "single markdown paragraph, ~6–7 lines" }
```

(For ETFs, `final-summary` is just one field — no `metaDescription` or `aboutReport` like the stock side.)

## Gotchas that only show up at run-time

These are from the SPUS test run — every one of them cost real time.

### 1. Escape double quotes inside JSON string values

LLM-written JSON frequently contains natural English double-quotes inside a string, which breaks `JSON.parse`:

```json
"detailedExplanation": "the tenure is "no turnover since launch" rather than…"
```

→ `SyntaxError: Expected ',' or '}' after property value in JSON at position 2606`

Always rewrite internal quotes as single-quotes or escape them:

```json
"detailedExplanation": "the tenure is 'no turnover since launch' rather than…"
```

Before calling `etfs:save` / `stocks:save`, validate the file:

```bash
node -e "JSON.parse(require('fs').readFileSync('/tmp/…/file.json','utf-8')); console.log('valid');"
```

The tsx script itself will surface the error position (line/column) on failure, but validating first is cheaper than a round-trip.

### 2. The first prompt may arrive with partial MOR data

The `ensure-mor-info` lambda is fire-and-forget; callbacks upsert the four tables (`EtfMorAnalyzerInfo`, `EtfMorRiskInfo`, `EtfMorPeopleInfo`, `EtfMorPortfolioInfo`) asynchronously. With `--wait-ms 10000` (the default), the first report's data block can still have:

```
morReturns: {}
morOverview: {"indexName":"…"}   // only the index name made it in
```

Rather than re-run, proceed — the prompt's missing-field rule tells the LLM to silently omit metrics that aren't there. By the second prompt (`--skip-mor-check`), the rest of the MOR data is typically in the DB, which is why the loop order starts with `performance-and-returns` (most resilient to thin data) rather than `risk-analysis` (needs `morRiskPeriods`).

If a later report genuinely needs MOR data that still isn't there, bump the wait:

```bash
yarn etfs:prompt … --wait-ms 30000
```

### 3. Prompts can be huge (tens of KB)

`future-performance-outlook` came back at `63,609 chars` for SPUS. This is fine for the CLI — it just writes to stdout or `--out`. It becomes a problem only if you're piping the prompt into a downstream LLM with a small context window. Write to `--out <path>` always, even if you're reading it back in the same step.

### 4. `final-summary` must be last

The `final-summary` prompt pulls the previously-saved category summaries and factor results from the DB. Running it before the other reports are saved gives you an empty or stale roll-up. Keep it strictly at the end of the loop.

### 5. `withAdminOrToken` endpoints need the automation secret

`ensure-mor-info`, `etfs:save` (`save-report-callback`), and the generation-requests POST are all token-gated. `requireAutomationSecret()` in the CLI will throw fast if the env var is missing — always source `.env` at the start of the session.

### 6. Node 23 is required

The monorepo `package.json` has `"engines": { "node": ">=23.11.0" }`. `yarn` refuses to run under Node 22. The `/home/ubuntu/.nvm/versions/node/v23.11.1/bin` path lives on the box — put it on `PATH` at the start, don't re-discover it every command.

## Copy-paste skeleton for a full ETF run

```bash
set -a; source /home/ubuntu/discord-claude-bot/.env; set +a
export PATH="/home/ubuntu/.nvm/versions/node/v23.11.1/bin:$PATH"
cd /home/ubuntu/discord-claude-bot/insights-ui/worktrees/<branch>/insights-ui

SYMBOL=SPUS
EXCHANGE=NYSEARCA
DIR=/tmp/${SYMBOL}-reports
mkdir -p "$DIR"

# Report 1 — includes MOR check + 10s wait
yarn etfs:prompt --symbol $SYMBOL --exchange $EXCHANGE \
  --report-type performance-and-returns --out "$DIR/01-performance-and-returns.prompt.txt"

# <<< act as the LLM, write $DIR/01-performance-and-returns.response.json >>>

node -e "JSON.parse(require('fs').readFileSync('$DIR/01-performance-and-returns.response.json','utf-8')); console.log('valid');"
yarn etfs:save --symbol $SYMBOL --exchange $EXCHANGE \
  --report-type performance-and-returns --in "$DIR/01-performance-and-returns.response.json"

# Reports 2–6 — skip MOR re-check
for RT in cost-efficiency-and-team risk-analysis future-performance-outlook index-strategy competition; do
  idx=$(printf "%02d" $((i++ + 2)))   # adjust or just use 02, 03, … explicitly
  yarn etfs:prompt --symbol $SYMBOL --exchange $EXCHANGE \
    --report-type $RT --out "$DIR/$idx-$RT.prompt.txt" --skip-mor-check
  # <<< act as the LLM >>>
  node -e "JSON.parse(require('fs').readFileSync('$DIR/$idx-$RT.response.json','utf-8'));"
  yarn etfs:save --symbol $SYMBOL --exchange $EXCHANGE \
    --report-type $RT --in "$DIR/$idx-$RT.response.json"
done

# Report 7 — final-summary, depends on the others
yarn etfs:prompt --symbol $SYMBOL --exchange $EXCHANGE \
  --report-type final-summary --out "$DIR/07-final-summary.prompt.txt" --skip-mor-check
# <<< act as the LLM >>>
yarn etfs:save --symbol $SYMBOL --exchange $EXCHANGE \
  --report-type final-summary --in "$DIR/07-final-summary.response.json"
```

Note: the `for` loop is illustrative — in a real Claude session, run each step as a separate tool call so the LLM can read the prompt and write the response file between them.

## Verifying a run

After saving, spot-check the public GET endpoints:

```bash
curl -s "https://koalagains.com/api/koala_gains/etfs-v1/exchange/$EXCHANGE/$SYMBOL/analysis"   | jq '.'
curl -s "https://koalagains.com/api/koala_gains/etfs-v1/exchange/$EXCHANGE/$SYMBOL/competition" | jq '.'
```

For stocks, the analysis route is `/api/koala_gains/tickers-v1/exchange/$EXCHANGE/$SYMBOL/analysis` and the per-category routes return per-factor detail.

## Where this fits in the knowledge base

- [`automated-report-generation.md`](automated-report-generation.md) — the reference doc: what each script does, which endpoint it hits, which tables it writes, auth model. Read this first.
- **This file** — the agent playbook: loop order, response-shape cheat sheet, and the run-time gotchas. Read this when actually driving a run.
- [`stock-analysis/generate-stock-reports.md`](stock-analysis/generate-stock-reports.md) — the `yarn stocks:trigger` path, which enqueues server-side LLM jobs rather than driving them from the agent. Use that when you want the server's pipeline to do the generation; use the scripts in this playbook when the agent itself is the LLM.
- [`etf-analysis/generate-etf-reports.md`](etf-analysis/generate-etf-reports.md) — the same server-side pipeline for ETFs.
