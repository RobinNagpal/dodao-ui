// Setup script for Remotion Lambda infrastructure
// Run this once to deploy Remotion Lambda functions and site bundle
import { deploySite, deployFunction, getOrCreateBucket } from "@remotion/lambda";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config();

const REGION = (process.env.AWS_REGION || "us-east-1") as any;
const SITE_NAME = "remotion-video-slides";

// Helper function to sleep
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Deploy function with retry logic to handle IAM role propagation delay
async function deployFunctionWithRetry(
  region: any,
  maxRetries: number = 5,
  delayMs: number = 10000
): Promise<{ functionName: string }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${maxRetries}...`);
      const result = await deployFunction({
        region,
        timeoutInSeconds: 900,
        memorySizeInMb: 3008,
        createCloudWatchLogGroup: true,
      });
      return result;
    } catch (error: any) {
      lastError = error;

      // Check if it's the IAM role propagation error
      if (
        error.name === "InvalidParameterValueException" &&
        error.message?.includes("cannot be assumed")
      ) {
        if (attempt < maxRetries) {
          console.log(
            `  ⏳ IAM role not yet propagated. Waiting ${delayMs / 1000}s before retry...`
          );
          await sleep(delayMs);
        }
      } else {
        // For other errors, throw immediately
        throw error;
      }
    }
  }

  throw lastError;
}

async function main() {
  console.log("🚀 Setting up Remotion Lambda infrastructure...\n");

  // Step 1: Create or get S3 bucket for Remotion
  console.log("Step 1: Setting up S3 bucket...");
  const { bucketName } = await getOrCreateBucket({
    region: REGION,
  });
  console.log(`✅ Bucket: ${bucketName}\n`);

  // Step 2: Deploy Remotion Lambda function (with retry for IAM propagation)
  console.log("Step 2: Deploying Remotion Lambda render function...");
  console.log("  (This may take a few attempts while IAM role propagates)");
  const { functionName } = await deployFunctionWithRetry(REGION);
  console.log(`✅ Function: ${functionName}\n`);

  // Step 3: Deploy site bundle (your React components)
  console.log("Step 3: Bundling and deploying Remotion site...");
  const { serveUrl, siteName } = await deploySite({
    region: REGION,
    bucketName,
    entryPoint: path.join(process.cwd(), "src", "index.ts"),
    siteName: SITE_NAME,
  });
  console.log(`✅ Site deployed: ${siteName}`);
  console.log(`   Serve URL: ${serveUrl}\n`);

  // Step 4: Save configuration
  console.log("📝 Configuration to add to your .env:");
  console.log(`REMOTION_APP_REGION=${REGION}`);
  console.log(`REMOTION_APP_FUNCTION_NAME=${functionName}`);
  console.log(`REMOTION_APP_SERVE_URL=${serveUrl}`);
  console.log();

  console.log("✅ Setup complete!");
  console.log("\nNext steps:");
  console.log("1. Add the above variables to your .env file");
  console.log("2. Run 'npm run deploy' to deploy your API Lambda");
  console.log("3. Test the API endpoints");
}

main().catch((err) => {
  console.error("❌ Setup failed:", err);
  process.exit(1);
});
