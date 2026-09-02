# Insights-UI API Routes & Auth (Stocks, ETFs, Prompts, Prompt Invocations)

Reference for every Next.js API route under `insights-ui/src/app/api/**` that backs the
**stocks**, **stock/ETF scenarios**, **ETFs**, **prompts**, and **prompt-invocation** surfaces of the
KoalaGains UI, together with the auth wrapper each `GET` / `POST` / `PUT` / `DELETE` handler uses.

It exists so that, when adding or reviewing a mutating endpoint, you can confirm at a glance that it
follows the project rule below instead of re-deriving it from the code each time.

## The auth wrappers

All route handlers are wrapped by one of these middlewares (see `src/app/api/helpers/`):

| Wrapper | Meaning | Where used |
| --- | --- | --- |
| `withAdminOrToken` | Allows access via **either** an admin JWT login **or** the automation secret (`?token=<AUTOMATION_SECRET>` query param or `x-automation-token` header). | Every admin/automation **mutation** (POST/PUT/DELETE) for stocks, ETFs, prompts, prompt invocations. |
| `withLoggedInAdmin` | Admin JWT only (no token path). | A few **admin-only reads** (GET) that have no automation use case. |
| `withLoggedInUser` | Any logged-in end user. | User-owned data — **favourites** (and notes/lists). Intentionally **not** admin-gated. |
| `withErrorHandlingV2` | No auth. | Public reads (listings, full-render, etc.) **and** machine-to-machine **callbacks / cron triggers** that cannot present an admin token. |

### The rule

> **Every `POST` / `PUT` / `DELETE` for stocks, ETFs, prompts, and prompt invocations must use
> `withAdminOrToken`** — so the admin UI and automation scripts/skills can both call it — **except:**
>
> 1. **Callback routes** — endpoints whose URL is handed to a Lambda / the Python backend so it can
>    POST results or status back. These run unauthenticated (`withErrorHandlingV2`) and must stay that way.
> 2. **Cron / batch routes** — endpoints triggered by a scheduler rather than a human admin.
> 3. **Favourites** (and other user-owned data) — stay on `withLoggedInUser`, exactly as on `main`.

`GET` handlers are out of scope of the rule (mostly public reads); they are listed below for completeness.

Legend: 🔑 `withAdminOrToken` · 🔒 `withLoggedInAdmin` · 👤 `withLoggedInUser` · 🌐 `withErrorHandlingV2` (no auth)

---

## Stocks — `tickers-v1` (current system)

Base prefix: `/api/[spaceId]/tickers-v1`

