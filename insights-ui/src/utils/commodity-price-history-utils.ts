import { PriceHistoryResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import { prisma } from '@/prisma';
import { Commodity, CommodityPriceHistory } from '@prisma/client';
import { PriceHistoryPoint } from '@/types/prismaTypes';
import {
  DAILY_LOOKBACK_DAYS,
  ONE_DAY_MS,
  WEEKLY_LOOKBACK_DAYS,
  YahooPriceHistoryResult,
  fetchPriceHistoryFromYahoo,
  isDataStale,
} from '@/utils/yahoo-price-history';

/**
 * Ensure price history is available and fresh for a commodity.
 *
 * Mirrors `ensureEtfPriceHistoryIsFresh` — Yahoo Finance serves commodity
 * futures OHLC history via the same `chart` endpoint used for equities/ETFs.
 * A commodity's `priceSymbol` (e.g. "GC=F", "CL=F") is already a Yahoo Finance
 * ticker, so it is passed through directly with no exchange-based conversion.
 *
 * - Daily series: last ~6.5 months (covers the 1M and 6M range tabs).
 * - Weekly series: last ~5 years (covers the 1Y, 3Y and 5Y range tabs).
 *
 * Returns null when the commodity has no `priceSymbol` to fetch.
 */
export async function ensureCommodityPriceHistoryIsFresh(commodity: Commodity): Promise<CommodityPriceHistory | null> {
  if (!commodity.priceSymbol) return null;

  const existing = await prisma.commodityPriceHistory.findUnique({
    where: { commodityId: commodity.id },
  });

  const needsDaily = !existing || isDataStale(existing.lastUpdatedAtDaily);
  const needsWeekly = !existing || isDataStale(existing.lastUpdatedAtWeekly);

  if (existing && !needsDaily && !needsWeekly) {
    return existing;
  }

  const yahooSymbol = commodity.priceSymbol;
  const now = new Date();

  try {
    const [dailyResult, weeklyResult] = await Promise.all([
      needsDaily
        ? fetchPriceHistoryFromYahoo(yahooSymbol, '1d', new Date(Date.now() - DAILY_LOOKBACK_DAYS * ONE_DAY_MS))
        : Promise.resolve<YahooPriceHistoryResult | null>(null),
      needsWeekly
        ? fetchPriceHistoryFromYahoo(yahooSymbol, '1wk', new Date(Date.now() - WEEKLY_LOOKBACK_DAYS * ONE_DAY_MS))
        : Promise.resolve<YahooPriceHistoryResult | null>(null),
    ]);

    const dailyData = dailyResult?.points ?? (existing?.dailyData as unknown as PriceHistoryPoint[] | undefined) ?? [];
    const weeklyData = weeklyResult?.points ?? (existing?.weeklyData as unknown as PriceHistoryPoint[] | undefined) ?? [];
    const currency = dailyResult?.currency ?? weeklyResult?.currency ?? existing?.currency ?? null;

    const saved = await prisma.commodityPriceHistory.upsert({
      where: { commodityId: commodity.id },
      update: {
        dailyData: dailyData as unknown as object,
        lastUpdatedAtDaily: needsDaily ? now : existing!.lastUpdatedAtDaily,
        weeklyData: weeklyData as unknown as object,
        lastUpdatedAtWeekly: needsWeekly ? now : existing!.lastUpdatedAtWeekly,
        currency,
      },
      create: {
        commodity: { connect: { id: commodity.id } },
        dailyData: dailyData as unknown as object,
        lastUpdatedAtDaily: now,
        weeklyData: weeklyData as unknown as object,
        lastUpdatedAtWeekly: now,
        currency,
      },
    });

    return saved;
  } catch (error) {
    console.error(`Failed to refresh price history for commodity ${commodity.slug} (${commodity.priceSymbol}):`, error);
    // Fall back to prior snapshot if available so the UI still renders.
    return existing;
  }
}

/**
 * Resolve a commodity's price history into the shared `PriceHistoryResponse`
 * shape consumed by the price chart (reused from stocks/ETFs). Returns null when
 * there is no symbol or no usable data. Kick this off (without awaiting) in the
 * report page and unwrap it inside a `<Suspense>` boundary so the on-demand
 * Yahoo fetch streams in without blocking the rest of the render.
 */
export async function loadCommodityPriceHistory(commodity: Commodity): Promise<PriceHistoryResponse | null> {
  if (!commodity.priceSymbol) return null;

  const priceInfo = await ensureCommodityPriceHistoryIsFresh(commodity);
  if (!priceInfo) return null;

  const daily = (priceInfo.dailyData as unknown as PriceHistoryPoint[] | null) ?? [];
  const weekly = (priceInfo.weeklyData as unknown as PriceHistoryPoint[] | null) ?? [];
  if (daily.length === 0 && weekly.length === 0) return null;

  return { symbol: commodity.priceSymbol, currency: priceInfo.currency ?? null, daily, weekly };
}
