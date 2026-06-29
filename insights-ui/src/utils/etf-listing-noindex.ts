import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import type { EtfGroupDetailResponse } from '@/app/api/[spaceId]/etfs-v1/listings/group/route';
import type { EtfGroupsIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/groups-index/route';
import type { EtfProvidersIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/providers-index/route';
import { slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import type { Metadata } from 'next';

/**
 * SEO guard for ETF *listing* pages (group / category / asset-class / provider
 * indexes and detail pages, US + every country).
 *
 * Those pages are deliberately kept OUT of the sitemap when they hold no ETFs
 * (see `app/etfs/sitemap.xml/route.ts`), but Google still discovers them via the
 * cross-country switcher links (`EtfCountryAlternatives`) and on-page
 * breadcrumbs. An empty-but-valid listing returns HTTP 200 with a "no ETFs"
 * shell, which Search Console flags as a *soft 404*.
 *
 * Fix: emit `noindex, follow` when — and ONLY when — we have a CONFIRMED empty
 * response. Every predicate takes a `... | null` argument; `null` means the
 * upstream fetch could not be confirmed (it failed and fell back to an empty
 * sentinel) and is treated as INDEXABLE. We never noindex on uncertainty, so a
 * transient API blip can never deindex a populated, ranking page. This makes
 * the noindex rule the exact mirror of the sitemap-inclusion rule
 * ("in sitemap ⇔ indexable").
 *
 * `follow` is kept so the page still passes link equity to the (indexable) ETF
 * report pages it lists once it has content.
 */

const NOINDEX_FOLLOW: Pick<Metadata, 'robots'> = { robots: { index: false, follow: true } };
const INDEXABLE: Pick<Metadata, 'robots'> = {};

/** Spread into a page's metadata: `{ ...baseMeta, ...etfListingRobots(empty) }`. */
export function etfListingRobots(confirmedEmpty: boolean): Pick<Metadata, 'robots'> {
  return confirmedEmpty ? NOINDEX_FOLLOW : INDEXABLE;
}

function allCountsZero(counts: Record<string, number>): boolean {
  return Object.values(counts).every((count) => !count);
}

/** Groups index = a country root page (`/etfs`, `/etfs/countries/<c>`). Empty
 *  when no group bucket and no "others" bucket holds an ETF. */
export function groupsIndexRobots(data: EtfGroupsIndexResponse | null): Pick<Metadata, 'robots'> {
  if (!data) return INDEXABLE;
  return etfListingRobots(allCountsZero(data.groupCounts) && (data.others?.count ?? 0) === 0);
}

export function assetClassesIndexRobots(data: EtfAssetClassesIndexResponse | null): Pick<Metadata, 'robots'> {
  if (!data) return INDEXABLE;
  return etfListingRobots(allCountsZero(data.counts));
}

export function providersIndexRobots(data: EtfProvidersIndexResponse | null): Pick<Metadata, 'robots'> {
  if (!data) return INDEXABLE;
  return etfListingRobots(data.providers.length === 0);
}

/** Group detail page. `found:false` means an unknown key (the page 404s anyway)
 *  or a failed fetch — neither is a confirmed-empty 200, so stay indexable. */
export function groupDetailRobots(data: EtfGroupDetailResponse | null): Pick<Metadata, 'robots'> {
  if (!data || !data.found) return INDEXABLE;
  return etfListingRobots(allCountsZero(data.counts) && (data.others?.count ?? 0) === 0);
}

/** Group-category detail page: empty when the parent group's detail buckets no
 *  ETF under this category name (group-detail counts are keyed by category name). */
export function groupCategoryDetailRobots(group: EtfGroupDetailResponse | null, categoryName: string): Pick<Metadata, 'robots'> {
  if (!group || !group.found) return INDEXABLE;
  return etfListingRobots((group.counts[categoryName] ?? 0) === 0);
}

/** Asset-class detail page: empty when no asset class in the country index
 *  slugifies to this slug with a non-zero count. Slug-matched so canonical/value
 *  casing differences can never trigger a false noindex. */
export function assetClassDetailRobots(index: EtfAssetClassesIndexResponse | null, assetClassSlug: string): Pick<Metadata, 'robots'> {
  if (!index) return INDEXABLE;
  const present = Object.entries(index.counts).some(([value, count]) => count > 0 && slugifyEtfTag(value) === assetClassSlug);
  return etfListingRobots(!present);
}

/** Provider detail page: empty when no issuer in the country index slugifies to
 *  this provider slug. */
export function providerDetailRobots(index: EtfProvidersIndexResponse | null, providerSlug: string): Pick<Metadata, 'robots'> {
  if (!index) return INDEXABLE;
  const present = index.providers.some((issuer) => slugifyEtfTag(issuer) === providerSlug);
  return etfListingRobots(!present);
}
