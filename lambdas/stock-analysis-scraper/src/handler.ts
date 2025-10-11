import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  scrapeIncomeStatementAnnual,
  scrapeIncomeStatementAnnualRaw,
  scrapeIncomeStatementAnnualStrict,
} from "./cheerio/income-statement-annual";
import {
  scrapeIncomeStatementQuarterly,
  scrapeIncomeStatementQuarterlyRaw,
  scrapeIncomeStatementQuarterlyStrict,
} from "./cheerio/income-statement-quarterly";
import { scrapeFundamentalsSummary } from "./cheerio/fundamentals-summary";

type FetchArticleRequestBody = { url: string };

// simple URL joiner that preserves exactly one slash between parts
function joinUrl(base: string, path: string): string {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${b}/${p}`;
}

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
} as const;

export const scrapeTickerInfo = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: "Request body is required" }),
      };
    }

    const body: FetchArticleRequestBody = JSON.parse(event.body);
    const { url } = body || {};
    if (!url) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: "url is required" }),
      };
    }

    // Build sub-URLs
    const annualUrl = joinUrl(url, "financials/");
    const quarterlyUrl = joinUrl(url, "financials/?p=quarterly");

    // Kick off everything in parallel
    const [
      summaryRes,
      annualNormRes,
      annualRawRes,
      annualStrictRes,
      qNormRes,
      qRawRes,
      qStrictRes,
    ] = await Promise.all([
      scrapeFundamentalsSummary(url),
      scrapeIncomeStatementAnnual(annualUrl),
      scrapeIncomeStatementAnnualRaw(annualUrl),
      scrapeIncomeStatementAnnualStrict(annualUrl),
      scrapeIncomeStatementQuarterly(quarterlyUrl),
      scrapeIncomeStatementQuarterlyRaw(quarterlyUrl),
      scrapeIncomeStatementQuarterlyStrict(quarterlyUrl),
    ]);

    // Uniform response shape
    const response = {
      tickerUrl: url,

      summary: {
        data: summaryRes.financialSummary, // already flat
        errors: summaryRes.errors ?? [],
      },

      incomeStatement: {
        annual: {
          raw: annualRawRes.incomeStatementAnnual, // { meta, periods }
          normalized: annualNormRes.incomeStatementAnnual, // { meta, periods }
          strict: annualStrictRes.incomeStatementAnnual, // { meta, periods }
          errors: {
            raw: annualRawRes.errors ?? [],
            normalized: annualNormRes.errors ?? [],
            strict: annualStrictRes.errors ?? [],
          },
        },
        quarterly: {
          raw: qRawRes.incomeStatementQuarterly, // { meta, periods }
          normalized: qNormRes.incomeStatementQuarterly, // { meta, periods }
          strict: qStrictRes.incomeStatementQuarterly, // { meta, periods }
          errors: {
            raw: qRawRes.errors ?? [],
            normalized: qNormRes.errors ?? [],
            strict: qStrictRes.errors ?? [],
          },
        },
      },
    };

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    console.error("scrapeTickerInfo error:", error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        error: "Internal server error",
        details: error?.message,
      }),
    };
  }
};

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
