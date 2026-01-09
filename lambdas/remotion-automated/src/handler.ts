// AWS Lambda Handler Functions
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import type {
  GenerateSlideVideoRequest,
  GenerateSlideVideoResponse,
  ConcatenateVideosRequest,
  ConcatenateVideosResponse,
  GetRenderStatusRequest,
  GetRenderStatusResponse,
  SavePreferencesRequest,
  SavePreferencesResponse,
  GenerateFromPromptRequest,
  GenerateFromPromptResponse,
  GenerateSlideImageRequest,
  GenerateSlideAudioRequest,
  GetPresentationStatusRequest,
  GetPresentationStatusResponse,
  SlideAndScriptPreferences,
} from "./api/types";
import {
  renderSingleSlide,
  renderSlideVideoOnly,
  renderSlideAll,
  renderSlideWithPaths,
} from "./api/render-single-slide";
import { concatenateVideosRemotion } from "./api/concatenate-videos-remotion";
import { getRenderStatus as getRenderStatusService } from "./api/get-render-status";
import { StorageService, getPresentationPaths, formatSlideNumber } from "./api/storage-service";
import { generatePresentationContent } from "./api/gemini-service";
import { generateSlideImage } from "./api/image-generator";
import { generateSlideAudio } from "./api/tts-service";

/* --------------------------- shared types & headers -------------------------- */

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
} as const;

/* --------------------------------- helpers ---------------------------------- */

function parseBodyOr400(
  event: APIGatewayProxyEvent
): { ok: true; body: any } | { ok: false; res: APIGatewayProxyResult } {
  if (!event.body) {
    return {
      ok: false,
      res: {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: "Missing request body" }),
      },
    };
  }
  try {
    const body = JSON.parse(event.body);
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      res: {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: "Invalid JSON in request body" }),
      },
    };
  }
}

/* ========================= LEGACY HANDLERS (backward compatible) ========================= */

/**
 * Handler: Generate single slide video (legacy)
 * POST /generate-slide
 */
