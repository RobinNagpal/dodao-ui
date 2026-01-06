#!/bin/bash

echo "Fetching AWS Account ID..."
echo ""

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

if [ -n "$ACCOUNT_ID" ]; then
    echo "Your AWS Account ID is: $ACCOUNT_ID"
    echo ""
    echo "Add this to your .env file:"
    echo "AWS_ACCOUNT_ID=$ACCOUNT_ID"
else
    echo "Error: Could not fetch AWS Account ID"
    echo "Make sure AWS CLI is configured with valid credentials"
    exit 1
fi

