// AWS Lambda proxy in front of the public candidate-codes feed used by the
// tariff calculator. The local bulk-SQL script (yarn tariffs:gen-candidate-codes-sql)
// hits a per-source-IP daily quota when fetching directly. Routing each
// request through this Lambda gives every concurrent invocation a fresh AWS
// egress IP, which sidesteps the quota.
//
// The path mirrors the upstream so the local script can switch over by simply
// pointing TARIFF_CANDIDATE_CODES_BASE_URL at this API Gateway URL — no
// schema/format change downstream. The handler is a transparent pass-through:
// status code, body, and content-type all come from upstream as-is.

const UPSTREAM = 'https://tariffs.flexport.com';

// Match the headers the direct (non-lambda) fetch path uses
// (insights-ui/src/utils/tariff-calculator/upstream-feed.ts). Sending
// browser-shaped headers (Mozilla UA + Referer/Origin = tariffs.flexport.com)
// caused the upstream to return a richer payload than direct fetches did —
// including applicabilityConditions with __typename values our local mapper
// doesn't know about, which then surfaced as `'undefined'::"…ConditionKind"`
// literals in the generated SQL. Keeping the lambda's request shape identical
// to the direct path ensures via-lambda is purely an IP-rotation change, not a
// content change.
const REQUEST_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'User-Agent': 'Mozilla/5.0 (compatible; KoalaGains-TariffCalculator/1.0; +https://koalagains.com)',
};

interface ApiGatewayEvent {
  pathParameters?: { hts10?: string } | null;
}

interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export const fetchCandidateCode = async (event: ApiGatewayEvent): Promise<LambdaResponse> => {
  const hts10 = event.pathParameters?.hts10;
  if (!hts10 || !/^\d{10}$/.test(hts10)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid hts10. Expected exactly 10 digits.' }),
    };
  }

  const url = `${UPSTREAM}/api/public/v1/candidate-codes/${hts10}`;
  try {
    const res = await fetch(url, { headers: REQUEST_HEADERS });
    const body = await res.text();
    return {
      statusCode: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
      body,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Upstream fetch failed for ${hts10}: ${message}`);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'upstream_fetch_failed', message }),
    };
  }
};
