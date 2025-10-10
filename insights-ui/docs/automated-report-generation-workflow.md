# Automated Report Generation Workflow

## Overview
This document outlines the design for automating the generation of investment analysis reports for stocks. Currently, we manually generate reports for ~2000 tickers through a UI. This workflow will automate the process using a tracking system and AWS Lambda functions.

## Current Manual Process

### Report Structure
Each ticker has the following analysis sections:
1. **Competition Analysis** (prerequisite for most other analyses)
2. **Financial Analysis** (FinancialStatementAnalysis)
3. **Business & Moat** (BusinessAndMoat) - requires Competition
4. **Past Performance** (PastPerformance) - requires Competition
5. **Future Growth** (FutureGrowth) - requires Competition
6. **Fair Value** (FairValue) - requires Competition
7. **Future Risk**
8. **Investor Analysis** (3 types: WARREN_BUFFETT, CHARLIE_MUNGER, BILL_ACKMAN)
9. **Final Summary** - requires all category analyses
10. **Cached Score** - requires all factor analyses

### Current Generation Flow
1. Admin navigates to `/admin-v1/create-reports`
2. Selects Industry → Sub-Industry → filters by country/status
3. Selects one or multiple tickers
4. Uses `ReportGenerator` component to:
   - Generate all sections for all selected tickers (parallel)
   - Generate specific section for all selected tickers (parallel)
   - Generate all sections for a specific ticker (sequential)

### Current API Routes
- `POST /api/[spaceId]/tickers-v1/[ticker]/competition`
- `POST /api/[spaceId]/tickers-v1/[ticker]/financial-analysis`
- `POST /api/[spaceId]/tickers-v1/[ticker]/business-and-moat`
- `POST /api/[spaceId]/tickers-v1/[ticker]/past-performance`
- `POST /api/[spaceId]/tickers-v1/[ticker]/future-growth`
- `POST /api/[spaceId]/tickers-v1/[ticker]/fair-value`
- `POST /api/[spaceId]/tickers-v1/[ticker]/future-risk`
- `POST /api/[spaceId]/tickers-v1/[ticker]/investor-analysis` (with `investorKey` in body)
- `POST /api/[spaceId]/tickers-v1/[ticker]/final-summary`
- `POST /api/[spaceId]/tickers-v1/[ticker]/cached-score`

## Problem Statement

### Current Pain Points
1. **Manual Selection**: Admin must manually select tickers and sections
2. **Prompt Updates**: When a prompt changes (e.g., fair-value), regenerating for 2000 tickers is tedious
3. **No Tracking**: Hard to know which tickers need which sections regenerated
4. **No Automation**: No way to run generation jobs in background

## Proposed Solution

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    Admin UI (Next.js)                       │
│  - Page 1: Create Reports (existing - no changes)           │
│  - Page 2: Manage Generation Flags (new)                    │
│    * View ticker generation status                          │
│    * Mark sections for automated generation                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ REST API
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              Next.js API Routes                             │
│  - Existing: Ticker generation endpoints                    │
│    (updated to clear flags after generation)                │
│  - New: Batch status endpoint                               │
│  - New: Mark for regeneration endpoint                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Polling/API calls
                  │
