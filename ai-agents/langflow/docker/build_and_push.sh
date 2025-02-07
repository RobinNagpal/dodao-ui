#!/usr/bin/env bash

# docker/build_and_push.sh

# Exit on error
set -e

# Variables (update to match your AWS account/region/ECR name)
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR_REPO_NAME="langflow" # must match what we define in Terraform
VERSION_TAG="latest"

# Build the Docker image
docker build -t "${ECR_REPO_NAME}:${VERSION_TAG}" .

# Ensure we have logged in to ECR
aws ecr get-login-password --region "${AWS_REGION}" \
| docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Tag and push
docker tag "${ECR_REPO_NAME}:${VERSION_TAG}" \
  "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${VERSION_TAG}"

docker push "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${VERSION_TAG}"
