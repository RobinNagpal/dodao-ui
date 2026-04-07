import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import {
  scrapeEtfQuote,
  ScrapeSection,
  EtfQuoteResult,
} from "./puppeteer/etf-quote";

/* --------------------------- shared types & headers -------------------------- */

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
} as const;

interface RequestBody {
  url: string;
  sections?: ScrapeSection[];
}

/* --------------------------------- helpers ---------------------------------- */

function parseBodyOr400(
  event: APIGatewayProxyEvent
):
  | { ok: true; url: string; sections: ScrapeSection[] }
  | { ok: false; res: APIGatewayProxyResult } {
  if (!event.body) {
    return {
      ok: false,
      res: {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: "Request body is required" }),
      },
    };
  }
  try {
    const body: RequestBody = JSON.parse(event.body);
    const url = body?.url;
    if (!url) {
      return {
        ok: false,
        res: {
          statusCode: 400,
          headers: JSON_HEADERS,
          body: JSON.stringify({ error: "url is required" }),
        },
      };
    }
    const sections: ScrapeSection[] = body?.sections ?? ["all"];
    return { ok: true, url, sections };
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
  url: string;
  section: string;
  data: unknown;
  errors?: unknown[];
}): APIGatewayProxyResult {
  const { url, section, data, errors = [] } = params;
  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({ url, section, data, errors }),
  };
}

function errorResponse(
  statusCode: number,
  error: string,
  details?: string
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify({ error, ...(details ? { details } : {}) }),
  };
}

/* ----------------------------- endpoint handlers ----------------------------- */

export const fetchOverview = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url } = parsed;

    const result = await scrapeEtfQuote(url, ["overview"]);
    return okResponse({
      url,
      section: "overview",
      data: result.overview,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error("fetchOverview error:", error);
    return errorResponse(500, "Internal server error", error?.message);
  }
};

export const fetchAnalysis = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url } = parsed;

    const result = await scrapeEtfQuote(url, ["analysis"]);
    return okResponse({
      url,
      section: "analysis",
      data: result.analysis,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error("fetchAnalysis error:", error);
    return errorResponse(500, "Internal server error", error?.message);
  }
};

export const fetchReturns = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url } = parsed;

    const result = await scrapeEtfQuote(url, ["returns"]);
    return okResponse({
      url,
      section: "returns",
      data: result.returns,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error("fetchReturns error:", error);
    return errorResponse(500, "Internal server error", error?.message);
  }
};

export const fetchHoldings = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url } = parsed;

    const result = await scrapeEtfQuote(url, ["holdings"]);
    return okResponse({
      url,
      section: "holdings",
      data: result.holdings,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error("fetchHoldings error:", error);
    return errorResponse(500, "Internal server error", error?.message);
  }
};

export const fetchStrategy = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url } = parsed;

    const result = await scrapeEtfQuote(url, ["strategy"]);
    return okResponse({
      url,
      section: "strategy",
      data: result.strategy,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error("fetchStrategy error:", error);
    return errorResponse(500, "Internal server error", error?.message);
  }
};

export const fetchAll = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url, sections } = parsed;

    const result = await scrapeEtfQuote(url, sections);
    return okResponse({
      url,
      section: sections.join(","),
      data: {
        overview: result.overview,
        analysis: result.analysis,
        returns: result.returns,
        holdings: result.holdings,
        strategy: result.strategy,
      },
      errors: result.errors,
    });
  } catch (error: any) {
    console.error("fetchAll error:", error);
    return errorResponse(500, "Internal server error", error?.message);
  }
};

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

/* ----------------------------------- ROUTER --------------------------------- */

function normPath(p?: string | null): string {
  const raw = (p || "/").toLowerCase();
  if (raw === "/") return "/";
  return raw.replace(/\/+$/, "");
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

  if (method === "OPTIONS") return handleOptions();

  if (method !== "POST") {
    return errorResponse(405, `Method ${method} not allowed`);
  }

  switch (path) {
    case "/overview":
      return fetchOverview(event);
    case "/analysis":
      return fetchAnalysis(event);
    case "/returns":
      return fetchReturns(event);
    case "/holdings":
      return fetchHoldings(event);
    case "/strategy":
      return fetchStrategy(event);
    case "/all":
    case "/":
      return fetchAll(event);
    default:
      return errorResponse(404, `No route for ${method} ${path}`);
  }
};
