// Utility functions for cross-environment compatibility

import path from "node:path";
import fs from "node:fs";
import os from "node:os";

/**
 * Get the appropriate temporary directory based on environment
 * Lambda: /tmp (writable directory)
 * Local: OS temp directory
 */
export function getTempDir(): string {
  // Check if running in AWS Lambda
  const isLambda = process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

  if (isLambda) {
    return "/tmp";
  }

  // Local development - use OS temp directory
  return os.tmpdir();
}

/**
 * Ensure a directory exists, create if it doesn't
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Normalize path for FFmpeg (convert backslashes to forward slashes)
 * FFmpeg prefers forward slashes on all platforms
 */
export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

/**
 * Get chromium executable path based on environment
 */
export function getChromiumPath(): string | undefined {
  const isLambda = process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

  if (isLambda) {
    // Lambda Layer provides chromium at this path
    return "/opt/chrome/chrome";
  }

  // Local development - use system chromium/chrome
  return undefined;
}

/**
 * Check if running in AWS Lambda environment
 */
export function isLambdaEnvironment(): boolean {
  return process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
}
