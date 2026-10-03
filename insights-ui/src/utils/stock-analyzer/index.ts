import { buildStockAnalyzerSubPageUrl, fetchStockAnalyzerPage, StockAnalyzerFetchError } from '@/utils/stock-analyzer/stock-analyzer-fetcher';
import {
  EtfSummaryStats,
  KpisData,
  parseDividendsPage,
  parseEtfSummaryPage,
  parseKpisPage,
  parseMainListingHref,
  parseStatementPage,
  parseSummaryPage,
  StatementData,
  StatementPeriodType,
} from '@/utils/stock-analyzer/stock-analysis-section-parsers';
import { DividendsData, StockFundamentalsSummary } from '@/types/prismaTypes';

/**
 * In-process replacement for the Stock Analyzer Lambda.
 *
 * The Lambda only fetched a page from the stock-analyze site (configured by
 * `NEXT_PUBLIC_STOCK_ANALYZE_BASE_URL`) and parsed its tables, and
 * its statement parsers keyed off `#main-table` — an id the site dropped in a
 * redesign, after which every statement came back as `{ periods: [] }` with a
 * `200 OK`. Owning the scrape here means the parsers live next to the code that
 * reads their output and can be fixed in one deploy.
 */

export type StockAnalyzerSectionId =
  | 'summary'
  | 'dividends'
  | 'income-statement/annual'
  | 'income-statement/quarterly'
  | 'balance-sheet/annual'
  | 'balance-sheet/quarterly'
  | 'cashflow/annual'
  | 'cashflow/quarterly'
  | 'ratios/annual'
  | 'ratios/quarterly'
  | 'kpis/annual'
  | 'kpis/quarterly';

export type ScrapedSectionData = StockFundamentalsSummary | DividendsData | StatementData | KpisData;

export interface ScrapeSectionError {
  where: string;
  message: string;
}

export interface ScrapeSectionResult {
  section: StockAnalyzerSectionId;
  url: string;
  data: ScrapedSectionData;
  errors: ScrapeSectionError[];
}

interface SectionDefinition {
  /** Path appended to the ticker's `stockAnalyzeUrl`. */
  subPath: string;
  /** `?p=quarterly` for quarterly statement pages. */
  searchParams?: Record<string, string>;
  parse: (html: string) => ScrapedSectionData;
  /**
   * Whether a parse produced something worth persisting. A page that renders
   * but yields no rows means the source layout changed — the caller keeps the
   * previously stored data instead of overwriting it with an empty object.
   */
  isUsable: (data: ScrapedSectionData) => boolean;
  /**
   * Whether a 404 on this section may be retried against the ticker's main
   * listing (see {@link scrapeStockAnalyzerSection}).
   *
   * True only for the statement / KPI sections, which a secondary listing does
   * not publish. `summary` and `dividends` stay on the ticker the user is
   * looking at even when its page 404s: those are per-listing figures, and for
   * a cross-border cross-listing the main listing reports them in a different
   * currency, which would silently mix currencies within one stored row.
   */
  fallsBackToMainListing: boolean;
  /**
   * Set when a 404 means "the source site does not publish this section for
   * the listing" rather than a failure: a non-payer has no dividend page, and
   * most non-US listings have no KPI page. The returned payload (marked
   * `meta.notPublished`) is stored and stamped fresh like any good scrape, so
   * the section is not retried until its normal age window expires.
   */
  notPublishedData?: () => ScrapedSectionData;
}

function hasPeriods(data: ScrapedSectionData): boolean {
  const periods: unknown = (data as StatementData | KpisData).periods;
  return Array.isArray(periods) && periods.length > 0;
}

function statementSection(subPath: string, periodType: StatementPeriodType): SectionDefinition {
  return {
    subPath,
    ...(periodType === 'quarterly' ? { searchParams: { p: 'quarterly' } } : {}),
    parse: (html: string): ScrapedSectionData => parseStatementPage(html, periodType),
    isUsable: hasPeriods,
    fallsBackToMainListing: true,
  };
}

function kpisSection(periodType: StatementPeriodType): SectionDefinition {
  return {
    subPath: 'financials/metrics',
    ...(periodType === 'quarterly' ? { searchParams: { p: 'quarterly' } } : {}),
    parse: (html: string): ScrapedSectionData => parseKpisPage(html, periodType),
    isUsable: hasPeriods,
    fallsBackToMainListing: true,
    notPublishedData: (): ScrapedSectionData => ({ meta: { notPublished: true }, periods: [] }),
  };
}

