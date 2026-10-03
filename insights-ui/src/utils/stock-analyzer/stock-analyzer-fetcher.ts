/**
 * Low-level HTTP access to the stock-analyze site.
 *
 * The site's origin is never hard-coded here: it comes from
 * `NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL`, the same variable
 * `stockAnalyzeUrlValidation.ts` uses to generate and validate every ticker's
 * `stockAnalyzeUrl`.
 *
 * This replaces the call that used to go out to the Stock Analyzer Lambda
 * (`STOCK_ANALYZER_LAMBDA_URL`). The Lambda was nothing but "fetch the page,
 * parse the table", so it is cheaper and far easier to keep in sync with the
 * source site if it lives next to the parsers that consume it.
 */

/** Configured origin of the stock-analyze site, e.g. `https://example.com`. */
const STOCK_ANALYZE_BASE_URL = process.env.NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL || '';

/**
 * The source site serves a stripped-down page (or a challenge page) to clients
 * that do not look like a browser, so send a realistic UA + Accept pair. This
 * mirrors what the Lambda used to send.
 */
const BROWSER_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const REQUEST_TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 3;

export class StockAnalyzerFetchError extends Error {
  constructor(message: string, readonly url: string, readonly status?: number, readonly rejected: boolean = false) {
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

function isChallengePage(html: string): boolean {
  return CHALLENGE_PAGE_MARKERS.some((marker) => html.includes(marker));
}

/** One concise error line with what is needed to act on a block: status, URL and the edge's diagnostics. */
function logRejection(url: string, reason: string, response: Response, attempt: number): void {
  const diagnostics: string[] = [];
  for (const header of ['retry-after', 'server', 'cf-ray', 'cf-mitigated', 'x-amz-cf-id']) {
    const value: string | null = response.headers.get(header);
    if (value) diagnostics.push(`${header}=${value}`);
  }
  console.error(
    `${SCRAPER_REJECTED_LOG_TAG} ${reason} (attempt ${attempt}/${MAX_ATTEMPTS}) for ${url}${diagnostics.length ? ` [${diagnostics.join(' ')}]` : ''}`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch one source-site page as HTML.
 *
 * Retries transient failures (network error, 429, 5xx) with a short backoff.
 * A 404 is not retried — it means the ticker or sub-page genuinely does not
 * exist on the source site. A 401/403 or a bot-challenge page is not retried
 * either (it will not clear in a second); every rejection is logged with
 * `SCRAPER_REJECTED_LOG_TAG`.
 */
export async function fetchStockAnalyzerPage(url: string): Promise<string> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response: Response = await fetch(url, {
        headers: {
          'User-Agent': BROWSER_USER_AGENT,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        cache: 'no-store',
      });

      if (response.status === 404) {
        throw new StockAnalyzerFetchError(`Page not found: ${url}`, url, 404);
      }

      if (REJECTION_STATUSES.has(response.status)) {
        logRejection(url, `Rejected with ${response.status} ${response.statusText}`, response, attempt);
        throw new StockAnalyzerFetchError(`Rejected by source site with ${response.status} ${response.statusText}: ${url}`, url, response.status, true);
      }

      const html: string = await response.text();
      if (isChallengePage(html)) {
        logRejection(url, `Served a bot-challenge page (status ${response.status})`, response, attempt);
        throw new StockAnalyzerFetchError(`Rejected by source site with a bot-challenge page (status ${response.status}): ${url}`, url, response.status, true);
      }

      if (!response.ok) {
        throw new StockAnalyzerFetchError(`Request failed with ${response.status} ${response.statusText}: ${url}`, url, response.status);
      }

      return html;
    } catch (error) {
      // 404 and hard rejections (401/403/challenge) will not change on an immediate retry; 429 may.
      if (error instanceof StockAnalyzerFetchError && (error.status === 404 || (error.rejected && error.status !== 429))) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_ATTEMPTS) {
        await sleep(attempt * 500);
      }
    }
  }

  // Keep the last status/rejection so callers (and the logs) can still tell a block from an outage.
  const last: StockAnalyzerFetchError | undefined = lastError instanceof StockAnalyzerFetchError ? lastError : undefined;
  throw new StockAnalyzerFetchError(
    `Failed to fetch after ${MAX_ATTEMPTS} attempts (${lastError?.message}): ${url}`,
    url,
    last?.status,
    last?.rejected ?? false
  );
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
