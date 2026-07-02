import 'server-only';
import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import { fetchEtfsForGroupings, fetchEtfsWithoutAssetClass } from '@/app/api/[spaceId]/etfs-v1/listings/listings-prisma';
import { ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';

/**
 * Source-of-truth query for the home-page "Explore ETFs by Asset Class" showcase.
 *
 * This is a first-party Prisma read, so the home-page Server Component calls it directly instead
 * of going through an HTTP self-fetch — exactly like `getTopIndustriesWithTickers` does for the
 * stocks showcase. The home page is statically exported during `next build`; a self-fetch there
 * resolves to the public canonical origin (CloudFront→AWS) and can return an HTML error page that
 * crashes `res.json()` and aborts the export of "/". Reading the DB directly removes that base-URL
 * / CDN dependency entirely and keeps the page build-safe.
 *
 * Mirrors the `/api/.../etfs-v1/listings/asset-classes-index` route. Only two queries run — one for
 * the asset-class buckets, one for the no-asset-class "Others" bucket — each selecting only the
 * columns the cards render and capping to the top 5 per bucket (see `listings-prisma.ts`).
 */
export async function getTopEtfAssetClasses(spaceId: string, country: EtfSupportedCountry): Promise<EtfAssetClassesIndexResponse> {
  const valueToKey = new Map<string, string>();
  for (const opt of ETF_ASSET_CLASS_OPTIONS) {
    if (opt.value !== '') valueToKey.set(opt.value, opt.value);
  }

  const [grouped, others] = await Promise.all([
    fetchEtfsForGroupings(spaceId, 'assetClass', valueToKey, country),
    fetchEtfsWithoutAssetClass(spaceId, country),
  ]);

  return { values: grouped.values, counts: grouped.counts, others };
}
