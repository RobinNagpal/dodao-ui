# Stock Analysis Knowledge

Runbooks and reference docs for the stock (ticker / equity) analysis pipeline — how to add new stocks, enqueue report generation, and interact with the relevant API endpoints from scripts.

## Topics

- **[generate-stock-reports.md](generate-stock-reports.md)** — How to enqueue stock analysis reports with `yarn stocks:trigger` (single ticker or batch, all reports or a subset), and how authentication works against the generation-requests endpoint.
- **[add-stock.md](add-stock.md)** — How to add new stocks to the database with `yarn stocks:add`, including exchange validation against the predefined list, required fields, and the stockAnalyzeUrl auto-generation.
- **[stock-market-scenarios.md](stock-market-scenarios.md)** — Catalog of policy / macro / industry scenarios that move specific stocks (winners, losers, most-exposed). Source-of-truth markdown consumed by `yarn import:stock-scenarios`; tickers are exchange-qualified and each entry is country-scoped.

## Where to read further

- Trigger endpoint: `src/app/api/[spaceId]/tickers-v1/generation-requests/route.ts`
- Create-ticker endpoint: `src/app/api/[spaceId]/tickers-v1/route.ts`
- Exchanges source-of-truth: `src/utils/countryExchangeUtils.ts` (`EXCHANGES`, `isExchange`, `AllExchanges`)
- stockAnalyzeUrl validation / generation: `src/utils/stockAnalyzeUrlValidation.ts`
- Trigger script: `src/scripts/tickers/trigger-generation.ts`
- Add-stock script: `src/scripts/tickers/add-stock.ts`
