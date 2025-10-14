// scripts/generate-events.ts
// Prints a single-line JSON event to STDOUT.
// Usage:
//   npx tsx scripts/generate-events.ts --route fetchSummary --url <ticker> --view strict
//   npx tsx scripts/generate-events.ts --route optionsAll              # preflight example
//   (legacy arg still works) --function <name>

import * as process from "node:process";

type View = "normal" | "raw" | "strict";
type HttpMethod = "POST" | "OPTIONS";

type Args = {
  route: string; // logical route key (e.g. fetchSummary)
  url: string;
  view: View;
  origin: string; // for OPTIONS
};

function getArg(key: string, dflt?: string): string {
  const argv = process.argv.slice(2);
  const i = argv.indexOf(key);
  if (i >= 0 && argv[i + 1]) return argv[i + 1];
  const kv = argv.find((a) => a.startsWith(`${key}=`));
  if (kv) return kv.split("=", 2)[1];
  if (dflt !== undefined) return dflt;
  throw new Error(`Missing required arg ${key}`);
}

function parseArgs(): Args {
  // Prefer --route, fall back to --function for backward compatibility
  let route: string;
  try {
    route = getArg("--route");
  } catch {
    route = getArg("--function"); // legacy
  }

  const url = getArg(
    "--url",
    "https://www.macrotrends.net/stocks/charts/AAPL/apple"
  );
  const view = getArg("--view", "strict") as View;
  const origin = getArg("--origin", "http://localhost:3000");

  if (!["normal", "raw", "strict"].includes(view)) {
    throw new Error(`Invalid --view "${view}". Use: normal | raw | strict.`);
  }
  return { route, url, view, origin };
}

type Mapping = { method: HttpMethod; path: string; includeView?: boolean };

const MAP: Record<string, Mapping> = {
  // Legacy combined (body {url})
  scrapeTickerInfo: {
    method: "POST",
    path: "/fetch-stock-info",
    includeView: false,
  },

  // Summary & Dividends
  fetchSummary: { method: "POST", path: "/summary", includeView: true },
  fetchDividends: { method: "POST", path: "/dividends", includeView: true },

  // Income
  fetchIncomeStatementAnnual: {
    method: "POST",
    path: "/income-statement/annual",
    includeView: true,
  },
  fetchIncomeStatementQuarterly: {
    method: "POST",
    path: "/income-statement/quarterly",
    includeView: true,
  },

  // Balance
  fetchBalanceSheetAnnual: {
    method: "POST",
    path: "/balance-sheet/annual",
    includeView: true,
  },
  fetchBalanceSheetQuarterly: {
    method: "POST",
    path: "/balance-sheet/quarterly",
    includeView: true,
  },

  // Cashflow
  fetchCashflowAnnual: {
    method: "POST",
    path: "/cashflow/annual",
    includeView: true,
  },
  fetchCashflowQuarterly: {
    method: "POST",
    path: "/cashflow/quarterly",
    includeView: true,
  },

  // Ratios
  fetchRatiosAnnual: {
    method: "POST",
    path: "/ratios/annual",
    includeView: true,
  },
  fetchRatiosQuarterly: {
    method: "POST",
    path: "/ratios/quarterly",
    includeView: true,
  },

  // Aggregates
  fetchFinancialsAnnual: {
    method: "POST",
    path: "/financials/annual",
    includeView: true,
  },
  fetchFinancialsQuarterly: {
    method: "POST",
    path: "/financials/quarterly",
    includeView: true,
  },

  // OPTIONS example
  optionsAll: { method: "OPTIONS", path: "/ratios/annual" },
};

function httpApiV2EventPOST(path: string, body: unknown) {
  return {
    version: "2.0",
    routeKey: `POST ${path}`,
    rawPath: path,
    rawQueryString: "",
    headers: { "content-type": "application/json" },
    requestContext: { http: { method: "POST", path } },
    body: JSON.stringify(body),
    isBase64Encoded: false,
  };
}

function httpApiV2EventOPTIONS(path: string, origin: string) {
  return {
    version: "2.0",
    routeKey: `OPTIONS ${path}`,
    rawPath: path,
    rawQueryString: "",
    headers: {
      origin,
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type",
    },
    requestContext: { http: { method: "OPTIONS", path } },
    isBase64Encoded: false,
  };
}

function main() {
  const { route, url, view, origin } = parseArgs();
  const m = MAP[route];
  if (!m) {
    const known = Object.keys(MAP).sort().join(", ");
    throw new Error(`Unknown route "${route}". Known: ${known}`);
  }

  let event: any;
  if (m.method === "OPTIONS") {
    event = httpApiV2EventOPTIONS(m.path, origin);
  } else {
    const body = m.includeView ? { url, view } : { url };
    event = httpApiV2EventPOST(m.path, body);
  }

  // Single-line JSON for easy -d passing
  process.stdout.write(JSON.stringify(event));
}

try {
  main();
} catch (e: any) {
  console.error(e?.message || e);
  process.exit(1);
}