| Route (relative to prefix) | Method | Auth | Notes |
| --- | --- | --- | --- |
| `/` | GET | 🌐 | List tickers with industry names |
| `/` | POST | 🔑 | Bulk-create tickers |
| `/` | PUT | 🔑 | Bulk-update tickers |
| `/[ticker]` | GET | 🌐 | Fast ticker record |
| `/[ticker]/all-details` | GET | 🌐 | |
| `/[ticker]/business-and-moat-data` | GET | 🌐 | |
| `/[ticker]/competition-tickers` | GET | 🌐 | |
| `/[ticker]/creation-infos` | GET | 🌐 | |
| `/[ticker]/creation-infos` | POST | 🔑 | Create ticker from competition |
| `/[ticker]/fair-value-data` | GET | 🌐 | |
| `/[ticker]/financial-statement-analysis-data` | GET | 🌐 | |
| `/[ticker]/future-performance-data` | GET | 🌐 | |
| `/[ticker]/generation-requests` | GET | 🌐 | |
| `/[ticker]/generation-requests` | POST | 🔑 | Create a generation request for the ticker |
| `/[ticker]/get-exchange-name` | GET | 🌐 | |
| `/[ticker]/past-performance-data` | GET | 🌐 | |
| `/[ticker]/update-request-status` | POST | 🌐 | **Callback** — automation pipeline updates generation-request status |
| `/bulk-csv` | POST | 🔑 | Admin CSV upload |
| `/country/[country]/tickers/industries` | GET | 🌐 | |
| `/country/[country]/tickers/industries/[industryKey]` | GET | 🌐 | |
| `/country/[country]/tickers/industries/[industryKey]/[profileId]` | GET | 🌐 | |
| `/country/[country]/tickers/only-industries` | GET | 🌐 | |
| `/daily-movers-available-dates` | GET | 🌐 | |
| `/daily-movers/[moverId]/save-daily-mover` | POST | 🌐 | **Callback** — Lambda posts the daily-mover LLM result |
| `/daily-top-gainers` · `/daily-top-gainers/[topGainersId]` | GET | 🌐 | |
| `/daily-top-losers` · `/daily-top-losers/[topLosersId]` | GET | 🌐 | |
| `/exchange/[exchange]/[ticker]` | GET | 🌐 | |
| `/exchange/[exchange]/[ticker]` | PUT | 🔑 | Edit ticker |
| `/exchange/[exchange]/[ticker]/business-and-moat` | POST | 🔑 | Run + save Business & Moat analysis |
| `/exchange/[exchange]/[ticker]/competition` | POST | 🔑 | Run + save Competition analysis |
| `/exchange/[exchange]/[ticker]/fair-value` | POST | 🔑 | Run + save Fair Value analysis |
| `/exchange/[exchange]/[ticker]/final-summary` | POST | 🔑 | Run + save Final Summary |
| `/exchange/[exchange]/[ticker]/financial-analysis` | POST | 🔑 | Run + save Financial Statement analysis |
| `/exchange/[exchange]/[ticker]/future-growth` | POST | 🔑 | Run + save Future Growth analysis |
| `/exchange/[exchange]/[ticker]/investor-analysis` | POST | 🔑 | Run + save Investor analysis |
| `/exchange/[exchange]/[ticker]/management-team` | POST | 🔑 | Run + save Management Team analysis |
| `/exchange/[exchange]/[ticker]/past-performance` | POST | 🔑 | Run + save Past Performance analysis |
| `/exchange/[exchange]/[ticker]/generate-prompt` | POST | 🔑 | Build prompt for a report type |
| `/exchange/[exchange]/[ticker]/save-json-report` | POST | 🔑 | Admin/skill saves a generated report JSON |
| `/exchange/[exchange]/[ticker]/save-report-callback` | POST | 🌐 | **Callback** — Lambda posts a report result |
| `/exchange/[exchange]/[ticker]/*-data`, `financial-info`, `full-render`, `price-history`, `quarterly-chart-data`, `similar-tickers` | GET | 🌐 | Read endpoints |
| `/fetch-financial-data` | POST | 🔑 | Admin: fetch financial data |
| `/generate-cached-scores-for-all` | POST | 🌐 | **Batch/cron** — recompute cached scores for all tickers |
| `/generate-daily-top-gainers` · `/generate-daily-top-losers` | GET | 🌐 | **Cron** triggers (screener callback) |
| `/generate-ticker-v1-request` | GET | 🌐 | |
| `/generation-requests` | GET | 🔒 | Admin dashboard list |
| `/generation-requests` | POST | 🔑 | Queue generation requests |
| `/generation-requests/by-ids` | GET | 🔑 | |
| `/industry/[industryKey]/[subIndustryKey]` | GET | 🌐 | |
| `/admin-search` | GET | 🔒 | Paginated admin ticker search + report status (create-reports / missing-reports) |
| `/missing-factor-analysis` | GET | 🔒 | Admin-only read |
| `/move` | POST | 🔑 | Move tickers between industries |
| `/oldest-by-report-type` | GET | 🔑 | |
| `/screener-callback` | POST | 🌐 | **Callback** — screener posts top gainers/losers |
| `/search` | GET | 🌐 | |

`/api/[spaceId]/tickers-v1-filtered` → GET 🌐.

## Stocks — legacy public-equities

Base prefixes: `/api/tickers` and `/api/actions/tickers`

