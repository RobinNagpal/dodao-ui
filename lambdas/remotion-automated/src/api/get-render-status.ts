// Get Render Status Service
import { getRenderProgress } from "@remotion/lambda";
import type { GetRenderStatusRequest, GetRenderStatusResponse } from "./types";

/**
 * Get the status of a Remotion Lambda render
 */
export async function getRenderStatus(
  request: GetRenderStatusRequest
): Promise<GetRenderStatusResponse> {
  try {
    const region = process.env.REMOTION_APP_REGION || "us-east-1";
    const functionName = process.env.REMOTION_APP_FUNCTION_NAME;

    if (!functionName) {
      throw new Error("Missing Remotion Lambda configuration");
    }

    console.log(`Checking render status for ${request.renderId}...`);

    const progress = await getRenderProgress({
      renderId: request.renderId,
      bucketName: request.bucketName,
      functionName,
      region: region as any,
    });

    console.log(`Render progress:`, {
      done: progress.done,
      overallProgress: progress.overallProgress,
      outputFile: progress.outputFile,
    });

    // outputFile is already a full URL when done
    const outputUrl = progress.done && progress.outputFile ? progress.outputFile : undefined;

    // Extract error messages if any
    const errors =
      progress.errors && progress.errors.length > 0
        ? progress.errors.map((e: any) => {
            if (typeof e === "string") return e;
            if (e.message) return e.message;
            return JSON.stringify(e);
          })
        : undefined;

    return {
      success: true,
      renderId: request.renderId,
      done: progress.done,
      overallProgress: progress.overallProgress,
      outputFile: progress.outputFile ?? undefined,
      outputUrl,
      errors,
      currentStep: !progress.done ? getProgressStep(progress.overallProgress) : "Complete",
    };
  } catch (error) {
    console.error("Error getting render status:", error);
    return {
      success: false,
      renderId: request.renderId,
      done: false,
      overallProgress: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Helper to get human-readable progress step
 */
function getProgressStep(progress: number): string {
  if (progress < 0.1) return "Initializing";
  if (progress < 0.3) return "Downloading assets";
  if (progress < 0.9) return "Rendering frames";
  if (progress < 0.95) return "Encoding video";
  if (progress < 1.0) return "Uploading to S3";
  return "Complete";
}
