import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { convertToYahooFinanceSymbol } from '@/utils/yahoo-finance-symbol-utils';

type Num = number | null;

// Coerce unknown to a finite number, else null.
const num = (v: unknown): Num => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const x = Number(v);
    return Number.isFinite(x) ? x : null;
  }
  return null;
};

// Read a number or an object with { raw: number }.
const rawNum = (v: unknown): Num => {
  if (v == null) return null;
  const direct = num(v);
  if (direct != null) return direct;
  const maybe = (v as { raw?: unknown })?.raw;
  return num(maybe);
};

// Return the first non-null numeric from candidates (supports {raw}).
const pickNum = (...vals: unknown[]): Num => {
  for (const v of vals) {
    const x = rawNum(v);
    if (x != null) return x;
  }
  return null;
};

export interface FinancialInfoResponse {
  symbol: string;
  currency: string | null;
  price: Num;
  dayHigh: Num;
  dayLow: Num;
  yearHigh: Num;
  yearLow: Num;
  marketCap: Num;
  epsDilutedTTM: Num;
  pe: Num;
  avgVolume3M: Num;
  dayVolume: Num;
  annualDividend: Num;
  dividendYield: Num;
  totalRevenue: Num;
  netIncome: Num;
  netProfitMargin: Num;
}

async function fetchFromYahooFinance(ticker: string, exchange: string): Promise<FinancialInfoResponse> {
  // Convert to Yahoo Finance format (e.g., DIR.UN -> DIR-UN.TO for TSX)
  const yahooSymbol = convertToYahooFinanceSymbol(ticker, exchange);

  // 1) Fast quote
  const q = await yahooFinance.quote(yahooSymbol);

  // 2) Summary for fallbacks
  const qs = await yahooFinance.quoteSummary(yahooSymbol, {
    modules: ['incomeStatementHistoryQuarterly', 'summaryDetail'],
  });

  // ----- TTM from quarterly -----
  const quarterly = qs?.incomeStatementHistoryQuarterly?.incomeStatementHistory ?? [];

  const last4 = Array.isArray(quarterly) ? quarterly.slice(0, 4) : [];

  const totalRevenueTTM =
    last4
      .map((r) => num((r as Record<string, unknown>)?.totalRevenue))
      .filter((x): x is number => x != null)
      .reduce((a, b) => a + b, 0) || null;

  const netIncomeTTM =
    last4
      .map((r) => {
        const row = r as Record<string, unknown>;
        return num(row?.netIncome ?? row?.netIncomeApplicableToCommonShares);
      })
      .filter((x): x is number => x != null)
      .reduce((a, b) => a + b, 0) || null;

  const netProfitMargin = totalRevenueTTM && totalRevenueTTM !== 0 && netIncomeTTM != null ? netIncomeTTM / totalRevenueTTM : null;

  // ----- DIVIDENDS -----
  const sd = qs?.summaryDetail;

  const annualDividend = pickNum((q as Record<string, unknown>)?.dividendRate, sd?.dividendRate, (q as Record<string, unknown>)?.trailingAnnualDividendRate);

  const dividendYield = pickNum((q as Record<string, unknown>)?.dividendYield, sd?.dividendYield, (q as Record<string, unknown>)?.trailingAnnualDividendYield);

  return {
    symbol: ((q as Record<string, unknown>)?.symbol as string) ?? ticker,
    currency: ((q as Record<string, unknown>)?.currency as string) ?? ((q as Record<string, unknown>)?.financialCurrency as string) ?? null,

    price: num((q as Record<string, unknown>)?.regularMarketPrice),
    dayHigh: num((q as Record<string, unknown>)?.regularMarketDayHigh),
    dayLow: num((q as Record<string, unknown>)?.regularMarketDayLow),
    yearHigh: num((q as Record<string, unknown>)?.fiftyTwoWeekHigh),
    yearLow: num((q as Record<string, unknown>)?.fiftyTwoWeekLow),

    marketCap: num((q as Record<string, unknown>)?.marketCap),
    epsDilutedTTM: num((q as Record<string, unknown>)?.epsTrailingTwelveMonths),
    pe: num((q as Record<string, unknown>)?.trailingPE),
    avgVolume3M: num((q as Record<string, unknown>)?.averageDailyVolume3Month),
    dayVolume: num((q as Record<string, unknown>)?.regularMarketVolume),

    annualDividend,
    dividendYield,

    totalRevenue: totalRevenueTTM,
    netIncome: netIncomeTTM,
    netProfitMargin,
  };
}

