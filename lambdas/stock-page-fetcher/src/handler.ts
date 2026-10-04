import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

/**
 * POST /html  { "url": "https://<allowed host>/..." }
 *
 * Fetches one page and returns its raw HTML with the upstream status, so the
 * insights-ui scraper can parse it with its own parsers while the request
 * leaves from Lambda's IPs. Called via the function's Lambda Function URL.
 *
 * Always 200 when the proxy itself worked; the upstream result is in the body:
 *   { status, html, headers: { "retry-after", server, "cf-ray", "cf-mitigated" } }
 * A non-200 from here means the proxy failed (bad input, host not allowed, not
 * configured, upstream unreachable), which the app treats as transient.
 *
 * Only hosts in ALLOWED_FETCH_HOSTS (comma-separated) may be fetched, so this
 * is not an open proxy; unset refuses every request.
 */

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

// Same browser-like headers insights-ui sends: the upstream serves a stripped
// page or a challenge to clients that do not look like a browser.
const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const DIAGNOSTIC_HEADERS: readonly string[] = ['retry-after', 'server', 'cf-ray', 'cf-mitigated'];

// The function timeout is 25s; the app's own request timeout is 20s.
const UPSTREAM_TIMEOUT_MS = 18_000;

function respond(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function allowedHosts(): Set<string> {
  return new Set(
    (process.env.ALLOWED_FETCH_HOSTS || '')
      .split(',')
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const method: string = event.requestContext?.http?.method ?? 'GET';
  const path: string = (event.rawPath || '/').replace(/\/+$/, '') || '/';
  if (method !== 'POST' || path !== '/html') {
    return respond(404, { error: `No route for ${method} ${path}` });
  }

  let target: URL;
  try {
    const rawBody: string = event.isBase64Encoded ? Buffer.from(event.body ?? '', 'base64').toString('utf8') : event.body ?? '';
    target = new URL((JSON.parse(rawBody || '{}') as { url?: string }).url ?? '');
  } catch {
    return respond(400, { error: 'Body must be JSON with a valid absolute `url`' });
  }

  const hosts: Set<string> = allowedHosts();
  if (hosts.size === 0) {
    return respond(500, { error: 'ALLOWED_FETCH_HOSTS is not configured' });
  }
  if (target.protocol !== 'https:' || !hosts.has(target.hostname.toLowerCase())) {
    return respond(403, { error: `Host not allowed: ${target.hostname}` });
  }

  try {
    const upstream: Response = await fetch(target.toString(), {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    const headers: Record<string, string> = {};
    for (const name of DIAGNOSTIC_HEADERS) {
      const value: string | null = upstream.headers.get(name);
      if (value) headers[name] = value;
    }
    const html: string = await upstream.text();
    if (upstream.status !== 200) {
      console.warn(`upstream ${upstream.status} for ${target.toString()}${headers['cf-mitigated'] ? ` (cf-mitigated=${headers['cf-mitigated']})` : ''}`);
    }
    return respond(200, { status: upstream.status, html, headers });
  } catch (error) {
    const message: string = error instanceof Error ? error.message : String(error);
    console.error(`fetch failed for ${target.toString()}: ${message}`);
    return respond(502, { error: `Upstream fetch failed: ${message}` });
  }
}
