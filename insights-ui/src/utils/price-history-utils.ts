import { prisma } from '@/prisma';
import { TickerV1, TickerV1PriceHistory } from '@prisma/client';
import yahooFinance from 'yahoo-finance2';
import { PriceHistoryPoint } from '@/types/prismaTypes';
import { revalidateTickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { convertToYahooFinanceSymbol } from '@/utils/yahoo-finance-symbol-utils';

/** Freshness threshold. Weekly refresh = once per week. */
const REFRESH_AGE_DAYS = 7;

/** Day/week constants used when computing fetch windows. */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Fetch windows sized exactly to what the UI needs:
 * - Daily covers up to the 6M range tab (with a little headroom).
 * - Weekly covers up to the 5Y range tab (with a little headroom).
 * Older data is intentionally not fetched to keep payload size small.
 */
const DAILY_LOOKBACK_DAYS = 200; // ~6.5 months
const WEEKLY_LOOKBACK_DAYS = 366 * 5 + 30; // ~5 years + 1 month

/**
 * Yahoo Finance blocks requests whose User-Agent identifies them as the
 * `yahoo-finance2` library (the library's default UA). Responses come back as
 * HTTP 429 with the plain-text body "Too Many Requests", which the library
 * then fails to parse as JSON. Overriding the UA with a real browser string
 * per call avoids the block.
 */
const YAHOO_BROWSER_FETCH_OPTIONS = {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
  },
};

function isDataStale(lastUpdatedAt: Date | null | undefined): boolean {
  if (!lastUpdatedAt) return true;
  const ageInDays = (Date.now() - lastUpdatedAt.getTime()) / ONE_DAY_MS;
  return ageInDays > REFRESH_AGE_DAYS;
}

type YahooInterval = '1d' | '1wk';

interface FetchResult {
  points: PriceHistoryPoint[];
  currency: string | null;
}

/**
 * Fetch OHLC history from Yahoo for the given symbol/interval and date window.
 */
async function fetchFromYahoo(yahooSymbol: string, interval: YahooInterval, period1: Date): Promise<FetchResult> {
  const result = await yahooFinance.chart(
    yahooSymbol,
    {
      period1,
      period2: new Date(),
      interval,
    },
    { fetchOptions: YAHOO_BROWSER_FETCH_OPTIONS }
  );

  const currency = result.meta?.currency ?? null;
  const quotes = (result.quotes ?? []) as Array<{
    date?: unknown;
    open?: unknown;
    high?: unknown;
    low?: unknown;
    close?: unknown;
    volume?: unknown;
  }>;

  const points: PriceHistoryPoint[] = quotes
    .filter((q) => q.date)
    .map((q) => {
      const d = q.date instanceof Date ? q.date : new Date(q.date as unknown as string);
      return {
        date: d.toISOString().slice(0, 10),
        open: typeof q.open === 'number' && Number.isFinite(q.open) ? q.open : null,
        high: typeof q.high === 'number' && Number.isFinite(q.high) ? q.high : null,
        low: typeof q.low === 'number' && Number.isFinite(q.low) ? q.low : null,
        close: typeof q.close === 'number' && Number.isFinite(q.close) ? q.close : null,
        volume: typeof q.volume === 'number' && Number.isFinite(q.volume) ? q.volume : null,
      };
    });

  return { points, currency };
}

/**
 * Ensure price history is available and fresh for a ticker.
 * - Daily series: last ~6.5 months (covers the 1M and 6M range tabs).
 * - Weekly series: last ~5 years (covers the 1Y, 3Y and 5Y range tabs).
 *
 * Refreshed when the record is missing or older than REFRESH_AGE_DAYS.
 */
export async function ensurePriceHistoryIsFresh(ticker: TickerV1): Promise<TickerV1PriceHistory | null> {
  const existing = await prisma.tickerV1PriceHistory.findUnique({
    where: { tickerId: ticker.id },
  });

  const needsDaily = !existing || isDataStale(existing.lastUpdatedAtDaily);
  const needsWeekly = !existing || isDataStale(existing.lastUpdatedAtWeekly);

  if (existing && !needsDaily && !needsWeekly) {
    return existing;
  }

  const yahooSymbol = convertToYahooFinanceSymbol(ticker.symbol, ticker.exchange);
  const now = new Date();

  try {
    const [dailyResult, weeklyResult] = await Promise.all([
      needsDaily ? fetchFromYahoo(yahooSymbol, '1d', new Date(Date.now() - DAILY_LOOKBACK_DAYS * ONE_DAY_MS)) : Promise.resolve<FetchResult | null>(null),
      needsWeekly ? fetchFromYahoo(yahooSymbol, '1wk', new Date(Date.now() - WEEKLY_LOOKBACK_DAYS * ONE_DAY_MS)) : Promise.resolve<FetchResult | null>(null),
    ]);

    const dailyData = dailyResult?.points ?? (existing?.dailyData as unknown as PriceHistoryPoint[] | undefined) ?? [];
    const weeklyData = weeklyResult?.points ?? (existing?.weeklyData as unknown as PriceHistoryPoint[] | undefined) ?? [];
    const currency = dailyResult?.currency ?? weeklyResult?.currency ?? existing?.currency ?? null;

    const saved = await prisma.tickerV1PriceHistory.upsert({
      where: { tickerId: ticker.id },
      update: {
        dailyData: dailyData as unknown as object,
        lastUpdatedAtDaily: needsDaily ? now : existing!.lastUpdatedAtDaily,
        weeklyData: weeklyData as unknown as object,
        lastUpdatedAtWeekly: needsWeekly ? now : existing!.lastUpdatedAtWeekly,
        currency,
      },
      create: {
        ticker: { connect: { id: ticker.id } },
        dailyData: dailyData as unknown as object,
        lastUpdatedAtDaily: now,
        weeklyData: weeklyData as unknown as object,
        lastUpdatedAtWeekly: now,
        currency,
      },
    });

    revalidateTickerAndExchangeTag(ticker.symbol, ticker.exchange);
    return saved;
  } catch (error) {
    console.error(`Failed to refresh price history for ${ticker.symbol} (${ticker.exchange}):`, error);
    // If refresh fails but we have a prior snapshot, fall back to that so the UI still renders.
    return existing;
  }
}
