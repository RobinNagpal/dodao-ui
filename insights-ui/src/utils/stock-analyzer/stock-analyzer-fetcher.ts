/**
 * Low-level HTTP access to the stock-analyze site.
 *
 * The site's origin is never hard-coded here: it comes from
 * `NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL`, the same variable
 * `stockAnalyzeUrlValidation.ts` uses to generate and validate every ticker's
 * `stockAnalyzeUrl`.
 *
 * Pages are fetched either directly from this server or, when the
 * `SCRAPER_FETCH_VIA_LAMBDA` App Setting is on, through the stock-page-fetcher
 * Lambda's `POST /html` proxy (lambdas/stock-page-fetcher) (`STOCK_ANALYZER_LAMBDA_URL`), so requests leave from
 * Lambda's IPs. Parsing always happens here either way.
 *
 * The site's CDN rate-limits aggressive clients (429 with
 * `cf-mitigated: challenge`). To stay under it:
 * - at most MAX_CONCURRENT_FETCHES requests are in flight per process;
 * - a rejection is never retried, and pauses ALL fetches over that transport
 *   for max(Retry-After, REJECTION_PAUSE_MS); while paused, fetches fail fast
 *   with `paused: true` and no network call.
 */
import { getAppConfigBoolean, getAppConfigValue } from '@/lib/appConfig/appConfig';

/** Configured origin of the stock-analyze site, e.g. `https://example.com`. */
const STOCK_ANALYZE_BASE_URL = process.env.NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL || '';

/**
 * The source site serves a stripped-down page (or a challenge page) to clients
 * that do not look like a browser, so send a realistic UA + Accept pair. The
 * Lambda proxy sends the same headers.
 */
const BROWSER_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const REQUEST_TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 3;
const MAX_CONCURRENT_FETCHES = 2;
const REJECTION_PAUSE_MS = 10 * 60 * 1000;
const MAX_REJECTION_PAUSE_MS = 60 * 60 * 1000;

export class StockAnalyzerFetchError extends Error {
  constructor(
    message: string,
    readonly url: string,
    readonly status?: number,
    readonly rejected: boolean = false,
    /** True when no request was made because fetching is paused after a rejection. */
    readonly paused: boolean = false
  ) {
    super(message);
    this.name = 'StockAnalyzerFetchError';
  }
}

/**
 * Stable tag on every log line where the source site refused to serve us
 * (401/403/429 or a bot-challenge page), so blocking is searchable in Loki:
 * `pnpm logs:fetch --grep scraper-rejected`.
 */
export const SCRAPER_REJECTED_LOG_TAG = '[scraper-rejected]';

/** Statuses that mean "you are not allowed / slow down", not "page missing" or "server broken". */
const REJECTION_STATUSES: ReadonlySet<number> = new Set([401, 403, 429]);

/**
 * Bot-protection interstitials are often served with 200 or 503 and would
 * otherwise parse to nothing and be misreported as a layout change.
 */
const CHALLENGE_PAGE_MARKERS: readonly string[] = [
  '<title>Just a moment...</title>',
  'cf-chl-',
  '/cdn-cgi/challenge-platform/',
  '<title>Attention Required!',
  '<title>Access denied</title>',
];

const DIAGNOSTIC_HEADERS: readonly string[] = ['retry-after', 'server', 'cf-ray', 'cf-mitigated'];

type Transport = 'direct' | 'lambda';

/** What either transport hands back for one upstream request. */
interface UpstreamPage {
  status: number;
  html: string;
  headers: Record<string, string>;
}

/**
 * Process-wide state on `globalThis`, so every bundled copy of this module
 * (Next.js can load one per route layer) shares one limiter and one pause.
 */
interface FetcherState {
  pausedUntil: Record<Transport, number>;
  inFlight: number;
  waiters: Array<() => void>;
}
const globalForFetcher = globalThis as typeof globalThis & { __stockAnalyzerFetcher?: FetcherState };
const state: FetcherState = (globalForFetcher.__stockAnalyzerFetcher ??= { pausedUntil: { direct: 0, lambda: 0 }, inFlight: 0, waiters: [] });

