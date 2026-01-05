// Test script to generate a single slide video locally (without AWS)
import { renderSingleSlide } from "../src/api/render-single-slide";
import type { SlideInput } from "../src/api/types";
import dotenv from "dotenv";

dotenv.config();

const testSlide: SlideInput = {
  id: "test-001",
  type: "bullets",
  title: "Test Slide Title",
  titleAccent: "Test",
  bullets: [
    "This is the first point we want to make",
    "Here's a second important concept",
    "Finally, we conclude with this thought",
  ],
  bulletAccents: ["first", "second", "Finally"],
  narration:
    "Welcome to our test slide. This is the first point we want to make about our topic. " +
    "Here's a second important concept that builds on the first. " +
    "Finally, we conclude with this thought that ties everything together.",
};

async function main() {
  console.log("🎬 Starting single slide render test...\n");

  const bucket = process.env.S3_BUCKET_NAME || "test-bucket";
  const prefix = "test/";

  try {
    const result = await renderSingleSlide(testSlide, bucket, prefix);

    console.log("\n✅ Render completed!");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n❌ Render failed:", error);
    process.exit(1);
  }
}

main();
