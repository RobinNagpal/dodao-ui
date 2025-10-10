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
5. **No Prioritization**: Can't prioritize certain tickers or sections

## Proposed Solution

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    Admin UI (Next.js)                       │
│  - Manual trigger for specific tickers/sections             │
│  - View generation status/progress                          │
│  - Mark sections for regeneration                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ REST API
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              Next.js API Routes                             │
│  - Ticker generation endpoints (existing)                   │
│  - New: Batch status endpoint                               │
│  - New: Mark for regeneration endpoint                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ Polling/API calls
                  │
┌─────────────────▼───────────────────────────────────────────┐
│          AWS Lambda (Python)                                │
│  - Scheduled execution (EventBridge)                        │
│  - Fetches pending tickers                                  │
│  - Calls Next.js generation endpoints                       │
│  - Respects rate limits & dependencies                      │
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
  
  // Core analysis sections
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
  
  // Priority (higher = process first)
  priority                      Int     @default(0) @map("priority")
  
  // Timestamps for tracking
  lastProcessedAt               DateTime? @map("last_processed_at")
  createdAt                     DateTime  @default(now()) @map("created_at")
  updatedAt                     DateTime  @updatedAt @map("updated_at")
  
  // Relation
  ticker    TickerV1 @relation(fields: [tickerId], references: [id], onDelete: Cascade)
  
  @@unique([spaceId, tickerId])
  @@index([spaceId, priority])
  @@map("ticker_v1_generation_status")
}
```

### Helper View/Query
For easy querying, we can create a computed view or query that shows:
- Total pending sections per ticker
- Which tickers have dependencies satisfied
- Processing order based on priority and dependencies

## New Next.js API Endpoints

### 1. Batch Status Endpoint
**GET** `/api/[spaceId]/tickers-v1/batch-status`

Query parameters:
- `limit`: Number of tickers to return (default: 10)
- `offset`: Pagination offset (default: 0)
- `priority`: Minimum priority level (optional)

Response:
```typescript
{
  tickers: [
    {
      tickerId: string;
      symbol: string;
      exchange: string;
      pendingSections: string[]; // e.g., ['competition', 'fair-value']
      canProcess: boolean; // true if dependencies are met
      priority: number;
    }
  ],
  total: number;
  hasMore: boolean;
}
```

### 2. Mark for Regeneration Endpoint
**POST** `/api/[spaceId]/tickers-v1/batch-mark-regeneration`

Body:
```typescript
{
  sections: string[]; // e.g., ['fair-value', 'final-summary']
  filters?: {
    industryKey?: string;
    subIndustryKey?: string;
    symbols?: string[]; // specific tickers
    exchange?: string;
  };
  priority?: number; // 0-10, higher = process sooner
}
```

Response:
```typescript
{
  success: boolean;
  tickersMarked: number;
  message: string;
}
```

### 3. Single Ticker Status
**GET** `/api/[spaceId]/tickers-v1/[ticker]/generation-status`

Response:
```typescript
{
  ticker: string;
  status: {
    needsCompetition: boolean;
    needsFinancialAnalysis: boolean;
    // ... all other fields
  };
  canProcess: string[]; // sections that can be processed now
  blocked: string[]; // sections blocked by dependencies
  priority: number;
  lastProcessedAt: string | null;
}
```

### 4. Update Single Ticker Status
**PATCH** `/api/[spaceId]/tickers-v1/[ticker]/generation-status`

Body:
```typescript
{
  sections: string[]; // sections to mark as needed
  unmark?: boolean; // if true, unmark instead of mark
  priority?: number;
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
  - `MAX_CONCURRENT_REQUESTS`: Max parallel API calls (default: 3)
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

### New Admin Page: Generation Queue Management
**Route**: `/admin-v1/generation-queue`

Features:
1. **View Queue**
   - Table showing all tickers with pending sections
   - Sort by priority, last processed, number of pending sections
   - Filter by industry, sub-industry, exchange
   - Show which sections are pending for each ticker

2. **Bulk Mark for Regeneration**
   - Select industry/sub-industry
   - Choose specific sections to regenerate
   - Set priority level
   - Confirm and mark all matching tickers

3. **Monitor Progress**
   - Dashboard showing:
     - Total tickers in queue
     - Sections being processed
     - Recently completed
     - Failed generations (with errors)
   - Real-time updates (polling or webhooks)

4. **Manual Trigger**
   - Button to manually trigger Lambda execution
   - Override batch size for specific run
   - Process specific ticker immediately (bypass queue)

### Updated Create Reports Page
Modify existing `/admin-v1/create-reports` page to:
1. Show generation status for each ticker
2. Add button to "Add to Queue" instead of immediate generation
3. Set priority when adding to queue
4. Option for immediate generation (current behavior) OR queue for later

## Workflow Examples

### Example 1: Regenerate Fair Value for All Tickers

**User Action:**
1. Navigate to `/admin-v1/generation-queue`
2. Click "Bulk Mark for Regeneration"
3. Select sections: `["fair-value", "final-summary", "cached-score"]`
4. Filters: None (all tickers)
5. Priority: 5 (medium)
6. Click "Mark for Regeneration"

**System Action:**
1. API endpoint marks ~2000 tickers with:
   - `needsFairValue = true`
   - `needsFinalSummary = true` (depends on fair value)
   - `needsCachedScore = true` (final step)
   - `priority = 5`
2. Lambda runs on next scheduled execution
3. Processes 10 tickers per run (configurable)
4. Takes ~200 Lambda executions to complete all tickers
5. Each ticker gets sections generated in order: fair-value → final-summary → cached-score

**Timeline:**
- If Lambda runs every 30 minutes
- Processing 10 tickers per run
- 2000 tickers / 10 = 200 runs
- 200 runs × 30 minutes = 6000 minutes = ~4 days
- Can speed up by increasing batch size or frequency

### Example 2: Generate Reports for New Tickers

**User Action:**
1. Add 50 new tickers via UI
2. Navigate to `/admin-v1/generation-queue`
3. Filter by these new tickers (e.g., by creation date)
4. Mark all sections for generation
5. Set priority: 10 (high)

**System Action:**
1. All 50 tickers marked with all sections needed
2. Lambda prioritizes these (priority 10 > others)
3. Processes high-priority tickers first
4. Each ticker gets full report generated in sequence

### Example 3: Fix Failed Generations

**User Action:**
1. View "Failed Generations" dashboard
2. See that 15 tickers failed on "competition" analysis
3. Select these tickers
4. Mark only "competition" for regeneration
5. Set priority: 8 (high)

**System Action:**
1. Lambda retries competition analysis for these 15 tickers
2. If successful, automatically triggers dependent sections
3. Logs success/failure for monitoring

## Automatic Status Updates

### When Generation Completes
Each existing generation endpoint should automatically update the status table:

```typescript
// In each route handler, after successful generation:
await prisma.tickerV1GenerationStatus.update({
  where: { tickerId: tickerRecord.id },
  data: {
    needsCompetition: false, // or whichever section was generated
    lastProcessedAt: new Date(),
  }
});
```

### When Dependencies Complete
Some sections auto-mark dependent sections:

Example: When competition analysis completes, check if business-and-moat was already generated:
```typescript
// If business-and-moat exists, don't mark as needed
// If it doesn't exist, mark as needed (auto-trigger)
const hasBusinessAndMoat = await prisma.tickerV1CategoryAnalysisResult.findFirst({
  where: {
    tickerId: tickerRecord.id,
    categoryKey: 'BusinessAndMoat'
  }
});

if (!hasBusinessAndMoat) {
  await markSectionAsNeeded(tickerRecord.id, 'needsBusinessAndMoat');
}
```

## Error Handling & Retry Logic

### Lambda Retry Strategy
1. **Transient Errors** (network, timeout):
   - Retry up to 3 times with exponential backoff
   - If still fails, mark ticker for manual review

2. **Business Logic Errors** (missing data, LLM errors):
   - Log error details
   - Mark section as failed
   - Send notification to admin
   - Don't retry automatically

3. **Rate Limiting**:
   - Respect Next.js API rate limits
   - Add configurable delay between requests
   - Reduce batch size if hitting limits

### Status Table Error Tracking
Add optional error tracking fields:

```prisma
model TickerV1GenerationStatus {
  // ... existing fields
  
  lastError                     String?   @map("last_error")
  errorCount                    Int       @default(0) @map("error_count")
  lastErrorAt                   DateTime? @map("last_error_at")
}
```

## Monitoring & Observability

### CloudWatch Metrics
- Number of tickers processed per run
- Success/failure rate
- Processing duration per ticker
- API call latency
- Queue depth (pending tickers)

### CloudWatch Alarms
- High failure rate (>20%)
- Lambda timeout/errors
- API errors from Next.js
- Queue not decreasing (stuck)

### Logging
- Structured JSON logs
- Log level: INFO for normal operations, ERROR for failures
- Include: ticker symbol, section, duration, error details

### Dashboard
Create CloudWatch or custom dashboard showing:
- Tickers processed (last 24h, 7d, 30d)
- Current queue depth
- Success/failure rates
- Average processing time
- Sections with highest failure rate

## Security Considerations

### API Authentication
1. Generate API key for Lambda to call Next.js
2. Store in AWS Secrets Manager
3. Validate in Next.js API middleware
4. Rate limit by API key

### Authorization
- Only admin users can access queue management UI
- Only Lambda (via API key) can call batch endpoints
- Audit log for manual queue modifications

## Scalability Considerations

### Short Term (Current 2000 tickers)
- Lambda batch size: 10 tickers
- Run frequency: Every 30 minutes
- Max concurrent requests: 3
- Should handle current load comfortably

### Long Term (10,000+ tickers)
- Increase batch size to 50
- Run frequency: Every 15 minutes
- Consider using SQS queue instead of polling
- Implement multiple Lambda workers
- Use DynamoDB for status tracking (better scalability)

## Migration Plan

### Phase 1: Database Schema
1. Create `TickerV1GenerationStatus` table
2. Run migration to create status entries for all existing tickers
3. Initially, all fields set to `false` (nothing pending)

### Phase 2: Next.js API Endpoints
1. Implement batch-status endpoint
2. Implement mark-regeneration endpoint
3. Update existing generation endpoints to update status table
4. Test with small subset of tickers

### Phase 3: Lambda Development
1. Develop Python Lambda locally
2. Test against dev/staging Next.js environment
3. Deploy to AWS
4. Configure with conservative settings (small batch size)
5. Monitor for a week

### Phase 4: UI Enhancement
1. Create generation queue management page
2. Update existing create-reports page
3. Add monitoring dashboard
4. User testing with admin users

### Phase 5: Production Rollout
1. Enable Lambda with small batch size
2. Mark a few tickers for test regeneration
3. Monitor results
4. Gradually increase batch size and frequency
5. Full rollout

## Cost Estimates

### AWS Lambda
- Executions per month: ~1440 (every 30 min)
- Duration: ~5 minutes per execution
- Memory: 512 MB
- Cost: ~$5-10/month (within free tier initially)

### API Gateway (if used)
- Requests: ~14,400/month (10 per Lambda execution)
- Cost: ~$0.05/month (within free tier)

### CloudWatch Logs
- Log data: ~500 MB/month
- Cost: ~$0.25/month

### Total: ~$5-15/month

## Alternative Approaches Considered

### 1. Background Jobs in Next.js
**Pros**: Simpler, no Lambda needed
**Cons**: Next.js not ideal for long-running jobs, harder to scale

### 2. SQS Queue + Lambda
**Pros**: Better decoupling, natural retry logic
**Cons**: More complex, overkill for current scale

### 3. Cron Job on EC2
**Pros**: Simple, traditional approach
**Cons**: Need to manage server, less serverless benefits

**Decision**: Lambda polling is good middle ground - serverless benefits, simple enough for current scale, can evolve to SQS later if needed.

## Future Enhancements

### Smart Prioritization
- Auto-prioritize tickers with high trading volume
- Prioritize tickers that users are viewing
- De-prioritize archived/delisted tickers

### Incremental Updates
- Only regenerate sections that depend on changed data
- Track prompt versions and regenerate when prompts change
- Compare old vs new results and flag significant changes

### Parallel Processing
- Process independent sections in parallel
- Use Step Functions for complex orchestration
- Multiple Lambda instances for faster processing

### Webhooks
- Next.js sends webhook when generation completes
- Lambda subscribes to webhook instead of polling
- Real-time UI updates via WebSockets

### A/B Testing Prompts
- Generate with different prompt versions
- Compare results
- Gradual rollout of new prompts

## Conclusion

This automated workflow will:
✅ Eliminate manual ticker selection and generation
✅ Make bulk regeneration (e.g., after prompt changes) trivial
✅ Provide visibility into generation status and queue
✅ Scale to handle thousands of tickers
✅ Maintain dependency order and data integrity
✅ Enable background processing without blocking UI

The phased approach ensures we can test and validate each component before full rollout, minimizing risk while delivering value incrementally.

