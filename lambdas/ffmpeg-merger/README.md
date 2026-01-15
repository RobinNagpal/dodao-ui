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

## Environment Variables

The following environment variables must be set in a `.env` file before deploying and running the lambda:

> **Note:** The Dockerfile has been updated to use the standard Node.js Alpine image instead of the AWS Lambda Node.js image to avoid authentication issues with the AWS ECR public repository.

| Variable | Description |
|----------|-------------|
| `AWS_REGION` | AWS region where the lambda will be deployed (e.g., us-east-1) |
| `AWS_ACCOUNT_ID` | Your AWS account ID |
| `S3_BUCKET_NAME` | Name of the S3 bucket for storing videos and processed outputs |
| `AWS_ACCESS_KEY_ID` | AWS access key with permissions for Lambda, ECR, and S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key corresponding to the access key ID |

Example `.env` file:
```
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
S3_BUCKET_NAME=my-video-bucket
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Request Format

```json
{
  "clips": [
    {"s3Url": "s3://bucket/video1.mp4"},
    {"s3Url": "s3://bucket/video2.mp4"}
  ],
  "outputKey": "merged/output.mp4"
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