| Route | Method | Auth | Notes |
| --- | --- | --- | --- |
| `/api/tickers` | GET | 🌐 | Paginated tickers |
| `/api/tickers` | POST | 🔑 | Create ticker |
| `/api/tickers/[tickerKey]` | GET | 🌐 | |
| `/api/tickers/[tickerKey]` | PUT | 🔑 | Edit ticker |
| `/api/tickers/[tickerKey]` | DELETE | 🔑 | Delete ticker |
| `/api/tickers/[tickerKey]/criteria-definition` | GET | 🌐 | |
| `/api/tickers/[tickerKey]/criteria-matches` | POST | 🌐 | **Callback** — backend saves 10-Q criteria matches |
| `/api/tickers/[tickerKey]/financial-statements` | POST | 🔑 | Save latest-10Q financial statements |
| `/api/tickers/[tickerKey]/latest-10q-info` | POST | 🔑 | Populate latest-10Q info |
| `/api/tickers/[tickerKey]/sec-filings` · `/sec-filings/[secFilingId]` | GET | 🌐 | |
| `/api/tickers/[tickerKey]/ticker-business-model` | POST / PUT | 🔑 | Save / upsert business model |
| `/api/tickers/[tickerKey]/ticker-dividends` | POST | 🔑 | Save dividends |
| `/api/tickers/[tickerKey]/ticker-financials` | POST / PUT | 🔑 | Save / upsert financials |
| `/api/tickers/[tickerKey]/ticker-info` | POST / PUT | 🔑 | Save / upsert info |
| `/api/tickers/[tickerKey]/ticker-mgt-team-assessment` | POST / PUT | 🔑 | Save / upsert mgmt-team assessment |
| `/api/tickers/[tickerKey]/ticker-news` | POST / PUT | 🔑 | Save / upsert news |
| `/api/tickers/compare/metrics-and-checklist` | GET | 🌐 | |
| `/api/actions/tickers/[tickerKey]/linkedIn-profile` | POST / PUT / DELETE | 🔑 | Manage management-team members |
| `/api/actions/tickers/[tickerKey]/criterion/[criterionKey]/criteria-matching-for-management-discussion` | POST | 🔑 | Run matching for MD&A |
| `/api/actions/tickers/[tickerKey]/criterion/[criterionKey]/trigger-single-criterion-reports` | POST | 🔑 | Regenerate a single criterion report |
| `/api/actions/tickers/[tickerKey]/sec-filings/criteria-matching-for-an-attachment` | POST | 🔑 | Run matching for one attachment |
| `/api/actions/tickers/[tickerKey]/sec-filings/re-populate` | POST | 🔑 | Re-populate SEC filings |
| `/api/actions/tickers/[tickerKey]/trigger-criteria-matching` | POST | 🔑 | Trigger criteria matching |
| `/api/actions/tickers/[tickerKey]/trigger-financial-statements` | POST | 🔑 | Trigger financial statements |
| `/api/actions/tickers/[tickerKey]/save-matching-attachments-count` | POST | 🌐 | **Callback** — backend reports matching-attachment count |
| `/api/actions/tickers/[tickerKey]/save-matching-attachments-processed` | POST | 🌐 | **Callback** — backend reports processed count |

## Stock Scenarios

| Route | Method | Auth | Notes |
| --- | --- | --- | --- |
| `/api/stock-scenarios` | GET | 🌐 | List |
| `/api/stock-scenarios` | POST | 🔑 | Create |
| `/api/stock-scenarios/[id]` | GET | 🌐 | |
| `/api/stock-scenarios/[id]` | PUT | 🔑 | Update |
| `/api/stock-scenarios/[id]` | DELETE | 🔑 | Delete |
| `/api/stock-scenarios/[id]/links` | POST | 🔑 | Link a stock |
| `/api/stock-scenarios/[id]/links` | DELETE | 🔑 | Unlink a stock |
| `/api/stock-scenarios/import` | POST | 🔑 | Bulk import |
| `/api/[spaceId]/stock-scenarios/[slug]` · `/listing` | GET | 🌐 | Public reads |

---

## ETFs — `etfs-v1`

Base prefix: `/api/[spaceId]/etfs-v1`

| Route (relative to prefix) | Method | Auth | Notes |
| --- | --- | --- | --- |
| `/country-exchange-stats` | GET | 🌐 | |
| `/etf-admin-reports` | GET | 🔑 | |
| `/exchange/[exchange]/[etf]` | GET | 🌐 | |
| `/exchange/[exchange]/[etf]/analysis` · `analyzer-info` · `competition` · `full-render` · `mor-info` · `portfolio-holdings` | GET | 🌐 | Read endpoints |
| `/exchange/[exchange]/[etf]/ensure-mor-info` | POST | 🔑 | Ensure MOR info exists |
| `/exchange/[exchange]/[etf]/fetch-financial-info` | POST | 🔑 | Fetch financial info |
| `/exchange/[exchange]/[etf]/fetch-mor-info` | POST | 🔑 | Trigger MOR scrape |
| `/exchange/[exchange]/[etf]/generate-prompt` | POST | 🔑 | Build prompt |
| `/exchange/[exchange]/[etf]/mor-info-callback` | POST | 🌐 | **Callback** — MOR scrape posts back |
| `/exchange/[exchange]/[etf]/save-report-callback` | POST | 🌐 | **Callback** — Lambda posts a report result |
| `/generate-etf-v1-request` | GET | 🌐 | |
| `/generation-requests` | GET | 🔑 | |
| `/generation-requests` | POST | 🔑 | Queue generation requests |
| `/generation-requests/[requestId]/reload` | POST | 🔑 | Re-queue a request |
| `/generation-requests/by-ids` | GET | 🔑 | |
| `/listing` · `/listings/*` · `/mor-stats` · `/search` | GET | 🌐 | Read endpoints |

## ETF Scenarios

