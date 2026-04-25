# Stock Analysis Knowledge

Runbooks and reference docs for the stock (ticker / equity) analysis pipeline — how to add new stocks, enqueue report generation, and interact with the relevant API endpoints from scripts.

## Topics

- **[generate-stock-reports.md](generate-stock-reports.md)** — How to enqueue stock analysis reports with `yarn stocks:trigger` (single ticker or batch, all reports or a subset), and how authentication works against the generation-requests endpoint.
- **[add-stock.md](add-stock.md)** — How to add new stocks to the database with `yarn stocks:add`, including exchange validation against the predefined list, required fields, and the stockAnalyzeUrl auto-generation.

Stock market scenarios live in the `StockScenario` Prisma model (see `insights-ui/prisma/schema.prisma`) and are managed through the admin UI at `/admin-v1/stock-scenarios` — there is no longer a markdown catalog. For drafting a new scenario (scratch-file workflow under `/tmp/scenarios/stocks/<slug>.md` and the required content template), see [`../scenario-authoring.md`](../scenario-authoring.md).

## Where to read further

- Trigger endpoint: `src/app/api/[spaceId]/tickers-v1/generation-requests/route.ts`
- Create-ticker endpoint: `src/app/api/[spaceId]/tickers-v1/route.ts`
- Exchanges source-of-truth: `src/utils/countryExchangeUtils.ts` (`EXCHANGES`, `isExchange`, `AllExchanges`)
- stockAnalyzeUrl validation / generation: `src/utils/stockAnalyzeUrlValidation.ts`
- Trigger script: `src/scripts/tickers/trigger-generation.ts`
- Add-stock script: `src/scripts/tickers/add-stock.ts`
