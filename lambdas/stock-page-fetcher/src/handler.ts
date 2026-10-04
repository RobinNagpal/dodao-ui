import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { flushLoki, log } from './loki';

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

/** Statuses that mean the upstream refused us (rate limit / bot protection), as in insights-ui. */
const REJECTION_STATUSES: ReadonlySet<number> = new Set([401, 403, 429]);

export async function handler(event: APIGatewayProxyEventV2, context?: Context): Promise<APIGatewayProxyResultV2> {
  try {
    return await handle(event, context?.awsRequestId);
  } catch (error) {
    log('error', `Unhandled error: ${error instanceof Error ? error.message : String(error)}`, {
      requestId: context?.awsRequestId,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return respond(500, { error: 'Internal error' });
  } finally {
    // Must finish before returning: a frozen Lambda cannot complete a background push.
    await flushLoki();
  }
}

async function handle(event: APIGatewayProxyEventV2, requestId: string | undefined): Promise<APIGatewayProxyResultV2> {
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
    log('error', 'ALLOWED_FETCH_HOSTS is not configured; refusing all requests', { requestId });
    return respond(500, { error: 'ALLOWED_FETCH_HOSTS is not configured' });
  }
  if (target.protocol !== 'https:' || !hosts.has(target.hostname.toLowerCase())) {
    log('warn', `Refused fetch for a host that is not allowed: ${target.hostname}`, { requestId, url: target.toString() });
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
    const fields = { requestId, url: target.toString(), status: upstream.status, ...headers };
    if (REJECTION_STATUSES.has(upstream.status) || headers['cf-mitigated']) {
      // Same tag as insights-ui, so `|= "[scraper-rejected]"` finds rejections from both.
      log('error', `[scraper-rejected] upstream ${upstream.status} via lambda for ${target.toString()}`, fields);
    } else if (upstream.status === 404) {
      // Normal (e.g. a non-payer has no dividend page): CloudWatch only.
      log('info', `upstream 404 for ${target.toString()}`, fields);
    } else if (upstream.status < 200 || upstream.status >= 300) {
      log('warn', `upstream ${upstream.status} for ${target.toString()}`, fields);
    }
    return respond(200, { status: upstream.status, html, headers });
  } catch (error) {
    const message: string = error instanceof Error ? error.message : String(error);
    log('error', `Upstream fetch failed for ${target.toString()}: ${message}`, { requestId, url: target.toString() });
    return respond(502, { error: `Upstream fetch failed: ${message}` });
  }
}
