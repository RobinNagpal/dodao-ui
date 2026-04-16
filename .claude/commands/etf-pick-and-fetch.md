# ETF Prompt Review - Skill 1: Pick Random ETFs and Fetch Morningstar Data

## Goal
Pick 4 diverse ETFs from each asset class and fetch fresh Morningstar data for all of them.
This is the first step in the ETF prompt review workflow.

## Procedure

### Step 1: Pick 4 diverse ETFs from each asset class

Query the database for ETFs grouped by asset class. The 4 asset classes are:
- Equity
- Fixed Income
- Commodity
- Alternatives

For each asset class, pick 4 ETFs with diversity:
1. **High AUM** - the most famous/well-known fund (largest AUM)
2. **Low AUM** - a small/niche fund (smallest non-zero AUM)
3. **New fund** - the most recently launched fund (by inception date)
4. **Random** - a random pick from the remaining ETFs for variety

Use the API:
```
GET https://koalagains.com/api/koala_gains/etfs-v1/skills/pick-random-etfs?token=<AUTOMATION_SECRET>
```

Record the picked ETFs and explain why each was chosen.

### Step 2: Fetch all 4 types of Morningstar data for each picked ETF

For each picked ETF, trigger all 4 Morningstar scrape types (quote, risk, people, portfolio):

```
POST https://koalagains.com/api/koala_gains/etfs-v1/skills/fetch-mor-all-kinds?token=<AUTOMATION_SECRET>
Body: {"symbol": "<SYMBOL>", "exchange": "<EXCHANGE>"}
```

### Step 3: Verify data arrived

Wait ~60 seconds for callbacks, then verify data is populated:
```
GET https://koalagains.com/api/koala_gains/etfs-v1/exchange/<EXCHANGE>/<SYMBOL>/mor-info
```

Report which ETFs have complete data and which are missing any type.

### Step 4: Output summary

Write a summary listing:
- All picked ETFs grouped by asset class
- Why each was picked (high-aum, low-aum, new-fund, random)
- Data completeness status (which mor data types are available)
- Any ETFs that failed to fetch data

This summary will be used as input for the review skill (`/project:etf-review-prompts`).
