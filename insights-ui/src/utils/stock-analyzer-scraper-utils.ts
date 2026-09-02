import { prisma } from '@/prisma';
import { TickerV1, TickerV1StockAnalyzerScrapperInfo, Prisma } from '@prisma/client';
import {
  IncomeAnnualData,
  IncomeQuarterlyData,
  BalanceAnnualData,
  BalanceQuarterlyData,
  CashFlowAnnualData,
  CashFlowQuarterlyData,
  RatiosAnnualData,
  RatiosQuarterlyData,
  KpisAnnualData,
  KpisQuarterlyData,
  DividendsData,
  DividendHistoryRow,
  StockFundamentalsSummary,
} from '@/types/prismaTypes';
import { isScrapedSectionUsable, ScrapeSectionResult, scrapeStockAnalyzerSection, StockAnalyzerSectionId } from '@/utils/stock-analyzer';

type ScraperInfoDataField = keyof Omit<
  TickerV1StockAnalyzerScrapperInfo,
  'id' | 'tickerId' | 'ticker' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'errors'
>;

interface FetchConfig {
  /** Which source-site page + period this row is scraped from. */
  section: StockAnalyzerSectionId;
  field: ScraperInfoDataField;
  lastUpdatedField: ScraperInfoDataField;
  maxAgeInDays: number;
}

// Configuration for each data type
const FETCH_CONFIGS: FetchConfig[] = [
  {
    section: 'summary',
    field: 'summary',
    lastUpdatedField: 'lastUpdatedAtSummary',
    maxAgeInDays: 7,
  },
  {
    section: 'dividends',
    field: 'dividends',
    lastUpdatedField: 'lastUpdatedAtDividends',
    maxAgeInDays: 30,
  },
  {
    section: 'income-statement/annual',
    field: 'incomeStatementAnnual',
    lastUpdatedField: 'lastUpdatedAtIncomeStatementAnnual',
    maxAgeInDays: 90,
  },
  {
    section: 'income-statement/quarterly',
    field: 'incomeStatementQuarter',
    lastUpdatedField: 'lastUpdatedAtIncomeStatementQuarter',
    maxAgeInDays: 30,
  },
  {
    section: 'balance-sheet/annual',
    field: 'balanceSheetAnnual',
    lastUpdatedField: 'lastUpdatedAtBalanceSheetAnnual',
    maxAgeInDays: 90,
  },
  {
    section: 'balance-sheet/quarterly',
    field: 'balanceSheetQuarter',
    lastUpdatedField: 'lastUpdatedAtBalanceSheetQuarter',
    maxAgeInDays: 30,
  },
  {
    section: 'cashflow/annual',
    field: 'cashFlowAnnual',
    lastUpdatedField: 'lastUpdatedAtCashFlowAnnual',
    maxAgeInDays: 90,
  },
  {
    section: 'cashflow/quarterly',
    field: 'cashFlowQuarter',
    lastUpdatedField: 'lastUpdatedAtCashFlowQuarter',
    maxAgeInDays: 30,
  },
  {
    section: 'ratios/annual',
    field: 'ratiosAnnual',
    lastUpdatedField: 'lastUpdatedAtRatiosAnnual',
    maxAgeInDays: 90,
  },
  {
    section: 'ratios/quarterly',
    field: 'ratiosQuarter',
    lastUpdatedField: 'lastUpdatedAtRatiosQuarter',
    maxAgeInDays: 30,
  },
  {
    section: 'kpis/annual',
    field: 'kpisAnnual',
    lastUpdatedField: 'lastUpdatedAtKpisAnnual',
    maxAgeInDays: 90,
  },
  {
    section: 'kpis/quarterly',
    field: 'kpisQuarter',
    lastUpdatedField: 'lastUpdatedAtKpisQuarter',
    maxAgeInDays: 30,
  },
];

/**
 * `lastUpdatedAt*` sentinel for a section that has never been stored
 * successfully. The columns are non-nullable, so a row created while a section
 * was failing has to carry *some* timestamp — the epoch makes it unambiguously
 * stale, instead of the `new Date()` that used to be written and made an empty
 * section look freshly fetched for the next 30-90 days.
 */
const NEVER_FETCHED_AT = new Date(0);

/**
 * Cap on the persisted `errors` array. It used to be read back and appended to
 * on every request, so a section failing on a hot page grew the column without
 * bound. Keep only the most recent entries — older ones tell you nothing the
 * newer ones don't.
 */
