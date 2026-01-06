# Integration Examples

This folder contains examples of how to call the FFmpeg Video Merger from different languages and platforms.

## Available Examples

### 1. Node.js / TypeScript
**File**: `call-from-nodejs.js`

```bash
npm install @aws-sdk/client-lambda
node call-from-nodejs.js
```

Perfect for:
- Next.js API routes
- Express.js backends
- Serverless functions

### 2. Python
**File**: `call-from-python.py`

```bash
pip install boto3
python call-from-python.py
```

Perfect for:
- Flask/Django apps
- Data processing pipelines
- ML workflows

### 3. HTTP/cURL
**File**: `call-via-http.sh`

```bash
bash call-via-http.sh
```

Perfect for:
- Any language with HTTP support
- Webhooks
- External integrations
- Testing

## Integration Patterns

### Pattern 1: Direct Lambda Invocation
Best for AWS-native applications. Requires AWS credentials.

```typescript
// TypeScript/Node.js
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const client = new LambdaClient({ region: 'us-east-1' });
const result = await client.send(new InvokeCommand({
  FunctionName: 'ffmpeg-video-merger',
  Payload: JSON.stringify({ clips: [...] })
}));
```

### Pattern 2: HTTP API
Best for external integrations. No AWS SDK needed.

```bash
curl -X POST https://api-url/merge \
  -H 'Content-Type: application/json' \
  -d '{"clips": [...]}'
```

### Pattern 3: S3 Event Trigger
Automatically merge videos when uploaded to specific S3 prefix.

Configure S3 event notification → Lambda trigger

### Pattern 4: Step Functions
Orchestrate video merging as part of larger workflow.

```json
{
  "StartAt": "GenerateClips",
  "States": {
    "GenerateClips": { "Type": "Task", "Resource": "..." },
    "MergeClips": { 
      "Type": "Task", 
      "Resource": "arn:aws:lambda:...:function:ffmpeg-video-merger"
    }
  }
}
```

## Response Format

All methods return the same format:

**Success:**
```json
{
  "success": true,
  "outputKey": "merged/output.mp4",
  "s3Url": "s3://bucket/merged/output.mp4"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Common Use Cases

### Use Case 1: Video Pipeline
```
Remotion generates clips → Upload to S3 → Merge with FFmpeg → Final video
```

### Use Case 2: User-Generated Content
```
User uploads videos → Process → Merge → Publish
```

### Use Case 3: Batch Processing
```
Cron job → Get list of clips → Merge → Notify
```

## Need Help?

See main [SETUP.md](../SETUP.md) for deployment instructions.

