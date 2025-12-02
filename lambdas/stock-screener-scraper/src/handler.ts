import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
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

/* ------------------------------ OPTIONS helper ------------------------------ */

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

/* ------------------------------ async handler with callback ------------------------------ */

/**
 * Processes screener scraping in background and calls back with results
 */
async function processAndCallback(
  filters: ScreenerFilters,
  callbackUrl: string,
  moverType: DailyMoverType,
  spaceId: string
): Promise<void> {
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
    } else {
      console.log(`[Screener] Callback successful for ${moverType}`);
    }
  } catch (error) {
    console.error(`[Screener] Error in background processing:`, error);
  }
}

/* ----------------------------- main handler ------------------------------ */

export const fetchScreenedStocks = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    
    const { filters, callbackUrl, moverType, spaceId } = parsed;
    
    // If callback URL is provided, return immediately and process in background
    if (callbackUrl && moverType && spaceId) {
      console.log(`[Screener] Async mode: Returning immediately, will callback to ${callbackUrl}`);
      
      // Start background processing (don't await)
      processAndCallback(filters, callbackUrl, moverType, spaceId).catch((err) => {
        console.error(`[Screener] Background processing error:`, err);
      });
      
      // Return immediate acknowledgment
      return {
        statusCode: 202,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          message: "Request accepted. Processing in background.",
          filters,
          moverType,
          spaceId,
        }),
      };
    }
    
    // Synchronous mode (original behavior for backwards compatibility)
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

/* ----------------------------------- ROUTER --------------------------------- */

function normPath(p?: string | null): string {
  const raw = (p || "/").toLowerCase();
  if (raw === "/") return "/";
  return raw.replace(/\/+$/, ""); // strip trailing slashes
}

export const api = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const method = (event as any)?.requestContext?.http?.method || "GET";
  const rawPath =
    (event as any)?.rawPath ||
    (event as any)?.requestContext?.http?.path ||
    "/";
  const path = normPath(rawPath);

  // Preflight/CORS handled here
  if (method === "OPTIONS") return handleOptions();

  if (method !== "POST") {
    return {
      statusCode: 405,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: `Method ${method} not allowed` }),
    };
  }

  // Map paths to handlers
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