export const generateSlide = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Generate Slide Video request received");

  const parsed = parseBodyOr400(event);
  if (!parsed.ok) return parsed.res;

  const request: GenerateSlideVideoRequest = parsed.body;

  // Validate request
  if (!request.slide || !request.outputBucket) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: "Missing required fields: slide, outputBucket",
      }),
    };
  }

  try {
    let response: GenerateSlideVideoResponse;

    // Check if using new presentation path structure
    if (request.presentationId && request.slideNumber) {
      response = await renderSlideWithPaths(
        request.presentationId,
        request.slideNumber,
        request.slide,
        request.outputBucket,
        request.voice
      );
    } else {
      // Legacy mode
      response = await renderSingleSlide(
        request.slide,
        request.outputBucket,
        request.outputPrefix || "",
        request.voice
      );
    }

    return {
      statusCode: response.success ? 200 : 500,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error in generateSlide:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};

/**
 * Handler: Concatenate multiple videos
 * POST /concatenate-videos
 */
export const concatenateVideos = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Concatenate Videos request received");

  const parsed = parseBodyOr400(event);
  if (!parsed.ok) return parsed.res;

  const request: ConcatenateVideosRequest = parsed.body;

  // Validate request
  if (!request.videoUrls || !Array.isArray(request.videoUrls) || request.videoUrls.length === 0) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: "Missing or invalid videoUrls array",
      }),
    };
  }

  if (
    !request.renderIds ||
    !Array.isArray(request.renderIds) ||
    request.renderIds.length !== request.videoUrls.length
  ) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: "Missing or invalid renderIds array (must match videoUrls length)",
      }),
    };
  }

  if (!request.outputBucket || !request.outputKey) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: "Missing required fields: outputBucket, outputKey",
      }),
    };
  }

  try {
    const response: ConcatenateVideosResponse = await concatenateVideosRemotion(request);

    return {
      statusCode: response.success ? 200 : 500,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error in concatenateVideos:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};

/**
 * Handler: Get render status
 * POST /render-status
 */
export const getRenderStatus = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Get Render Status request received");

  const parsed = parseBodyOr400(event);
  if (!parsed.ok) return parsed.res;

  const request: GetRenderStatusRequest = parsed.body;

  // Validate request
  if (!request.renderId || !request.bucketName) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: "Missing required fields: renderId, bucketName",
      }),
    };
  }

  try {
    const response: GetRenderStatusResponse = await getRenderStatusService(request);

    return {
      statusCode: response.success ? 200 : 500,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error in getRenderStatus:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};

/* ========================= NEW HANDLERS ========================= */

/**
 * Handler: Save slide and script preferences
 * POST /save-preferences
 */
export const savePreferences = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Save Preferences request received");

  const parsed = parseBodyOr400(event);
  if (!parsed.ok) return parsed.res;

  const request: SavePreferencesRequest = parsed.body;

  // Validate request
  if (!request.presentationId || !request.slides || !request.outputBucket) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: "Missing required fields: presentationId, slides, outputBucket",
      }),
    };
  }

  try {
    const region = process.env.AWS_REGION || "us-east-1";
    const storage = new StorageService(region);

    // Build preferences object
    const preferences: SlideAndScriptPreferences = {
      presentationId: request.presentationId,
      slides: request.slides.map((s, i) => ({
        slideNumber: s.slideNumber || formatSlideNumber(i + 1),
        slide: s.slide,
      })),
      voice: request.voice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to S3
    const preferencesUrl = await storage.savePreferences(
      request.outputBucket,
      request.presentationId,
      preferences
    );

    const response: SavePreferencesResponse = {
      success: true,
      presentationId: request.presentationId,
      preferencesUrl,
      slideCount: request.slides.length,
    };

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error in savePreferences:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};

/**
 * Handler: Generate slides from prompt using Gemini AI
 * POST /generate-from-prompt
 */
export const generateFromPrompt = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Generate From Prompt request received");

  const parsed = parseBodyOr400(event);
  if (!parsed.ok) return parsed.res;

  const request: GenerateFromPromptRequest = parsed.body;

  // Validate request
  if (!request.presentationId || !request.prompt || !request.outputBucket) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: "Missing required fields: presentationId, prompt, outputBucket",
      }),
    };
  }

  try {
    const region = process.env.AWS_REGION || "us-east-1";
    const storage = new StorageService(region);

    // Step 1: Save the prompt
    const promptUrl = await storage.savePrompt(
      request.outputBucket,
      request.presentationId,
      request.prompt
    );
    console.log(`Prompt saved: ${promptUrl}`);

    // Step 2: Generate content using Gemini
    const generatedContent = await generatePresentationContent(
      request.presentationId,
      request.prompt,
      request.numberOfSlides || 5,
      request.additionalInstructions
    );

    // Step 3: Save generated content
    const generatedContentUrl = await storage.saveGeneratedContent(
      request.outputBucket,
      request.presentationId,
      generatedContent
    );
    console.log(`Generated content saved: ${generatedContentUrl}`);

    // Step 4: Also save as preferences for consistency
    const preferences: SlideAndScriptPreferences = {
      presentationId: request.presentationId,
      slides: generatedContent.slides.map((s) => ({
        slideNumber: s.slideNumber,
        slide: s.slide,
      })),
      voice: request.voice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storage.savePreferences(request.outputBucket, request.presentationId, preferences);

    const response: GenerateFromPromptResponse = {
      success: true,
      presentationId: request.presentationId,
      promptUrl,
      generatedContentUrl,
      slides: generatedContent.slides,
    };

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error in generateFromPrompt:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};

/**
 * Handler: Generate slide image
 * POST /generate-slide-image
 */
export const generateSlideImageHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Generate Slide Image request received");

  const parsed = parseBodyOr400(event);
  if (!parsed.ok) return parsed.res;

  const request: GenerateSlideImageRequest = parsed.body;

  // Validate request
  if (!request.presentationId || !request.slideNumber || !request.outputBucket) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: "Missing required fields: presentationId, slideNumber, outputBucket",
      }),
    };
  }

  try {
    const region = process.env.AWS_REGION || "us-east-1";
    const storage = new StorageService(region);
    const formattedSlideNumber = formatSlideNumber(request.slideNumber);

    // Load preferences to get slide content
    const preferences = await storage.loadPreferences(request.outputBucket, request.presentationId);

    if (!preferences) {
      return {
        statusCode: 404,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          success: false,
          error: "Preferences not found. Call /save-preferences or /generate-from-prompt first.",
        }),
      };
    }

    // Find the slide
    const slidePreference = preferences.slides.find(
      (s) => formatSlideNumber(s.slideNumber) === formattedSlideNumber
    );

    if (!slidePreference) {
      return {
        statusCode: 404,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          success: false,
          error: `Slide ${formattedSlideNumber} not found in preferences`,
        }),
      };
    }

    // Generate image
    const response = await generateSlideImage(
      request.presentationId,
      formattedSlideNumber,
      slidePreference.slide,
      request.outputBucket
    );

    return {
      statusCode: response.success ? 200 : 500,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error in generateSlideImageHandler:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};

