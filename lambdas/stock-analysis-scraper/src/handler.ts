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

/* --------------------------- shared types & headers -------------------------- */

type View = "normal" | "raw" | "strict";
type FetchRequestBody = { url: string; view?: View };

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
} as const;

/* --------------------------------- helpers ---------------------------------- */

function joinUrl(base: string, path: string): string {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${b}/${p}`;
}

function parseBodyOr400(
  event: APIGatewayProxyEvent
):
  | { ok: true; url: string; view: View }
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
    const body: FetchRequestBody = JSON.parse(event.body);
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
    const view: View =
      body?.view === "normal" || body?.view === "raw" || body?.view === "strict"
        ? body.view
        : "strict";
    return { ok: true, url, view };
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

function okResponse(params: {
  url: string;
  section:
    | "summary"
    | "dividends"
    | "income-statement"
    | "balance-sheet"
    | "cashflow"
    | "ratios"
    | "all";
  period?: "annual" | "quarterly";
  view: View;
  data: unknown;
  errors?: unknown[];
}): APIGatewayProxyResult {
  const { url, section, period, view, data, errors = [] } = params;
  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({
      tickerUrl: url,
      section,
      period: period ?? null,
      view,
      data,
      errors,
    }),
  };
}

async function byView<T>(
  view: View,
  fns: {
    normal: () => Promise<T>;
    raw: () => Promise<T>;
    strict: () => Promise<any>;
  }
): Promise<T> {
  if (view === "normal") return fns.normal();
  if (view === "raw") return fns.raw();
  return fns.strict();
}

/* ----------------------------- existing handlers ---------------------------- */
/* (scrapeTickerInfoNormal/Raw/Strict + handleOptions remain as in your file)   */
/* No changes needed except parseBodyOr400 now also returns `view` (ignored).   */

/* ----------------------------- new granular APIs ---------------------------- */

/* SUMMARY */
export const fetchSummary = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url, view } = parsed; // view accepted for consistency, output is the same
    const summaryRes = await scrapeFundamentalsSummary(url);
    return okResponse({
      url,
      section: "summary",
      view,
      data: summaryRes.financialSummary,
      errors: summaryRes.errors ?? [],
    });
  } catch (error: any) {
    console.error("fetchSummary error:", error);
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

/* DIVIDENDS */
export const fetchDividends = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url, view } = parsed; // view accepted for consistency
    const { dividendsUrl } = buildSubUrls(url);
    const res = await scrapeDividends(dividendsUrl);
    return okResponse({
      url,
      section: "dividends",
      view,
      data: res.dividends,
      errors: res.errors ?? [],
    });
  } catch (error: any) {
    console.error("fetchDividends error:", error);
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

/* INCOME STATEMENT */
export const fetchIncomeStatementAnnual = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url, view } = parsed;
    const { incomeAnnualUrl } = buildSubUrls(url);

    const res = await byView(view, {
      normal: () => scrapeIncomeStatementAnnual(incomeAnnualUrl),
      raw: () => scrapeIncomeStatementAnnualRaw(incomeAnnualUrl),
      strict: () => scrapeIncomeStatementAnnualStrict(incomeAnnualUrl),
    });

    return okResponse({
      url,
      section: "income-statement",
      period: "annual",
      view,
      data: (res as any).incomeStatementAnnual,
      errors: (res as any).errors ?? [],
    });
  } catch (error: any) {
    console.error("fetchIncomeStatementAnnual error:", error);
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

export const fetchIncomeStatementQuarterly = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url, view } = parsed;
    const { incomeQuarterlyUrl } = buildSubUrls(url);

    const res = await byView(view, {
      normal: () => scrapeIncomeStatementQuarterly(incomeQuarterlyUrl),
      raw: () => scrapeIncomeStatementQuarterlyRaw(incomeQuarterlyUrl),
      strict: () => scrapeIncomeStatementQuarterlyStrict(incomeQuarterlyUrl),
    });

    return okResponse({
      url,
      section: "income-statement",
      period: "quarterly",
      view,
      data: (res as any).incomeStatementQuarterly,
      errors: (res as any).errors ?? [],
    });
  } catch (error: any) {
    console.error("fetchIncomeStatementQuarterly error:", error);
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

/* BALANCE SHEET */
export const fetchBalanceSheetAnnual = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url, view } = parsed;
    const { balanceAnnualUrl } = buildSubUrls(url);

    const res = await byView(view, {
      normal: () => scrapeBalanceSheetAnnual(balanceAnnualUrl),
      raw: () => scrapeBalanceSheetAnnualRaw(balanceAnnualUrl),
      strict: () => scrapeBalanceSheetAnnualStrict(balanceAnnualUrl),
    });

    return okResponse({
      url,
      section: "balance-sheet",
      period: "annual",
      view,
      data: (res as any).balanceSheetAnnual,
      errors: (res as any).errors ?? [],
    });
  } catch (error: any) {
    console.error("fetchBalanceSheetAnnual error:", error);
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

export const fetchBalanceSheetQuarterly = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url, view } = parsed;
    const { balanceQuarterlyUrl } = buildSubUrls(url);

    const res = await byView(view, {
      normal: () => scrapeBalanceSheetQuarterly(balanceQuarterlyUrl),
      raw: () => scrapeBalanceSheetQuarterlyRaw(balanceQuarterlyUrl),
      strict: () => scrapeBalanceSheetQuarterlyStrict(balanceQuarterlyUrl),
    });

    return okResponse({
      url,
      section: "balance-sheet",
      period: "quarterly",
      view,
      data: (res as any).balanceSheetQuarterly,
      errors: (res as any).errors ?? [],
    });
  } catch (error: any) {
    console.error("fetchBalanceSheetQuarterly error:", error);
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

/* CASHFLOW */
export const fetchCashflowAnnual = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url, view } = parsed;
    const { cashAnnualUrl } = buildSubUrls(url);

    const res = await byView(view, {
      normal: () => scrapeCashFlowAnnual(cashAnnualUrl),
      raw: () => scrapeCashFlowAnnualRaw(cashAnnualUrl),
      strict: () => scrapeCashFlowAnnualStrict(cashAnnualUrl),
    });

    return okResponse({
      url,
      section: "cashflow",
      period: "annual",
      view,
      data: (res as any).cashFlowAnnual,
      errors: (res as any).errors ?? [],
    });
  } catch (error: any) {
    console.error("fetchCashflowAnnual error:", error);
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

export const fetchCashflowQuarterly = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url, view } = parsed;
    const { cashQuarterlyUrl } = buildSubUrls(url);

    const res = await byView(view, {
      normal: () => scrapeCashFlowQuarterly(cashQuarterlyUrl),
      raw: () => scrapeCashFlowQuarterlyRaw(cashQuarterlyUrl),
      strict: () => scrapeCashFlowQuarterlyStrict(cashQuarterlyUrl),
    });

    return okResponse({
      url,
      section: "cashflow",
      period: "quarterly",
      view,
      data: (res as any).cashFlowQuarterly,
      errors: (res as any).errors ?? [],
    });
  } catch (error: any) {
    console.error("fetchCashflowQuarterly error:", error);
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

/* RATIOS */
export const fetchRatiosAnnual = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url, view } = parsed;
    const { ratiosAnnualUrl } = buildSubUrls(url);

    const res = await byView(view, {
      normal: () => scrapeRatiosAnnual(ratiosAnnualUrl),
      raw: () => scrapeRatiosAnnualRaw(ratiosAnnualUrl),
      strict: () => scrapeRatiosAnnualStrict(ratiosAnnualUrl),
    });

    return okResponse({
      url,
      section: "ratios",
      period: "annual",
      view,
      data: (res as any).ratiosAnnual,
      errors: (res as any).errors ?? [],
    });
  } catch (error: any) {
    console.error("fetchRatiosAnnual error:", error);
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

export const fetchRatiosQuarterly = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;
    const { url, view } = parsed;
    const { ratiosQuarterlyUrl } = buildSubUrls(url);

    const res = await byView(view, {
      normal: () => scrapeRatiosQuarterly(ratiosQuarterlyUrl),
      raw: () => scrapeRatiosQuarterlyRaw(ratiosQuarterlyUrl),
      strict: () => scrapeRatiosQuarterlyStrict(ratiosQuarterlyUrl),
    });

    return okResponse({
      url,
      section: "ratios",
      period: "quarterly",
      view,
      data: (res as any).ratiosQuarterly,
      errors: (res as any).errors ?? [],
    });
  } catch (error: any) {
    console.error("fetchRatiosQuarterly error:", error);
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

/* Helper to aggregate error arrays safely */
function collectErrors(
  ...maybeArrays: Array<unknown[] | undefined | null>
): unknown[] {
  return maybeArrays.filter(Array.isArray).flat() as unknown[];
}

/* --------------------------- ALL • ANNUAL --------------------------- */
export const fetchAllAnnual = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;

    // If your parseBodyOr400 doesn't return view yet, uncomment next line:
    // const view: View = "strict";
    const { url, view } = parsed as { ok: true; url: string; view: View };

    const {
      incomeAnnualUrl,
      balanceAnnualUrl,
      cashAnnualUrl,
      dividendsUrl,
      ratiosAnnualUrl,
    } = buildSubUrls(url);

    // Summary (no view variants)
    const summaryRes = await scrapeFundamentalsSummary(url);

    // Annual financials by selected view
    const incAnn = await byView(view, {
      normal: () => scrapeIncomeStatementAnnual(incomeAnnualUrl),
      raw: () => scrapeIncomeStatementAnnualRaw(incomeAnnualUrl),
      strict: () => scrapeIncomeStatementAnnualStrict(incomeAnnualUrl),
    });

    const balAnn = await byView(view, {
      normal: () => scrapeBalanceSheetAnnual(balanceAnnualUrl),
      raw: () => scrapeBalanceSheetAnnualRaw(balanceAnnualUrl),
      strict: () => scrapeBalanceSheetAnnualStrict(balanceAnnualUrl),
    });

    const cfAnn = await byView(view, {
      normal: () => scrapeCashFlowAnnual(cashAnnualUrl),
      raw: () => scrapeCashFlowAnnualRaw(cashAnnualUrl),
      strict: () => scrapeCashFlowAnnualStrict(cashAnnualUrl),
    });

    const ratiosAnn = await byView(view, {
      normal: () => scrapeRatiosAnnual(ratiosAnnualUrl),
      raw: () => scrapeRatiosAnnualRaw(ratiosAnnualUrl),
      strict: () => scrapeRatiosAnnualStrict(ratiosAnnualUrl),
    });

    // Dividends (no view variants)
    const dividendsRes = await scrapeDividends(dividendsUrl);

    const errors = collectErrors(
      summaryRes?.errors,
      (incAnn as any)?.errors,
      (balAnn as any)?.errors,
      (cfAnn as any)?.errors,
      (ratiosAnn as any)?.errors,
      dividendsRes?.errors
    );

    return okResponse({
      url,
      section: "all",
      period: "annual",
      view,
      data: {
        summary: summaryRes.financialSummary,
        income: (incAnn as any).incomeStatementAnnual,
        balanceSheet: (balAnn as any).balanceSheetAnnual,
        cashFlow: (cfAnn as any).cashFlowAnnual,
        ratios: (ratiosAnn as any).ratiosAnnual,
        dividends: dividendsRes.dividends,
      },
      errors,
    });
  } catch (error: any) {
    console.error("fetchAllAnnual error:", error);
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

/* -------------------------- ALL • QUARTERLY -------------------------- */
export const fetchAllQuarterly = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const parsed = parseBodyOr400(event);
    if (!parsed.ok) return parsed.res;

    // If your parseBodyOr400 doesn't return view yet, uncomment next line:
    // const view: View = "strict";
    const { url, view } = parsed as { ok: true; url: string; view: View };

    const {
      incomeQuarterlyUrl,
      balanceQuarterlyUrl,
      cashQuarterlyUrl,
      dividendsUrl,
      ratiosQuarterlyUrl,
    } = buildSubUrls(url);

    // Summary (no view variants)
    const summaryRes = await scrapeFundamentalsSummary(url);

    // Quarterly financials by selected view
    const incQ = await byView(view, {
      normal: () => scrapeIncomeStatementQuarterly(incomeQuarterlyUrl),
      raw: () => scrapeIncomeStatementQuarterlyRaw(incomeQuarterlyUrl),
      strict: () => scrapeIncomeStatementQuarterlyStrict(incomeQuarterlyUrl),
    });

    const balQ = await byView(view, {
      normal: () => scrapeBalanceSheetQuarterly(balanceQuarterlyUrl),
      raw: () => scrapeBalanceSheetQuarterlyRaw(balanceQuarterlyUrl),
      strict: () => scrapeBalanceSheetQuarterlyStrict(balanceQuarterlyUrl),
    });

    const cfQ = await byView(view, {
      normal: () => scrapeCashFlowQuarterly(cashQuarterlyUrl),
      raw: () => scrapeCashFlowQuarterlyRaw(cashQuarterlyUrl),
      strict: () => scrapeCashFlowQuarterlyStrict(cashQuarterlyUrl),
    });

    const ratiosQ = await byView(view, {
      normal: () => scrapeRatiosQuarterly(ratiosQuarterlyUrl),
      raw: () => scrapeRatiosQuarterlyRaw(ratiosQuarterlyUrl),
      strict: () => scrapeRatiosQuarterlyStrict(ratiosQuarterlyUrl),
    });

    // Dividends (no view variants)
    const dividendsRes = await scrapeDividends(dividendsUrl);

    const errors = collectErrors(
      summaryRes?.errors,
      (incQ as any)?.errors,
      (balQ as any)?.errors,
      (cfQ as any)?.errors,
      (ratiosQ as any)?.errors,
      dividendsRes?.errors
    );

    return okResponse({
      url,
      section: "all",
      period: "quarterly",
      view,
      data: {
        summary: summaryRes.financialSummary,
        income: (incQ as any).incomeStatementQuarterly,
        balanceSheet: (balQ as any).balanceSheetQuarterly,
        cashFlow: (cfQ as any).cashFlowQuarterly,
        ratios: (ratiosQ as any).ratiosQuarterly,
        dividends: dividendsRes.dividends,
      },
      errors,
    });
  } catch (error: any) {
    console.error("fetchAllQuarterly error:", error);
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

/* ------------------------------ OPTIONS handler ----------------------------- */

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