const SECTION_DEFINITIONS: Readonly<Record<StockAnalyzerSectionId, SectionDefinition>> = {
  summary: {
    subPath: '',
    parse: (html: string): ScrapedSectionData => parseSummaryPage(html),
    // The quote page always carries a market cap and a previous close; without
    // them the fetch hit a challenge/placeholder page rather than the quote.
    isUsable: (data: ScrapedSectionData): boolean => Object.keys(data as StockFundamentalsSummary).length > 0,
    fallsBackToMainListing: false,
  },
  dividends: {
    subPath: 'dividend',
    parse: (html: string): ScrapedSectionData => parseDividendsPage(html),
    // Non-payers legitimately have no history, so any parsed summary counts.
    isUsable: (data: ScrapedSectionData): boolean => {
      const dividends = data as DividendsData;
      return dividends.history.length > 0 || Object.keys(dividends.summary).length > 0;
    },
    fallsBackToMainListing: false,
    notPublishedData: (): ScrapedSectionData => ({ meta: { notPublished: true }, summary: {}, history: [] }),
  },
  'income-statement/annual': statementSection('financials/income-statement', 'annual'),
  'income-statement/quarterly': statementSection('financials/income-statement', 'quarterly'),
  'balance-sheet/annual': statementSection('financials/balance-sheet', 'annual'),
  'balance-sheet/quarterly': statementSection('financials/balance-sheet', 'quarterly'),
  'cashflow/annual': statementSection('financials/cash-flow-statement', 'annual'),
  'cashflow/quarterly': statementSection('financials/cash-flow-statement', 'quarterly'),
  'ratios/annual': statementSection('financials/ratios', 'annual'),
  'ratios/quarterly': statementSection('financials/ratios', 'quarterly'),
  'kpis/annual': kpisSection('annual'),
  'kpis/quarterly': kpisSection('quarterly'),
};

/** URL of the source-site page backing a section, for logging / debugging. */
export function stockAnalyzerSectionUrl(stockAnalyzeUrl: string, section: StockAnalyzerSectionId): string {
  const definition: SectionDefinition = SECTION_DEFINITIONS[section];
  return buildStockAnalyzerSubPageUrl(stockAnalyzeUrl, definition.subPath, definition.searchParams);
}

/**
 * Whether a scraped (or previously stored) payload for a section is usable.
 *
 * Exported so the persistence layer can apply the same test to what is already
 * in the database and re-fetch sections that were stored empty.
 */
export function isScrapedSectionUsable(section: StockAnalyzerSectionId, data: unknown): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const definition: SectionDefinition = SECTION_DEFINITIONS[section];
  if (definition.notPublishedData && (data as { meta?: { notPublished?: boolean } }).meta?.notPublished === true) {
    return true;
  }
  try {
    return definition.isUsable(data as ScrapedSectionData);
  } catch {
    return false;
  }
}

/** Stored-error prefix for a quarterly page that only carries half-yearly columns. */
export const HALF_YEARLY_ONLY_ERROR_PREFIX = 'half-yearly-only:';

/**
 * Semi-annual reporters (most ASX listings, some US small caps) have a
 * `?p=quarterly` page whose columns are `H1 2026` / `H2 2026`, so the quarterly
 * parser finds nothing. That is the company's reporting cadence, not a parser
 * failure. Anything else that parses to nothing stays an error.
 */
function isHalfYearlyOnlyQuarterlyPage(section: StockAnalyzerSectionId, html: string): boolean {
  return section.endsWith('/quarterly') && />\s*H[12] \d{4}\s*</.test(html);
}

function isPageNotFound(error: unknown): error is StockAnalyzerFetchError {
  return error instanceof StockAnalyzerFetchError && error.status === 404;
}

/**
 * Fetch a section's page, retrying a 404 once against the ticker's main
 * listing. A secondary listing has no statement pages of its own; they live
 * under its main listing — but only for the sections that a secondary listing
 * genuinely does not publish (see `fallsBackToMainListing`).
 */
async function fetchSectionPage(stockAnalyzeUrl: string, definition: SectionDefinition): Promise<{ url: string; html: string }> {
  const url: string = buildStockAnalyzerSubPageUrl(stockAnalyzeUrl, definition.subPath, definition.searchParams);
  try {
    return { url, html: await fetchStockAnalyzerPage(url) };
  } catch (error) {
    if (!isPageNotFound(error) || !definition.fallsBackToMainListing) {
      throw error;
    }

    const mainListingUrl: string | null = await resolveMainListingUrl(stockAnalyzeUrl);
    if (!mainListingUrl) {
      // Distinguishable in the logs from "this is a main listing": we only get
      // here because the section's own page was missing.
      throw new StockAnalyzerFetchError(`${error.message} (and its quote page carries no Main Listing link)`, error.url, 404);
    }

    const mainListingSectionUrl: string = buildStockAnalyzerSubPageUrl(mainListingUrl, definition.subPath, definition.searchParams);
    return { url: mainListingSectionUrl, html: await fetchStockAnalyzerPage(mainListingSectionUrl) };
  }
}

/**
 * Fetch and parse one section for a ticker.
 *
 * Throws if the page cannot be fetched; a page that loads but parses to nothing
 * comes back with `errors` populated and `isScrapedSectionUsable(...) === false`
 * so the caller can decide not to overwrite good data with it. A 404 on a
 * section with `notPublishedData` is not an error: it comes back as that
 * (usable) "not published" payload.
 */
