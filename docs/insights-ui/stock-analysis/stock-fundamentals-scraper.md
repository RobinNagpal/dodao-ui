# Stock fundamentals scraper

How `TickerV1StockAnalyzerScrapperInfo` gets filled — the data behind the **Financial
Information** card and the **Quarterly / Annual Financial Metrics** chart on
`/stocks/[exchange]/[ticker]`, and behind the financial JSON handed to the analysis
prompts.

Lives in [`insights-ui/src/utils/stock-analyzer/`](../../../insights-ui/src/utils/stock-analyzer/),
with the persistence layer in
[`insights-ui/src/utils/stock-analyzer-scraper-utils.ts`](../../../insights-ui/src/utils/stock-analyzer-scraper-utils.ts).

## Why it moved out of the Lambda

It used to be an AWS Lambda (`STOCK_ANALYZER_LAMBDA_URL`) that did nothing but fetch a
page from the stock-analyze site and parse its tables. Its statement parsers keyed off a
`#main-table` id that the source site **dropped in a SvelteKit redesign**. After that
every statement request came back `200 OK` with:

```json
{ "data": { "meta": { "unit": "ones" }, "periods": [] },
  "errors": [{ "where": "parseIncomeStatementQuarterlyRaw", "message": "#main-table not found" }] }
```

The app treated that as a successful fetch, wrote the empty object over good data and
stamped it fresh — so the revenue chart silently disappeared for every ticker and would
not have retried for 30–90 days. Owning the scrape here means the parsers sit next to the
code that reads their output and a fix is one app deploy, not a separate Lambda release.

`STOCK_ANALYZER_LAMBDA_URL` and `ETF_ANALYZER_LAMBDA_URL` are no longer read by anything;
the scraper reads `NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL` instead. (`ETF_MORN_LAMBDA_URL` —
the Morningstar scrape, a different source on an async callback — and `SCREENER_API_URL`
are unrelated and still in use.)

## Layout

| File | Responsibility |
| --- | --- |
| `stock-analysis-fetcher.ts` | HTTP: browser UA, 20 s timeout, retry on 429/5xx (never on 404), and `stockAnalyzeUrl` → sub-page URL building against the configured base URL. |
| `stock-analysis-table-parser.ts` | Generic reader for the site's tables — period columns, row labels, cell values. Selector-free: no generated class or id is used. |
| `stock-analysis-section-parsers.ts` | Page-shape parsers producing the exact persisted JSON shapes (`StockFundamentalsSummary`, `DividendsData`, `{ meta, periods }`). |
| `index.ts` | Section registry (URL + parser + usability test), `scrapeStockAnalyzerSection()` and `scrapeEtfSummary()`. |

## The 12 sections

Each maps to one source-site page appended to the ticker's `stockAnalyzeUrl`
(`<base>/stocks/{SYMBOL}/` for US exchanges, `<base>/quote/{segment}/{SYMBOL}/` otherwise).
Quarterly variants add `?p=quarterly`.

The origin is never hard-coded: `buildStockAnalysisSubPageUrl` takes the *path* from the
stored `stockAnalyzeUrl` and resolves it against `NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL` —
the same variable `stockAnalyzeUrlValidation.ts` uses to generate those URLs. If the
variable is unset (local scripts, tests) the stored URL's own origin is used.

| Section | Page | DB column | Max age |
| --- | --- | --- | --- |
| `summary` | *(quote page)* | `summary` | 7 d |
| `dividends` | `dividend/` | `dividends` | 30 d |
| `income-statement/{annual,quarterly}` | `financials/income-statement/` | `incomeStatement{Annual,Quarter}` | 90 / 30 d |
| `balance-sheet/{annual,quarterly}` | `financials/balance-sheet/` | `balanceSheet{Annual,Quarter}` | 90 / 30 d |
| `cashflow/{annual,quarterly}` | `financials/cash-flow-statement/` | `cashFlow{Annual,Quarter}` | 90 / 30 d |
| `ratios/{annual,quarterly}` | `financials/ratios/` | `ratios{Annual,Quarter}` | 90 / 30 d |
| `kpis/{annual,quarterly}` | `financials/metrics/` | `kpis{Annual,Quarter}` | 90 / 30 d |

A full 12-section refresh is ~0.6–1.0 s (all sections in parallel), versus a Lambda
round-trip per section before.

## Parsing rules worth knowing

- **Two header rows.** Statement pages stack `Fiscal Quarter | Q2 2026 | …` over
  `Period Ending | Jun 30, 2026 | …`. Period labels come from the first row; the ISO
  `periodEnd` comes from the `<th id="2026-06-30">` on either row.