/**
 * Handler: Generate slide audio
 * POST /generate-slide-audio
 */
export const generateSlideAudioHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Generate Slide Audio request received");

  const parsed = parseBodyOr400(event);
  if (!parsed.ok) return parsed.res;

  const request: GenerateSlideAudioRequest = parsed.body;

  // Validate request
  if (!request.presentationId || !request.slideNumber || !request.outputBucket) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: "Missing required fields: presentationId, slideNumber, outputBucket",
      }),
    };
  }

  try {
    const region = process.env.AWS_REGION || "us-east-1";
    const storage = new StorageService(region);
    const formattedSlideNumber = formatSlideNumber(request.slideNumber);

    // Load preferences to get narration
    const preferences = await storage.loadPreferences(request.outputBucket, request.presentationId);

    if (!preferences) {
      return {
        statusCode: 404,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          success: false,
          error: "Preferences not found. Call /save-preferences or /generate-from-prompt first.",
        }),
      };
    }

    // Find the slide
    const slidePreference = preferences.slides.find(
      (s) => formatSlideNumber(s.slideNumber) === formattedSlideNumber
    );

    if (!slidePreference) {
      return {
        statusCode: 404,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          success: false,
          error: `Slide ${formattedSlideNumber} not found in preferences`,
        }),
      };
    }

    // Generate audio
    const response = await generateSlideAudio(
      request.presentationId,
      formattedSlideNumber,
      slidePreference.slide.narration,
      request.outputBucket,
      request.voice || preferences.voice || "Ruth"
    );

    return {
      statusCode: response.success ? 200 : 500,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error in generateSlideAudioHandler:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};

/**
 * Handler: Generate slide video ONLY (requires existing audio)
 * POST /generate-slide-video
 *
 * Use this when audio already exists - does NOT regenerate audio.
 * Throws error if audio is not found.
 */