┌─────────────────▼───────────────────────────────────────────┐
│          AWS Lambda (Python)                                │
│  - Scheduled execution (EventBridge)                        │
│  - Fetches pending tickers with batch status API            │
│  - Calls generation endpoints (which auto-clear flags)      │
│  - Respects dependencies                                    │
└─────────────────────────────────────────────────────────────┘
```

## New Database Schema

### TickerV1GenerationStatus Table
Tracks which sections need generation/regeneration for each ticker.

```prisma
model TickerV1GenerationStatus {
  id        String   @id @default(uuid())
  tickerId  String   @unique @map("ticker_id")
  spaceId   String   @default("koala_gains") @map("space_id")
  
  // Core analysis sections (true = needs generation)
  needsCompetition              Boolean @default(false) @map("needs_competition")
  needsFinancialAnalysis        Boolean @default(false) @map("needs_financial_analysis")
  needsBusinessAndMoat          Boolean @default(false) @map("needs_business_and_moat")
  needsPastPerformance          Boolean @default(false) @map("needs_past_performance")
  needsFutureGrowth             Boolean @default(false) @map("needs_future_growth")
  needsFairValue                Boolean @default(false) @map("needs_fair_value")
  needsFutureRisk               Boolean @default(false) @map("needs_future_risk")
  
  // Investor analyses
  needsWarrenBuffett            Boolean @default(false) @map("needs_warren_buffett")
  needsCharlieMunger            Boolean @default(false) @map("needs_charlie_munger")
  needsBillAckman               Boolean @default(false) @map("needs_bill_ackman")
  
  // Final steps
  needsFinalSummary             Boolean @default(false) @map("needs_final_summary")
  needsCachedScore              Boolean @default(false) @map("needs_cached_score")
  
  // Timestamps for tracking
  lastProcessedAt               DateTime? @map("last_processed_at")
  createdAt                     DateTime  @default(now()) @map("created_at")
  updatedAt                     DateTime  @updatedAt @map("updated_at")
  
  // Relation
  ticker    TickerV1 @relation(fields: [tickerId], references: [id], onDelete: Cascade)
  
  @@unique([spaceId, tickerId])
  @@index([spaceId, tickerId])
  @@map("ticker_v1_generation_status")
}
```

## New Next.js API Endpoints

### 1. Batch Status Endpoint
**GET** `/api/[spaceId]/tickers-v1/batch-status`

Returns tickers that need generation, along with what sections they need.

Query parameters:
- `limit`: Number of tickers to return (default: 10)

Response:
```typescript
{
  tickers: [
    {
      tickerId: string;
      symbol: string;
      exchange: string;
      name: string;
      industryKey: string;
      subIndustryKey: string;
      pendingSections: string[]; // e.g., ['competition', 'fair-value']
      lastProcessedAt: string | null;
    }
  ],
  total: number;
  hasMore: boolean;
}
```

### 2. Mark Sections for Generation
**POST** `/api/[spaceId]/tickers-v1/mark-for-generation`

Marks specific sections for specific tickers for automated generation.

Body:
```typescript
{
  sections: string[]; // e.g., ['fair-value', 'final-summary', 'cached-score']
  
  // Option 1: Specific ticker symbols
  symbols?: string[]; // e.g., ['AAPL', 'GOOGL']
  
  // Option 2: Filter by industry/sub-industry
  filters?: {
    industryKey?: string;
    subIndustryKey?: string;
    exchange?: string;
  };
  
  // If both symbols and filters are provided, symbols take precedence
  // If neither is provided, applies to ALL tickers (use with caution!)
}
```

Response:
```typescript
{
  success: boolean;
  tickersMarked: number;
  message: string;
  tickers: string[]; // symbols of tickers that were marked
}
```

## Python Lambda Function

### Lambda Configuration
- **Runtime**: Python 3.11+
- **Memory**: 512 MB
- **Timeout**: 15 minutes (max)
- **Trigger**: EventBridge (CloudWatch Events) - runs every 30 minutes or hourly
- **Environment Variables**:
  - `NEXTJS_BASE_URL`: Base URL of Next.js app
  - `NEXTJS_API_KEY`: Authentication key (if needed)
  - `SPACE_ID`: Default space ID (e.g., "koala_gains")
  - `BATCH_SIZE`: Number of tickers to process per run (default: 10)
  - `RATE_LIMIT_DELAY`: Delay between requests in seconds (default: 2)

### Lambda Workflow

```python
# Pseudocode for Lambda handler