- **Several tables per page.** A statement page splits its rows across 2–6 tables sharing
  the same period columns. Statement parsers merge them into one flat `values` map per
  period; the KPI parser instead keeps them grouped by heading
  (`revenue` / `revenueByGeography` / `keyPerformanceIndicators`).
- **Non-period columns are dropped.** `TTM` (annual) and `Current` (ratios) are not
  fiscal periods; only `Q[1-4] YYYY` / `FY YYYY` columns become data points.
- **Row label → value key.** camelCase of the label, with an alias table for the keys the
  app reads: `EPS (Diluted)` → `eps`, `Shares Outstanding (Diluted)` → `sharesOutstanding`,
  `Revenue (Total)` → `totalRevenue`. `quarterly-chart-data/route.ts` looks up `revenue`,
  `grossMargin`, `ebit`, `freeCashFlow`, `eps`, `sharesOutstanding` — keep those aliases
  if you touch this.
- **Values.** Plain numbers become numbers (`5,442` → `5442`, `(1,234)` → `-1234`);
  percentages and suffixed values stay strings (`70.49%`, `1.45B`). `-` / `n/a` → `null`.

## How a bad scrape is now contained

Three rules replace "write whatever came back":

1. **Usability gate before writing.** Each section declares `isUsable`. A page that loads
   but parses to nothing is never written over stored data and never stamps
   `lastUpdatedAt*` — so a future source-site change degrades to "data goes stale"
   instead of "data is deleted".
2. **Empty sections are re-fetched.** `determineDataToFetch` re-scrapes any section whose
   *stored* value fails `isUsable`, not just stale ones. Previously only an empty
   `summary` triggered a refetch, which is why empty statements stayed empty.
3. **Failure backoff.** A section that fails is left alone for 6 h, read off the newest
   matching entry in the `errors` column. This bounds the retry rate both for a broken
   parser and for tickers with legitimately no data (Reliance publishes no quarterly cash
   flow; a non-payer has no dividend history). A successful scrape clears that section's
   past errors, and the column is capped at the 50 most recent entries — it used to grow
   without bound.

On create, sections that failed get `lastUpdatedAt* = epoch` rather than "now", so they
read as stale instead of masquerading as freshly fetched.

## Forcing a refresh

`POST /api/{spaceId}/tickers-v1/fetch-financial-data` (admin or automation token):

```json
{ "tickerIds": ["…"], "force": true }
```

`force` bypasses the age check and the backoff and re-scrapes all 12 sections. Use it to
backfill rows whose sections were persisted empty — without it those rows carry a fresh
`lastUpdatedAt*` and the age check skips them.

## ETFs

ETFs sit on the same source site (`<base>/etf/{symbol}/`) and their quote page uses the
same two-column stat tables, so `scrapeEtfSummary()` shares the fetcher and the stat-table
reader. It backs `EtfFinancialInfo` (the AUM / expense ratio / yield / holdings card on
`/etfs/[exchange]/[etf]`), written by
`POST /api/{spaceId}/etfs-v1/exchange/{exchange}/{etf}/fetch-financial-info`.

That route carried the same bug in a sharper form: it upserted **every** column from the
Lambda payload with a `?? null` fallback and no usability check at all, so a single empty
response would have nulled out AUM, expense ratio, P/E, dividends, holdings — the whole
row — rather than just one section. It survived only because it is an admin/automation
write path, not a read path, so nothing had triggered it since the source-site redesign
(rows were last written months ago and are correspondingly stale). It now scrapes
in-process and refuses to write a row when the page parses to nothing.

Two size fields, `aum` and `sharesOut`, are stored as plain digit strings
(`112210000000`) rather than the page's compact form (`$112.21B`). Both the UI's
`formatCompactAmount` and the ETF filters read them through `parseNumericStringValue`,
which accepts either, but every existing row is plain digits — `parseEtfSummaryPage`
expands the suffix so the rows stay homogeneous.

## When the charts disappear again

1. `GET /api/koala_gains/tickers-v1/exchange/{EXCHANGE}/{TICKER}/quarterly-chart-data` —
   `{"chartData": null}` for every ticker means the statement sections are empty.
2. Check the `errors` column on `TickerV1StockAnalyzerScrapperInfo` for that ticker; the
   newest entries name the failing section and page URL.
3. Open the page it names in a browser. If the tables moved, fix
   `stock-analysis-table-parser.ts` / `stock-analysis-section-parsers.ts`, then `force`
   a refresh for the affected tickers.
