# Triggering stock report generation

How to enqueue stock (ticker) analysis reports — single stock or batch, all reports or specific types. Mirrors the ETF trigger pattern in [`../etf-analysis/generate-etf-reports.md`](../etf-analysis/generate-etf-reports.md).

## Quick reference

| Situation | Command |
| --- | --- |
| All reports for one stock | `yarn stocks:trigger --symbol AAPL --exchange NASDAQ --all` |
| All reports for many stocks (10s delay between) | `yarn stocks:trigger --in path/to/stocks.json --all` |
| Specific report types for one stock | `yarn stocks:trigger --symbol AAPL --exchange NASDAQ --categories=financial-analysis,competition` |
| 7 analysis categories (skip final-summary) | `yarn stocks:trigger --in path/to/stocks.json --analysis` |
| Write request IDs for follow-up | `... --out path/to/triggered.json` |

## What gets generated

`yarn stocks:trigger` POSTs to `/api/koala_gains/tickers-v1/generation-requests` with
one or more `GenerationRequestPayload` entries. Each entry sets per-step
`regenerate*` flags for the requested report types:

| Report type (CLI value) | Flag set on payload |
| --- | --- |
| `financial-analysis` | `regenerateFinancialAnalysis` |
| `competition` | `regenerateCompetition` |
| `business-and-moat` | `regenerateBusinessAndMoat` |
| `past-performance` | `regeneratePastPerformance` |
| `future-growth` | `regenerateFutureGrowth` |
| `fair-value` | `regenerateFairValue` |
| `future-risk` | `regenerateFutureRisk` |
| `final-summary` | `regenerateFinalSummary` |

### Shortcuts

- `--all` (or `--categories=all`) — all 8 report types. **This is also the default** when no category flag is passed.
- `--analysis` (or `--categories=analysis`) — the 7 analysis categories, **skipping `final-summary`**. Useful when you want the core reports to finish first and will regenerate the summary afterward.

Explicit comma-separated list:

```bash
yarn stocks:trigger --symbol AAPL --exchange NASDAQ \
  --categories=financial-analysis,competition,final-summary
```

## Stock input — `--in` vs `--symbol/--exchange`

Two mutually-exclusive ways to specify stocks:

**Single stock (convenience):**

```bash
yarn stocks:trigger --symbol MSFT --exchange NASDAQ --all
```

**Batch from JSON file:**

```bash
yarn stocks:trigger --in /tmp/stocks.json --all
```

The JSON file must be a non-empty array of objects with at least `symbol` and
`exchange`:

```json
[
  { "symbol": "AAPL", "exchange": "NASDAQ" },
  { "symbol": "MSFT", "exchange": "NASDAQ" },
  { "symbol": "SHOP", "exchange": "TSX" }
]
```

Other fields (`name`, `industryKey`, etc.) are tolerated and forwarded to the
`--out` file but ignored by the API.

## Multi-stock behavior

When the input contains more than one stock, the script POSTs them **sequentially —
one stock per HTTP call — with a 10-second delay between calls**. This protects the
callback Lambda from a thundering-herd burst when the API enqueues several requests
at once.

- Default delay: **10000 ms**. Override with `--delay-ms 5000` (or any positive integer).
- Failures of one stock (e.g. unknown symbol/exchange in the prod `tickerV1` table)
  do not abort the run; they are logged, captured in the output file under
  `failedTickers`, and the script exits with code 1 at the end.

### Hard limit: 50 stocks per invocation

The script **fails immediately** if `--in` contains more than 50 entries:

> `Refusing to enqueue 73 tickers in one invocation — limit is 50.`

Each stock triggers up to 8 LLM jobs and a sequential delay; split the input
file and run again.

## Calling from Claude Code (or any automation)

The `POST /api/[spaceId]/tickers-v1/generation-requests` endpoint is gated by
`withAdminOrToken`. It accepts either:

1. Normal admin login (JWT + Admin role) — for UI-based triggering, OR
2. A secret token passed as the `x-automation-token` header (or `?token=<SECRET>`
   query param).

The script uses the header. Set `AUTOMATION_SECRET` in the environment
(e.g. `source path/to/discord-claude-bot/.env` or `export AUTOMATION_SECRET=...`)
before running. The GET handler on the same route is still admin-only; only
POST accepts the automation token.

## Output file (`--out`)

When passed `--out path/to/triggered.json`, the script writes:

```json
{
  "categories": ["financial-analysis", "competition", "..."],
  "tickers": [
    {
      "symbol": "AAPL",
      "exchange": "NASDAQ",
      "requestId": "b72f1d91-...",
      "ok": true,
      "error": null
    }
  ],
  "requestIds": ["b72f1d91-..."],
  "failedTickers": []
}
```

## Processing the enqueued requests

The POST only **creates `NotStarted` generation requests** in the database — it
does not itself execute LLM calls. To drain the queue:

- UI: open the admin generation-requests page, which periodically ticks the
  processing endpoint.
- Automation: GET `/api/[spaceId]/tickers-v1/generate-ticker-v1-request`
  (not token-gated today) picks up to 10 pending requests per call and kicks
  them off.

## Polling request status (the `by-ids` endpoint)