| Route | Method | Auth | Notes |
| --- | --- | --- | --- |
| `/api/etf-scenarios` | GET | 🌐 | List |
| `/api/etf-scenarios` | POST | 🔑 | Create |
| `/api/etf-scenarios/[id]` | GET | 🌐 | |
| `/api/etf-scenarios/[id]` | PUT | 🔑 | Update |
| `/api/etf-scenarios/[id]` | DELETE | 🔑 | Delete |
| `/api/etf-scenarios/[id]/links` | POST | 🔑 | Link an ETF |
| `/api/etf-scenarios/[id]/links` | DELETE | 🔑 | Unlink an ETF |
| `/api/etf-scenarios/import` | POST | 🔑 | Bulk import |
| `/api/[spaceId]/etf-scenarios/[slug]` · `/listing` | GET | 🌐 | Public reads |

---

## Prompts

Base prefix: `/api/[spaceId]/prompts`

| Route (relative to prefix) | Method | Auth | Notes |
| --- | --- | --- | --- |
| `/` | GET | 🌐 | List prompts |
| `/` | POST | 🔑 | Create prompt |
| `/[promptId]` | GET | 🌐 | |
| `/[promptId]` | PUT | 🔑 | Update prompt |
| `/[promptId]` | DELETE | 🔑 | Delete prompt |
| `/[promptId]/versions` | GET | 🌐 | |
| `/[promptId]/versions` | POST | 🔑 | Create version |
| `/[promptId]/versions/[version]` | GET | 🌐 | |
| `/[promptId]/versions/[version]` | PUT | 🔑 | Update version |
| `/[promptId]/versions/[version]` | DELETE | 🔑 | Delete version |
| `/by-keys` | GET | 🌐 | |

## Prompt Invocations

| Route | Method | Auth | Notes |
| --- | --- | --- | --- |
| `/api/[spaceId]/prompts/[promptId]/invocations` | GET | 🌐 | List invocations |
| `/api/[spaceId]/prompts/[promptId]/invocations/[invocationId]` | GET | 🌐 | One invocation |
| `/api/[spaceId]/prompts/[promptId]/test-invocations` | GET | 🌐 | List test invocations |
| `/api/actions/prompt-invocation/full-req-resp` | POST | 🔑 | Run a full prompt invocation |
| `/api/actions/prompt-invocation/test-req-resp` | POST | 🔑 | Run a test prompt invocation |

---

## Excluded by design — Favourites (user-owned)

Favourites are owned by the end user, not by an admin, so they stay on `withLoggedInUser` exactly as on
`main` — they are **not** converted to `withAdminOrToken`.

| Route | Methods | Auth |
| --- | --- | --- |
| `/api/[spaceId]/users/favourite-tickers` | GET / POST / PUT | 👤 |
| `/api/[spaceId]/users/favourite-tickers/[favouriteId]` | PUT / DELETE | 👤 |
| `/api/[spaceId]/users/favourite-etfs` | GET / POST | 👤 |
| `/api/[spaceId]/users/favourite-etfs/[favouriteId]` | PUT / DELETE | 👤 |

The same applies to the other user-owned routes under `/api/[spaceId]/users/**` (ticker/ETF notes,
user lists, ticker tags, portfolio-manager profiles).

---

## Summary of the non-`withAdminOrToken` mutations (and why)

| Endpoint | Wrapper | Reason kept as-is |
| --- | --- | --- |
| `tickers-v1/[ticker]/update-request-status` | 🌐 | Automation status callback |
| `tickers-v1/daily-movers/[moverId]/save-daily-mover` | 🌐 | Lambda result callback |
| `tickers-v1/exchange/.../save-report-callback` | 🌐 | Lambda result callback |
| `tickers-v1/screener-callback` | 🌐 | Screener callback |
| `tickers-v1/generate-cached-scores-for-all` | 🌐 | Batch/cron job |
| `tickers/[tickerKey]/criteria-matches` | 🌐 | Backend result callback |
| `actions/tickers/[tickerKey]/save-matching-attachments-count` | 🌐 | Backend progress callback |
| `actions/tickers/[tickerKey]/save-matching-attachments-processed` | 🌐 | Backend progress callback |
| `etfs-v1/exchange/.../mor-info-callback` | 🌐 | MOR scrape callback |
| `etfs-v1/exchange/.../save-report-callback` | 🌐 | Lambda result callback |
| `users/favourite-tickers*`, `users/favourite-etfs*` | 👤 | User-owned data (kept as `main`) |

Everything else that mutates stocks, ETFs, prompts, or prompt invocations is on `withAdminOrToken`.
