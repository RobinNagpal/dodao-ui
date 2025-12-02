import { APIGatewayProxyEvent, APIGatewayProxyResult, LambdaFunctionURLEvent } from "aws-lambda";
import { ResponseStream, streamifyResponse } from "lambda-stream";
import { scrapeScreener, ScreenerFilters, ScreenerResult } from "./puppeteer/screener";

/* --------------------------- shared types & headers -------------------------- */

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
} as const;

export enum DailyMoverType {
  GAINER = 'gainer',
  LOSER = 'loser',
}

interface RequestBody {
  marketCapMin?: string; // e.g., "Over 1B", "Over 10B"
  priceChange1DMin?: string; // e.g., "Over 1%", "Over 2%"
  limit?: number; // Number of stocks to return (default 15)
  callbackUrl?: string; // URL to call back with results
  moverType?: DailyMoverType; // Type of mover for callback
  spaceId?: string; // Space ID for callback
}

interface CallbackPayload {
  filters: ScreenerFilters;
  totalMatched: number;
  count: number;
  stocks: ScreenerResult["stocks"];
  errors: ScreenerResult["errors"];
  moverType: DailyMoverType;
  spaceId: string;
}

/* --------------------------------- helpers ---------------------------------- */

function parseBody(body: string | null | undefined, isBase64Encoded?: boolean): RequestBody {
  if (!body) return {};
  
  try {
    const decoded = isBase64Encoded 
      ? Buffer.from(body, "base64").toString() 
      : body;
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

function getFilters(body: RequestBody): ScreenerFilters {
  return {
    marketCapMin: body.marketCapMin || "Over 1B",
    priceChange1DMin: body.priceChange1DMin || "Over 1%",
    limit: body.limit || 15,
  };
}

/* ------------------------------ Streaming handler (async with callback) ------------------------------ */

/**
 * Streaming handler for async mode with callback
 * Uses Lambda Function URL with response streaming to return immediately
 * while continuing to process in the background
 */
async function streamingHandler(
  event: LambdaFunctionURLEvent,
  responseStream: ResponseStream
): Promise<void> {
  const body = parseBody(event.body, event.isBase64Encoded);
  const filters = getFilters(body);
  const { callbackUrl, moverType, spaceId } = body;

  // Set content type for the response
  responseStream.setContentType("application/json");

  // If callback URL is provided, return immediately and process in background
  if (callbackUrl && moverType && spaceId) {
    console.log(`[Screener] Async mode: Returning immediately, will callback to ${callbackUrl}`);
    
    // Write immediate acknowledgment response
    responseStream.write(
      JSON.stringify({
        message: "Request accepted. Processing in background.",
        filters,
        moverType,
        spaceId,
      })
    );
    responseStream.end();

    // Now continue processing in background (Lambda stays alive because we used streamifyResponse)
    try {
      console.log(`[Screener] Starting background scraping for ${moverType}...`);
      
      // Scrape the data
      const result = await scrapeScreener(filters);
      
      console.log(`[Screener] Scraping complete. Found ${result.stocks.length} stocks. Calling back to ${callbackUrl}`);
      
      // Prepare callback payload
      const payload: CallbackPayload = {
        filters,
        totalMatched: result.totalMatched,
        count: result.stocks.length,
        stocks: result.stocks,
        errors: result.errors,
        moverType,
        spaceId,
      };
      
      // Call the callback URL with results
      const response = await fetch(callbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        console.error(`[Screener] Callback failed with status: ${response.status}`);
        const responseText = await response.text();
        console.error(`[Screener] Callback response: ${responseText}`);
      } else {
        console.log(`[Screener] Callback successful for ${moverType}`);
      }
    } catch (error) {
      console.error(`[Screener] Error in background processing:`, error);
    }
    
    return;
  }

  // Synchronous mode - scrape and return results directly
  try {
    const result = await scrapeScreener(filters);
    
    responseStream.write(
      JSON.stringify({
        filters,
        totalMatched: result.totalMatched,
        count: result.stocks.length,
        stocks: result.stocks,
        errors: result.errors,
      })
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Screener error:", error);
    
    responseStream.write(
      JSON.stringify({
        error: "Internal server error",
        details: message,
      })
    );
  }
  
  responseStream.end();
}

// Export the streaming handler wrapped with streamifyResponse
export const api = streamifyResponse(streamingHandler);

/* ============================== LEGACY API GATEWAY HANDLERS ============================== */
/* These are kept for backwards compatibility if using API Gateway instead of Function URL */

function parseBodyOr400(
  event: APIGatewayProxyEvent
):
  | { ok: true; filters: ScreenerFilters; callbackUrl?: string; moverType?: DailyMoverType; spaceId?: string }
  | { ok: false; res: APIGatewayProxyResult } {
  try {
    const body: RequestBody = event.body ? JSON.parse(event.body) : {};
    
    const filters: ScreenerFilters = {
      marketCapMin: body.marketCapMin || "Over 1B",
      priceChange1DMin: body.priceChange1DMin || "Over 1%",
      limit: body.limit || 15,
    };

    return { 
      ok: true, 
      filters, 
      callbackUrl: body.callbackUrl,
      moverType: body.moverType,
      spaceId: body.spaceId,
    };
  } catch {
    return {
      ok: false,
      res: {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: "Invalid JSON body" }),
      },
    };
  }
}

function okResponse(params: {
  filters: ScreenerFilters;
  result: ScreenerResult;
}): APIGatewayProxyResult {
  const { filters, result } = params;
  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({
      filters,
      totalMatched: result.totalMatched,
      count: result.stocks.length,
      stocks: result.stocks,
      errors: result.errors,
    }),
  };
}

export const handleOptions = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      ...JSON_HEADERS,
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    },
    body: "",
  };
};

/**
 * Legacy API Gateway handler - synchronous only
 * For async mode, use the Function URL with streaming (api handler)
 */
export const fetchScreenedStocks = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    
    const { filters } = parsed;
    const result = await scrapeScreener(filters);
    return okResponse({ filters, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("fetchScreenedStocks error:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        error: "Internal server error",
        details: message,
      }),
    };
  }
};

/* Legacy router for API Gateway - kept for backwards compatibility */
function normPath(p?: string | null): string {
  const raw = (p || "/").toLowerCase();
  if (raw === "/") return "/";
  return raw.replace(/\/+$/, "");
}

export const legacyApi = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const method = (event as any)?.requestContext?.http?.method || "GET";
  const rawPath =
    (event as any)?.rawPath ||
    (event as any)?.requestContext?.http?.path ||
    "/";
  const path = normPath(rawPath);

  if (method === "OPTIONS") return handleOptions();

  if (method !== "POST") {
    return {
      statusCode: 405,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: `Method ${method} not allowed` }),
    };
  }

  switch (path) {
    case "/screener":
    case "/":
      return fetchScreenedStocks(event);

    default:
      return {
        statusCode: 404,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: `No route for ${method} ${path}` }),
      };
  }
};
