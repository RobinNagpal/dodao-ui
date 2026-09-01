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

export class StockAnalysisFetchError extends Error {
  constructor(message: string, readonly url: string, readonly status?: number) {
    super(message);
    this.name = 'StockAnalysisFetchError';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch one source-site page as HTML.
 *
 * Retries transient failures (network error, 429, 5xx) with a short backoff.
 * A 404 is not retried — it means the ticker or sub-page genuinely does not
 * exist on the source site.
 */
export async function fetchStockAnalysisPage(url: string): Promise<string> {
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
        throw new StockAnalysisFetchError(`Page not found: ${url}`, url, 404);
      }

      if (!response.ok) {
        throw new StockAnalysisFetchError(`Request failed with ${response.status} ${response.statusText}: ${url}`, url, response.status);
      }

      return await response.text();
    } catch (error) {
      if (error instanceof StockAnalysisFetchError && error.status === 404) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_ATTEMPTS) {
        await sleep(attempt * 500);
      }
    }
  }

  throw new StockAnalysisFetchError(`Failed to fetch after ${MAX_ATTEMPTS} attempts (${lastError?.message}): ${url}`, url);
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
export function buildStockAnalysisSubPageUrl(stockAnalyzeUrl: string, subPath: string, searchParams?: Record<string, string>): string {
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
