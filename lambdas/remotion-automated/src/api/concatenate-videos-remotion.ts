// Video Concatenation using Remotion Lambda (async)
import { renderMediaOnLambda, getRenderProgress } from "@remotion/lambda";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import type { ConcatenateVideosRequest, ConcatenateVideosResponse } from "./types";

// Fixed concurrency limit to stay within AWS Lambda limits (quota is 10, we use 6 for buffer)
const MAX_CONCURRENT_LAMBDAS = 6;
const FPS = 30;

/**
 * Fetch video duration in frames from Remotion's progress.json
 */
async function fetchVideoDurationFromProgress(
  s3Client: S3Client,
  bucketName: string,
  renderId: string
): Promise<{ durationInFrames: number; durationInSeconds: number }> {
  const progressKey = `renders/${renderId}/progress.json`;

  console.log(`Fetching progress.json for renderId: ${renderId}`);

  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: progressKey,
    })
  );

  const bodyString = await response.Body?.transformToString();
  if (!bodyString) {
    throw new Error(`Empty progress.json for renderId: ${renderId}`);
  }

  const progressData = JSON.parse(bodyString);

  // Get frame range from renderMetadata.frameRange [start, end]
  const frameRange = progressData.renderMetadata?.frameRange;
  if (!frameRange || !Array.isArray(frameRange) || frameRange.length !== 2) {
    throw new Error(`Invalid frameRange in progress.json for renderId: ${renderId}`);
  }

  // frameRange is [startFrame, endFrame], so total frames = endFrame - startFrame + 1
  const durationInFrames = frameRange[1] - frameRange[0] + 1;
  const durationInSeconds = durationInFrames / FPS;

  console.log(`Render ${renderId}: ${durationInFrames} frames (${durationInSeconds.toFixed(2)}s)`);

  return { durationInFrames, durationInSeconds };
}

/**
 * Concatenate videos using Remotion Lambda (async - returns immediately with renderId)
 */

export async function concatenateVideosRemotion(
  request: ConcatenateVideosRequest
): Promise<ConcatenateVideosResponse> {
  try {
    console.log(`Starting Remotion concatenation of ${request.videoUrls.length} videos...`);

    const region = process.env.REMOTION_APP_REGION || "us-east-1";
    const functionName = process.env.REMOTION_APP_FUNCTION_NAME;
    const serveUrl = process.env.REMOTION_APP_SERVE_URL;

    if (!functionName || !serveUrl) {
      throw new Error("Missing Remotion Lambda configuration");
    }

    // Validate renderIds array
    if (!request.renderIds || request.renderIds.length !== request.videoUrls.length) {
      throw new Error("renderIds array is required and must match videoUrls length");
    }

    // Create S3 client for fetching progress.json
    const s3Client = new S3Client({ region });

    // Fetch durations for each video from their progress.json files
    console.log("Fetching video durations from progress.json files...");
    const videoMetadata = await Promise.all(
      request.renderIds.map((renderId) =>
        fetchVideoDurationFromProgress(s3Client, request.outputBucket, renderId)
      )
    );

    // Build videos array with actual durations
    const videos = request.videoUrls.map((url, index) => {
      const { durationInFrames } = videoMetadata[index];
      return {
        url: `https://${request.outputBucket}.s3.${region}.amazonaws.com/${url}`,
        durationInFrames,
      };
    });

    const totalFrames = videos.reduce((sum, v) => sum + v.durationInFrames, 0);
    const totalDurationSeconds = videoMetadata.reduce((sum, m) => sum + m.durationInSeconds, 0);

    console.log(`Total duration: ${totalDurationSeconds}s, Total frames: ${totalFrames}`);

    // Calculate framesPerLambda to ensure max 6 concurrent lambdas
    // This ensures we stay within AWS concurrency limits regardless of video length
    const framesPerLambda = Math.max(60, Math.ceil(totalFrames / MAX_CONCURRENT_LAMBDAS));

    console.log(
      `Using framesPerLambda: ${framesPerLambda} (max ${MAX_CONCURRENT_LAMBDAS} concurrent lambdas)`
    );

    const { renderId, bucketName } = await renderMediaOnLambda({
      region: region as any,
      functionName,
      serveUrl,
      composition: "ConcatenatedVideo",
      inputProps: {
        videos,
      },
      codec: "h264",
      imageFormat: "jpeg",
      maxRetries: 3,
      framesPerLambda, // Calculated to limit concurrency to 6
      privacy: "public",
      outName: request.outputKey,
      overwrite: true,
      timeoutInMilliseconds: 1800000, // 30 minutes timeout for long videos
    });

    console.log(`Concatenation render started: ${renderId}`);
    console.log(`Output will be at: s3://${bucketName}/${request.outputKey}`);

    const outputUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${request.outputKey}`;

    return {
      success: true,
      outputUrl,
      totalDuration: totalDurationSeconds,
      videoCount: request.videoUrls.length,
      renderId,
      bucketName,
    };
  } catch (error) {
    console.error("Error concatenating videos with Remotion:", error);
    return {
      success: false,
      outputUrl: "",
      totalDuration: 0,
      videoCount: 0,
      renderId: "",
      bucketName: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
