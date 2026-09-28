# Stock Analysis Knowledge

Runbooks and reference docs for the stock (ticker / equity) analysis pipeline — how to add new stocks, enqueue report generation, and interact with the relevant API endpoints from scripts.

## Topics

- **[generate-stock-reports.md](generate-stock-reports.md)** — How to enqueue stock analysis reports with `yarn stocks:trigger` (single ticker or batch, all reports or a subset), and how authentication works against the generation-requests endpoint.
- **[add-stock.md](add-stock.md)** — How to add new stocks to the database with `yarn stocks:add`, including exchange validation against the predefined list, required fields, and the stockAnalyzeUrl auto-generation.
- **[stock-fundamentals-scraper.md](stock-fundamentals-scraper.md)** — How `TickerV1StockAnalyzerScrapperInfo` is filled: the in-process scraper that replaced the Stock Analyzer Lambda (`STOCK_ANALYZER_LAMBDA_URL`), the 12 sections and the pages behind them, the parsing rules, and the write-validation / refetch / backoff rules that stop a source-site change from silently blanking the financial charts. Read this when the Financial Information card or the Quarterly Metrics chart goes missing.

## Previewing the automated (Claude) queue

The nightly Claude job picks stock candidates by staleness — oldest report first —
and, by default, only from US and Canadian exchanges (`AUTOMATED_GENERATION_MARKETS`
on the App Settings screen). The admin screen **Stocks Reports → Claude Reports**
(`/admin-v1/claude-reports`) shows that queue: a paginated list of the stocks the job
will generate for, in the order it will take them, with the leading `batchSize` rows
marked as the next batch.

The markets toggle on that screen previews the other setting ("All markets") without
changing it; when the preview does not match the configured value the screen says so
and links to App Settings. Ordering and eligibility come from
`getUpcomingAutoGenerationStocks`, which shares its `where` / `orderBy` with
`getOldestStocksOverall` (what the enqueue job actually calls) — so the preview cannot
drift from the real queue. A stock is eligible only if it already has a report
(`summary` present) and has no `NotStarted` / `InProgress` generation request.

Stock market scenarios live in the `StockScenario` Prisma model (see `insights-ui/prisma/schema.prisma`) and are managed through the admin UI at `/admin-v1/stock-scenarios` — there is no longer a markdown catalog. For drafting a new scenario (scratch-file workflow under `/tmp/scenarios/stocks/<slug>.md` and the required content template), see [`../scenario-authoring.md`](../scenario-authoring.md).

## Where to read further

- Trigger endpoint: `src/app/api/[spaceId]/tickers-v1/generation-requests/route.ts`
- Upcoming-queue endpoint + screen: `src/app/api/[spaceId]/tickers-v1/upcoming-auto-generation/route.ts`, `src/app/admin-v1/claude-reports/`
- Queue ordering helpers: `src/utils/oldest-reports-utils.ts`; the job that consumes them: `src/utils/auto-generation/auto-stock-generation-utils.ts`
- Create-ticker endpoint: `src/app/api/[spaceId]/tickers-v1/route.ts`
- Exchanges source-of-truth: `src/utils/countryExchangeUtils.ts` (`EXCHANGES`, `isExchange`, `AllExchanges`)
- stockAnalyzeUrl validation / generation: `src/utils/stockAnalyzeUrlValidation.ts`
- Fundamentals scraper: `src/utils/stock-analyzer/` (fetch + parse) and `src/utils/stock-analyzer-scraper-utils.ts` (freshness + persistence)
- Trigger script: `src/scripts/tickers/trigger-generation.ts`
- Add-stock script: `src/scripts/tickers/add-stock.ts`