const MAX_STORED_ERRORS = 50;

/**
 * How long to leave a failing section alone before scraping it again.
 *
 * A section can come back empty for two very different reasons: the source
 * layout changed (fix the parser), or the ticker genuinely has no data for that
 * statement/period (Reliance publishes no quarterly cash flow, for instance).
 * Neither is worth re-attempting on every page render, and neither may be
 * written over good data — so instead of stamping `lastUpdatedAt*`, the last
 * attempt is read back off the persisted `errors` entries.
 */
const FAILED_SECTION_RETRY_MS = 6 * 60 * 60 * 1000;

export interface StoredScraperError {
  section: string;
  error: string;
  timestamp: string;
}

export interface FetchStockAnalyzerDataOptions {
  /**
   * Re-scrape every section regardless of how recently it was stored. Used by
   * the admin refresh endpoint to recover rows whose sections were persisted
   * empty (and therefore look "fresh" to the age check).
   */
  force?: boolean;
}

/**
 * Check if data is older than specified days
 */
function isDataStale(lastUpdatedAt: Date | null, maxAgeInDays: number): boolean {
  if (!lastUpdatedAt) {
    return true;
  }

  const now = new Date();
  const ageInDays = (now.getTime() - lastUpdatedAt.getTime()) / (1000 * 60 * 60 * 24);
  return ageInDays > maxAgeInDays;
}

/**
 * Check if summary field is empty (empty object {})
 * Summary is the key indicator - if it's empty, the entire fetch likely failed
 */
function isEmptySummary(summary: StockFundamentalsSummary): boolean {
  return Object.keys(summary).length === 0;
}

/**
 * Determine which sections need to be scraped.
 *
 * A section is fetched when it is missing, when what is stored for it is not
 * usable (an empty `{}` or a `{ periods: [] }` left behind by a failed scrape),
 * or when it is older than its `maxAgeInDays`. The stored-but-unusable case
 * matters: without it an empty section keeps its "fresh" timestamp and is not
 * retried until the age window expires, which is how every ticker ended up with
 * no income statement for months after the source site changed its markup.
 */
function determineDataToFetch(existingData: TickerV1StockAnalyzerScrapperInfo | null, options: FetchStockAnalyzerDataOptions = {}): FetchConfig[] {
  if (!existingData || options.force) {
    // If no existing data, fetch everything
    return FETCH_CONFIGS;
  }

  const storedErrors: StoredScraperError[] = (existingData.errors as StoredScraperError[] | null) || [];
  const configsToFetch: FetchConfig[] = [];

  for (const config of FETCH_CONFIGS) {
    const storedValue: unknown = existingData[config.field];
    const lastUpdatedAt = existingData[config.lastUpdatedField] as Date;
    const needsFetch: boolean = !isScrapedSectionUsable(config.section, storedValue) || isDataStale(lastUpdatedAt, config.maxAgeInDays);

    if (needsFetch && !isInFailureBackoff(storedErrors, config.section)) {
      configsToFetch.push(config);
    }
  }

  return configsToFetch;
}

/** True while a section's most recent scrape failure is still inside the retry window. */
function isInFailureBackoff(storedErrors: StoredScraperError[], section: StockAnalyzerSectionId): boolean {
  let lastFailureMs: number | null = null;

  for (const storedError of storedErrors) {
    if (storedError.section !== section) {
      continue;
    }
    const failedAtMs: number = new Date(storedError.timestamp).getTime();
    if (Number.isFinite(failedAtMs) && (lastFailureMs === null || failedAtMs > lastFailureMs)) {
      lastFailureMs = failedAtMs;
    }
  }

  return lastFailureMs !== null && Date.now() - lastFailureMs < FAILED_SECTION_RETRY_MS;
}

