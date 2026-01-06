# FFmpeg Video Merger - AWS Lambda

Merge video clips from S3 with padding between clips.

## Commands

```bash
# 1. Install
npm install

# 2. Build
npm run build

# 3. Deploy (first time)
bash deploy.sh

# 4. Update test-payload.json with your video URLs, then test
bash invoke-lambda.sh

# 5. (Optional) Create HTTP API
bash setup-api.sh
```

## Request Format

```json
{
  "clips": [
    {"s3Url": "s3://bucket/video1.mp4"},
    {"s3Url": "s3://bucket/video2.mp4"}
  ],
  "outputKey": "merged/output.mp4",
  "paddingSeconds": 1
}
```

## Response

```json
{
  "success": true,
  "outputKey": "merged/output.mp4",
  "s3Url": "s3://bucket/merged/output.mp4"
}
```
