// Image Generator Service - Generate slide images using Remotion Lambda
import { renderStillOnLambda } from "@remotion/lambda";
import type { SlideInput, GenerateSlideImageResponse } from "./types";
import { StorageService, getPresentationPaths, formatSlideNumber } from "./storage-service";

/**
 * Generate a PNG image of a slide using Remotion Lambda
 */
export async function generateSlideImage(
  presentationId: string,
  slideNumber: string,
  slide: SlideInput,
  outputBucket: string
): Promise<GenerateSlideImageResponse> {
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
      `Generating image for presentation ${presentationId}, slide ${formattedSlideNumber}...`
    );

    // Step 0: Cleanup old render folder if exists (important for regeneration)
    const cleanupResult = await storage.cleanupOldRender(
      outputBucket,
      presentationId,
      formattedSlideNumber,
      "image"
    );
    if (cleanupResult.cleaned) {
      console.log(`Cleaned up old image render folder: ${cleanupResult.oldRenderId}`);
    }

    // Step 1: Save slide text JSON
    const textUrl = await storage.saveSlideText(
      outputBucket,
      presentationId,
      formattedSlideNumber,
      slide
    );
    console.log(`Saved slide text: ${textUrl}`);

    // Step 2: Render still image using Remotion Lambda
    // Note: Remotion stores output at renders/{renderId}/{outName}
    const imageOutName = slidePaths.image;

    console.log(`Rendering image with outName: ${imageOutName}`);

    const startedAt = new Date().toISOString();

    const { renderId, bucketName } = await renderStillOnLambda({
      region: region as any,
      functionName,
      serveUrl,
      composition: "SingleSlide",
      inputProps: {
        slide,
        audioUrl: undefined, // No audio for still image
        durationInFrames: 30, // Doesn't matter for still
      },
      imageFormat: "png",
      privacy: "public",
      outName: imageOutName,
      frame: 0, // Render first frame
      maxRetries: 3,
    });

    // Construct the ACTUAL image URL (with renders/{renderId}/ prefix)
    const imageUrl = storage.getRemotionOutputUrl(bucketName, renderId, imageOutName);

    console.log(`Image render started: ${renderId}`);
    console.log(`Actual image URL: ${imageUrl}`);

    // Step 3: Save image render metadata
    await storage.updateImageRenderMetadata(bucketName, presentationId, formattedSlideNumber, {
      renderId,
      status: "completed", // renderStillOnLambda is synchronous
      url: imageUrl,
      startedAt,
      completedAt: new Date().toISOString(),
    });

    console.log(`Image generated successfully: ${imageUrl}`);

    return {
      success: true,
      presentationId,
      slideNumber: formattedSlideNumber,
      textUrl,
      imageUrl,
      renderId,
    };
  } catch (error) {
    console.error(`Error generating image for slide ${slideNumber}:`, error);

    // Try to save error metadata
    try {
      const region = process.env.REMOTION_APP_REGION || "us-east-1";
      const storage = new StorageService(region);
      const formattedSlideNumber = formatSlideNumber(slideNumber);

      await storage.updateImageRenderMetadata(outputBucket, presentationId, formattedSlideNumber, {
        renderId: "",
        status: "failed",
        startedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
    } catch {
      // Ignore metadata save errors
    }

    return {
      success: false,
      presentationId,
      slideNumber: formatSlideNumber(slideNumber),
      textUrl: "",
      imageUrl: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Generate images for all slides in a presentation
 */
export async function generateAllSlideImages(
  presentationId: string,
  slides: Array<{ slideNumber: string; slide: SlideInput }>,
  outputBucket: string
): Promise<GenerateSlideImageResponse[]> {
  console.log(`Generating images for ${slides.length} slides...`);

  // Process slides sequentially to avoid overwhelming Lambda concurrency
  const results: GenerateSlideImageResponse[] = [];

  for (const { slideNumber, slide } of slides) {
    const result = await generateSlideImage(presentationId, slideNumber, slide, outputBucket);
    results.push(result);

    if (!result.success) {
      console.error(`Failed to generate image for slide ${slideNumber}: ${result.error}`);
    }
  }

  return results;
}
