// Test script to concatenate videos locally (without AWS)
import { concatenateVideos } from "../src/api/concatenate-videos";
import type { ConcatenateVideosRequest } from "../src/api/types";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🎬 Starting video concatenation test...\n");

  const request: ConcatenateVideosRequest = {
    videoUrls: [
      // Add your S3 video keys or URLs here
      "test/videos/test-001.mp4",
      "test/videos/test-002.mp4",
    ],
    outputBucket: process.env.S3_BUCKET_NAME || "test-bucket",
    outputKey: "test/final/concatenated.mp4",
  };

  try {
    const result = await concatenateVideos(request);

    console.log("\n✅ Concatenation completed!");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n❌ Concatenation failed:", error);
    process.exit(1);
  }
}

main();
