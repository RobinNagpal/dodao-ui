# ETF Prompt Review Skills

Automated skills for reviewing and improving ETF analysis prompts. Each skill is an API-driven step that can be called by an automation agent or manually.

## Overview

The goal is to systematically review ETF analysis prompts by:
1. Picking diverse ETFs across asset classes
2. Fetching fresh Morningstar data for them
3. Running the analysis prompts against them
4. Reviewing the output for quality, accuracy, and completeness
5. Writing improvement docs

Reference: See `docs/ai-knowledge/insights-ui/etf-prompt-improvement/prompt-improvement-summary-all-etfs.md` for the output format and review criteria used in previous rounds.

## Authentication

All skill endpoints accept either:
- **Admin login** (JWT cookie with Admin role) — works from the admin UI
- **Automation token** — pass `?token=<AUTOMATION_SECRET>` query param or `x-automation-token` header

Set `AUTOMATION_SECRET` in your `.env` to enable token-based access.

## Skill 1: Pick Random ETFs

**Endpoint**: `GET /api/{spaceId}/etfs-v1/skills/pick-random-etfs`

Picks 4 diverse ETFs from each asset class (Equity, Fixed Income, Commodity, Alternatives).

### Diversity criteria
For each asset class, picks:
1. **Highest AUM** — well-known, heavily traded fund
2. **Lowest AUM** (non-zero preferred) — small/niche fund
3. **Newest fund** — by inception date, tests young-fund handling
4. **Random mid-range** — from remaining pool

### Query params
- `count` (optional, default 4, max 10) — number of ETFs to pick per asset class

### Example
```
GET https://koalagains.com/api/koala_gains/etfs-v1/skills/pick-random-etfs?token=YOUR_TOKEN
```

### Response shape
```json
{
  "assetClasses": {
    "Equity": [
      { "id": "...", "symbol": "VOO", "name": "Vanguard S&P 500 ETF", "exchange": "NYSEARCA", "inception": "2010-09-07", "aum": "$1.4T", "expenseRatio": 0.03, "pickReason": "high-aum" },
      { "id": "...", "symbol": "EAGL", "name": "...", "pickReason": "new-fund" }
    ],
    "Fixed Income": [...],
    "Commodity": [...],
    "Alternatives": [...]
  },
  "totalPicked": 16
}
```

## Skill 2: Fetch All Morningstar Data

**Endpoint**: `POST /api/{spaceId}/etfs-v1/skills/fetch-mor-all-kinds`

Triggers all 4 Morningstar scrape types (quote, risk, people, portfolio) for a single ETF in one call. The Lambda scrapes asynchronously and posts results back via callback.

### Request body
```json
{
  "symbol": "VOO",
  "exchange": "NYSEARCA"
}
```

### Example
```
POST https://koalagains.com/api/koala_gains/etfs-v1/skills/fetch-mor-all-kinds?token=YOUR_TOKEN
Content-Type: application/json

{"symbol": "VOO", "exchange": "NYSEARCA"}
```

### Response shape
```json
{
  "symbol": "VOO",
  "exchange": "NYSEARCA",
  "results": [
    { "kind": "quote", "success": true, "message": "Request accepted" },
    { "kind": "risk", "success": true, "message": "Request accepted" },
    { "kind": "people", "success": true, "message": "Request accepted" },
    { "kind": "portfolio", "success": true, "message": "Request accepted" }
  ]
}
```

Note: Data arrives asynchronously via callbacks. Wait ~30-60 seconds before querying the ETF data.

## Skill 1+2 Combined Workflow

To fetch fresh Morningstar data for a diverse set of ETFs:

1. Call **Skill 1** to get picked ETFs
2. For each picked ETF, call **Skill 2** to trigger all 4 mor data fetches
3. Wait for callbacks to complete (~30-60s per ETF)
4. Verify data is populated via the existing `GET /api/{spaceId}/etfs-v1/exchange/{exchange}/{etf}/mor-info` endpoint

## Review Criteria (for future skills)

When reviewing ETF analysis prompt output, evaluate:

1. **Prompt improvements** — what could be added/changed in the prompt to get better output?
2. **Strengths** — what did the analysis get right?
3. **Weaknesses** — what was wrong, misleading, or missing?
4. **Factor relevance** — are the analysis factors appropriate for this specific ETF type/asset class?
5. **Cross-cutting issues** — patterns that affect multiple ETFs (see the summary doc for examples)

### Key things to check
- Yield/income data present for bond and income ETFs
- Price return vs total return properly distinguished
- Asset-class-appropriate factor thresholds (not one-size-fits-all)
- Percentile rank data utilized in analysis
- Passive vs active fund distinction
- Young fund handling (insufficient data vs Fail)
- Benchmark identity resolved (not null)
- Output tone appropriate (not overly dramatic for index trackers)
