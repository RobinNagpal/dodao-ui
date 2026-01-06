// Single Slide Rendering Service using Remotion Lambda
import { renderMediaOnLambda } from "@remotion/lambda";
import * as mm from "music-metadata";
import type { SlideInput, GenerateSlideVideoResponse } from "./types";
import { generateAudioToS3 } from "./tts-service";

/**
 * Render a single slide to video using Remotion Lambda and upload to S3
 */
export async function renderSingleSlide(
  slide: SlideInput,
  outputBucket: string,
  outputPrefix: string = "",
  voice: string = "en-US-JennyNeural"
): Promise<GenerateSlideVideoResponse> {
  try {
    console.log(`Starting render for slide ${slide.id}...`);

    // Get Remotion Lambda configuration from environment
    const region = process.env.REMOTION_APP_REGION || "us-east-1";
    const functionName = process.env.REMOTION_APP_FUNCTION_NAME;
    const serveUrl = process.env.REMOTION_APP_SERVE_URL;

    if (!functionName || !serveUrl) {
      throw new Error("Missing Remotion Lambda configuration. Run 'npm run setup:remotion' first.");
    }

    // Step 1: Generate audio and upload to S3
    const { audioUrl, localPath: audioPath } = await generateAudioToS3(
      slide.id,
      slide.narration,
      outputBucket,
      outputPrefix,
      voice
    );

    // Step 2: Get accurate audio duration using music-metadata
    const metadata = await mm.parseFile(audioPath);
    const audioDuration = metadata.format.duration ?? 0;
    const fps = 30;
    const durationInFrames = Math.ceil(audioDuration * fps) + 5; // Add 5 frames padding

    console.log(`Audio duration: ${audioDuration}s, frames: ${durationInFrames}`);

    // Step 3: Render video using Remotion Lambda
    console.log(`Rendering video for slide ${slide.id} on Remotion Lambda...`);

    const videoKey = `${outputPrefix}${slide.id}.mp4`;

    // Fixed concurrency limit to stay within AWS Lambda limits (quota is 10, we use 6 for buffer)
    const maxConcurrentLambdas = 6;
    const optimalFramesPerLambda = Math.max(60, Math.ceil(durationInFrames / maxConcurrentLambdas));

    console.log(
      `Using framesPerLambda: ${optimalFramesPerLambda} for ${durationInFrames} frames (max ${maxConcurrentLambdas} concurrent lambdas)`
    );

    const { renderId, bucketName } = await renderMediaOnLambda({
      region: region as any,
      functionName,
      serveUrl,
      composition: "SingleSlide",
      inputProps: {
        slide,
        audioUrl, // Use presigned S3 URL
        durationInFrames, // Pass duration to calculateMetadata
      },
      codec: "h264",
      imageFormat: "jpeg",
      maxRetries: 3,
      framesPerLambda: optimalFramesPerLambda, // Calculated to limit concurrency to 6
      privacy: "public",
      outName: videoKey,
      overwrite: true,
      timeoutInMilliseconds: 1200000, // 20 minutes timeout for single slide
    });

    console.log(`Render started: ${renderId}`);
    console.log(`Video will be at: s3://${bucketName}/${videoKey}`);

    // Construct the S3 URL
    const videoUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${videoKey}`;

    console.log(`Slide ${slide.id} render initiated successfully!`);
    console.log(`Use renderId '${renderId}' to check render status`);

    return {
      success: true,
      slideId: slide.id,
      audioUrl,
      videoUrl,
      duration: audioDuration,
      renderId,
      bucketName,
    };
  } catch (error) {
    console.error(`Error rendering slide ${slide.id}:`, error);
    return {
      success: false,
      slideId: slide.id,
      audioUrl: "",
      videoUrl: "",
      duration: 0,
      renderId: "",
      bucketName: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