export const generateSlideVideoHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Generate Slide Video (video only) request received");

  const parsed = parseBodyOr400(event);
  if (!parsed.ok) return parsed.res;

  const request: {
    presentationId: string;
    slideNumber: string;
    outputBucket: string;
  } = parsed.body;

  // Validate request
  if (!request.presentationId || !request.slideNumber || !request.outputBucket) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: "Missing required fields: presentationId, slideNumber, outputBucket",
      }),
    };
  }

  try {
    const region = process.env.AWS_REGION || "us-east-1";
    const storage = new StorageService(region);
    const formattedSlideNumber = formatSlideNumber(request.slideNumber);

    // Load preferences to get slide content
    const preferences = await storage.loadPreferences(request.outputBucket, request.presentationId);

    if (!preferences) {
      return {
        statusCode: 404,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          success: false,
          error: "Preferences not found. Call /save-preferences or /generate-from-prompt first.",
        }),
      };
    }

    // Find the slide
    const slidePreference = preferences.slides.find(
      (s) => formatSlideNumber(s.slideNumber) === formattedSlideNumber
    );

    if (!slidePreference) {
      return {
        statusCode: 404,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          success: false,
          error: `Slide ${formattedSlideNumber} not found in preferences`,
        }),
      };
    }

    // Generate video only (uses existing audio)
    const response = await renderSlideVideoOnly(
      request.presentationId,
      formattedSlideNumber,
      slidePreference.slide,
      request.outputBucket
    );

    return {
      statusCode: response.success ? 200 : 500,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error in generateSlideVideoHandler:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};

/**
 * Handler: Generate ALL slide artifacts (audio + image + video)
 * POST /generate-slide-all
 *
 * Regenerates everything even if they exist.
 */
export const generateSlideAllHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Generate Slide All (audio + image + video) request received");

  const parsed = parseBodyOr400(event);
  if (!parsed.ok) return parsed.res;

  const request: {
    presentationId: string;
    slideNumber: string;
    outputBucket: string;
    voice?: string;
  } = parsed.body;

  // Validate request
  if (!request.presentationId || !request.slideNumber || !request.outputBucket) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: "Missing required fields: presentationId, slideNumber, outputBucket",
      }),
    };
  }

  try {
    const region = process.env.AWS_REGION || "us-east-1";
    const storage = new StorageService(region);
    const formattedSlideNumber = formatSlideNumber(request.slideNumber);

    // Load preferences to get slide content
    const preferences = await storage.loadPreferences(request.outputBucket, request.presentationId);

    if (!preferences) {
      return {
        statusCode: 404,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          success: false,
          error: "Preferences not found. Call /save-preferences or /generate-from-prompt first.",
        }),
      };
    }

    // Find the slide
    const slidePreference = preferences.slides.find(
      (s) => formatSlideNumber(s.slideNumber) === formattedSlideNumber
    );

    if (!slidePreference) {
      return {
        statusCode: 404,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          success: false,
          error: `Slide ${formattedSlideNumber} not found in preferences`,
        }),
      };
    }

    // Generate all: audio + image + video
    const response = await renderSlideAll(
      request.presentationId,
      formattedSlideNumber,
      slidePreference.slide,
      request.outputBucket,
      request.voice || preferences.voice || "Ruth"
    );

    return {
      statusCode: response.success ? 200 : 500,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error in generateSlideAllHandler:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};

/**
 * Handler: Get presentation status
 * POST /presentation-status
 */