def lambda_handler(event, context):
    """
    Main Lambda handler for automated report generation
    """
    
    # 1. Initialize
    batch_size = int(os.environ.get('BATCH_SIZE', 10))
    space_id = os.environ.get('SPACE_ID', 'koala_gains')
    
    # 2. Fetch pending tickers
    pending_tickers = fetch_pending_tickers(space_id, batch_size)
    
    if not pending_tickers:
        return {
            'statusCode': 200,
            'body': 'No pending tickers to process'
        }
    
    # 3. Process each ticker
    results = []
    for ticker_info in pending_tickers:
        result = process_ticker(ticker_info)
        results.append(result)
    
    # 4. Return summary
    return {
        'statusCode': 200,
        'body': {
            'processed': len(results),
            'successful': sum(1 for r in results if r['success']),
            'failed': sum(1 for r in results if not r['success']),
            'details': results
        }
    }


def fetch_pending_tickers(space_id, limit):
    """
    Fetch tickers that need processing from Next.js API
    """
    url = f"{NEXTJS_BASE_URL}/api/{space_id}/tickers-v1/batch-status"
    params = {'limit': limit}
    
    response = requests.get(url, params=params, headers=get_auth_headers())
    response.raise_for_status()
    
    return response.json()['tickers']


def process_ticker(ticker_info):
    """
    Process all pending sections for a ticker
    Respects dependencies and rate limits
    """
    ticker_id = ticker_info['tickerId']
    symbol = ticker_info['symbol']
    pending_sections = ticker_info['pendingSections']
    
    # Define dependency order
    section_order = [
        'competition',           # Must be first (dependency for many)
        'financial-analysis',
        'business-and-moat',     # Requires competition
        'fair-value',            # Requires competition
        'future-risk',
        'past-performance',      # Requires competition
        'future-growth',         # Requires competition
        'warren-buffett',        # Investor analyses
        'charlie-munger',
        'bill-ackman',
        'final-summary',         # Requires all categories
        'cached-score',          # Must be last
    ]
    
    # Sort pending sections by dependency order
    sections_to_process = [
        s for s in section_order 
        if s in pending_sections
    ]
    
    results = []
    for section in sections_to_process:
        try:
            result = generate_section(symbol, section)
            results.append({
                'section': section,
                'success': True,
                'result': result
            })
            
            # Rate limiting
            time.sleep(RATE_LIMIT_DELAY)
            
        except Exception as e:
            results.append({
                'section': section,
                'success': False,
                'error': str(e)
            })
            # Stop processing this ticker on error
            break
    
    return {
        'ticker': symbol,
        'success': all(r['success'] for r in results),
        'sections_processed': results
    }


def generate_section(symbol, section):
    """
    Call Next.js API to generate a specific section
    """
    space_id = os.environ.get('SPACE_ID')
    
    # Map section name to API endpoint
    endpoint_map = {
        'competition': f'/api/{space_id}/tickers-v1/{symbol}/competition',
        'financial-analysis': f'/api/{space_id}/tickers-v1/{symbol}/financial-analysis',
        'business-and-moat': f'/api/{space_id}/tickers-v1/{symbol}/business-and-moat',
        'past-performance': f'/api/{space_id}/tickers-v1/{symbol}/past-performance',
        'future-growth': f'/api/{space_id}/tickers-v1/{symbol}/future-growth',
        'fair-value': f'/api/{space_id}/tickers-v1/{symbol}/fair-value',
        'future-risk': f'/api/{space_id}/tickers-v1/{symbol}/future-risk',
        'warren-buffett': f'/api/{space_id}/tickers-v1/{symbol}/investor-analysis',
        'charlie-munger': f'/api/{space_id}/tickers-v1/{symbol}/investor-analysis',
        'bill-ackman': f'/api/{space_id}/tickers-v1/{symbol}/investor-analysis',
        'final-summary': f'/api/{space_id}/tickers-v1/{symbol}/final-summary',
        'cached-score': f'/api/{space_id}/tickers-v1/{symbol}/cached-score',
    }
    
    url = f"{NEXTJS_BASE_URL}{endpoint_map[section]}"
    
    # Prepare body for investor analysis
    body = {}
    if section in ['warren-buffett', 'charlie-munger', 'bill-ackman']:
        investor_key_map = {
            'warren-buffett': 'WARREN_BUFFETT',
            'charlie-munger': 'CHARLIE_MUNGER',
            'bill-ackman': 'BILL_ACKMAN'
        }
        body['investorKey'] = investor_key_map[section]
    
    response = requests.post(
        url, 
        json=body,
        headers=get_auth_headers(),
        timeout=300  # 5 minutes timeout
    )
    response.raise_for_status()
    
    return response.json()


