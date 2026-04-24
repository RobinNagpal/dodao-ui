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

Unlike the ETF pipeline, there is no `by-ids` polling endpoint for tickers, so
the trigger script does not ship with a `stocks:wait` companion. Check status
via the admin page or by querying the generation-requests list.

## Common failure modes

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `HTTP 404 ... findFirstOrThrow ... No record was found` | `(symbol, exchange)` doesn't match the prod `tickerV1` table — usually the stock hasn't been added yet. | Add the stock first with `yarn stocks:add` (see [add-stock.md](add-stock.md)). |
| `AUTOMATION_SECRET is not set` | Missing env var. | `source path/to/.env` or `export AUTOMATION_SECRET=...` before running. |
| `HTTP 401/403` | Token mismatch between client and `AUTOMATION_SECRET` on the server. | Confirm the env var matches the deployed server's secret. |
| `Refusing to enqueue N tickers` | `--in` contains > 50 entries. | Split the file. |
| Multiple `FAIL` lines, exit code 1 | Some stocks missing from prod. | Check the `failedTickers` block in the `--out` file; add them with `yarn stocks:add`, then re-run. |

## Where to read further

- Endpoint: `src/app/api/[spaceId]/tickers-v1/generation-requests/route.ts`
- Trigger script: `src/scripts/tickers/trigger-generation.ts`
- Shared CLI helpers: `src/scripts/tickers/lib.ts`
- Report types enum: `src/types/ticker-typesv1.ts` (`ReportType`)
- Processing tick endpoint: `src/app/api/[spaceId]/tickers-v1/generate-ticker-v1-request/route.ts`
- Auth helper: `src/app/api/helpers/withAdminOrToken.ts`
