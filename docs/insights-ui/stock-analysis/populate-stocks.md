# Populating stocks for an exchange

How to add the next N most valuable stocks of an exchange (e.g. 100 more PSX stocks,
200 NSE stocks) that KoalaGains doesn't cover yet. The output is a **`.sql` file** that
is run on the production Postgres database — no API writes, no admin screen.

This is written so it can be handed to Claude as a task ("add 100 more PSX stocks").
Claude runs step 1, does the industry mapping in step 2, runs step 3 and hands back the SQL file.

## Quick reference

| Step                 | Who     | Command / action                                                                          | Output                                                    |
| -------------------- | ------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1. Fetch candidates  | Claude  | `yarn stocks:populate fetch --exchange PSX --count 100`                                   | `insights-ui/stock-population/psx-<date>-candidates.json` |
| 2. Map industries    | Claude  | Fill `industryKey` + `subIndustryKey` for every candidate                                 | same file                                                 |
| 3. Generate SQL      | Claude  | `yarn stocks:populate sql --in stock-population/psx-<date>-candidates.json`               | `insights-ui/stock-population/psx-<date>.sql`             |
| 4. Run on production | Manager | `psql "$PROD_DATABASE_URL" -f psx-<date>.sql`                                             | rows in `tickers_v1`                                      |
| 5. Generate reports  | Anyone  | `yarn stocks:trigger --in …` (see [generate-stock-reports.md](generate-stock-reports.md)) | reports                                                   |

`stock-population/` is git-ignored — the candidates file is a working file; the SQL is the deliverable.

## Step 1 — `fetch`

```bash
cd insights-ui
yarn stocks:populate fetch --exchange NSE --count 200
```

What it does:

1. Reads **production** (`KOALAGAINS_API_BASE`, default `https://koalagains.com`, public GETs — no secret needed):
   - every live ticker in the exchange's country (`GET /api/koala_gains/tickers-v1?country=…`), and
   - every industry / sub-industry with its stock count (`GET /api/industries`).
