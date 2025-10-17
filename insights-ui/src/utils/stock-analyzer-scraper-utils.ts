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
  DividendsData,
  DividendHistoryRow,
} from '@/types/prismaTypes';

const LAMBDA_BASE_URL = process.env.STOCK_ANALYZER_LAMBDA_URL || '';

interface ScraperResponse<T = any> {
  tickerUrl: string;
  section: string;
  period: string | null;
  view: string;
  data: T;
  errors: any[];
}

interface FetchConfig {
  endpoint: string;
  view: 'strict' | 'normal';
  field: keyof Omit<TickerV1StockAnalyzerScrapperInfo, 'id' | 'tickerId' | 'ticker' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'errors'>;
  lastUpdatedField: keyof Omit<
    TickerV1StockAnalyzerScrapperInfo,
    'id' | 'tickerId' | 'ticker' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'errors'
  >;
  maxAgeInDays: number;
}

// Configuration for each data type
const FETCH_CONFIGS: FetchConfig[] = [
  {
    endpoint: '/summary',
    view: 'strict',
    field: 'summary',
    lastUpdatedField: 'lastUpdatedAtSummary',
    maxAgeInDays: 7,
  },
  {
    endpoint: '/dividends',
    view: 'strict',
    field: 'dividends',
    lastUpdatedField: 'lastUpdatedAtDividends',
    maxAgeInDays: 30,
  },
  {
    endpoint: '/income-statement/annual',
    view: 'normal',
    field: 'incomeStatementAnnual',
    lastUpdatedField: 'lastUpdatedAtIncomeStatementAnnual',
    maxAgeInDays: 90,
  },
  {
    endpoint: '/income-statement/quarterly',
    view: 'normal',
    field: 'incomeStatementQuarter',
    lastUpdatedField: 'lastUpdatedAtIncomeStatementQuarter',
    maxAgeInDays: 30,
  },
  {
    endpoint: '/balance-sheet/annual',
    view: 'normal',
    field: 'balanceSheetAnnual',
    lastUpdatedField: 'lastUpdatedAtBalanceSheetAnnual',
    maxAgeInDays: 90,
  },
  {
    endpoint: '/balance-sheet/quarterly',
    view: 'normal',
    field: 'balanceSheetQuarter',
    lastUpdatedField: 'lastUpdatedAtBalanceSheetQuarter',
    maxAgeInDays: 30,
  },
  {
    endpoint: '/cashflow/annual',
    view: 'normal',
    field: 'cashFlowAnnual',
    lastUpdatedField: 'lastUpdatedAtCashFlowAnnual',
    maxAgeInDays: 90,
  },
  {
    endpoint: '/cashflow/quarterly',
    view: 'normal',
    field: 'cashFlowQuarter',
    lastUpdatedField: 'lastUpdatedAtCashFlowQuarter',
    maxAgeInDays: 30,
  },
  {
    endpoint: '/ratios/annual',
    view: 'normal',
    field: 'ratiosAnnual',
    lastUpdatedField: 'lastUpdatedAtRatiosAnnual',
    maxAgeInDays: 90,
  },
  {
    endpoint: '/ratios/quarterly',
    view: 'normal',
    field: 'ratiosQuarter',
    lastUpdatedField: 'lastUpdatedAtRatiosQuarter',
    maxAgeInDays: 30,
  },
];

/**
 * Fetch data from AWS Lambda scraper endpoint
 */