def get_auth_headers():
    """
    Get authentication headers for Next.js API
    """
    api_key = os.environ.get('NEXTJS_API_KEY')
    if api_key:
        return {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    return {'Content-Type': 'application/json'}
```

### Lambda Deployment
- Deploy using AWS SAM, Serverless Framework, or CDK
- Set up EventBridge rule for scheduled execution
- Configure CloudWatch Logs for monitoring
- Set up CloudWatch Alarms for failures

## UI Enhancements

### Page 1: Create Reports (Existing - No Changes)
**Route**: `/admin-v1/create-reports`

This page remains exactly as it is. It allows manual, immediate report generation:
- Select industry → sub-industry
- Filter by country/status
- Select tickers
- Generate reports immediately (synchronously)

No changes needed to this page.

### Page 2: Manage Generation Flags (New)
**Route**: `/admin-v1/manage-generation-flags`

This new page allows admins to mark sections for automated generation by the Lambda.

#### Features:

**1. Ticker Selection Options**
- **Option A**: Select by Industry/Sub-Industry
  - Dropdown for industry
  - Dropdown for sub-industry
  - Shows count of tickers that will be affected
  
- **Option B**: Select specific tickers
  - Industry/sub-industry filter to narrow down
  - Multi-select checkbox list of tickers
  - Search by symbol/name

**2. Section Selection**
- Checkbox list of all available sections:
  - Competition Analysis
  - Financial Analysis
  - Business & Moat
  - Past Performance
  - Future Growth
  - Fair Value
  - Future Risk
  - Warren Buffett Analysis
  - Charlie Munger Analysis
  - Bill Ackman Analysis
  - Final Summary
  - Cached Score
- "Select All" checkbox
- Dependency warnings (e.g., "Note: Business & Moat and others requires Competition Analysis")

**3. Mark for Generation**
- Single button: "Mark for Automated Generation"
- Confirmation dialog showing:
  - Number of tickers affected
  - Sections that will be marked
  - Estimated processing time
- Calls the `mark-for-generation` API endpoint

**4. Status View**
- Table showing current generation status
- Columns:
  - Ticker Symbol
  - Ticker Name
  - All Sections and their statuses (they are marked or not)
  - Last Processed (timestamp)
- Filters:
  - Show only tickers with pending sections
  - Filter by industry/sub-industry
  - Filter by specific section
- Real-time refresh button

**5. Bulk Status Display**
Uses the `batch-status` endpoint to show:
- Total tickers with pending sections
- Most common pending sections

#### Example UI Flow:

**Scenario: Regenerate Fair Value for all Technology stocks**

1. Admin navigates to `/admin-v1/manage-generation-flags`
2. Selects "Industry: Technology" (no sub-industry filter)
3. System shows: "This will affect 450 tickers"
4. Selects sections: 
   - ✅ Fair Value
   - ✅ Final Summary
   - ✅ Cached Score
5. Clicks "Mark for Automated Generation"
6. Confirmation: "Mark 3 sections for 450 tickers? Lambda will process these automatically."
7. Admin confirms
8. Success message: "Marked 450 tickers. Lambda will process on next run."
9. Status table updates showing these tickers now have pending sections

## Workflow Examples

### Example 1: Regenerate Fair Value for All Tickers

**User Action:**
1. Navigate to `/admin-v1/manage-generation-flags`
2. Ticker Selection: Don't select any filter (applies to all tickers)
3. Section Selection: Check
   - ✅ Fair Value
   - ✅ Final Summary
   - ✅ Cached Score
4. Click "Mark for Automated Generation"
5. Confirm: "Mark 3 sections for 2000 tickers?"

**System Action:**
1. `mark-for-generation` API endpoint updates ~2000 ticker status records:
   - `needsFairValue = true`
   - `needsFinalSummary = true`
   - `needsCachedScore = true`
2. Lambda runs on next scheduled execution
3. Fetches 10 tickers via `batch-status` endpoint
4. For each ticker, generates: fair-value → final-summary → cached-score
5. Generation routes automatically set flags to `false` after completion
6. Repeat until all 2000 tickers processed

**Timeline:**
- Lambda runs every 30 minutes
- Processes 10 tickers per run
- 2000 tickers / 10 = 200 runs
- 200 runs × 30 minutes = 6000 minutes = ~4 days
- Can speed up by increasing batch size or run frequency

### Example 2: Generate Reports for New Tickers

**User Action:**
1. Add 50 new tickers via UI for "Consumer Goods → Food Products"
2. Navigate to `/admin-v1/manage-generation-flags`
3. Select Industry: Consumer Goods, Sub-Industry: Food Products
4. Select all sections (all 12 sections)
5. Click "Mark for Automated Generation"

**System Action:**
1. All 50 tickers marked with all 12 sections needed
2. Lambda processes these tickers on next run
3. Each ticker gets full report generated in proper order:
   - competition → financial-analysis → business-and-moat → past-performance → future-growth → fair-value → future-risk → investor analyses → final-summary → cached-score
4. Takes ~5 Lambda runs to complete all 50 tickers

### Example 3: Regenerate Single Section for Specific Tickers

**User Action:**
1. Navigate to `/admin-v1/manage-generation-flags`
2. Select specific tickers: AAPL, MSFT, GOOGL (using checkbox selection)
3. Select only "Competition Analysis" section
4. Click "Mark for Automated Generation"

**System Action:**
1. These 3 tickers marked with `needsCompetition = true`
2. Lambda processes on next run
3. Competition analysis generated for each
4. Flags automatically cleared after successful generation

## Automatic Status Updates in Generation Routes

Each existing generation endpoint (`/competition`, `/financial-analysis`, `/business-and-moat`, etc.) should be updated to automatically clear the corresponding flag after successful generation.

### Implementation in Each Route

Add this at the end of each POST handler, after successful generation:

```typescript
// Example: In competition/route.ts, after storing competition data
await prisma.tickerV1GenerationStatus.upsert({
  where: {
    tickerId: tickerRecord.id,
  },
  update: {
    needsCompetition: false,
    lastProcessedAt: new Date(),
  },
  create: {
    tickerId: tickerRecord.id,
    spaceId: spaceId,
    needsCompetition: false,
    lastProcessedAt: new Date(),
  }
});
```

### Mapping: Section to Flag

| Route Endpoint | Flag to Clear |
|----------------|---------------|
| `/competition` | `needsCompetition` |
| `/financial-analysis` | `needsFinancialAnalysis` |
| `/business-and-moat` | `needsBusinessAndMoat` |
| `/past-performance` | `needsPastPerformance` |
| `/future-growth` | `needsFutureGrowth` |
| `/fair-value` | `needsFairValue` |
| `/future-risk` | `needsFutureRisk` |
| `/investor-analysis` (Warren Buffett) | `needsWarrenBuffett` |
| `/investor-analysis` (Charlie Munger) | `needsCharlieMunger` |
| `/investor-analysis` (Bill Ackman) | `needsBillAckman` |
| `/final-summary` | `needsFinalSummary` |
| `/cached-score` | `needsCachedScore` |

### Why Upsert?

We use `upsert` because:
- When a new ticker is added, it might not have a status record yet
- When generation is triggered manually (not through flags), the status record should still be updated
- Ensures the status table stays in sync with actual generation state

