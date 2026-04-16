# ETF Prompt Review - Skill 1: Pick Random ETFs and Fetch Morningstar Data

Pick 4 diverse ETFs from the specified asset class and fetch all Morningstar data for them.

## Arguments
The user provides: `<assetClass>` (e.g. "Equity", "Fixed Income", "Alternatives", "Commodity", "Asset Allocation", "Currency")

User input: $ARGUMENTS

## Procedure

### Step 1: Pick 4 diverse ETFs from the asset class

Call the pick-random-etfs API for the specified asset class:

```
GET https://koalagains.com/api/koala_gains/etfs-v1/skills/pick-random-etfs?assetClass=<ASSET_CLASS>&token=<AUTOMATION_SECRET>
```

The API picks 4 ETFs with diversity:
1. **High AUM** - the most famous/well-known fund
2. **Low AUM** - a small/niche fund
3. **New fund** - the most recently launched fund
4. **Random** - a random pick from the remaining ETFs

Print the picked ETFs with their symbol, name, exchange, AUM, inception, and pick reason.

### Step 2: Fetch all 4 types of Morningstar data for each picked ETF

For each of the 4 picked ETFs, call the fetch-mor-info API 4 times (once per kind):

```
POST https://koalagains.com/api/koala_gains/etfs-v1/exchange/<EXCHANGE>/<SYMBOL>/fetch-mor-info?token=<AUTOMATION_SECRET>
Content-Type: application/json
Body: {"kind": "quote"}
```

Call it for each kind: `quote`, `risk`, `people`, `portfolio`.

That means 4 ETFs x 4 kinds = 16 API calls total.

**Important**: Do NOT call the `fetch-financial-info` API - financial data is already present for all ETFs.

### Step 3: Report results

Print a summary table showing:
- Each picked ETF (symbol, name, asset class, AUM)
- Whether all 4 mor data fetch requests succeeded
- Any errors encountered

The data will arrive via callbacks. No need to wait or verify - the callbacks will populate the data.

### Output

The output should be a clear list of the 4 ETFs picked, ready to be used by subsequent skills (generation request creation, prompt review, etc.).
