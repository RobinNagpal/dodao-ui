#!/bin/bash

# Script to install dependencies only for the web-core package
# This prevents pnpm from installing dependencies for all workspace packages

echo "Installing dependencies only for @dodao/web-core..."
pnpm install --filter @dodao/web-core

echo "Done! Dependencies installed only for web-core package."
