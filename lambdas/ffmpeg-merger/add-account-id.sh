#!/bin/bash

# Automatically fetch and add AWS Account ID to .env file

echo "Fetching AWS Account ID..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

if [ -z "$ACCOUNT_ID" ]; then
    echo "Error: Could not fetch AWS Account ID"
    exit 1
fi

echo "Found Account ID: $ACCOUNT_ID"

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found"
    exit 1
fi

# Check if AWS_ACCOUNT_ID already exists in .env
if grep -q "^AWS_ACCOUNT_ID=" .env; then
    echo "AWS_ACCOUNT_ID already exists in .env"
    echo "Current value: $(grep "^AWS_ACCOUNT_ID=" .env)"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Update existing value
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^AWS_ACCOUNT_ID=.*/AWS_ACCOUNT_ID=$ACCOUNT_ID/" .env
        else
            # Linux/Git Bash
            sed -i "s/^AWS_ACCOUNT_ID=.*/AWS_ACCOUNT_ID=$ACCOUNT_ID/" .env
        fi
        echo "✓ Updated AWS_ACCOUNT_ID in .env"
    else
        echo "Skipped update"
        exit 0
    fi
else
    # Append to .env
    echo "" >> .env
    echo "AWS_ACCOUNT_ID=$ACCOUNT_ID" >> .env
    echo "✓ Added AWS_ACCOUNT_ID to .env"
fi

echo ""
echo "You're all set! Run:"
echo "  bash check-prerequisites.sh"

