import 'server-only';
import { fetchEtfsForGroupings } from '@/app/api/[spaceId]/etfs-v1/listings/listings-prisma';
import type { EtfGroupingPreview } from '@/types/etf/etf-listings-types';
import { getAllEtfGroups, getCategoriesForGroupKey } from '@/utils/etf-categorization-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';

/**
 * Source-of-truth query for the home-page "Explore Top ETFs by Category" showcase.
 *
 * Mirrors the category half of the `/api/.../etfs-v1/listings/groups-index` route, but as a
 * first-party Prisma read the home-page Server Component calls directly instead of an HTTP
 * self-fetch. The home page is statically exported during `next build`; a self-fetch there
 * resolves to the public canonical origin (CloudFront→AWS) and can return an HTML error page
 * that crashes `res.json()` and aborts the export of "/". Reading the DB directly removes that
 * base-URL / CDN dependency entirely — same rationale as `getTopIndustriesWithTickers`.
 *
 * Returns the top-rated ETFs per canonical category (keyed by category name), so the showcase
 * can render a compact subset of category cards without the group/others buckets the full
 * listings index needs.
 */
export async function getTopEtfCategories(spaceId: string, country: EtfSupportedCountry): Promise<EtfGroupingPreview> {
  const categoryValueToKey = new Map<string, string>();
  for (const group of getAllEtfGroups()) {
    for (const cat of getCategoriesForGroupKey(group.key)) {
      categoryValueToKey.set(cat.name, cat.name);
    }
  }

  return fetchEtfsForGroupings(spaceId, 'category', categoryValueToKey, country);
}
