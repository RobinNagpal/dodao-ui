# Triggering ETF report generation

How to enqueue ETF analysis reports — single ETF or batch, all reports or specific types.

## Quick reference

| Situation | Command |
| --- | --- |
| All reports for one ETF | `yarn etfs:trigger --symbol VOO --exchange NYSEARCA --all` |
| All reports for many ETFs (10s delay between) | `yarn etfs:trigger --in path/to/etfs.json --all` |
| Specific report types for one ETF | `yarn etfs:trigger --symbol VOO --exchange NYSEARCA --categories=performance-and-returns,risk-analysis` |
| Default (4 evaluation categories) for many ETFs | `yarn etfs:trigger --in path/to/etfs.json` |
| Write request IDs for the wait step | `... --out path/to/triggered.json` |

After triggering, poll until completion:

```bash
yarn etfs:wait --in path/to/triggered.json --tick
```

## What gets generated

`yarn etfs:trigger` POSTs to `/api/koala_gains/etfs-v1/generation-requests` with one
or more `EtfGenerationRequestPayload` entries. Each entry sets per-step
`regenerate*` flags for the requested report types:

| Report type (CLI value) | Flag set on payload |
| --- | --- |
| `performance-and-returns` | `regeneratePerformanceAndReturns` |
| `cost-efficiency-and-team` | `regenerateCostEfficiencyAndTeam` |
| `risk-analysis` | `regenerateRiskAnalysis` |
| `future-performance-outlook` | `regenerateFuturePerformanceOutlook` |
| `index-strategy` | `regenerateIndexStrategy` |
| `final-summary` | `regenerateFinalSummary` |

### Shortcuts

- `--all` (or `--categories=all`) — every report type above.
- `--evaluation` (or `--categories=evaluation`) — the four factor-analysis categories
  (`performance-and-returns`, `cost-efficiency-and-team`, `risk-analysis`,
  `future-performance-outlook`). This is also the default when no flag is passed.

You can also pass an explicit comma-separated list:

```bash
yarn etfs:trigger --symbol VOO --exchange NYSEARCA \
  --categories=performance-and-returns,risk-analysis,final-summary
```

## ETF input — `--in` vs `--symbol/--exchange`

Two mutually-exclusive ways to specify ETFs:

**Single ETF (convenience):**

```bash
yarn etfs:trigger --symbol VTI --exchange NYSEARCA --all
```

**Batch from JSON file:**

```bash
yarn etfs:trigger --in /tmp/etfs.json --all
```

The JSON file must be a non-empty array of objects with at least `symbol` and
`exchange`:

```json
[
  { "symbol": "VOO", "exchange": "NYSEARCA" },
  { "symbol": "QQQ", "exchange": "NASDAQ" },
  { "symbol": "IEFA", "exchange": "BATS" }
]
```

Other fields (`name`, `group`, `category`) are tolerated and forwarded to the
`--out` file but ignored by the API.

## Multi-ETF behavior

When the input contains more than one ETF, the script POSTs them **sequentially —
one ETF per HTTP call — with a 10-second delay between calls**. This protects
the LLM-callback Lambda from a thundering-herd burst when the API enqueues
several requests at once.

- Default delay: **10000 ms**. Override with `--delay-ms 5000` (or any positive
  integer).
- Failures of one ETF (e.g. unknown symbol/exchange in the prod `etf` table) do
  not abort the run; they are logged, captured in the output file under
  `failedEtfs`, and the script exits with code 1 at the end.

### Hard limit: 50 ETFs per invocation

The script **fails immediately** if `--in` contains more than 50 entries:

> `Refusing to enqueue 73 ETFs in one invocation — limit is 50.`

Each ETF triggers up to 6 LLM jobs and a sequential delay; split the input
file and run again.

## Cache invalidation

You don't need to manually flush caches — the save callbacks do it for you.
When an LLM report lands at `/api/.../save-report-callback`, the matching
`save*Response` helper in `src/utils/etf-analysis-reports/save-etf-report-utils.ts`
calls `revalidateEtfAndExchangeTag(symbol, exchange)`. Factor-analysis saves
also call `revalidateEtfListingTag()` because the cached score changes affect
the listing-page ranking.

So:

- Per-ETF detail page tag (`etf_exchange:_<SYM>_<EX>`): invalidated on every
  `saveEtfFactorAnalysisResponse`, `saveEtfFinalSummaryResponse`, and
  `saveEtfIndexStrategyResponse` call.
- ETF listing tag (`etf_listing`): invalidated on every
  `saveEtfFactorAnalysisResponse` (where scores update).

If you ever bypass the save helpers and write reports directly, call those two
`revalidate*` functions yourself.

## Auth

The endpoint is gated by `withAdminOrToken`. The script uses the
`x-automation-token` header set from `AUTOMATION_SECRET`. Make sure that env
var is exported (or `source ./.env`) before running.

## Output file (`--out`)

When passed `--out path/to/triggered.json`, the script writes:

```json
{
  "categories": ["performance-and-returns", "..."],
  "etfs": [
    {
      "symbol": "VOO",
      "exchange": "NYSEARCA",
      "requestId": "f7e29d2d-...",
      "ok": true,
      "error": null
    }
  ],
  "requestIds": ["f7e29d2d-..."],
  "failedEtfs": []
}
```

Pipe `--out` directly into the wait step:

```bash
yarn etfs:trigger --in /tmp/etfs.json --all --out /tmp/triggered.json
yarn etfs:wait --in /tmp/triggered.json --tick
```

## Common failure modes

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `HTTP 404 ... findFirstOrThrow ... No record was found` | `(symbol, exchange)` doesn't match the prod `etf` table — usually wrong exchange (e.g. IEFA listed as NYSEARCA when prod has it as BATS). | Verify exchange via the ETF detail page or `/api/.../etfs-v1/exchange/<EX>/<SYM>/analyzer-info`. |
| `AUTOMATION_SECRET is not set` | Missing env var. | `source path/to/.env` or `export AUTOMATION_SECRET=...` before running. |
| `Refusing to enqueue N ETFs` | `--in` contains > 50 entries. | Split the file. |
| Multiple `FAIL` lines, exit code 1 | Some ETFs missing from prod. | Check the `failedEtfs` block in the `--out` file; run successful subset through `--in` again. |

## Where to read further

- Endpoint: `src/app/api/[spaceId]/etfs-v1/generation-requests/route.ts`
- Trigger script: `src/scripts/etfs/trigger-generation.ts`
- Wait script: `src/scripts/etfs/wait-for-generation.ts`
- Save / cache: `src/utils/etf-analysis-reports/save-etf-report-utils.ts`
- Cache helpers: `src/utils/etf-cache-utils.ts`
