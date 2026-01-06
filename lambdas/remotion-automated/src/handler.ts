// AWS Lambda Handler Functions
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import type {
  GenerateSlideVideoRequest,
  GenerateSlideVideoResponse,
  ConcatenateVideosRequest,
  ConcatenateVideosResponse,
  GetRenderStatusRequest,
  GetRenderStatusResponse,
} from "./api/types";
import { renderSingleSlide } from "./api/render-single-slide";
import { concatenateVideosRemotion } from "./api/concatenate-videos-remotion";
import { getRenderStatus as getRenderStatusService } from "./api/get-render-status";

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

/* ------------------------------ Specific handlers ------------------------------ */

/**
 * Handler: Generate single slide video
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
    const response: GenerateSlideVideoResponse = await renderSingleSlide(
      request.slide,
      request.outputBucket,
      request.outputPrefix || "",
      request.voice
    );

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
    // Use Remotion Lambda for concatenation (async)
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
      case "/generate-slide":
        return generateSlide(event);
      case "/concatenate-videos":
        return concatenateVideos(event);
      case "/render-status":
        return getRenderStatus(event);
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
