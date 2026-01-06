#!/bin/bash

# Example: Call FFmpeg Merger via HTTP API
# (Requires setup-api.sh to be run first)

# Replace with your actual API Gateway URL
API_URL="https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/merge"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "clips": [
      {
        "s3Url": "s3://remotionlambda-useast1-ele686axd8/videos/clip1.mp4"
      },
      {
        "s3Url": "s3://remotionlambda-useast1-ele686axd8/videos/clip2.mp4"
      },
      {
        "s3Url": "s3://remotionlambda-useast1-ele686axd8/videos/clip3.mp4"
      }
    ],
    "outputKey": "merged/api-output.mp4",
    "paddingSeconds": 1
  }' | jq .

