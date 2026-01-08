# FFmpeg Video Merger - AWS Lambda

Merge video clips from S3 with padding between clips.

## Commands

```bash
# 1. Install
npm install

# 2. Build
npm run build

# 3. Deploy
bash deploy.sh

```

## Request Format

```json
{
  "clips": [
    {"s3Url": "s3://bucket/video1.mp4"},
    {"s3Url": "s3://bucket/video2.mp4"}
  ],
  "outputKey": "merged/output.mp4",
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