function trimErrors(errors: StoredScraperError[]): StoredScraperError[] {
  return errors.slice(-MAX_STORED_ERRORS);
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Fetch and update stock analyzer scraper data for a ticker
 * Returns the updated or existing scraper info
 */
export async function fetchAndUpdateStockAnalyzerData(
  ticker: TickerV1,
  options: FetchStockAnalyzerDataOptions = {}
): Promise<TickerV1StockAnalyzerScrapperInfo> {
  if (!ticker.stockAnalyzeUrl) {
    throw new Error(`Ticker ${ticker.symbol} does not have a stockAnalyzeUrl`);
  }

  // Get existing scraper info if it exists
  const existingInfo = await prisma.tickerV1StockAnalyzerScrapperInfo.findUnique({
    where: {
      tickerId: ticker.id,
    },
  });

  // Determine what data needs to be fetched
  const configsToFetch = determineDataToFetch(existingInfo, options);

  if (configsToFetch.length === 0) {
    // All data is fresh, return existing data
    console.log(`All data is fresh for ticker ${ticker.symbol}`);
    return existingInfo!;
  }

  console.log(`Scraping ${configsToFetch.length} section(s) for ticker ${ticker.symbol}`);

  const results = await Promise.all(
    configsToFetch.map((config) =>
      scrapeStockAnalyzerSection(ticker.stockAnalyzeUrl!, config.section)
        .then((result: ScrapeSectionResult) => ({ config, result, error: null as unknown }))
        .catch((error: unknown) => ({ config, result: null as ScrapeSectionResult | null, error }))
    )
  );

  const allErrors: StoredScraperError[] = [...((existingInfo?.errors as StoredScraperError[] | null) || [])];
  const recoveredSections: Set<StockAnalyzerSectionId> = new Set();
  const updateData: Partial<Prisma.TickerV1StockAnalyzerScrapperInfoUpdateInput> = {};
  const timestamp = new Date();

  // Every section starts out "never fetched" on create; only the ones that
  // actually produced usable data below get a real timestamp.
  const createData: Prisma.TickerV1StockAnalyzerScrapperInfoCreateInput = {
    ticker: { connect: { id: ticker.id } },
    summary: {},
    lastUpdatedAtSummary: NEVER_FETCHED_AT,
    dividends: {},
    lastUpdatedAtDividends: NEVER_FETCHED_AT,
    incomeStatementAnnual: {},
    lastUpdatedAtIncomeStatementAnnual: NEVER_FETCHED_AT,
    incomeStatementQuarter: {},
    lastUpdatedAtIncomeStatementQuarter: NEVER_FETCHED_AT,
    balanceSheetAnnual: {},
    lastUpdatedAtBalanceSheetAnnual: NEVER_FETCHED_AT,
    balanceSheetQuarter: {},
    lastUpdatedAtBalanceSheetQuarter: NEVER_FETCHED_AT,
    cashFlowAnnual: {},
    lastUpdatedAtCashFlowAnnual: NEVER_FETCHED_AT,
    cashFlowQuarter: {},
    lastUpdatedAtCashFlowQuarter: NEVER_FETCHED_AT,
    ratiosAnnual: {},
    lastUpdatedAtRatiosAnnual: NEVER_FETCHED_AT,
    ratiosQuarter: {},
    lastUpdatedAtRatiosQuarter: NEVER_FETCHED_AT,
    kpisAnnual: {},
    lastUpdatedAtKpisAnnual: NEVER_FETCHED_AT,
    kpisQuarter: {},
    lastUpdatedAtKpisQuarter: NEVER_FETCHED_AT,
    errors: [],
  };

  for (const { config, result, error } of results) {
    if (error || !result) {
      console.error(`Error scraping ${config.section} for ${ticker.symbol}:`, error);
      allErrors.push({ section: config.section, error: toErrorMessage(error), timestamp: timestamp.toISOString() });
      continue;
    }

    // A page that loads but parses to nothing means the source layout changed.
    // Never write that over data we already have, and never stamp it as fresh —
    // otherwise one bad scrape blanks the section until its age window expires.
    if (!isScrapedSectionUsable(config.section, result.data)) {
      console.error(`Scraped no usable data for ${config.section} (${ticker.symbol}) from ${result.url}; keeping previously stored data`);
      allErrors.push(...result.errors.map((e) => ({ section: config.section, error: `${e.where}: ${e.message}`, timestamp: timestamp.toISOString() })));
      continue;
    }

    (updateData as Record<string, unknown>)[config.field] = result.data;
    (updateData as Record<string, unknown>)[config.lastUpdatedField] = timestamp;
    (createData as Record<string, unknown>)[config.field] = result.data;
    (createData as Record<string, unknown>)[config.lastUpdatedField] = timestamp;

    // Clear this section's past failures so a recovered section is not held in
    // the retry backoff by errors that no longer apply.
    recoveredSections.add(config.section);
  }

  const trimmedErrors = trimErrors(allErrors.filter((storedError) => !recoveredSections.has(storedError.section as StockAnalyzerSectionId)));
  updateData.errors = trimmedErrors as unknown as Prisma.InputJsonValue;
  createData.errors = trimmedErrors as unknown as Prisma.InputJsonValue;

  // Upsert the scraper info
  const scraperInfo = await prisma.tickerV1StockAnalyzerScrapperInfo.upsert({
    where: {
      tickerId: ticker.id,
    },
    update: updateData,
    create: createData,
  });

  console.log(`Updated scraper info for ticker ${ticker.symbol}`);
  // Intentionally do NOT revalidate the ticker tag here. This function runs in
  // the read path of several API routes (financial-info, quarterly-chart-data,
  // business-and-moat, etc.) that the static ticker pages fetch during render,
  // so a revalidate here would evict the very cache entry we just filled and
  // force an immediate re-render — double-counting ISR writes. The freshly
  // upserted data is already in the response we're returning, which the
  // caller's fetch will cache.
  return scraperInfo;
}

/**
 * Always re-fetches the market summary from the scraper (bypasses the 7-day freshness rule).
 * Use for Fair Value so last close / snapshot time matches the latest quote, without refreshing all other sections.
 * If no scraper row exists yet, falls back to a full {@link fetchAndUpdateStockAnalyzerData} bootstrap.
 */
export async function refreshMarketSummaryForFairValue(ticker: TickerV1): Promise<TickerV1StockAnalyzerScrapperInfo> {
  if (!ticker.stockAnalyzeUrl) {
    throw new Error(`Ticker ${ticker.symbol} does not have a stockAnalyzeUrl`);
  }

  const existingInfo = await prisma.tickerV1StockAnalyzerScrapperInfo.findUnique({
    where: { tickerId: ticker.id },
  });

  if (!existingInfo) {
    return fetchAndUpdateStockAnalyzerData(ticker);
  }

  const allErrors: StoredScraperError[] = [...((existingInfo.errors as StoredScraperError[] | null) || [])];
  const updateData: Partial<Prisma.TickerV1StockAnalyzerScrapperInfoUpdateInput> = {};
  const timestamp = new Date();

  try {
    const result: ScrapeSectionResult = await scrapeStockAnalyzerSection(ticker.stockAnalyzeUrl, 'summary');
    if (isScrapedSectionUsable('summary', result.data)) {
      updateData.summary = result.data as unknown as Prisma.InputJsonValue;
      updateData.lastUpdatedAtSummary = timestamp;
    } else {
      allErrors.push(...result.errors.map((e) => ({ section: 'summary', error: `${e.where}: ${e.message}`, timestamp: timestamp.toISOString() })));
    }
  } catch (error) {
    console.error(`Error scraping summary for ${ticker.symbol}:`, error);
    allErrors.push({ section: 'summary', error: toErrorMessage(error), timestamp: timestamp.toISOString() });
  }

  updateData.errors = trimErrors(allErrors) as unknown as Prisma.InputJsonValue;

  const scraperInfo = await prisma.tickerV1StockAnalyzerScrapperInfo.update({
    where: { tickerId: ticker.id },
    data: updateData,
  });

  console.log(`Refreshed market summary only for ticker ${ticker.symbol} (fair value)`);
  // Intentionally do NOT revalidate here — see the note on
  // fetchAndUpdateStockAnalyzerData above. This is called from the fair-value
  // report-generation pipeline; the subsequent saveFactorAnalysisResponse call
  // for the FairValue category will invalidate the right narrow tag.
  return scraperInfo;
}

/**
 * Ensure stock analyzer data is available and fresh for a ticker
 * This is the main function to call from route handlers
 */
export async function ensureStockAnalyzerDataIsFresh(ticker: TickerV1): Promise<TickerV1StockAnalyzerScrapperInfo> {
  return await fetchAndUpdateStockAnalyzerData(ticker);
}

/**
 * Extract and format comprehensive financial data for financial statement analysis
 */
export function extractFinancialDataForAnalysis(scraperInfo: TickerV1StockAnalyzerScrapperInfo) {
  // Check if summary is empty, indicating scraper failure
  if (isEmptySummary(scraperInfo.summary as StockFundamentalsSummary)) {
    throw new Error('Scraper data is invalid: summary is empty, likely due to invalid stockAnalyzeUrl or scraper failure');
  }

  // Helper function to get latest annual data
  const getLatestAnnual = (data: IncomeAnnualData | BalanceAnnualData | CashFlowAnnualData | RatiosAnnualData | null) => {
    if (!data?.periods || data.periods.length === 0) return null;
    // Find the latest annual period (assuming fiscalYear format like "FY 2024")
    const annualPeriods = data.periods
      .filter((period) => period.fiscalYear && period.fiscalYear.startsWith('FY'))
      .sort((a, b) => {
        const yearA = parseInt(a.fiscalYear.replace('FY ', ''));
        const yearB = parseInt(b.fiscalYear.replace('FY ', ''));
        return yearB - yearA; // Descending order
      });
    return annualPeriods[0] || null;
  };

  // Helper function to get last 2 quarters (excluding current quarter if not complete)
  const getLast2Quarters = (data: IncomeQuarterlyData | BalanceQuarterlyData | CashFlowQuarterlyData | RatiosQuarterlyData | null) => {
    if (!data?.periods || data.periods.length === 0) return [];
    return data.periods.slice(0, 2);
  };

  // Send whole summary data
  const marketSummary = scraperInfo.summary || {};

  return {
    marketSummary,

    // Income Statement - last 2 quarters + latest annual
    incomeStatement: {
      meta: scraperInfo.incomeStatementQuarter?.meta || scraperInfo.incomeStatementAnnual?.meta || {},
      last2Quarters: getLast2Quarters(scraperInfo.incomeStatementQuarter as IncomeQuarterlyData | null),
      latestAnnual: getLatestAnnual(scraperInfo.incomeStatementAnnual as IncomeAnnualData | null),
    },

    // Balance Sheet - last 2 quarters + latest annual
    balanceSheet: {
      meta: scraperInfo.balanceSheetQuarter?.meta || scraperInfo.balanceSheetAnnual?.meta || {},
      last2Quarters: getLast2Quarters(scraperInfo.balanceSheetQuarter as BalanceQuarterlyData | null),
      latestAnnual: getLatestAnnual(scraperInfo.balanceSheetAnnual as BalanceAnnualData | null),
    },

    // Cash Flow Statement - last 2 quarters + latest annual
    cashFlow: {
      meta: scraperInfo.cashFlowQuarter?.meta || scraperInfo.cashFlowAnnual?.meta || {},
      last2Quarters: getLast2Quarters(scraperInfo.cashFlowQuarter as CashFlowQuarterlyData | null),
      latestAnnual: getLatestAnnual(scraperInfo.cashFlowAnnual as CashFlowAnnualData | null),
    },

    // Ratios - latest annual + last 2 quarters
    ratios: {
      meta: scraperInfo.ratiosQuarter?.meta || scraperInfo.ratiosAnnual?.meta || {},
      latestAnnual: getLatestAnnual(scraperInfo.ratiosAnnual as RatiosAnnualData | null),
      last2Quarters: getLast2Quarters(scraperInfo.ratiosQuarter as RatiosQuarterlyData | null),
    },

    // Dividends - latest + last 4 payments if applicable
    dividends: scraperInfo.dividends
      ? {
          meta: scraperInfo.dividends.meta || {},
          summary: scraperInfo.dividends.summary || {},
          // Get last 4 dividend payments (most recent first)
          last4Payments: scraperInfo.dividends.history ? scraperInfo.dividends.history.slice(0, 4) : [],
        }
      : { meta: {}, summary: {}, last4Payments: [] },
  };
}

/**
 * Extract and format financial data for past performance analysis (last 5 annual periods only)
 */
export function extractFinancialDataForPastPerformance(scraperInfo: TickerV1StockAnalyzerScrapperInfo) {
  // Check if summary is empty, indicating scraper failure
  if (isEmptySummary(scraperInfo.summary as StockFundamentalsSummary)) {
    throw new Error('Scraper data is invalid: summary is empty, likely due to invalid stockAnalyzeUrl or scraper failure');
  }

  // Helper function to get last 5 annual periods
  const getLast5Annuals = (data: IncomeAnnualData | BalanceAnnualData | CashFlowAnnualData | RatiosAnnualData | null) => {
    if (!data?.periods || data.periods.length === 0) return [];
    // Filter for annual periods and get last 5
    const annualPeriods = data.periods
      .filter((period) => period.fiscalYear && period.fiscalYear.startsWith('FY'))
      .sort((a, b) => {
        const yearA = parseInt(a.fiscalYear.replace('FY ', ''));
        const yearB = parseInt(b.fiscalYear.replace('FY ', ''));
        return yearB - yearA; // Descending order (newest first)
      });
    return annualPeriods.slice(0, 5);
  };

  // Helper function to get last 5 annual dividend records
  const getLast5AnnualDividends = (
    dividendsData: DividendsData
  ): Array<{
    year: number;
    totalAmount: number;
    paymentCount: number;
    dividends: DividendHistoryRow[];
  }> => {
    if (!dividendsData?.history || dividendsData.history.length === 0) return [];

    // Group dividends by year and calculate annual totals
    const dividendsByYear = new Map<number, DividendHistoryRow[]>();

    dividendsData.history.forEach((dividend) => {
      if (dividend.exDividendDate) {
        const year = new Date(dividend.exDividendDate).getFullYear();
        if (!dividendsByYear.has(year)) {
          dividendsByYear.set(year, []);
        }
        dividendsByYear.get(year)!.push(dividend);
      }
    });

    // Convert to array, sort by year (newest first), and take last 5
    const annualDividends = Array.from(dividendsByYear.entries())
      .map(([year, dividends]) => ({
        year,
        totalAmount: dividends.reduce((sum, d) => sum + (d.amount || 0), 0),
        paymentCount: dividends.length,
        dividends: dividends.sort((a, b) => new Date(b.exDividendDate!).getTime() - new Date(a.exDividendDate!).getTime()), // Most recent first within the year
      }))
      .sort((a, b) => b.year - a.year) // Newest years first
      .slice(0, 5);

    return annualDividends;
  };

  // Send whole summary data
  const marketSummary = scraperInfo.summary || {};

  return {
    marketSummary,

    // Financial Statements - last 5 annuals only
    incomeStatement: {
      meta: scraperInfo.incomeStatementAnnual?.meta || {},
      last5Annuals: getLast5Annuals(scraperInfo.incomeStatementAnnual as IncomeAnnualData | null),
    },

    balanceSheet: {
      meta: scraperInfo.balanceSheetAnnual?.meta || {},
      last5Annuals: getLast5Annuals(scraperInfo.balanceSheetAnnual as BalanceAnnualData | null),
    },

    cashFlow: {
      meta: scraperInfo.cashFlowAnnual?.meta || {},
      last5Annuals: getLast5Annuals(scraperInfo.cashFlowAnnual as CashFlowAnnualData | null),
    },

    ratios: {
      meta: scraperInfo.ratiosAnnual?.meta || {},
      last5Annuals: getLast5Annuals(scraperInfo.ratiosAnnual as RatiosAnnualData | null),
    },

    dividends: scraperInfo.dividends
      ? {
          meta: scraperInfo.dividends.meta || {},
          summary: scraperInfo.dividends.summary || {},
          last5Annuals: getLast5AnnualDividends(scraperInfo.dividends),
        }
      : { meta: {}, summary: {}, last5Annuals: [] },
  };
}

/**
 * Coerce unknown to a finite number (same semantics as financial-info route).
 */
function coerceSummaryNumber(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const cleaned = v.replace(/,/g, '').trim();
    const x = Number(cleaned);
    return Number.isFinite(x) ? x : null;
  }
  return null;
}

