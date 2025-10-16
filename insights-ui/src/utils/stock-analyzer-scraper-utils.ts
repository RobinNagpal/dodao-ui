import { prisma } from '@/prisma';
import { TickerV1, TickerV1StockAnalyzerScrapperInfo, Prisma } from '@prisma/client';

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
  const updateData: Partial<Prisma.TickerV1StockAnalyzerScrapperInfoCreateInput> = {};
  const allErrors: any[] = existingInfo?.errors ? [...(existingInfo.errors as any[])] : [];

  for (const { config, result, error } of results) {
    if (error) {
      console.error(`Error fetching ${config.endpoint} for ${ticker.symbol}:`, error);
      allErrors.push({
        endpoint: config.endpoint,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } else if (result) {
      (updateData as any)[config.field] = result.data;
      (updateData as any)[config.lastUpdatedField] = new Date();

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
  }

  (updateData as any).errors = allErrors;

  // Upsert the scraper info
  const scraperInfo = await prisma.tickerV1StockAnalyzerScrapperInfo.upsert({
    where: {
      tickerId: ticker.id,
    },
    update: updateData,
    create: {
      tickerId: ticker.id,
      summary: updateData.summary || {},
      lastUpdatedAtSummary: updateData.lastUpdatedAtSummary || new Date(),
      dividends: updateData.dividends || {},
      lastUpdatedAtDividends: updateData.lastUpdatedAtDividends || new Date(),
      incomeStatementAnnual: updateData.incomeStatementAnnual || {},
      lastUpdatedAtIncomeStatementAnnual: updateData.lastUpdatedAtIncomeStatementAnnual || new Date(),
      incomeStatementQuarter: updateData.incomeStatementQuarter || {},
      lastUpdatedAtIncomeStatementQuarter: updateData.lastUpdatedAtIncomeStatementQuarter || new Date(),
      balanceSheetAnnual: updateData.balanceSheetAnnual || {},
      lastUpdatedAtBalanceSheetAnnual: updateData.lastUpdatedAtBalanceSheetAnnual || new Date(),
      balanceSheetQuarter: updateData.balanceSheetQuarter || {},
      lastUpdatedAtBalanceSheetQuarter: updateData.lastUpdatedAtBalanceSheetQuarter || new Date(),
      cashFlowAnnual: updateData.cashFlowAnnual || {},
      lastUpdatedAtCashFlowAnnual: updateData.lastUpdatedAtCashFlowAnnual || new Date(),
      cashFlowQuarter: updateData.cashFlowQuarter || {},
      lastUpdatedAtCashFlowQuarter: updateData.lastUpdatedAtCashFlowQuarter || new Date(),
      ratiosAnnual: updateData.ratiosAnnual || {},
      lastUpdatedAtRatiosAnnual: updateData.lastUpdatedAtRatiosAnnual || new Date(),
      ratiosQuarter: updateData.ratiosQuarter || {},
      lastUpdatedAtRatiosQuarter: updateData.lastUpdatedAtRatiosQuarter || new Date(),
      errors: allErrors,
    },
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
