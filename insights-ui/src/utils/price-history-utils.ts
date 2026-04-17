import { prisma } from '@/prisma';
import { TickerV1, TickerV1PriceHistory } from '@prisma/client';
import yahooFinance from 'yahoo-finance2';
import { PriceHistoryPoint } from '@/types/prismaTypes';
import { revalidateTickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { convertToYahooFinanceSymbol } from '@/utils/yahoo-finance-symbol-utils';

/** Freshness threshold. Weekly refresh = once per week. */
const REFRESH_AGE_DAYS = 7;

function isDataStale(lastUpdatedAt: Date | null | undefined): boolean {
  if (!lastUpdatedAt) return true;
  const ageInDays = (Date.now() - lastUpdatedAt.getTime()) / (1000 * 60 * 60 * 24);
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
  const result = await yahooFinance.chart(yahooSymbol, {
    period1,
    period2: new Date(),
    interval,
  });

  const currency = result.meta?.currency ?? null;
  const quotes = result.quotes ?? [];

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
 * - Daily series: last ~90 days (covers the 1M range tab with headroom)
 * - Weekly series: max available (covers 6M / 1Y / 5Y / MAX range tabs)
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
      needsDaily ? fetchFromYahoo(yahooSymbol, '1d', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) : Promise.resolve<FetchResult | null>(null),
      needsWeekly
        ? // 20 years back — yahoo-finance2 clamps to listing date automatically
          fetchFromYahoo(yahooSymbol, '1wk', new Date(Date.now() - 20 * 365 * 24 * 60 * 60 * 1000))
        : Promise.resolve<FetchResult | null>(null),
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