export interface FairValueValuationSnapshot {
  /** e.g. "April 2, 2026" — use for "today" / report date in the fair value prompt */
  valuationReportDateDisplay: string;
  /** Last close (or open fallback), aligned with Current Price on the ticker page */
  lastClosePriceUsd: number | null;
  /** ISO 8601 timestamp when summary was last refreshed from the scraper */
  marketSnapshotFetchedAt: string | null;
}

/**
 * Builds authoritative date/price context for Fair Value prompts from stored scraper summary.
 * For up-to-date price, call {@link refreshMarketSummaryForFairValue} first (or use {@link loadFairValueValuationSnapshot}).
 */
export function buildFairValueValuationSnapshotFromScraperInfo(
  scraperInfo: TickerV1StockAnalyzerScrapperInfo,
  reportDate: Date = new Date()
): FairValueValuationSnapshot {
  const summary = scraperInfo.summary as StockFundamentalsSummary;
  const valuationReportDateDisplay = reportDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (isEmptySummary(summary)) {
    return {
      valuationReportDateDisplay,
      lastClosePriceUsd: null,
      marketSnapshotFetchedAt: scraperInfo.lastUpdatedAtSummary?.toISOString() ?? null,
    };
  }

  const lastClosePriceUsd = coerceSummaryNumber(summary.previousClose) ?? coerceSummaryNumber(summary.open);

  return {
    valuationReportDateDisplay,
    lastClosePriceUsd,
    marketSnapshotFetchedAt: scraperInfo.lastUpdatedAtSummary?.toISOString() ?? null,
  };
}

