# Stock Screener Scraper Lambda

A Lambda function that scrapes with customizable filters.

## Features

- Applies Market Cap filter (default: Over 1B)
- Applies Price Change 1D filter (default: Over 1%)
- Returns top N stocks (default: 15)
- Extracts: Symbol, Company Name, Market Cap, % Change

## Local Testing

### Quick Test (Recommended)

```bash
cd lambdas/stock-screener-scraper
npm install
make test-local
```

### Using Serverless Invoke

```bash
make invoke-screener
```

### With Custom Filters

```bash
make invoke-screener MARKET_CAP='Over 10B' PRICE_CHANGE='Over 2%' LIMIT=20
```

## API

### POST /screener

**Request Body:**
```json
{
  "marketCapMin": "Over 1B",
  "priceChange1DMin": "Over 1%",
  "limit": 15
}
```

**Response:**
```json
{
  "filters": {
    "marketCapMin": "Over 1B",
    "priceChange1DMin": "Over 1%",
    "limit": 15
  },
  "totalMatched": 922,
  "count": 15,
  "stocks": [
    {
      "symbol": "NVDA",
      "companyName": "NVIDIA Corporation",
      "marketCap": "4.38T",
      "percentChange": "1.37%"
    }
    // ... more stocks
  ],
  "errors": []
}
```

## Filter Values

### Market Cap Options
- `Over 100B`
- `Over 50B`
- `Over 10B`
- `Over 1B` (default)
- `Over 300M`
- `Over 100M`
- `Mega-Cap: 200B+`
- `Large-Cap: 10-200B`
- `Mid-Cap: 2-10B`
- `Small-Cap: 300M-2B`
- `Micro-Cap: Under 300M`

### Price Change 1D Options
- `Over 100%`
- `Over 50%`
- `Over 20%`
- `Over 10%`
- `Over 5%`
- `Over 1%` (default)
- `From 0-1%`
- `From -1-0%`
- `Under -1%`
- `Under -5%`
- `Under -10%`
- `Under -20%`
- `Under -50%`

## Dependencies

- Puppeteer (for browser automation)
- TypeScript
- Serverless Framework

## Notes

- Uses headless Chrome for scraping
- Takes ~20-25 seconds to complete due to page load and filter interactions
- Respects the site's structure - filters are applied via UI interaction