export const getPresentationStatus = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Get Presentation Status request received");

  const parsed = parseBodyOr400(event);
  if (!parsed.ok) return parsed.res;

  const request: GetPresentationStatusRequest = parsed.body;

  // Validate request
  if (!request.presentationId || !request.outputBucket) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: "Missing required fields: presentationId, outputBucket",
      }),
    };
  }

  try {
    const region = process.env.AWS_REGION || "us-east-1";
    const storage = new StorageService(region);
    const paths = getPresentationPaths(request.presentationId, request.outputBucket);

    // Check what exists
    const [hasPreferences, hasPrompt, hasGeneratedContent] = await Promise.all([
      storage.objectExists(request.outputBucket, paths.inputs.preferences),
      storage.objectExists(request.outputBucket, paths.inputs.prompt),
      storage.objectExists(request.outputBucket, paths.middle.generatedContent),
    ]);

    // Get slide numbers
    const slideNumbers = await storage.getSlideNumbers(
      request.outputBucket,
      request.presentationId
    );

    // Check status of each slide
    const slideStatuses = await Promise.all(
      slideNumbers.map(async (slideNumber) => {
        const slidePaths = paths.output(slideNumber);
        const [hasText, hasAudioScript, hasAudio, renderMetadata] = await Promise.all([
          storage.objectExists(request.outputBucket, slidePaths.text),
          storage.objectExists(request.outputBucket, slidePaths.audioScript),
          storage.objectExists(request.outputBucket, slidePaths.audio),
          storage.loadRenderMetadata(request.outputBucket, request.presentationId, slideNumber),
        ]);

        // Image and video exist if they have completed render status with URL
        const hasImage =
          renderMetadata?.image?.status === "completed" && !!renderMetadata.image.url;
        const hasVideo =
          renderMetadata?.video?.status === "completed" && !!renderMetadata.video.url;

        return {
          slideNumber,
          hasText,
          hasImage,
          hasAudioScript,
          hasAudio,
          hasVideo,
          // Image render info
          imageStatus: renderMetadata?.image?.status,
          imageRenderId: renderMetadata?.image?.renderId,
          imageUrl: renderMetadata?.image?.url,
          // Video render info
          videoStatus: renderMetadata?.video?.status,
          videoRenderId: renderMetadata?.video?.renderId,
          videoUrl: renderMetadata?.video?.url,
        };
      })
    );

    const response: GetPresentationStatusResponse = {
      success: true,
      presentationId: request.presentationId,
      hasPreferences,
      hasPrompt,
      hasGeneratedContent,
      slides: slideStatuses,
    };

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error in getPresentationStatus:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};

/* ------------------------------ OPTIONS helper ------------------------------ */

export const handleOptions = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
    body: "",
  };
};

/* ----------------------------------- ROUTER --------------------------------- */

function normPath(p?: string | null): string {
  if (!p) return "/";
  const clean = p.replace(/^\/+|\/+$/g, "").toLowerCase();
  return `/${clean}`;
}

export const api = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method =
    event.httpMethod?.toUpperCase() || event.requestContext?.http?.method?.toUpperCase() || "GET";
  const path = normPath(event.path || event.rawPath);

  console.log(`Router: ${method} ${path}`);

  // Handle OPTIONS preflight
  if (method === "OPTIONS") {
    return handleOptions();
  }

  // Route matching
  if (method === "POST") {
    switch (path) {
      // Legacy endpoints
      case "/generate-slide":
        return generateSlide(event);
      case "/concatenate-videos":
        return concatenateVideos(event);
      case "/render-status":
        return getRenderStatus(event);

      // New endpoints
      case "/save-preferences":
        return savePreferences(event);
      case "/generate-from-prompt":
        return generateFromPrompt(event);
      case "/generate-slide-image":
        return generateSlideImageHandler(event);
      case "/generate-slide-audio":
        return generateSlideAudioHandler(event);
      case "/generate-slide-video":
        return generateSlideVideoHandler(event);
      case "/generate-slide-all":
        return generateSlideAllHandler(event);
      case "/presentation-status":
        return getPresentationStatus(event);
    }
  }

  // Health check
  if (method === "GET" && (path === "/" || path === "/health")) {
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        status: "healthy",
        service: "remotion-automated",
        timestamp: new Date().toISOString(),
        endpoints: [
          "POST /generate-slide (legacy)",
          "POST /concatenate-videos",
          "POST /render-status",
          "POST /save-preferences",
          "POST /generate-from-prompt",
          "POST /generate-slide-image",
          "POST /generate-slide-audio",
          "POST /generate-slide-video (video only, requires audio)",
          "POST /generate-slide-all (audio + image + video)",
          "POST /presentation-status",
        ],
      }),
    };
  }

  // 404 Not Found
  return {
    statusCode: 404,
    headers: JSON_HEADERS,
    body: JSON.stringify({
      error: "Not Found",
      message: `No handler for ${method} ${path}`,
    }),
  };
};