To watch progress on specific request IDs (e.g. the ones `trigger-generation.ts`
wrote to `triggered.json`), there is a dedicated lookup route that mirrors the
ETF pipeline's endpoint:

```
GET /api/[spaceId]/tickers-v1/generation-requests/by-ids?ids=<comma-separated-ids>
```

- **Auth:** `withAdminOrToken` — admin JWT or `x-automation-token` /
  `?token=<AUTOMATION_SECRET>` query param. Same secret the trigger script
  uses, so no extra setup.
- **Response shape:**

  ```ts
  interface TickerGenerationRequestsByIdsResponse {
    requests: Array<TickerV1GenerationRequest & {
      ticker: { symbol: string; exchange: string; name: string };
      pendingSteps: ReportType[];     // derived via calculatePendingSteps
    }>;
    missingIds: string[];             // ids that didn't resolve to a row
  }
  ```

  Each row also carries the raw `status` (`NotStarted` / `InProgress` /
  `Completed` / `Failed`), `completedSteps`, `failedSteps`, and
  `inProgressStep` columns from the Prisma model, which is everything you
  need to diagnose stuck or failed reports.

### Quick-debug recipes (for Claude or a human)

```bash
# 1. Take every requestId out of triggered.json and inspect the whole batch
jq -r '.requestIds | join(",")' /tmp/triggered.json | \
  xargs -I{} curl -s \
    -H "x-automation-token: $AUTOMATION_SECRET" \
    "https://koalagains.com/api/koala_gains/tickers-v1/generation-requests/by-ids?ids={}" | \
  jq '{
    statuses: (.requests | group_by(.status) | map({(.[0].status): length}) | add),
    missing:  .missingIds,
    failed:   [.requests[] | select(.status=="Failed") | {symbol: .ticker.symbol, failedSteps, inProgressStep, lastInvocationTime}],
    pending:  [.requests[] | select(.status!="Completed") | {symbol: .ticker.symbol, status, pendingSteps, inProgressStep}]
  }'

# 2. Poll a single request every 20s until it settles
while :; do
  curl -s -H "x-automation-token: $AUTOMATION_SECRET" \
    "https://koalagains.com/api/koala_gains/tickers-v1/generation-requests/by-ids?ids=<REQUEST_ID>" \
    | jq '.requests[0] | {status, pendingSteps, inProgressStep, failedSteps, completedSteps}'
  sleep 20
done
```

If the route returns a row whose `pendingSteps` array is empty but whose
`status` is still `InProgress`, the request has actually finished but the
"mark completed" sweep hasn't run yet — tick the processor
(`GET /api/[spaceId]/tickers-v1/generate-ticker-v1-request`) and it will
flip to `Completed` on the next pass.

There is no `stocks:wait` companion script today (unlike
`yarn etfs:wait`). If you need one, model it on
`src/scripts/etfs/wait-for-generation.ts` — the only things that change are
the endpoint path (above), the response field name (`ticker` instead of
`etf`), and the tick endpoint (`generate-ticker-v1-request`).

## Common failure modes

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `HTTP 404 ... findFirstOrThrow ... No record was found` | `(symbol, exchange)` doesn't match the prod `tickerV1` table — usually the stock hasn't been added yet. | Add the stock first with `yarn stocks:add` (see [add-stock.md](add-stock.md)). |
| `AUTOMATION_SECRET is not set` | Missing env var. | `source path/to/.env` or `export AUTOMATION_SECRET=...` before running. |
| `HTTP 401/403` | Token mismatch between client and `AUTOMATION_SECRET` on the server. | Confirm the env var matches the deployed server's secret. |
| `Refusing to enqueue N tickers` | `--in` contains > 50 entries. | Split the file. |
| Multiple `FAIL` lines, exit code 1 | Some stocks missing from prod. | Check the `failedTickers` block in the `--out` file; add them with `yarn stocks:add`, then re-run. |
| `by-ids` returns rows stuck in `InProgress` with an old `lastInvocationTime` | Lambda callback didn't complete or callback-url timed out. | Tick the processor again; if the `inProgressStep` is repeatedly the same, that step's LLM prompt is broken — inspect that specific report's pipeline. |
| `by-ids` returns the id under `missingIds` | Row was deleted or the id was typed wrong. | Re-run `yarn stocks:trigger` (it will create a fresh request) and capture the new id. |

## Where to read further

- Trigger endpoint: `src/app/api/[spaceId]/tickers-v1/generation-requests/route.ts`
- **Lookup by ids:** `src/app/api/[spaceId]/tickers-v1/generation-requests/by-ids/route.ts`
- Processor tick: `src/app/api/[spaceId]/tickers-v1/generate-ticker-v1-request/route.ts`
- Pending-step calculation: `src/utils/analysis-reports/report-steps-statuses.ts` (`calculatePendingSteps`)
- Trigger script: `src/scripts/tickers/trigger-generation.ts`
- Shared CLI helpers: `src/scripts/tickers/lib.ts`
- Report types enum: `src/types/ticker-typesv1.ts` (`ReportType`)
- Processing tick endpoint: `src/app/api/[spaceId]/tickers-v1/generate-ticker-v1-request/route.ts`
- Auth helper: `src/app/api/helpers/withAdminOrToken.ts`