2. Walks the exchange's **market-cap-ranked list** on the stock-analyze site (`NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL`), page by page, and keeps the first `--count` stocks that are not already covered:
   - same symbol on the same exchange → already have it;
   - same company name (ignoring `Limited`/`Ltd`, punctuation and case; `Co`/`Corp` are expanded, not dropped) on **any exchange of the same country** → already have it. This is what stops an NSE candidate duplicating a stock we hold on BSE (BSE symbols are numeric codes like `500325`, so symbols can't be compared);
   - another share class of a company already picked in this run (e.g. `PIAHCLA` / `PIAHCLB`) → keeps the higher-ranked one.
3. Opens each candidate's company profile page (`…/quote/<segment>/<SYMBOL>/company/`, ~1.5 s apart) for the **website**, the site's own **industry / sector** label, ISIN and a short **description**. Stocks with no website on their profile are skipped and the next ranked stock is taken.
4. Writes the candidates file with `industryKey` / `subIndustryKey` empty, plus `allowedSubIndustries` — the non-archived sub-industries that **already have at least one stock**. Industries with zero stocks are deliberately excluded.

`stockAnalyzeUrl` is generated from symbol + exchange (`generateExpectedStockAnalyzeUrl`), never scraped.

Flags: `--out <file>`, `--delay-ms <ms>` (default 1500), `--list-path /list/…/` for an exchange without a built-in list page. Built-in list pages: **PSX** (`/list/pakistan-stock-exchange/`), **NSE** (`/list/nse-india/`), **BSE** (`/list/bse-india/`).

**India:** use **NSE** as the exchange for new Indian stocks. Most large companies trade on both NSE and BSE; the name check above skips companies we already hold on BSE.

## Step 2 — industry mapping (Claude)

For every entry in `candidates`:

- Set `industryKey` and `subIndustryKey` to **one pair from `allowedSubIndustries`** — never invent a key and never use a pair outside that list. Decide from `name`, `sourceIndustry`, `sourceSector` and `description`; the sub-industry `summary` explains what each bucket holds.
- If `possibleDuplicateOf` is set, check whether it is really the same company. If it is, set `"skip": true, "skipReason": "same company as …"`. (Most are false alarms — e.g. _K.P.R. Mill_ vs _K.P. Energy_.)
- If the candidate is not an operating company (closed-end fund, REIT-like trust, modaraba, shell/holding vehicle with no business), set `skip: true` with a reason.
- Don't change `symbol`, `exchange`, `websiteUrl` or `stockAnalyzeUrl`.

Skipped candidates reduce the final count — if an exact number matters, fetch a few extra (`--count 110` for 100).

## Step 3 — `sql`

```bash
yarn stocks:populate sql --in stock-population/nse-2026-10-14-candidates.json
```

Re-reads production (tickers + in-use sub-industries) and **refuses to write the SQL** if any non-skipped candidate has an empty or not-allowed industry pair, a bad website URL, a bad `stockAnalyzeUrl`, or a duplicate symbol in the file. Candidates added to production since step 1 are dropped.

The generated file:

```sql
BEGIN;
INSERT INTO "tickers_v1" ("id", "name", "symbol", "exchange", "industry_key", "sub_industry_key",
  "website_url", "stock_analyze_url", "space_id", "created_by", "updated_by", "created_at", "updated_at")
VALUES
  ('<uuid>', 'Reliance Industries Limited', 'RELIANCE', 'NSE', '…', '…', 'https://www.ril.com',
   '<stock-analyze-base>/quote/nse/RELIANCE/', 'koala_gains', 'stocks-populate-script', 'stocks-populate-script', NOW(), NOW()),
  …
ON CONFLICT ("space_id", "symbol", "exchange") DO NOTHING;
COMMIT;
```

- `id` and `updated_at` are supplied explicitly — Prisma fills them on the API path (`@default(uuid())`, `@updatedAt`) but Postgres has no default for them.
- **Safe to re-run:** a row whose `(space_id, symbol, exchange)` already exists is skipped.
- **All-or-nothing:** one transaction, so an unknown industry/sub-industry (FK violation) aborts the whole insert.
- `created_by = 'stocks-populate-script'` makes the batch easy to find:
  `SELECT COUNT(*) FROM tickers_v1 WHERE created_by = 'stocks-populate-script' AND exchange = 'NSE';`

Inserting directly is equivalent to the create-ticker API (`POST /api/[spaceId]/tickers-v1`), which does a plain `prisma.tickerV1.create` with no other side effects.

## After the SQL has run

The new stocks have no reports yet. Enqueue them with `yarn stocks:trigger --in <file> --all`, where the file is an array of `{ "symbol", "exchange" }` — build it from the candidates file (non-skipped rows). New stocks also won't show up on cached listing pages until the cache is invalidated (`/admin-v1/invalidate-cache`).

## Common failure modes

| Symptom                                                         | Cause                                                                                                     | Fix                                                |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `Bot challenge served for …` / `HTTP 429`                       | The stock-analyze site rate-limited us.                                                                   | Wait a few minutes, re-run with `--delay-ms 3000`. |
| `No rows parsed from …`                                         | The list page layout changed (rows are read from the page's embedded `{no:…,s:"psx/OGDC",n:"…"}` data).   | Update `parseListPage` in the script.              |
| `profile fetch failed: HTTP 404` (in the skipped list)          | The list links to a symbol whose profile page doesn't exist (e.g. a second share class).                  | Nothing — the next ranked stock is taken.          |
| `… is not an in-use sub-industry pair`                          | Mapping used a key outside `allowedSubIndustries`, or that sub-industry lost all its stocks since step 1. | Re-map from the list in the file.                  |
| `insert … violates foreign key constraint` when running the SQL | Industry/sub-industry deleted on production after the SQL was generated.                                  | Re-run step 3 to regenerate. Nothing was inserted. |

## Where to read further

- Script: `insights-ui/src/scripts/tickers/populate-stocks.ts`
- Single/batch add through the API instead: [add-stock.md](add-stock.md)
- Exchanges and countries: `src/utils/countryExchangeUtils.ts`
- `stockAnalyzeUrl` format: `src/utils/stockAnalyzeUrlValidation.ts`
