# Pull News from Google

A serverless function to fetch news articles from Google News using the google-news-scraper package.

## Features

- Fetch news articles based on a search term
- Configure search parameters like language, region, and time frame
- Limit the number of results
- CORS support for cross-origin requests

## API Endpoints

### POST /fetch-news

Fetches news articles from Google News based on the provided search term.

#### Request Body

```json
{
  "searchTerm": "cryptocurrency",
  "prettyURLs": true,
  "queryVars": {
    "hl": "en",
    "gl": "US",
    "ceid": "US:en"
  },
  "timeframe": 0,
  "puppeteerArgs": [],
  "limit": 10
}
```

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| searchTerm | string | The term to search for | Yes |
| prettyURLs | boolean | Whether to return pretty URLs | No (default: true) |
| queryVars | object | Query variables for language and region | No |
| queryVars.hl | string | Language code | No |
| queryVars.gl | string | Country code | No |
| queryVars.ceid | string | Country and language | No |
| timeframe | number | Time frame for news (0 = any time) | No (default: 0) |
| puppeteerArgs | string[] | Arguments to pass to Puppeteer | No |
| limit | number | Maximum number of results to return | No (default: 10) |

#### Response

```json
{
  "articles": [
    {
      "title": "Article Title",
      "link": "https://example.com/article",
      "source": "Example News",
      "time": "2 hours ago",
      "snippet": "Article snippet text"
    },
    {
      "title": "Another Article",
      "link": "https://example.com/another-article",
      "source": "Another News Source",
      "time": "5 hours ago",
      "snippet": "Another article snippet text"
    }
  ]
}
```

## Development

### Prerequisites

- Node.js 20.x or later
- Serverless Framework

### Installation

1. Install dependencies:

```bash
npm install
```

2. Compile TypeScript:

```bash
npm run compile
```

### Deployment

Deploy the function to AWS:

```bash
npm run deploy
```

## Environment Variables

No environment variables are required for this function.

## Dependencies

- google-news-scraper: For scraping news from Google News
- aws-lambda: For AWS Lambda types
- typescript: For TypeScript support