/**
 * Refreshes market summary (always) then builds the fair value valuation snapshot for the LLM input.
 */
export async function loadFairValueValuationSnapshot(ticker: TickerV1): Promise<FairValueValuationSnapshot> {
  const scraperInfo = await refreshMarketSummaryForFairValue(ticker);
  return buildFairValueValuationSnapshotFromScraperInfo(scraperInfo);
}

export interface StabilityMarketSnapshot {
  /** e.g. "April 2, 2026" — "today" for the stability prompt. */
  analysisDateDisplay: string;
  /** Last close (or open fallback) — every expected price is derived from this. */
  currentPrice: number | null;
  /** ISO 8601 timestamp for when `currentPrice` was captured by the scraper. */
  priceAsOf: string | null;
  /** Listing currency of `currentPrice`, when known. */
  currency: string | null;
  /** Full scraper market summary (market cap, P/E, beta, 52-week range, dividend, volume). */
  marketSummary: StockFundamentalsSummary;
}

/**
 * Refreshes the market summary (always — the expected prices are anchored to the
 * live price) and returns the price + volatility/valuation context the Stability
 * (market-drawdown) prompt needs.
 */
export async function loadStabilityMarketSnapshot(ticker: TickerV1): Promise<StabilityMarketSnapshot> {
  const scraperInfo = await refreshMarketSummaryForFairValue(ticker);
  const valuationSnapshot = buildFairValueValuationSnapshotFromScraperInfo(scraperInfo);
  const summary = (scraperInfo.summary as StockFundamentalsSummary) || {};
  const financialInfo = await prisma.tickerV1FinancialInfo.findUnique({ where: { tickerId: ticker.id }, select: { currency: true } });

  return {
    analysisDateDisplay: valuationSnapshot.valuationReportDateDisplay,
    currentPrice: valuationSnapshot.lastClosePriceUsd,
    priceAsOf: valuationSnapshot.marketSnapshotFetchedAt,
    currency: financialInfo?.currency ?? null,
    marketSummary: isEmptySummary(summary) ? ({} as StockFundamentalsSummary) : summary,
  };
}

