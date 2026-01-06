#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

FUNCTION_NAME="ffmpeg-video-merger"

echo "Invoking Lambda function: $FUNCTION_NAME"
echo ""

aws lambda invoke \
    --function-name $FUNCTION_NAME \
    --payload file://test-payload.json \
    --region $AWS_REGION \
    response.json

echo ""
echo "Response:"
cat response.json | jq .
echo ""

