// Single Slide Rendering Service using Remotion Lambda
import { renderMediaOnLambda } from "@remotion/lambda";
import * as mm from "music-metadata";
import type { SlideInput, GenerateSlideVideoResponse } from "./types";
import { generateAudioToS3, generateSlideAudio } from "./tts-service";
import { StorageService, getPresentationPaths, formatSlideNumber } from "./storage-service";
import { generateSlideImage } from "./image-generator";

// Fixed concurrency limit to stay within AWS Lambda limits (quota is 10, we use 6 for buffer)
const MAX_CONCURRENT_LAMBDAS = 6;

/**
 * Render a single slide to video using Remotion Lambda and upload to S3 (legacy mode)
 * Kept for backward compatibility
 */
export async function renderSingleSlide(
  slide: SlideInput,
  outputBucket: string,
  outputPrefix: string = "",
  voice: string = "Ruth"
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

    // Calculate framesPerLambda to limit concurrency
    const optimalFramesPerLambda = Math.max(
      60,
      Math.ceil(durationInFrames / MAX_CONCURRENT_LAMBDAS)
    );

    console.log(
      `Using framesPerLambda: ${optimalFramesPerLambda} for ${durationInFrames} frames (max ${MAX_CONCURRENT_LAMBDAS} concurrent lambdas)`
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
      framesPerLambda: optimalFramesPerLambda,
      privacy: "public",
      outName: videoKey,
      overwrite: true,
      timeoutInMilliseconds: 1200000, // 20 minutes timeout
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

/**
 * Render video ONLY using existing audio (does NOT regenerate audio)
 * Throws error if audio doesn't exist
 */
export async function renderSlideVideoOnly(
  presentationId: string,
  slideNumber: string,
  slide: SlideInput,
  outputBucket: string
): Promise<GenerateSlideVideoResponse> {
  try {
    const region = process.env.REMOTION_APP_REGION || "us-east-1";
    const functionName = process.env.REMOTION_APP_FUNCTION_NAME;
    const serveUrl = process.env.REMOTION_APP_SERVE_URL;

    if (!functionName || !serveUrl) {
      throw new Error("Missing Remotion Lambda configuration. Run 'npm run setup:remotion' first.");
    }

    const formattedSlideNumber = formatSlideNumber(slideNumber);
    const storage = new StorageService(region);
    const paths = getPresentationPaths(presentationId, outputBucket);
    const slidePaths = paths.output(formattedSlideNumber);

    console.log(
      `Starting VIDEO ONLY render for presentation ${presentationId}, slide ${formattedSlideNumber}...`
    );

    // Step 1: Check if audio exists
    const audioExists = await storage.objectExists(outputBucket, slidePaths.audio);
    if (!audioExists) {
      throw new Error(
        `Audio not found for slide ${formattedSlideNumber}. ` +
          `Please generate audio first using /generate-slide-audio or use /generate-slide-all`
      );
    }

    console.log(`Audio found at: ${slidePaths.audio}`);

    // Step 2: Check if image exists (check both uploaded and generated)
    const renderMetadata = await storage.loadRenderMetadata(
      outputBucket,
      presentationId,
      formattedSlideNumber
    );
    const hasCompletedImage =
      renderMetadata?.image?.status === "completed" && !!renderMetadata.image.url;

    if (!hasCompletedImage) {
      throw new Error(
        `Image not found for slide ${formattedSlideNumber}. ` +
          `Please generate image first using /generate-slide-image, upload an image, or use /generate-slide-all`
      );
    }

    // Get the image URL - could be uploaded or Remotion-generated
    const imageUrl = renderMetadata.image?.url;
    const isUploadedImage = (renderMetadata.image as any)?.isUploaded === true;
    console.log(`Image found (${isUploadedImage ? "uploaded" : "generated"}): ${imageUrl}`);

    // Step 3: Download audio to temp file for duration parsing
    const tmpDir = require("os").tmpdir();
    // Use safe filename by replacing slashes
    const safePresId = presentationId.replace(/\//g, "-");
    const localAudioPath = `${tmpDir}/${safePresId}-${formattedSlideNumber}.mp3`;
    await storage.downloadFile(outputBucket, slidePaths.audio, localAudioPath);

    // Generate FRESH presigned URL for Remotion Lambda to access audio
    const audioUrl = await storage.getPresignedUrl(outputBucket, slidePaths.audio, 3600);

    // Step 4: Get accurate audio duration
    const metadata = await mm.parseFile(localAudioPath);
    const audioDuration = metadata.format.duration ?? 0;
    const fps = 30;
    const durationInFrames = Math.ceil(audioDuration * fps) + 5;

    console.log(`Audio duration: ${audioDuration}s, frames: ${durationInFrames}`);

    // Step 4.5: Cleanup old video render folder if exists
    const cleanupResult = await storage.cleanupOldRender(
      outputBucket,
      presentationId,
      formattedSlideNumber,
      "video"
    );
    if (cleanupResult.cleaned) {
      console.log(`Cleaned up old video render folder: ${cleanupResult.oldRenderId}`);
    }

    // Step 5: Render video using Remotion Lambda
    console.log(`Rendering video for slide ${formattedSlideNumber} on Remotion Lambda...`);

    const optimalFramesPerLambda = Math.max(
      60,
      Math.ceil(durationInFrames / MAX_CONCURRENT_LAMBDAS)
    );

    console.log(`Using framesPerLambda: ${optimalFramesPerLambda} for ${durationInFrames} frames`);

    const videoKey = slidePaths.video;

    const { renderId, bucketName } = await renderMediaOnLambda({
      region: region as any,
      functionName,
      serveUrl,
      composition: "SingleSlide",
      inputProps: {
        slide,
        audioUrl,
        durationInFrames,
        preGeneratedImageUrl: renderMetadata.image?.url, // Use pre-generated image
      },
      codec: "h264",
      imageFormat: "jpeg",
      maxRetries: 3,
      framesPerLambda: optimalFramesPerLambda,
      privacy: "public",
      outName: videoKey,
      overwrite: true,
      timeoutInMilliseconds: 1200000,
    });

    console.log(`Render started: ${renderId}`);

    // Construct the ACTUAL video URL (with renders/{renderId}/ prefix)
    const videoUrl = storage.getRemotionOutputUrl(bucketName, renderId, videoKey);

    console.log(`Actual video URL will be: ${videoUrl}`);

    // Step 6: Save video render metadata
    const renderMetadataUrl = await storage.updateVideoRenderMetadata(
      bucketName,
      presentationId,
      formattedSlideNumber,
      {
        renderId,
        status: "rendering",
        url: videoUrl,
        duration: audioDuration,
        startedAt: new Date().toISOString(),
      }
    );

    console.log(`Slide ${formattedSlideNumber} video render initiated!`);

    return {
      success: true,
      slideId: slide.id,
      audioUrl,
      videoUrl,
      duration: audioDuration,
      renderId,
      bucketName,
      presentationId,
      slideNumber: formattedSlideNumber,
      renderMetadataUrl,
    };
  } catch (error) {
    console.error(`Error rendering video for slide ${slideNumber}:`, error);
    return {
      success: false,
      slideId: slide.id,
      audioUrl: "",
      videoUrl: "",
      duration: 0,
      renderId: "",
      bucketName: "",
      presentationId,
      slideNumber: formatSlideNumber(slideNumber),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Generate ALL artifacts for a slide: audio + image + video
 * Regenerates everything even if they exist
 */
export async function renderSlideAll(
  presentationId: string,
  slideNumber: string,
  slide: SlideInput,
  outputBucket: string,
  voice: string = "Ruth"
): Promise<GenerateSlideVideoResponse & { imageUrl?: string }> {
  try {
    const region = process.env.REMOTION_APP_REGION || "us-east-1";
    const functionName = process.env.REMOTION_APP_FUNCTION_NAME;
    const serveUrl = process.env.REMOTION_APP_SERVE_URL;

    if (!functionName || !serveUrl) {
      throw new Error("Missing Remotion Lambda configuration. Run 'npm run setup:remotion' first.");
    }

    const formattedSlideNumber = formatSlideNumber(slideNumber);
    const storage = new StorageService(region);
    const paths = getPresentationPaths(presentationId, outputBucket);
    const slidePaths = paths.output(formattedSlideNumber);

    console.log(
      `Starting FULL render (audio + image + video) for presentation ${presentationId}, slide ${formattedSlideNumber}...`
    );

    // Step 1: Save slide text JSON
    await storage.saveSlideText(outputBucket, presentationId, formattedSlideNumber, slide);
    console.log(`Saved slide text`);

    // Step 2: Generate audio (always regenerate)
    console.log(`Generating audio...`);
    const audioResult = await generateSlideAudio(
      presentationId,
      formattedSlideNumber,
      slide.narration,
      outputBucket,
      voice
    );

    if (!audioResult.success) {
      throw new Error(`Failed to generate audio: ${audioResult.error}`);
    }
    console.log(`Audio generated: ${audioResult.audioUrl.substring(0, 80)}...`);

    // Step 3: Generate image (always regenerate)
    console.log(`Generating image...`);
    const imageResult = await generateSlideImage(
      presentationId,
      formattedSlideNumber,
      slide,
      outputBucket
    );

    if (!imageResult.success) {
      console.warn(`Image generation failed (continuing with video): ${imageResult.error}`);
    } else {
      console.log(`Image generated: ${imageResult.imageUrl}`);
    }

    // Step 4: Get accurate audio duration
    const tmpDir = require("os").tmpdir();
    // Use safe filename by replacing slashes
    const safePresId = presentationId.replace(/\//g, "-");
    const localAudioPath = `${tmpDir}/${safePresId}-${formattedSlideNumber}.mp3`;
    await storage.downloadFile(outputBucket, slidePaths.audio, localAudioPath);

    const metadata = await mm.parseFile(localAudioPath);
    const audioDuration = metadata.format.duration ?? 0;
    const fps = 30;
    const durationInFrames = Math.ceil(audioDuration * fps) + 5;

    console.log(`Audio duration: ${audioDuration}s, frames: ${durationInFrames}`);

    // Step 4.5: Cleanup old video render folder if exists (image cleanup happens in generateSlideImage)
    const videoCleanupResult = await storage.cleanupOldRender(
      outputBucket,
      presentationId,
      formattedSlideNumber,
      "video"
    );
    if (videoCleanupResult.cleaned) {
      console.log(`Cleaned up old video render folder: ${videoCleanupResult.oldRenderId}`);
    }

    // Step 5: Render video (using pre-generated image)
    console.log(`Rendering video...`);
    const optimalFramesPerLambda = Math.max(
      60,
      Math.ceil(durationInFrames / MAX_CONCURRENT_LAMBDAS)
    );

    const videoKey = slidePaths.video;

    // Get the image URL from the image generation result
    const preGeneratedImageUrl = imageResult.success ? imageResult.imageUrl : undefined;

    // Use presigned URL for Remotion Lambda to access audio
    // audioResult.audioPresignedUrl is already a fresh presigned URL from audio generation
    const audioUrlForRemotion =
      audioResult.audioPresignedUrl ||
      (await storage.getPresignedUrl(outputBucket, slidePaths.audio, 3600));

    const { renderId, bucketName } = await renderMediaOnLambda({
      region: region as any,
      functionName,
      serveUrl,
      composition: "SingleSlide",
      inputProps: {
        slide,
        audioUrl: audioUrlForRemotion, // Use presigned URL for Remotion
        durationInFrames,
        preGeneratedImageUrl, // Use pre-generated image
      },
      codec: "h264",
      imageFormat: "jpeg",
      maxRetries: 3,
      framesPerLambda: optimalFramesPerLambda,
      privacy: "public",
      outName: videoKey,
      overwrite: true,
      timeoutInMilliseconds: 1200000,
    });

    console.log(`Video render started: ${renderId}`);

    // Construct the ACTUAL video URL
    const videoUrl = storage.getRemotionOutputUrl(bucketName, renderId, videoKey);

    // Step 6: Save video render metadata
    const renderMetadataUrl = await storage.updateVideoRenderMetadata(
      bucketName,
      presentationId,
      formattedSlideNumber,
      {
        renderId,
        status: "rendering",
        url: videoUrl,
        duration: audioDuration,
        startedAt: new Date().toISOString(),
      }
    );

    // Also save audio URL to render metadata for UI playback
    const currentMetadata = await storage.loadRenderMetadata(
      bucketName,
      presentationId,
      formattedSlideNumber
    );
    if (currentMetadata) {
      (currentMetadata as any).audioUrl = audioResult.audioUrl;
      await storage.saveRenderMetadata(
        bucketName,
        presentationId,
        formattedSlideNumber,
        currentMetadata
      );
    }

    console.log(`Slide ${formattedSlideNumber} FULL render initiated!`);
    console.log(`- Audio: ${audioResult.audioUrl.substring(0, 50)}...`);
    console.log(`- Image: ${imageResult.success ? imageResult.imageUrl : "FAILED"}`);
    console.log(`- Video: ${videoUrl}`);

    return {
      success: true,
      slideId: slide.id,
      audioUrl: audioResult.audioUrl,
      videoUrl,
      duration: audioDuration,
      renderId,
      bucketName,
      presentationId,
      slideNumber: formattedSlideNumber,
      renderMetadataUrl,
      imageUrl: imageResult.success ? imageResult.imageUrl : undefined,
    };
  } catch (error) {
    console.error(`Error in full render for slide ${slideNumber}:`, error);
    return {
      success: false,
      slideId: slide.id,
      audioUrl: "",
      videoUrl: "",
      duration: 0,
      renderId: "",
      bucketName: "",
      presentationId,
      slideNumber: formatSlideNumber(slideNumber),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Render a single slide to video with proper presentation path structure
 * @deprecated Use renderSlideVideoOnly or renderSlideAll instead
 */
export async function renderSlideWithPaths(
  presentationId: string,
  slideNumber: string,
  slide: SlideInput,
  outputBucket: string,
  voice: string = "Ruth"
): Promise<GenerateSlideVideoResponse> {
  // Delegate to renderSlideAll for backward compatibility
  return renderSlideAll(presentationId, slideNumber, slide, outputBucket, voice);
}
