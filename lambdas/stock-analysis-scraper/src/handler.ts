import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// Summary
import { scrapeFundamentalsSummary } from "./cheerio/fundamentals-summary";

// Income
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

// Balance Sheet
import {
  scrapeBalanceSheetAnnual,
  scrapeBalanceSheetAnnualRaw,
  scrapeBalanceSheetAnnualStrict,
} from "./cheerio/balance-sheet-annual";
import {
  scrapeBalanceSheetQuarterly,
  scrapeBalanceSheetQuarterlyRaw,
  scrapeBalanceSheetQuarterlyStrict,
} from "./cheerio/balance-sheet-quarterly";

// Cash Flow
import {
  scrapeCashFlowAnnual,
  scrapeCashFlowAnnualRaw,
  scrapeCashFlowAnnualStrict,
} from "./cheerio/cashflow-annual";
import {
  scrapeCashFlowQuarterly,
  scrapeCashFlowQuarterlyRaw,
  scrapeCashFlowQuarterlyStrict,
} from "./cheerio/cashflow-quarterly";

// Dividends
import { scrapeDividends } from "./cheerio/dividends";

// Ratios
import {
  scrapeRatiosAnnual,
  scrapeRatiosAnnualRaw,
  scrapeRatiosAnnualStrict,
} from "./cheerio/ratios-annual";
import {
  scrapeRatiosQuarterly,
  scrapeRatiosQuarterlyRaw,
  scrapeRatiosQuarterlyStrict,
} from "./cheerio/ratios-quarterly";

type FetchArticleRequestBody = { url: string };
type View = "normal" | "raw" | "strict";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
} as const;