async function withFetchSlot<T>(run: () => Promise<T>): Promise<T> {
  while (state.inFlight >= MAX_CONCURRENT_FETCHES) {
    await new Promise<void>((resolve) => state.waiters.push(resolve));
  }
  state.inFlight++;
  try {
    return await run();
  } finally {
    state.inFlight--;
    state.waiters.shift()?.();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isChallengePage(html: string): boolean {
  return CHALLENGE_PAGE_MARKERS.some((marker) => html.includes(marker));
}

/** Seconds from a `Retry-After` header (delta-seconds or HTTP date), or null. */
function retryAfterMs(value: string | undefined): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return seconds * 1000;
  const at = Date.parse(value);
  return Number.isFinite(at) ? Math.max(0, at - Date.now()) : null;
}

async function resolveTransport(): Promise<{ transport: Transport; lambdaUrl?: string }> {
  if (!(await getAppConfigBoolean('SCRAPER_FETCH_VIA_LAMBDA'))) {
    return { transport: 'direct' };
  }
  const lambdaUrl = (await getAppConfigValue('STOCK_ANALYZER_LAMBDA_URL'))?.trim();
  if (!lambdaUrl) {
    console.error('SCRAPER_FETCH_VIA_LAMBDA is on but STOCK_ANALYZER_LAMBDA_URL is not set; fetching directly');
    return { transport: 'direct' };
  }
  return { transport: 'lambda', lambdaUrl };
}

/** True while fetches over the transport currently in use are paused after a rejection. */
export async function isScrapingPaused(): Promise<boolean> {
  const { transport } = await resolveTransport();
  return Date.now() < state.pausedUntil[transport];
}

async function requestDirect(url: string): Promise<UpstreamPage> {
  const response: Response = await fetch(url, {
    headers: {
      'User-Agent': BROWSER_USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: 'no-store',
  });
  const headers: Record<string, string> = {};
  for (const name of DIAGNOSTIC_HEADERS) {
    const value = response.headers.get(name);
    if (value) headers[name] = value;
  }
  return { status: response.status, html: await response.text(), headers };
}

async function requestViaLambda(url: string, lambdaUrl: string): Promise<UpstreamPage> {
  const response: Response = await fetch(new URL('/html', lambdaUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!response.ok) {
    // The proxy itself failed (bad config, upstream timeout): transient, retryable.
    throw new StockAnalyzerFetchError(`Lambda proxy failed with ${response.status}: ${(await response.text()).slice(0, 200)} (${url})`, url);
  }
  const page = (await response.json()) as Partial<UpstreamPage>;
  return { status: Number(page.status), html: page.html ?? '', headers: page.headers ?? {} };
}

/** Logs the rejection and pauses this transport; one line per pause, not per request. */
function handleRejection(url: string, reason: string, page: UpstreamPage, transport: Transport): StockAnalyzerFetchError {
  const pauseMs: number = Math.min(Math.max(retryAfterMs(page.headers['retry-after']) ?? 0, REJECTION_PAUSE_MS), MAX_REJECTION_PAUSE_MS);
  const wasPaused: boolean = Date.now() < state.pausedUntil[transport];
  state.pausedUntil[transport] = Math.max(state.pausedUntil[transport], Date.now() + pauseMs);
  if (!wasPaused) {
    const diagnostics: string = Object.entries(page.headers)
      .map(([name, value]) => `${name}=${value}`)
      .join(' ');
    console.error(
      `${SCRAPER_REJECTED_LOG_TAG} ${reason} via ${transport} for ${url}${
        diagnostics ? ` [${diagnostics}]` : ''
      }; pausing all ${transport} fetches for ${Math.round(pauseMs / 60000)} min`
    );
  }
  return new StockAnalyzerFetchError(`Rejected by source site (${reason}) via ${transport}: ${url}`, url, page.status, true);
}

/**
 * Fetch one source-site page as HTML.
 *
 * Retries transient failures (network error, 5xx, Lambda proxy errors) with a
 * short backoff. A 404 is not retried — it means the ticker or sub-page
 * genuinely does not exist on the source site. A rejection (401/403/429 or a
 * bot-challenge page) is not retried either and pauses fetching (see top).
 */
export async function fetchStockAnalyzerPage(url: string): Promise<string> {
  const { transport, lambdaUrl } = await resolveTransport();
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const pausedUntil: number = state.pausedUntil[transport];
    if (Date.now() < pausedUntil) {
      throw new StockAnalyzerFetchError(`Fetching paused after a rejection until ${new Date(pausedUntil).toISOString()}: ${url}`, url, undefined, true, true);
    }

    try {
      const page: UpstreamPage = await withFetchSlot(() => (transport === 'lambda' ? requestViaLambda(url, lambdaUrl!) : requestDirect(url)));

      if (page.status === 404) {
        throw new StockAnalyzerFetchError(`Page not found: ${url}`, url, 404);
      }
      if (REJECTION_STATUSES.has(page.status)) {
        throw handleRejection(url, `status ${page.status}`, page, transport);
      }
      if (isChallengePage(page.html)) {
        throw handleRejection(url, `bot-challenge page, status ${page.status}`, page, transport);
      }
      if (page.status < 200 || page.status >= 300) {
        throw new StockAnalyzerFetchError(`Request failed with ${page.status} via ${transport}: ${url}`, url, page.status);
      }
      return page.html;
    } catch (error) {
      // 404s and rejections will not change on an immediate retry.
      if (error instanceof StockAnalyzerFetchError && (error.status === 404 || error.rejected)) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_ATTEMPTS) {
        await sleep(attempt * 500);
      }
    }
  }

  const last: StockAnalyzerFetchError | undefined = lastError instanceof StockAnalyzerFetchError ? lastError : undefined;
  throw new StockAnalyzerFetchError(`Failed to fetch after ${MAX_ATTEMPTS} attempts (${lastError?.message}): ${url}`, url, last?.status);
}

/**
 * Build a sub-page URL from a ticker's `stockAnalyzeUrl`.
 *
 * `stockAnalyzeUrl` is stored as `<base>/stocks/{SYMBOL}/` for US exchanges and
 * `<base>/quote/{segment}/{SYMBOL}/` for everything else (see
 * `stockAnalyzeUrlValidation.ts`); both forms take the same sub-page suffixes.
 *
 * Only the *path* of the stored URL is used — the origin comes from
 * `NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL`, so a row stored against an old host
 * still resolves to the configured one. If that variable is unset (local
 * scripts, tests), the stored URL's own origin is used.
 */
export function buildStockAnalyzerSubPageUrl(stockAnalyzeUrl: string, subPath: string, searchParams?: Record<string, string>): string {
  const storedUrl: URL = new URL(stockAnalyzeUrl.trim());
  const origin: string = STOCK_ANALYZE_BASE_URL ? new URL(STOCK_ANALYZE_BASE_URL).origin : storedUrl.origin;

  const tickerPath: string = storedUrl.pathname.replace(/\/+$/, '');
  const suffix: string = subPath ? `/${subPath.replace(/^\/+|\/+$/g, '')}/` : '/';
  const url: URL = new URL(`${origin}${tickerPath}${suffix}`);

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}
