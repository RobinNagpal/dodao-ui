# Adding stocks

How to create new `TickerV1` records with `yarn stocks:add` — including required-field
and exchange validation. Used when a user wants analysis on a stock that isn't
yet in the DB, and as a prerequisite for `yarn stocks:trigger`.

## Quick reference

| Situation | Command |
| --- | --- |
| Add one stock inline | `yarn stocks:add --name "Apple Inc." --symbol AAPL --exchange NASDAQ --industry consumer-discretionary --sub-industry consumer-electronics --website https://www.apple.com` |
| Add many stocks from JSON | `yarn stocks:add --in path/to/stocks.json` |
| Write results for later inspection | `... --out path/to/added.json` |

## Required fields

Every stock must provide **all** of these:

| Field | CLI flag | JSON key | Notes |
| --- | --- | --- | --- |
| Company name | `--name` | `name` | Human-readable (e.g. "Apple Inc."). |
| Ticker symbol | `--symbol` | `symbol` | Upper-cased automatically. |
| Exchange | `--exchange` | `exchange` | **Must be in the predefined list** (see below). Upper-cased automatically. |
| Industry key | `--industry` | `industryKey` | FK into `TickerV1Industry`. Must already exist. |
| Sub-industry key | `--sub-industry` | `subIndustryKey` | FK into `TickerV1SubIndustry`. Must already exist under the chosen industry. |
| Website URL | `--website` | `websiteUrl` | **Mandatory.** Must be an absolute URL starting with `http://` or `https://`. |
| Stock-analyze URL | `--stock-analyze-url` | `stockAnalyzeUrl` | **Mandatory.** Must match the per-exchange format produced by `generateExpectedStockAnalyzeUrl` (see `src/utils/stockAnalyzeUrlValidation.ts`). The CLI uses `validateStockAnalyzeUrl` to check; the server re-validates on POST. |

Optional fields:

| Field | CLI flag | JSON key | Notes |
| --- | --- | --- | --- |
| Short summary | `--summary` | `summary` | Free text shown on the stock page. |

### Why both URLs are required

- **`websiteUrl`** — the company's official website is used throughout the analysis prompts (for sourcing business-model / product context) and on the stock detail page. Every record needs one.
- **`stockAnalyzeUrl`** — this is the canonical link into the external stock-analyze site that backs the per-stock data tabs; the DB column is non-nullable and most UI links assume it's present. Requiring it at the API boundary prevents half-populated rows from sneaking in through scripts.

The CLI and POST handler both enforce presence *and* format for these two fields.

## Exchange validation

The `exchange` value is validated against the predefined `EXCHANGES` array in
`src/utils/countryExchangeUtils.ts`. The full list (20 exchanges across 10
countries):

- **US:** `BATS`, `NASDAQ`, `NYSE`, `NYSEARCA`, `NYSEAMERICAN`, `OTCMKTS`
- **Canada:** `TSX`, `TSXV`
- **India:** `BSE`, `NSE`
- **UK:** `LSE`, `AIM`
- **Pakistan:** `PSX`
- **Japan:** `TSE`
- **Taiwan:** `TWSE`
- **Hong Kong:** `HKEX`
- **Korea:** `KOSPI`, `KOSDAQ`, `KONEX`
- **Australia:** `ASX`

Any value not in the list is rejected with an error that lists the allowed
values — both on the client side (CLI) and the server side (POST handler).

## Single-stock example

```bash
yarn stocks:add \
  --name "Apple Inc." \
  --symbol AAPL \
  --exchange NASDAQ \
  --industry consumer-discretionary \
  --sub-industry consumer-electronics \
  --website https://www.apple.com \
  --stock-analyze-url https://stockanalysis.com/stocks/AAPL/ \
  --summary "Designer & manufacturer of iPhones, Macs, and services."
```

> The `--stock-analyze-url` value must match the format produced by
> `generateExpectedStockAnalyzeUrl(symbol, exchange)`. For US stock exchanges
> (NASDAQ / NYSE / NYSEAMERICAN) that's `{BASE}/stocks/{SYMBOL}/`; other
> exchanges use `{BASE}/quote/{segment}/{SYMBOL}/` with per-exchange segments
> defined in `src/utils/stockAnalyzeUrlValidation.ts`. The CLI needs
> `NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL` set in its env to validate — otherwise
> the expected-format error message will show a relative path.

## Batch example (JSON input)

`--in` accepts either a bare array or `{ tickers: [...] }`:

```json
[
  {
    "name": "Apple Inc.",
    "symbol": "AAPL",
    "exchange": "NASDAQ",
    "industryKey": "consumer-discretionary",
    "subIndustryKey": "consumer-electronics",
    "websiteUrl": "https://www.apple.com",
    "stockAnalyzeUrl": "https://stockanalysis.com/stocks/AAPL/"
  },
  {
    "name": "Shopify Inc.",
    "symbol": "SHOP",
    "exchange": "TSX",
    "industryKey": "technology",
    "subIndustryKey": "software-application",
    "websiteUrl": "https://www.shopify.com",
    "stockAnalyzeUrl": "https://stockanalysis.com/quote/tsx/SHOP/",
    "summary": "Canadian multinational e-commerce company."
  }
]
```

```bash
yarn stocks:add --in /tmp/stocks.json
```

Batch behavior:

- Default inter-call delay: **500 ms** (tuned for sequential DB writes, not LLM
  calls). Override with `--delay-ms 250`.
- Pre-validation failures (missing required fields, unknown exchange, bad
  `websiteUrl` format, `stockAnalyzeUrl` that doesn't match the expected
  per-exchange format) are collected and **skipped**, never posted to the API.
- Server-side failures (duplicates, FK violations on industry/sub-industry) are
  logged per row and **do not abort the run**.
- Hard limit: **100 stocks** per invocation.
- Exit code 1 if any row failed.

## Output file (`--out`)

```json
{
  "added": [
    {
      "id": "7e1c9f1a-...",
      "name": "Apple Inc.",
      "symbol": "AAPL",
      "exchange": "NASDAQ",
      "websiteUrl": "https://www.apple.com",
      "stockAnalyzeUrl": "https://.../stocks/AAPL/",
      "industryKey": "consumer-discretionary",
      "subIndustryKey": "consumer-electronics"
    }
  ],
  "failed": [
    { "symbol": "XYZ", "exchange": "NASDAQ", "reason": "Ticker XYZ already exists on NASDAQ" }
  ]
}
```

Pipe the added symbols into the trigger step:

```bash
yarn stocks:add --in /tmp/stocks.json --out /tmp/added.json
# build a symbol/exchange list from /tmp/added.json and feed it to:
yarn stocks:trigger --in /tmp/trigger-input.json --all
```

## Auth

The create-ticker POST route (`/api/[spaceId]/tickers-v1`) uses the generic
`withErrorHandlingV2` middleware today — there is no admin-or-token guard on
it. The CLI still sends `x-automation-token` so that if the endpoint later
adopts `withAdminOrToken`, no script change is needed.

## Common failure modes

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Missing required field(s): websiteUrl` | Input lacks a website URL. | Provide `--website` / `websiteUrl`. |
| `Missing required field(s): stockAnalyzeUrl` | Input lacks the stock-analyze URL. | Provide `--stock-analyze-url` / `stockAnalyzeUrl`. |
| `Invalid exchange "NYSEArca". Supported: BATS, NASDAQ, ...` | Exchange typo or wrong casing. | Use one of the values in the `EXCHANGES` list (upper-case variants are accepted; the CLI normalizes). |
| `Ticker AAPL already exists on NASDAQ` | Stock is already in the DB. | Nothing to do; use `yarn stocks:trigger` to regenerate reports. |
| `Foreign key constraint violated on industryKey` | The industry/sub-industry key doesn't exist. | Confirm the keys via the admin industries page or by querying `TickerV1Industry`/`TickerV1SubIndustry`. |
| `websiteUrl must be an absolute URL starting with http:// or https://` | Missing protocol on the website URL. | Prepend `https://`. |
| `stockAnalyzeUrl is invalid: Invalid stockAnalyzeUrl format. Expected: .../stocks/AAPL/` | The URL doesn't match the per-exchange format `generateExpectedStockAnalyzeUrl` produces. | Use the URL shape from the error message (US exchanges use `/stocks/<SYM>/`; others use `/quote/<segment>/<SYM>/`). Make sure `NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL` is set in the CLI's env so the expected format resolves correctly. |

## Where to read further

- CLI: `src/scripts/tickers/add-stock.ts`
- Shared helpers: `src/scripts/tickers/lib.ts`
- Create endpoint: `src/app/api/[spaceId]/tickers-v1/route.ts` (POST handler)
- Exchange source-of-truth: `src/utils/countryExchangeUtils.ts`
- stockAnalyzeUrl generation: `src/utils/stockAnalyzeUrlValidation.ts`
- UI counterpart (visual equivalent of this CLI): `src/components/public-equitiesv1/AddTickersForm.tsx`
