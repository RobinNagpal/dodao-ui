#!/bin/bash

set -e

echo "=========================================="
echo "FFmpeg Video Merger - AWS Lambda Deployment"
echo "=========================================="

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

# Check required environment variables
if [ -z "$AWS_REGION" ] || [ -z "$AWS_ACCOUNT_ID" ]; then
    echo "Error: AWS_REGION and AWS_ACCOUNT_ID must be set in .env"
    exit 1
fi

# Configuration
FUNCTION_NAME="ffmpeg-video-merger"
ECR_REPO_NAME="ffmpeg-merger"
IMAGE_TAG="latest"
ECR_REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"

echo ""
echo "Configuration:"
echo "  Function Name: $FUNCTION_NAME"
echo "  ECR Repository: $ECR_REPO_URI"
echo "  AWS Region: $AWS_REGION"
echo ""

# Step 1: Build TypeScript
echo "Step 1: Building TypeScript..."
npm run build

# Step 2: Create ECR repository if it doesn't exist
echo ""
echo "Step 2: Creating ECR repository (if needed)..."
aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $AWS_REGION --no-cli-pager 2>/dev/null || \
    aws ecr create-repository --repository-name $ECR_REPO_NAME --region $AWS_REGION --no-cli-pager

# Step 3: Login to ECR
echo ""
echo "Step 3: Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URI

# Step 4: Build Docker image
echo ""
echo "Step 4: Building Docker image..."
# Use default builder and disable buildx features that might cause issues
export DOCKER_BUILDKIT=0
docker build -t $ECR_REPO_NAME:$IMAGE_TAG .

# Step 5: Tag Docker image
echo ""
echo "Step 5: Tagging Docker image..."
docker tag $ECR_REPO_NAME:$IMAGE_TAG $ECR_REPO_URI:$IMAGE_TAG

# Step 6: Push to ECR
echo ""
echo "Step 6: Pushing to ECR..."
docker push $ECR_REPO_URI:$IMAGE_TAG

# Step 7: Create or update Lambda function
echo ""
echo "Step 7: Deploying Lambda function..."

    # Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION --no-cli-pager 2>/dev/null; then
    echo "Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --image-uri $ECR_REPO_URI:$IMAGE_TAG \
        --region $AWS_REGION \
        --no-cli-pager
    
    # Wait for update to complete
    echo "Waiting for update to complete..."
    aws lambda wait function-updated --function-name $FUNCTION_NAME --region $AWS_REGION --no-cli-pager
    
    # Update environment variables
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --timeout 900 \
        --memory-size 3008 \
        --environment "Variables={S3_BUCKET_NAME=$S3_BUCKET_NAME}" \
        --region $AWS_REGION \
        --no-cli-pager
else
    echo "Creating new Lambda function..."
    
    # Create IAM role if it doesn't exist
    ROLE_NAME="ffmpeg-merger-lambda-role"
    ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text --no-cli-pager 2>/dev/null || echo "")
    
    if [ -z "$ROLE_ARN" ]; then
        echo "Creating IAM role..."
        
        # Create trust policy using inline JSON
        TRUST_POLICY='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
        
        ROLE_ARN=$(aws iam create-role \
            --role-name $ROLE_NAME \
            --assume-role-policy-document "$TRUST_POLICY" \
            --query 'Role.Arn' \
            --output text \
            --no-cli-pager)
        
        # Attach basic Lambda execution policy
        aws iam attach-role-policy \
            --role-name $ROLE_NAME \
            --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
            --no-cli-pager
        
        # Create and attach S3 access policy using inline JSON
        S3_POLICY="{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"s3:GetObject\",\"s3:PutObject\",\"s3:PutObjectAcl\",\"s3:ListBucket\"],\"Resource\":[\"arn:aws:s3:::${S3_BUCKET_NAME}/*\",\"arn:aws:s3:::${S3_BUCKET_NAME}\"]}]}"
        
        aws iam put-role-policy \
            --role-name $ROLE_NAME \
            --policy-name S3Access \
            --policy-document "$S3_POLICY" \
            --no-cli-pager
        
        echo "Waiting for IAM role to propagate..."
        sleep 10
    fi
    
    # Create Lambda function
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --package-type Image \
        --code ImageUri=$ECR_REPO_URI:$IMAGE_TAG \
        --role $ROLE_ARN \
        --timeout 900 \
        --memory-size 3008 \
        --environment "Variables={S3_BUCKET_NAME=$S3_BUCKET_NAME}" \
        --region $AWS_REGION \
        --no-cli-pager
fi

# Update IAM role policy on every deployment
echo ""
echo "Step 8: Updating IAM role S3 permissions..."
ROLE_NAME="ffmpeg-merger-lambda-role"
S3_POLICY="{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"s3:GetObject\",\"s3:PutObject\",\"s3:PutObjectAcl\",\"s3:ListBucket\"],\"Resource\":[\"arn:aws:s3:::${S3_BUCKET_NAME}\",\"arn:aws:s3:::${S3_BUCKET_NAME}/*\"]}]}"

aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name S3Access \
    --policy-document "$S3_POLICY" \
    --no-cli-pager

echo "IAM permissions updated successfully!"

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo ""
echo "Function ARN:"
aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION --query 'Configuration.FunctionArn' --output text --no-cli-pager
echo ""
echo "To invoke the function, use:"
echo "aws lambda invoke --function-name $FUNCTION_NAME --payload file://test-payload.json response.json --region $AWS_REGION"
echo ""

