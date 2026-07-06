'use server';

import {
  revalidateAllTickerTagsAwaited,
  revalidateStocksPageTag,
  revalidateIndustryPageTag,
  revalidatePortfolioManagersByTypeTag,
  revalidatePortfolioProfileTag,
} from '@/utils/ticker-v1-cache-utils';
import { revalidateAllEtfTagsAwaited, revalidateEtfListingTagOnly, type EtfListingCacheTag } from '@/utils/etf-cache-utils';
import {
  CacheFlushResult,
  classifyCloudFrontPaths,
  CloudFrontInvalidationResult,
  formatCloudFrontResult,
  invalidateCloudFrontPathsAwaited,
} from '@/utils/cloudfront-cache-utils';
import { revalidateCommodityTagsForPaths } from '@/utils/commodity-analysis-reports/commodity-cache-utils';
import { revalidateEtfScenarioBySlugTag, revalidateEtfScenarioListingTag } from '@/utils/etf-scenario-cache-utils';
import { revalidateStockScenarioBySlugTag, revalidateStockScenarioListingTag } from '@/utils/stock-scenario-cache-utils';
import { revalidateTariffReportsListing } from '@/utils/tariff-report-cache-utils';
import { revalidateTariffChapterDetailTag, revalidateTariffChapterRelatedReportTag } from '@/utils/tariff-calculator/cache-tags';
import { revalidateHtsChapterRefsTag } from '@/utils/tariff-cross-links/hts-chapter-ref';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { PortfolioManagerType } from '@/types/portfolio-manager';
import { prisma } from '@/prisma';

export async function revalidateStocksPageCache(country: string) {
  revalidateStocksPageTag(country as SupportedCountries);
  return { success: true, message: `Revalidated stocks page cache for ${country}` };
}

export async function revalidateIndustryPageCache(country: string, industryKey: string) {
  revalidateIndustryPageTag(country as SupportedCountries, industryKey);
  return { success: true, message: `Revalidated industry page cache for ${country}/${industryKey}` };
}

export async function revalidatePortfolioManagersByTypeCache(type: PortfolioManagerType) {
  revalidatePortfolioManagersByTypeTag(type);
  return { success: true, message: `Revalidated portfolio managers cache for type ${type}` };
}

export async function revalidatePortfolioProfileIfExists(userId: string) {
  const profile = await prisma.portfolioManagerProfile.findFirst({
    where: { userId },
    select: { id: true },
  });

  if (profile) {
    revalidatePortfolioProfileTag(profile.id);
  }
}

export async function revalidatePortfolioProfileCache(portfolioManagerId: string) {
  revalidatePortfolioProfileTag(portfolioManagerId);
  return { success: true, message: `Revalidated portfolio profile cache for ${portfolioManagerId}` };
}

export async function revalidateTickerCache(ticker: string, exchange: string): Promise<CacheFlushResult> {
  // The admin-facing "Revalidate" action is meant to clear *everything* for a
  // ticker — main page plus every per-subpage cache slice. We await the
  // CloudFront round-trip (instead of fire-and-forget) so the UI gets real
  // success/failure feedback — env-missing and IAM-denied are surfaced
  // instead of hiding behind a blanket `success: true`.
  const cf = await revalidateAllTickerTagsAwaited(ticker, exchange);
  return formatCloudFrontResult(`${exchange.toUpperCase()}:${ticker.toUpperCase()}`, cf);
}

export async function revalidateEtfCache(symbol: string, exchange: string): Promise<CacheFlushResult> {
  // Admin "Invalidate cache" / "Flush Cache" — clears everything for an ETF.
  // Awaited so the UI sees the real CloudFront outcome (see comment above).
  const cf = await revalidateAllEtfTagsAwaited(symbol, exchange);
  return formatCloudFrontResult(`ETF ${exchange.toUpperCase()}:${symbol.toUpperCase()}`, cf);
}

/**
 * Admin-facing "Revalidate This Listing" for any ETF listing page. Clears BOTH
 * cache layers for just the current page:
 *  - Next.js Data Cache: the tag backing this listing surface (index + group
 *    pages). Filter-based detail pages (provider / asset-class / category) are
 *    uncached in Next, so `tag` is omitted and only the edge is purged.
 *  - CloudFront: the exact page path the admin is viewing.
 * Awaited so the UI gets the real CloudFront outcome (env-missing / IAM-denied
 * surface instead of a blanket success).
 */
export async function revalidateEtfListingPageCache(pathname: string, tag?: EtfListingCacheTag): Promise<CacheFlushResult> {
  if (tag) revalidateEtfListingTagOnly(tag);
  const cf = await invalidateCloudFrontPathsAwaited([pathname]);
  return formatCloudFrontResult(pathname, cf);
}

export async function revalidateEtfScenariosListingCache() {
  revalidateEtfScenarioListingTag();
  return { success: true, message: 'Revalidated ETF scenarios listing cache' };
}

export async function revalidateEtfScenarioCache(slug: string) {
  revalidateEtfScenarioBySlugTag(slug);
  return { success: true, message: `Revalidated ETF scenario cache for ${slug}` };
}

export async function revalidateStockScenariosListingCache() {
  revalidateStockScenarioListingTag();
  return { success: true, message: 'Revalidated Stock scenarios listing cache' };
}

export async function revalidateStockScenarioCache(slug: string) {
  revalidateStockScenarioBySlugTag(slug);
  return { success: true, message: `Revalidated Stock scenario cache for ${slug}` };
}

export async function revalidateTariffReportsListingCache() {
  revalidateTariffReportsListing();
  return { success: true, message: 'Revalidated tariff reports listing cache' };
}

export async function revalidateHtsChapterDetailCache(chapterNumber: number) {
  revalidateTariffChapterDetailTag(chapterNumber);
  revalidateTariffChapterRelatedReportTag(chapterNumber);
  revalidateHtsChapterRefsTag();
  return { success: true, message: `Revalidated HTS chapter ${chapterNumber} cache` };
}

export interface AdminInvalidateCacheResult {
  cloudfront: CloudFrontInvalidationResult;
  cachedPaths: string[];
  uncachedPaths: string[];
  /** Next.js Data Cache tags revalidated for the recognized commodity paths. */
  revalidatedTags: string[];
}

/**
 * Admin-facing cache invalidation. Accepts arbitrary paths the operator pasted
 * on the `/admin-v1/invalidate-cache` page and purges the relevant cache layer(s):
 *  - CloudFront: classifies the paths against the cached-prefix allowlist (so
 *    the UI can show which were sent to AWS vs ignored as no-ops) and forwards
 *    the cached subset. (Commodity paths are NOT CloudFront-cached, so they fall
 *    into the ignored/no-op bucket here.)
 *  - Next.js Data Cache: revalidates the tag behind any commodity path
 *    (`/commodities` → listing tag, `/commodities/<slug>...` → per-slug tag) —
 *    the only cache layer that applies to commodity pages.
 */
export async function invalidateCloudFrontPathsForAdmin(paths: string[]): Promise<AdminInvalidateCacheResult> {
  const { cached, uncached } = classifyCloudFrontPaths(paths);
  const revalidatedTags = revalidateCommodityTagsForPaths(paths);
  const cloudfront = await invalidateCloudFrontPathsAwaited(paths);
  return { cloudfront, cachedPaths: cached, uncachedPaths: uncached, revalidatedTags };
}