export async function scrapeStockAnalyzerSection(stockAnalyzeUrl: string, section: StockAnalyzerSectionId): Promise<ScrapeSectionResult> {
  const definition: SectionDefinition = SECTION_DEFINITIONS[section];

  let url: string;
  let html: string;
  try {
    ({ url, html } = await fetchSectionPage(stockAnalyzeUrl, definition));
  } catch (error) {
    if (definition.notPublishedData && isPageNotFound(error)) {
      // Expected for one listing (a non-payer has no dividend page), but kept
      // visible: a spike across many tickers would mean the source moved its URLs.
      console.warn(`${section} not published for ${error.url} (404); storing it as empty`);
      return { section, url: error.url, data: definition.notPublishedData(), errors: [] };
    }
    throw error;
  }

  let data: ScrapedSectionData;
  try {
    data = definition.parse(html);
  } catch (error) {
    throw new Error(`Failed to parse ${section} from ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }

  let errors: ScrapeSectionError[] = [];
  if (!definition.isUsable(data)) {
    errors = isHalfYearlyOnlyQuarterlyPage(section, html)
      ? [
          {
            where: `${HALF_YEARLY_ONLY_ERROR_PREFIX}${section}`,
            message: `Only half-yearly (H1/H2) columns on ${url}; the company publishes no quarterly figures`,
          },
        ]
      : [{ where: `parse:${section}`, message: `Parsed no usable data from ${url} — the source page layout may have changed` }];
  }

  return { section, url, data, errors };
}

/**
 * How long a resolved main listing stays memoized.
 *
 * All 10 statement sections for a ticker are scraped in parallel, so without
 * this every one of them would fetch the quote page again just to read the same
 * link. The mapping only changes when a company restructures its listings, so a
 * short in-process TTL is ample.
 */
const MAIN_LISTING_CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * The in-flight *promise* is cached, not just its result: all 10 statement
 * sections 404 at the same moment under `Promise.all`, so caching only the
 * settled value would still let ten identical quote-page fetches race. This
 * makes the lookup single-flight per ticker.
 */
const mainListingCache: Map<string, { lookup: Promise<string | null>; startedAtMs: number }> = new Map();

/**
 * Resolve a ticker's main listing URL, or null when it is already one (or the
 * quote page cannot be read).
 */
function resolveMainListingUrl(stockAnalyzeUrl: string): Promise<string | null> {
  const quoteUrl: string = buildStockAnalyzerSubPageUrl(stockAnalyzeUrl, '');

  const cached = mainListingCache.get(quoteUrl);
  if (cached && Date.now() - cached.startedAtMs < MAIN_LISTING_CACHE_TTL_MS) {
    return cached.lookup;
  }

  const lookup: Promise<string | null> = fetchStockAnalyzerPage(quoteUrl)
    .then((quoteHtml: string) => {
      const mainListingHref: string | null = parseMainListingHref(quoteHtml);
      if (!mainListingHref) {
        return null;
      }
      const resolved: URL = new URL(mainListingHref, quoteUrl);
      // Never follow the link off-site: the scraped rows are stored as this
      // ticker's financials, so a wrong target would file another company's
      // statements under it.
      if (resolved.origin !== new URL(quoteUrl).origin) {
        console.error(`Ignoring off-site Main Listing link ${resolved.toString()} on ${quoteUrl}`);
        return null;
      }
      return resolved.toString();
    })
    .catch((error: unknown) => {
      console.error(`Could not resolve a main listing from ${quoteUrl}:`, error instanceof Error ? error.message : String(error));
      // Don't let a transient failure be remembered for the full TTL.
      mainListingCache.delete(quoteUrl);
      return null;
    });

  mainListingCache.set(quoteUrl, { lookup, startedAtMs: Date.now() });
  return lookup;
}

/* =============================================================================
   ETFs
============================================================================= */

export interface ScrapeEtfSummaryResult {
  url: string;
  data: EtfSummaryStats;
  errors: ScrapeSectionError[];
}

/** Whether an ETF quote page produced anything worth persisting. */
export function isEtfSummaryUsable(data: EtfSummaryStats): boolean {
  return Object.keys(data).length > 0;
}

/**
 * Fetch and parse an ETF quote page.
 *
 * ETFs live on the same source site as stocks and their quote page uses the
 * same two-column stat tables, so this shares the fetcher and the stat-table
 * reader. As with the stock sections, a page that loads but parses to nothing
 * comes back with `errors` populated and `isEtfSummaryUsable(...) === false`,
 * so the caller can decline to overwrite what it already has.
 */
export async function scrapeEtfSummary(etfUrl: string): Promise<ScrapeEtfSummaryResult> {
  const url: string = buildStockAnalyzerSubPageUrl(etfUrl, '');
  const html: string = await fetchStockAnalyzerPage(url);

  let data: EtfSummaryStats;
  try {
    data = parseEtfSummaryPage(html);
  } catch (error) {
    throw new Error(`Failed to parse ETF summary from ${url}: ${error instanceof Error ? error.message : String(error)}`);
  }

  const errors: ScrapeSectionError[] = isEtfSummaryUsable(data)
    ? []
    : [{ where: 'parse:etf-summary', message: `Parsed no usable data from ${url} — the source page layout may have changed` }];

  return { url, data, errors };
}
