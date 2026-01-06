#!/bin/bash

echo "=========================================="
echo "Checking Prerequisites"
echo "=========================================="
echo ""

MISSING=0

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js: $NODE_VERSION"
else
    echo "✗ Node.js: NOT FOUND"
    MISSING=1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm: $NPM_VERSION"
else
    echo "✗ npm: NOT FOUND"
    MISSING=1
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✓ Docker: $DOCKER_VERSION"
    
    # Check if Docker is running
    if docker info &> /dev/null; then
        echo "  ✓ Docker daemon is running"
    else
        echo "  ✗ Docker daemon is NOT running"
        MISSING=1
    fi
else
    echo "✗ Docker: NOT FOUND"
    MISSING=1
fi

# Check AWS CLI
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version)
    echo "✓ AWS CLI: $AWS_VERSION"
    
    # Check AWS credentials
    if aws sts get-caller-identity &> /dev/null; then
        AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
        AWS_USER=$(aws sts get-caller-identity --query Arn --output text)
        echo "  ✓ AWS credentials configured"
        echo "    Account: $AWS_ACCOUNT"
        echo "    User: $AWS_USER"
    else
        echo "  ✗ AWS credentials NOT configured"
        MISSING=1
    fi
else
    echo "✗ AWS CLI: NOT FOUND"
    MISSING=1
fi

# Check .env file
echo ""
if [ -f .env ]; then
    echo "✓ .env file exists"
    
    # Check required variables
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs) 2>/dev/null
    fi
    
    if [ -z "$AWS_REGION" ]; then
        echo "  ✗ AWS_REGION not set"
        MISSING=1
    else
        echo "  ✓ AWS_REGION: $AWS_REGION"
    fi
    
    if [ -z "$AWS_ACCESS_KEY_ID" ]; then
        echo "  ✗ AWS_ACCESS_KEY_ID not set"
        MISSING=1
    else
        echo "  ✓ AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:0:8}..."
    fi
    
    if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        echo "  ✗ AWS_SECRET_ACCESS_KEY not set"
        MISSING=1
    else
        echo "  ✓ AWS_SECRET_ACCESS_KEY: [HIDDEN]"
    fi
    
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        echo "  ✗ AWS_ACCOUNT_ID not set"
        MISSING=1
    else
        echo "  ✓ AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID"
    fi
    
    if [ -z "$S3_BUCKET_NAME" ]; then
        echo "  ✗ S3_BUCKET_NAME not set"
        MISSING=1
    else
        echo "  ✓ S3_BUCKET_NAME: $S3_BUCKET_NAME"
    fi
else
    echo "✗ .env file NOT FOUND"
    MISSING=1
fi

echo ""
echo "=========================================="

if [ $MISSING -eq 0 ]; then
    echo "✓ All prerequisites met!"
    echo "You're ready to deploy."
    echo ""
    echo "Run: bash deploy.sh"
    exit 0
else
    echo "✗ Some prerequisites are missing"
    echo "Please install missing components and configure .env"
    exit 1
fi