/**
 * Extract and format KPIs data for business & moat and future growth analysis
 * Returns all available periods (TTM + fiscal years for annual, quarters for quarterly)
 */
export function extractKpisDataForAnalysis(scraperInfo: TickerV1StockAnalyzerScrapperInfo) {
  // Check if summary is empty, indicating scraper failure
  if (isEmptySummary(scraperInfo.summary as StockFundamentalsSummary)) {
    throw new Error('Scraper data is invalid: summary is empty, likely due to invalid stockAnalyzeUrl or scraper failure');
  }

  // Get all available annual periods (TTM + FY periods)
  const getAnnualPeriods = (data: KpisAnnualData | null | undefined) => {
    if (!data?.periods || data.periods.length === 0) return [];
    return data.periods;
  };

  // Get all available quarterly periods
  const getQuarterlyPeriods = (data: KpisQuarterlyData | null | undefined) => {
    if (!data?.periods || data.periods.length === 0) return [];
    return data.periods;
  };

  const kpisAnnual = (scraperInfo as any).kpisAnnual as KpisAnnualData | null | undefined;
  const kpisQuarter = (scraperInfo as any).kpisQuarter as KpisQuarterlyData | null | undefined;

  return {
    annual: {
      meta: kpisAnnual?.meta || {},
      periods: getAnnualPeriods(kpisAnnual),
    },
    quarterly: {
      meta: kpisQuarter?.meta || {},
      periods: getQuarterlyPeriods(kpisQuarter),
    },
  };
}
