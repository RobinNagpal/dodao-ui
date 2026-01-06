#!/bin/bash

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

FUNCTION_NAME="ffmpeg-video-merger"
API_NAME="ffmpeg-merger-api"

echo "=========================================="
echo "Setting up API Gateway for Lambda"
echo "=========================================="

# Create REST API
echo "Creating REST API..."
API_ID=$(aws apigateway create-rest-api \
    --name $API_NAME \
    --description "API for FFmpeg Video Merger" \
    --region $AWS_REGION \
    --query 'id' \
    --output text 2>/dev/null || \
    aws apigateway get-rest-apis \
    --region $AWS_REGION \
    --query "items[?name=='$API_NAME'].id" \
    --output text)

echo "API ID: $API_ID"

# Get root resource ID
ROOT_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $AWS_REGION \
    --query 'items[?path==`/`].id' \
    --output text)

echo "Root Resource ID: $ROOT_ID"

# Create /merge resource
RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_ID \
    --path-part merge \
    --region $AWS_REGION \
    --query 'id' \
    --output text 2>/dev/null || \
    aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $AWS_REGION \
    --query "items[?path=='/merge'].id" \
    --output text)

echo "Merge Resource ID: $RESOURCE_ID"

# Create POST method
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --authorization-type NONE \
    --region $AWS_REGION 2>/dev/null || echo "Method already exists"

# Get Lambda function ARN
FUNCTION_ARN=$(aws lambda get-function \
    --function-name $FUNCTION_NAME \
    --region $AWS_REGION \
    --query 'Configuration.FunctionArn' \
    --output text)

echo "Lambda ARN: $FUNCTION_ARN"

# Set up Lambda integration
LAMBDA_URI="arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/${FUNCTION_ARN}/invocations"

aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri $LAMBDA_URI \
    --region $AWS_REGION

# Grant API Gateway permission to invoke Lambda
aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id apigateway-access-$(date +%s) \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${AWS_REGION}:${AWS_ACCOUNT_ID}:${API_ID}/*/*" \
    --region $AWS_REGION 2>/dev/null || echo "Permission already exists"

# Deploy API
echo "Deploying API..."
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod \
    --region $AWS_REGION

echo ""
echo "=========================================="
echo "API Gateway Setup Complete!"
echo "=========================================="
echo ""
echo "API Endpoint:"
echo "https://${API_ID}.execute-api.${AWS_REGION}.amazonaws.com/prod/merge"
echo ""
echo "Test with curl:"
echo "curl -X POST https://${API_ID}.execute-api.${AWS_REGION}.amazonaws.com/prod/merge \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d @test-payload.json"
echo ""