async function fetchFromLambda<T = any>(url: string, endpoint: string, view: 'strict' | 'normal'): Promise<ScraperResponse<T>> {
  if (!LAMBDA_BASE_URL) {
    throw new Error('STOCK_ANALYZER_LAMBDA_URL environment variable is not set');
  }

  const response = await fetch(`${LAMBDA_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      view,
    }),
  });

  if (!response.ok) {
    throw new Error(`Lambda request failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
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
 * Determine which data needs to be fetched based on existing data and age
 */
function determineDataToFetch(existingData: TickerV1StockAnalyzerScrapperInfo | null): FetchConfig[] {
  if (!existingData) {
    // If no existing data, fetch everything
    return FETCH_CONFIGS;
  }

  // Check each config to see if data needs updating
  const configsToFetch: FetchConfig[] = [];

  for (const config of FETCH_CONFIGS) {
    const lastUpdatedAt = existingData[config.lastUpdatedField] as Date;
    if (isDataStale(lastUpdatedAt, config.maxAgeInDays)) {
      configsToFetch.push(config);
    }
  }

  return configsToFetch;
}

/**
 * Fetch and update stock analyzer scraper data for a ticker
 * Returns the updated or existing scraper info
 */
export async function fetchAndUpdateStockAnalyzerData(ticker: TickerV1): Promise<TickerV1StockAnalyzerScrapperInfo> {
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
  const configsToFetch = determineDataToFetch(existingInfo);

  if (configsToFetch.length === 0) {
    // All data is fresh, return existing data
    console.log(`All data is fresh for ticker ${ticker.symbol}`);
    return existingInfo!;
  }

  console.log(`Fetching ${configsToFetch.length} data types for ticker ${ticker.symbol}`);

  // Fetch all required data
  const fetchPromises = configsToFetch.map((config) =>
    fetchFromLambda(ticker.stockAnalyzeUrl!, config.endpoint, config.view)
      .then((result) => ({ config, result, error: null }))
      .catch((error) => ({ config, result: null, error }))
  );

  const results = await Promise.all(fetchPromises);

  // Prepare data for upsert
  const allErrors: any[] = existingInfo?.errors ? [...(existingInfo.errors as any[])] : [];
  const updateData: Partial<Prisma.TickerV1StockAnalyzerScrapperInfoCreateInput> = {};
  const currentTimestamp = new Date();

  // Initialize createData with all required timestamp fields
  const createData: Prisma.TickerV1StockAnalyzerScrapperInfoCreateInput = {
    ticker: { connect: { id: ticker.id } },
    summary: {},
    lastUpdatedAtSummary: currentTimestamp,
    dividends: {},
    lastUpdatedAtDividends: currentTimestamp,
    incomeStatementAnnual: {},
    lastUpdatedAtIncomeStatementAnnual: currentTimestamp,
    incomeStatementQuarter: {},
    lastUpdatedAtIncomeStatementQuarter: currentTimestamp,
    balanceSheetAnnual: {},
    lastUpdatedAtBalanceSheetAnnual: currentTimestamp,
    balanceSheetQuarter: {},
    lastUpdatedAtBalanceSheetQuarter: currentTimestamp,
    cashFlowAnnual: {},
    lastUpdatedAtCashFlowAnnual: currentTimestamp,
    cashFlowQuarter: {},
    lastUpdatedAtCashFlowQuarter: currentTimestamp,
    ratiosAnnual: {},
    lastUpdatedAtRatiosAnnual: currentTimestamp,
    ratiosQuarter: {},
    lastUpdatedAtRatiosQuarter: currentTimestamp,
    errors: allErrors,
  };

  for (const { config, result, error } of results) {
    if (error) {
      console.error(`Error fetching ${config.endpoint} for ${ticker.symbol}:`, error);
      allErrors.push({
        endpoint: config.endpoint,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } else if (result) {
      // Set data for both update and create
      const dataValue = result.data;
      const timestampValue = new Date();

      (updateData as any)[config.field] = dataValue;
      (updateData as any)[config.lastUpdatedField] = timestampValue;
      (createData as any)[config.field] = dataValue;
      (createData as any)[config.lastUpdatedField] = timestampValue;

      // Add any errors from the response
      if (result.errors && result.errors.length > 0) {
        allErrors.push(
          ...result.errors.map((err: any) => ({
            endpoint: config.endpoint,
            error: err,
            timestamp: new Date().toISOString(),
          }))
        );
      }
    }
    // Note: For failed requests, timestamps remain null in createData
    // This ensures that failed requests don't appear as "fresh" data
  }

  (updateData as any).errors = allErrors;

  // Upsert the scraper info
  const scraperInfo = await prisma.tickerV1StockAnalyzerScrapperInfo.upsert({
    where: {
      tickerId: ticker.id,
    },
    update: updateData,
    create: createData,
  });

  console.log(`Updated scraper info for ticker ${ticker.symbol}`);
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
 * Extract and format comprehensive financial data for LLM analysis (fair value and financial analysis)
 */
export function extractFinancialDataForAnalysis(scraperInfo: TickerV1StockAnalyzerScrapperInfo) {
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

  // Helper function to get last 4 quarters (excluding current quarter if not complete)
  const getLast4Quarters = (data: IncomeQuarterlyData | BalanceQuarterlyData | CashFlowQuarterlyData | RatiosQuarterlyData | null) => {
    if (!data?.periods || data.periods.length === 0) return [];
    return data.periods.slice(0, 4);
  };

  // Send whole summary data
  const marketSummary = scraperInfo.summary || {};

  return {
    marketSummary,

    // Income Statement - last 4 quarters + latest annual
    incomeStatement: {
      meta: scraperInfo.incomeStatementQuarter?.meta || scraperInfo.incomeStatementAnnual?.meta || {},
      last4Quarters: getLast4Quarters(scraperInfo.incomeStatementQuarter as IncomeQuarterlyData | null),
      latestAnnual: getLatestAnnual(scraperInfo.incomeStatementAnnual as IncomeAnnualData | null),
    },

    // Balance Sheet - last 4 quarters + latest annual
    balanceSheet: {
      meta: scraperInfo.balanceSheetQuarter?.meta || scraperInfo.balanceSheetAnnual?.meta || {},
      last4Quarters: getLast4Quarters(scraperInfo.balanceSheetQuarter as BalanceQuarterlyData | null),
      latestAnnual: getLatestAnnual(scraperInfo.balanceSheetAnnual as BalanceAnnualData | null),
    },

    // Cash Flow Statement - last 4 quarters + latest annual
    cashFlow: {
      meta: scraperInfo.cashFlowQuarter?.meta || scraperInfo.cashFlowAnnual?.meta || {},
      last4Quarters: getLast4Quarters(scraperInfo.cashFlowQuarter as CashFlowQuarterlyData | null),
      latestAnnual: getLatestAnnual(scraperInfo.cashFlowAnnual as CashFlowAnnualData | null),
    },

    // Ratios - latest annual + last 4 quarters
    ratios: {
      meta: scraperInfo.ratiosQuarter?.meta || scraperInfo.ratiosAnnual?.meta || {},
      latestAnnual: getLatestAnnual(scraperInfo.ratiosAnnual as RatiosAnnualData | null),
      last4Quarters: getLast4Quarters(scraperInfo.ratiosQuarter as RatiosQuarterlyData | null),
    },

    // Dividends - latest + last 4 quarters if applicable
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
