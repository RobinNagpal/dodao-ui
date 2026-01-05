// Video Concatenation Service
import { getVideoMetadata } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import type { ConcatenateVideosRequest, ConcatenateVideosResponse, S3VideoMetadata } from "./types";
import { S3Helper } from "./s3-helper";
import { getTempDir, ensureDir, normalizePath } from "./utils";

/**
 * Download videos from S3 and get metadata
 */
async function prepareVideos(videoUrls: string[], bucket: string): Promise<S3VideoMetadata[]> {
  const s3Helper = new S3Helper();

  // Use cross-environment temp directory
  const tmpDir = path.join(getTempDir(), "remotion-concat-videos");
  ensureDir(tmpDir);
  console.log(`Using temp directory: ${tmpDir}`);

  const metadata: S3VideoMetadata[] = [];

  for (let i = 0; i < videoUrls.length; i++) {
    const url = videoUrls[i];
    console.log(`Downloading video ${i + 1}/${videoUrls.length}: ${url}`);

    // Parse S3 URL or key
    const parsed = s3Helper.parseS3Url(url);
    const videoBucket = parsed?.bucket || bucket;
    const videoKey = parsed?.key || url;

    // Download to temp
    const localPath = path.join(tmpDir, `video-${i}.mp4`);
    await s3Helper.downloadFile(videoBucket, videoKey, localPath);
    console.log(`Downloaded to: ${localPath}`);

    // Get video metadata
    const videoMetadata = await getVideoMetadata(localPath);
    const fileStat = fs.statSync(localPath);

    metadata.push({
      url: localPath,
      key: videoKey,
      duration: videoMetadata.durationInSeconds || 0,
      size: fileStat.size,
    });
  }

  return metadata;
}

/**
 * Concatenate videos using FFmpeg directly (more efficient than Remotion for simple concatenation)
 */
async function concatenateWithFFmpeg(videoPaths: string[], outputPath: string): Promise<void> {
  const { spawnSync } = await import("node:child_process");

  // Create concat list file in temp directory
  const tmpDir = getTempDir();
  const listPath = path.join(tmpDir, "remotion-concat-list.txt");

  // Normalize paths for FFmpeg and escape single quotes
  const listContent = videoPaths
    .map((p) => {
      const normalizedPath = normalizePath(p);
      const escapedPath = normalizedPath.replace(/'/g, "\\'");
      return `file '${escapedPath}'`;
    })
    .join("\n");

  fs.writeFileSync(listPath, listContent);
  console.log(`Created concat list at: ${listPath}`);
  console.log(`Concatenating ${videoPaths.length} videos...`);

  // Normalize paths for FFmpeg
  const normalizedOutputPath = normalizePath(outputPath);
  const normalizedListPath = normalizePath(listPath);

  // Run ffmpeg concat
  console.log("Running FFmpeg concatenation...");
  const result = spawnSync(
    "ffmpeg",
    [
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      normalizedListPath,
      "-c",
      "copy", // Copy streams without re-encoding (very fast!)
      "-y", // Overwrite output
      normalizedOutputPath,
    ],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    // Clean up on error
    try {
      fs.unlinkSync(listPath);
    } catch (e) {
      // Ignore cleanup errors
    }
    throw new Error(`FFmpeg concatenation failed with status ${result.status}`);
  }

  // Clean up concat list file
  try {
    fs.unlinkSync(listPath);
  } catch (e) {
    console.warn("Failed to delete concat list file:", e);
  }
}

/**
 * Concatenate multiple videos from S3 and upload result
 */
export async function concatenateVideos(
  request: ConcatenateVideosRequest
): Promise<ConcatenateVideosResponse> {
  try {
    console.log(`Starting concatenation of ${request.videoUrls.length} videos...`);

    // Step 1: Download all videos and get metadata
    const videoMetadata = await prepareVideos(request.videoUrls, request.outputBucket);

    const totalDuration = videoMetadata.reduce((sum, v) => sum + v.duration, 0);
    console.log(`Total duration: ${totalDuration}s`);

    // Step 2: Concatenate videos using FFmpeg (fast, no re-encoding)
    const tmpDir = path.join(getTempDir(), "remotion-concat-videos");
    const outputPath = path.join(tmpDir, "concatenated.mp4");

    await concatenateWithFFmpeg(
      videoMetadata.map((v) => v.url),
      outputPath
    );

    console.log("Concatenation complete!");

    // Step 3: Upload to S3
    const s3Helper = new S3Helper();
    const outputUrl = await s3Helper.uploadFile(
      request.outputBucket,
      request.outputKey,
      outputPath,
      "video/mp4"
    );

    // Step 4: Cleanup
    try {
      fs.unlinkSync(outputPath);
      videoMetadata.forEach((v) => {
        try {
          fs.unlinkSync(v.url);
        } catch (err) {
          console.warn(`Failed to delete temp file ${v.url}:`, err);
        }
      });
    } catch (err) {
      console.warn("Failed to cleanup temp files:", err);
    }

    console.log(`Concatenation completed successfully: ${outputUrl}`);

    return {
      success: true,
      outputUrl,
      totalDuration,
      videoCount: request.videoUrls.length,
    };
  } catch (error) {
    console.error("Error concatenating videos:", error);
    return {
      success: false,
      outputUrl: "",
      totalDuration: 0,
      videoCount: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
