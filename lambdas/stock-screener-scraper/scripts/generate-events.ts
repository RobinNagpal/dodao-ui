// scripts/generate-events.ts
// Prints a single-line JSON event to STDOUT for serverless invoke local.
// Usage:
//   npx tsx scripts/generate-events.ts --route screener
//   npx tsx scripts/generate-events.ts --route screener --market-cap "Over 10B" --price-change "Over 2%" --limit 20
//   npx tsx scripts/generate-events.ts --route options

import * as process from "node:process";

type HttpMethod = "POST" | "OPTIONS";

interface Args {
  route: string;
  marketCapMin: string;
  priceChange1DMin: string;
  limit: number;
  origin: string;
}

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
  const route = getArg("--route", "screener");
  const marketCapMin = getArg("--market-cap", "Over 1B");
  const priceChange1DMin = getArg("--price-change", "Over 1%");
  const limit = parseInt(getArg("--limit", "15"), 10);
  const origin = getArg("--origin", "http://localhost:3000");

  return { route, marketCapMin, priceChange1DMin, limit, origin };
}

type Mapping = { method: HttpMethod; path: string };

const MAP: Record<string, Mapping> = {
  screener: { method: "POST", path: "/screener" },
  options: { method: "OPTIONS", path: "/screener" },
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
  const { route, marketCapMin, priceChange1DMin, limit, origin } = parseArgs();
  const m = MAP[route];
  if (!m) {
    const known = Object.keys(MAP).sort().join(", ");
    throw new Error(`Unknown route "${route}". Known: ${known}`);
  }

  let event: unknown;
  if (m.method === "OPTIONS") {
    event = httpApiV2EventOPTIONS(m.path, origin);
  } else {
    const body = { marketCapMin, priceChange1DMin, limit };
    event = httpApiV2EventPOST(m.path, body);
  }

  // Single-line JSON for easy -d passing
  process.stdout.write(JSON.stringify(event));
}

try {
  main();
} catch (e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  console.error(message);
  process.exit(1);
}

