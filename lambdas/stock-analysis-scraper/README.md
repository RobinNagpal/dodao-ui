# stock-analysis-scraper (Serverless Lambda)

A tiny AWS Lambda that scrapes stock fundamentals from **stock analysis** and returns them as JSON.  
It’s deployed behind **API Gateway (HTTP API v2)** and uses **one Lambda function (`api`)** with an internal router that dispatches by **URL path** (via a `switch` in `src/handler.api`).

---

## How it works (at a glance)

1. **One handler**: `src/handler.api` receives every request (ANY `/{proxy+}` route).
2. **Routing**: the handler normalizes the request path and switches to the matching function, e.g. `/summary` → `fetchSummary`, `/financials/annual` → `fetchAllAnnual`, etc.
3. **Request body**: JSON with at least:
   ```json
   {
     "url": "https://stock-analyze.xyz/stocks/amzn/",
     "view": "strict"
   }
   ```
   - `url` (required): the **ticker root** on stock-analyze.xyz.
   - `view` (optional): `"normal" | "raw" | "strict"`; defaults to `"strict"`.
4. **Response**: JSON object with `section`, optional `period`, the selected `view`, `data` (the parsed tables/values), and an `errors` array (scrape errors are reported here instead of crashing the Lambda).
5. **CORS**: enabled via HTTP API config. An `OPTIONS` helper exists in the handler for preflight requests.

---

## Endpoints (paths) you can call

> Replace `<API_BASE>` with your API Gateway base URL. Example:  
> `https://mxko5gs3s2.execute-api.us-east-1.amazonaws.com`

| Path                          | Section                                                     | Period    | Body shape                                  |
| ----------------------------- | ----------------------------------------------------------- | --------- | ------------------------------------------- | --- | ----------- |
| `/fetch-stock-info`           | legacy combined (if implemented)                            | n/a       | `{ "url": "<ticker-root>" }`                |
| `/summary`                    | summary                                                     | n/a       | `{ "url": "<ticker-root>", "view": "<normal | raw | strict>" }` |
| `/dividends`                  | dividends                                                   | n/a       | same as above                               |
| `/income-statement/annual`    | income-statement                                            | annual    | same as above                               |
| `/income-statement/quarterly` | income-statement                                            | quarterly | same as above                               |
| `/balance-sheet/annual`       | balance-sheet                                               | annual    | same as above                               |
| `/balance-sheet/quarterly`    | balance-sheet                                               | quarterly | same as above                               |
| `/cashflow/annual`            | cashflow                                                    | annual    | same as above                               |
| `/cashflow/quarterly`         | cashflow                                                    | quarterly | same as above                               |
| `/ratios/annual`              | ratios                                                      | annual    | same as above                               |
| `/ratios/quarterly`           | ratios                                                      | quarterly | same as above                               |
| `/kpis/annual`                | kpis                                                        | annual    | same as above                               |
| `/kpis/quarterly`             | kpis                                                        | quarterly | same as above                               |
| `/financials/annual`          | all (summary+income+balance+cashflow+ratios+kpis+dividends) | annual    | same as above                               |
| `/financials/quarterly`       | all (summary+income+balance+cashflow+ratios+kpis+dividends) | quarterly | same as above                               |

**Ticker root examples**

- `https://stock-analyze.xyz/stocks/amzn/`
- `https://stock-analyze.xyz/stocks/aapl/`

The router will construct the sub-URLs it needs (e.g., `financials/`, `financials/balance-sheet/`, `dividend/`, etc.) under that root.

---

## Quick start

### Deploy

```bash
yarn serverless deploy
# outputs: endpoint ANY - https://<id>.execute-api.us-east-1.amazonaws.com/{proxy+}
```

### Call an endpoint (cURL)

```bash
API_BASE="https://mxko5gs3s2.execute-api.us-east-1.amazonaws.com"
curl -X POST "$API_BASE/summary" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://stock-analyze.xyz/stocks/amzn/","view":"strict"}'
```

### Call an endpoint (VS Code REST Client)

```http
### Summary
POST https://mxko5gs3s2.execute-api.us-east-1.amazonaws.com/summary
Content-Type: application/json

{
  "url": "https://stock-analyze.xyz/stocks/amzn/",
  "view": "strict"
}
```

> Omit `"view"` to default to `"strict"`.

---

## Local development

- **Makefile** provides `invoke-*` targets that all hit the single `api` function via Serverless’ local invoke.
- **scripts/generate-events.ts** crafts an HTTP API v2 event with the correct `rawPath` so your in-Lambda router picks the right handler.

Examples:

```bash
# Print config
make print-config

# Invoke any route locally (uses the router)
make invoke-fetchSummary TICKER_URL=https://stock-analyze.xyz/stocks/amzn/ VIEW=strict
make invoke-financialsAnnual  TICKER_URL=https://stock-analyze.xyz/stocks/aapl/  VIEW=raw

# Batch (runs many routes)
make invoke-all TICKER_URL=https://stock-analyze.xyz/stocks/msft/
```

---

## Request/Response details

**Request body**

```json
{
  "url": "https://stock-analyze.xyz/stocks/amzn/",
  "view": "normal | raw | strict"
}
```

**Response (shape varies by route)**

```json
{
  "tickerUrl": "https://stock-analyze.xyz/stocks/amzn/",
  "section": "income-statement",
  "period": "annual",
  "view": "strict",
  "data": {
    /* parsed table(s) */
  },
  "errors": [] // any non-fatal scrape errors
}
```

**Views**

- `normal`: parsed & lightly cleaned data.
- `raw`: raw DOM extraction (closer to source).
- `strict` (default): strict parsing with additional validation; safer for consumers, may be more selective.

---

## Troubleshooting

- **404**: Path not recognized by the router. Double-check the path table above.
- **400: url is required**: Include the `"url"` field in the JSON body.
- **405: Method not allowed**: Only `POST` is supported for data routes; preflight `OPTIONS` is allowed automatically by API Gateway CORS.
- **Scrape errors**: Check the `errors` array in the success response; the Lambda tries not to crash on partial failures.

---

## Notes

- This project targets **Node.js 20** (see `serverless.yml`).
- CORS is enabled at the API layer; the handler also includes compatible headers.
- For the legacy combined endpoint `/fetch-stock-info`, only `{ "url": "..." }` is required (if `scrapeTickerInfoStrict` is present in the handler).

---

Happy scraping!