function joinUrl(base: string, path: string): string {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${b}/${p}`;
}

function parseBodyOr400(
  event: APIGatewayProxyEvent
): { ok: true; url: string } | { ok: false; res: APIGatewayProxyResult } {
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
    const body: FetchArticleRequestBody = JSON.parse(event.body);
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
    return { ok: true, url };
  } catch (e) {
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

function buildSubUrls(root: string) {
  return {
    incomeAnnualUrl: joinUrl(root, "financials/"),
    incomeQuarterlyUrl: joinUrl(root, "financials/?p=quarterly"),
    balanceAnnualUrl: joinUrl(root, "financials/balance-sheet/"),
    balanceQuarterlyUrl: joinUrl(root, "financials/balance-sheet/?p=quarterly"),
    cashAnnualUrl: joinUrl(root, "financials/cash-flow-statement/"),
    cashQuarterlyUrl: joinUrl(
      root,
      "financials/cash-flow-statement/?p=quarterly"
    ),
    dividendsUrl: joinUrl(root, "dividend/"),
    ratiosAnnualUrl: joinUrl(root, "financials/ratios/"),
    ratiosQuarterlyUrl: joinUrl(root, "financials/ratios/?p=quarterly"),
  };
}

/* ───────────────────────── NORMAL (normalized only) ───────────────────────── */

export const scrapeTickerInfoNormal = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url } = parsed;
    const {
      incomeAnnualUrl,
      incomeQuarterlyUrl,
      balanceAnnualUrl,
      balanceQuarterlyUrl,
      cashAnnualUrl,
      cashQuarterlyUrl,
      dividendsUrl,
      ratiosAnnualUrl,
      ratiosQuarterlyUrl,
    } = buildSubUrls(url);

    // sequential awaits (no Promise.all)
    const summaryRes = await scrapeFundamentalsSummary(url);

    // income
    const incAnn = await scrapeIncomeStatementAnnual(incomeAnnualUrl);
    const incQ = await scrapeIncomeStatementQuarterly(incomeQuarterlyUrl);

    // balance
    const balAnn = await scrapeBalanceSheetAnnual(balanceAnnualUrl);
    const balQ = await scrapeBalanceSheetQuarterly(balanceQuarterlyUrl);

    // cash flow
    const cfAnn = await scrapeCashFlowAnnual(cashAnnualUrl);
    const cfQ = await scrapeCashFlowQuarterly(cashQuarterlyUrl);

    // ratios
    const ratiosAnn = await scrapeRatiosAnnual(ratiosAnnualUrl);
    const ratiosQ = await scrapeRatiosQuarterly(ratiosQuarterlyUrl);

    // dividends
    const dividendsRes = await scrapeDividends(dividendsUrl);

    const response = {
      tickerUrl: url,
      view: "normal" as View,
      summary: {
        data: summaryRes.financialSummary,
        errors: summaryRes.errors ?? [],
      },
      financials: {
        income: {
          annual: incAnn.incomeStatementAnnual,
          quarterly: incQ.incomeStatementQuarterly,
        },
        balanceSheet: {
          annual: balAnn.balanceSheetAnnual,
          quarterly: balQ.balanceSheetQuarterly,
        },
        cashFlow: {
          annual: cfAnn.cashFlowAnnual,
          quarterly: cfQ.cashFlowQuarterly,
        },
        ratios: {
          annual: ratiosAnn.ratiosAnnual,
          quarterly: ratiosQ.ratiosQuarterly,
        },
      },
      dividends: {
        data: dividendsRes.dividends,
        errors: dividendsRes.errors ?? [],
      },
    };

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    console.error("scrapeTickerInfoNormal error:", error);
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

/* ───────────────────────────── RAW (original labels) ──────────────────────── */

export const scrapeTickerInfoRaw = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    console.log("parsed:", parsed);
    const { url } = parsed;

    const {
      incomeAnnualUrl,
      incomeQuarterlyUrl,
      balanceAnnualUrl,
      balanceQuarterlyUrl,
      cashAnnualUrl,
      cashQuarterlyUrl,
      dividendsUrl,
      ratiosAnnualUrl,
      ratiosQuarterlyUrl,
    } = buildSubUrls(url);

    const summaryRes = await scrapeFundamentalsSummary(url);

    // income
    const incAnnRaw = await scrapeIncomeStatementAnnualRaw(incomeAnnualUrl);
    const incQRaw = await scrapeIncomeStatementQuarterlyRaw(incomeQuarterlyUrl);

    // balance
    const balAnnRaw = await scrapeBalanceSheetAnnualRaw(balanceAnnualUrl);
    const balQRaw = await scrapeBalanceSheetQuarterlyRaw(balanceQuarterlyUrl);

    // cash flow
    const cfAnnRaw = await scrapeCashFlowAnnualRaw(cashAnnualUrl);
    const cfQRaw = await scrapeCashFlowQuarterlyRaw(cashQuarterlyUrl);

    // ratios
    const ratiosAnnRaw = await scrapeRatiosAnnualRaw(ratiosAnnualUrl);
    const ratiosQRaw = await scrapeRatiosQuarterlyRaw(ratiosQuarterlyUrl);

    // dividends
    const dividendsRes = await scrapeDividends(dividendsUrl);

    const response = {
      tickerUrl: url,
      view: "raw" as View,
      summary: {
        data: summaryRes.financialSummary,
        errors: summaryRes.errors ?? [],
      },
      financials: {
        income: {
          annual: incAnnRaw.incomeStatementAnnual,
          quarterly: incQRaw.incomeStatementQuarterly,
        },
        balanceSheet: {
          annual: balAnnRaw.balanceSheetAnnual,
          quarterly: balQRaw.balanceSheetQuarterly,
        },
        cashFlow: {
          annual: cfAnnRaw.cashFlowAnnual,
          quarterly: cfQRaw.cashFlowQuarterly,
        },
        ratios: {
          annual: ratiosAnnRaw.ratiosAnnual,
          quarterly: ratiosQRaw.ratiosQuarterly,
        },
      },
      dividends: {
        data: dividendsRes.dividends,
        errors: dividendsRes.errors ?? [],
      },
    };

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    console.error("scrapeTickerInfoRaw error:", error);
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

/* ─────────────────────────── STRICT (allow-listed keys) ───────────────────── */

export const scrapeTickerInfoStrict = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url } = parsed;
    const {
      incomeAnnualUrl,
      incomeQuarterlyUrl,
      balanceAnnualUrl,
      balanceQuarterlyUrl,
      cashAnnualUrl,
      cashQuarterlyUrl,
      dividendsUrl,
      ratiosAnnualUrl,
      ratiosQuarterlyUrl,
    } = buildSubUrls(url);

    const summaryRes = await scrapeFundamentalsSummary(url);

    // income
    const incAnnStrict = await scrapeIncomeStatementAnnualStrict(
      incomeAnnualUrl
    );
    const incQStrict = await scrapeIncomeStatementQuarterlyStrict(
      incomeQuarterlyUrl
    );

    // balance
    const balAnnStrict = await scrapeBalanceSheetAnnualStrict(balanceAnnualUrl);
    const balQStrict = await scrapeBalanceSheetQuarterlyStrict(
      balanceQuarterlyUrl
    );

    // cash flow
    const cfAnnStrict = await scrapeCashFlowAnnualStrict(cashAnnualUrl);
    const cfQStrict = await scrapeCashFlowQuarterlyStrict(cashQuarterlyUrl);

    // ratios
    const ratiosAnnStrict = await scrapeRatiosAnnualStrict(ratiosAnnualUrl);
    const ratiosQStrict = await scrapeRatiosQuarterlyStrict(ratiosQuarterlyUrl);

    // dividends
    const dividendsRes = await scrapeDividends(dividendsUrl);

    const response = {
      tickerUrl: url,
      view: "strict" as View,
      summary: {
        data: summaryRes.financialSummary,
        errors: summaryRes.errors ?? [],
      },
      financials: {
        income: {
          annual: incAnnStrict.incomeStatementAnnual,
          quarterly: incQStrict.incomeStatementQuarterly,
        },
        balanceSheet: {
          annual: balAnnStrict.balanceSheetAnnual,
          quarterly: balQStrict.balanceSheetQuarterly,
        },
        cashFlow: {
          annual: cfAnnStrict.cashFlowAnnual,
          quarterly: cfQStrict.cashFlowQuarterly,
        },
        ratios: {
          annual: ratiosAnnStrict.ratiosAnnual,
          quarterly: ratiosQStrict.ratiosQuarterly,
        },
      },
      dividends: {
        data: dividendsRes.dividends,
        errors: dividendsRes.errors ?? [],
      },
    };

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error: any) {
    console.error("scrapeTickerInfoStrict error:", error);
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

/* ───────────────────────────── CORS preflight ─────────────────────────────── */

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
