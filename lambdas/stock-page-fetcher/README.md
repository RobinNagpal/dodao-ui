# stock-page-fetcher

Lambda behind a **Lambda Function URL** (`https://<id>.lambda-url.us-east-1.on.aws/`, no API
Gateway, no extra cost) that the insights-ui fundamentals scraper uses as a fetch proxy.

`POST /html` with `{ "url": "https://<allowed host>/..." }` returns
`{ status, html, headers: { retry-after, server, cf-ray, cf-mitigated } }`: one source page's raw
HTML and upstream status. insights-ui parses it with its own parsers
(`insights-ui/src/utils/stock-analyzer/`). Requests leave from Lambda's IPs instead of the app
server's, which the source site's CDN rate-limits. Only hosts in `ALLOWED_FETCH_HOSTS`
(comma-separated) can be fetched; empty refuses everything.

## Use from insights-ui

Admin → App Settings → **Fundamentals Scraping**:
- `STOCK_ANALYZER_LAMBDA_URL` = this function's URL (printed by the deploy job / `npm run info`)
- `SCRAPER_FETCH_VIA_LAMBDA` = ON

See `docs/insights-ui/stock-analysis/stock-fundamentals-scraper.md`.

## Deploy

CI: `.github/workflows/deploy-stock-page-fetcher.yml` runs `sls deploy` (osls, the open-source
Serverless v3 fork, no Serverless account) on every push to `main` that touches this folder, or via
"Run workflow". It uses the repo's existing `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` deploy
secrets and the `ALLOWED_FETCH_HOSTS` repo variable.

Manually (needs CloudFormation/Lambda/IAM/S3 permissions):

```bash
cd lambdas/stock-page-fetcher
npm install
ALLOWED_FETCH_HOSTS=<host> npx sls deploy --verbose
```