async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; ticker: string }> }
): Promise<FinancialInfoResponse> {
  const { spaceId, exchange, ticker } = await params;
  const e = exchange?.toUpperCase()?.trim();
  const t = ticker?.toUpperCase()?.trim();

  if (!t || !e) {
    throw new Error('Ticker symbol and exchange are required');
  }

  // Find the ticker in database
  const tickerRecord = await prisma.tickerV1.findFirst({
    where: {
      spaceId,
      symbol: t,
      exchange: e,
    },
    include: {
      financialInfo: true,
    },
  });

  if (!tickerRecord) {
    throw new Error(`Ticker ${t} on exchange ${e} not found`);
  }

  // Check if we have cached data and if it's less than 7 days old
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const existingFinancialInfo = tickerRecord.financialInfo;
  const shouldRefetch = !existingFinancialInfo || existingFinancialInfo.updatedAt < sevenDaysAgo;

  if (shouldRefetch) {
    try {
      // Fetch fresh data from Yahoo Finance
      const freshData = await fetchFromYahooFinance(t, e);

      // Upsert financial info in database (handles both create and update)
      await prisma.tickerV1FinancialInfo.upsert({
        where: {
          tickerId: tickerRecord.id,
        },
        update: {
          currency: freshData.currency,
          price: freshData.price,
          dayHigh: freshData.dayHigh,
          dayLow: freshData.dayLow,
          yearHigh: freshData.yearHigh,
          yearLow: freshData.yearLow,
          marketCap: freshData.marketCap,
          epsDilutedTTM: freshData.epsDilutedTTM,
          pe: freshData.pe,
          avgVolume3M: freshData.avgVolume3M,
          dayVolume: freshData.dayVolume,
          annualDividend: freshData.annualDividend,
          dividendYield: freshData.dividendYield,
          totalRevenue: freshData.totalRevenue,
          netIncome: freshData.netIncome,
          netProfitMargin: freshData.netProfitMargin,
          updatedAt: now,
        },
        create: {
          tickerId: tickerRecord.id,
          currency: freshData.currency,
          price: freshData.price,
          dayHigh: freshData.dayHigh,
          dayLow: freshData.dayLow,
          yearHigh: freshData.yearHigh,
          yearLow: freshData.yearLow,
          marketCap: freshData.marketCap,
          epsDilutedTTM: freshData.epsDilutedTTM,
          pe: freshData.pe,
          avgVolume3M: freshData.avgVolume3M,
          dayVolume: freshData.dayVolume,
          annualDividend: freshData.annualDividend,
          dividendYield: freshData.dividendYield,
          totalRevenue: freshData.totalRevenue,
          netIncome: freshData.netIncome,
          netProfitMargin: freshData.netProfitMargin,
        },
      });

      return freshData;
    } catch (error) {
      // If Yahoo Finance fails and we have cached data, return it
      if (existingFinancialInfo) {
        console.warn(`Yahoo Finance fetch failed for ${t}, returning cached data:`, error);
        return {
          symbol: tickerRecord.symbol,
          currency: existingFinancialInfo.currency,
          price: existingFinancialInfo.price,
          dayHigh: existingFinancialInfo.dayHigh,
          dayLow: existingFinancialInfo.dayLow,
          yearHigh: existingFinancialInfo.yearHigh,
          yearLow: existingFinancialInfo.yearLow,
          marketCap: existingFinancialInfo.marketCap,
          epsDilutedTTM: existingFinancialInfo.epsDilutedTTM,
          pe: existingFinancialInfo.pe,
          avgVolume3M: existingFinancialInfo.avgVolume3M,
          dayVolume: existingFinancialInfo.dayVolume,
          annualDividend: existingFinancialInfo.annualDividend,
          dividendYield: existingFinancialInfo.dividendYield,
          totalRevenue: existingFinancialInfo.totalRevenue,
          netIncome: existingFinancialInfo.netIncome,
          netProfitMargin: existingFinancialInfo.netProfitMargin,
        };
      }

      // If no cached data, throw error so the frontend knows there's no data
      console.warn(`Yahoo Finance fetch failed for ${t} and no cached data available:`, error);
      throw new Error(`Financial data unavailable for ${t} on exchange ${e}`);
    }
  }

  // Return cached data
  return {
    symbol: tickerRecord.symbol,
    currency: existingFinancialInfo.currency,
    price: existingFinancialInfo.price,
    dayHigh: existingFinancialInfo.dayHigh,
    dayLow: existingFinancialInfo.dayLow,
    yearHigh: existingFinancialInfo.yearHigh,
    yearLow: existingFinancialInfo.yearLow,
    marketCap: existingFinancialInfo.marketCap,
    epsDilutedTTM: existingFinancialInfo.epsDilutedTTM,
    pe: existingFinancialInfo.pe,
    avgVolume3M: existingFinancialInfo.avgVolume3M,
    dayVolume: existingFinancialInfo.dayVolume,
    annualDividend: existingFinancialInfo.annualDividend,
    dividendYield: existingFinancialInfo.dividendYield,
    totalRevenue: existingFinancialInfo.totalRevenue,
    netIncome: existingFinancialInfo.netIncome,
    netProfitMargin: existingFinancialInfo.netProfitMargin,
  };
}

export const GET = withErrorHandlingV2<FinancialInfoResponse>(getHandler);
