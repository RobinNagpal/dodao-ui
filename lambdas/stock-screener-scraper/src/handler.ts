import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { scrapeScreener, ScreenerFilters, ScreenerResult } from "./puppeteer/screener";

/* --------------------------- shared types & headers -------------------------- */

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
} as const;

interface RequestBody {
  marketCapMin?: string; // e.g., "Over 1B", "Over 10B"
  priceChange1DMin?: string; // e.g., "Over 1%", "Over 2%"
  limit?: number; // Number of stocks to return (default 15)
}

/* --------------------------------- helpers ---------------------------------- */

function parseBodyOr400(
  event: APIGatewayProxyEvent
):
  | { ok: true; filters: ScreenerFilters }
  | { ok: false; res: APIGatewayProxyResult } {
  try {
    const body: RequestBody = event.body ? JSON.parse(event.body) : {};
    
    const filters: ScreenerFilters = {
      marketCapMin: body.marketCapMin || "Over 1B",
      priceChange1DMin: body.priceChange1DMin || "Over 1%",
      limit: body.limit || 15,
    };

    return { ok: true, filters };
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

/* ----------------------------- main handler ------------------------------ */

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

