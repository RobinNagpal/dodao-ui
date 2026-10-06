import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import type { EtfGroupDetailResponse } from '@/app/api/[spaceId]/etfs-v1/listings/group/route';
import type { EtfGroupsIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/groups-index/route';
import type { EtfProvidersIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/providers-index/route';
import { ETF_OTHERS_GROUP_KEY } from '@/utils/etf-categorization-utils';
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
 * Detail pages (a specific group / category / asset class / provider) go
 * further: when confirmed empty the page calls `notFound()` so Google gets a
 * real 404 (the generic `EtfListingNotFound` page).
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
  return etfListingRobots(allCountsZero(data.counts) && (data.others?.count ?? 0) === 0);
}

export function providersIndexRobots(data: EtfProvidersIndexResponse | null): Pick<Metadata, 'robots'> {
  if (!data) return INDEXABLE;
  return etfListingRobots(data.providers.length === 0 && (data.others?.count ?? 0) === 0);
}

/** Group detail page. `found:false` means an unknown key (the page 404s anyway)
 *  or a failed fetch — neither is a confirmed-empty 200, so stay indexable. */
export function isGroupDetailEmpty(data: EtfGroupDetailResponse | null): boolean {
  if (!data || !data.found) return false;
  return allCountsZero(data.counts) && (data.others?.count ?? 0) === 0;
}

export function groupDetailRobots(data: EtfGroupDetailResponse | null): Pick<Metadata, 'robots'> {
  return etfListingRobots(isGroupDetailEmpty(data));
}

/** Group-category detail page: empty when the parent group's detail buckets no
 *  ETF under this category name (group-detail counts are keyed by category name). */
export function isGroupCategoryDetailEmpty(group: EtfGroupDetailResponse | null, categoryName: string): boolean {
  if (!group || !group.found) return false;
  return (group.counts[categoryName] ?? 0) === 0;
}

export function groupCategoryDetailRobots(group: EtfGroupDetailResponse | null, categoryName: string): Pick<Metadata, 'robots'> {
  return etfListingRobots(isGroupCategoryDetailEmpty(group, categoryName));
}

/** Asset-class detail page: empty when no asset class in the country index
 *  slugifies to this slug with a non-zero count. Slug-matched so canonical/value
 *  casing differences can never trigger a false noindex. The "others" slug
 *  (ETFs with no asset class) is backed by the index's `others` bucket. */
export function isAssetClassDetailEmpty(index: EtfAssetClassesIndexResponse | null, assetClassSlug: string): boolean {
  if (!index) return false;
  if (assetClassSlug === ETF_OTHERS_GROUP_KEY) return (index.others?.count ?? 0) === 0;
  return !Object.entries(index.counts).some(([value, count]) => count > 0 && slugifyEtfTag(value) === assetClassSlug);
}

export function assetClassDetailRobots(index: EtfAssetClassesIndexResponse | null, assetClassSlug: string): Pick<Metadata, 'robots'> {
  return etfListingRobots(isAssetClassDetailEmpty(index, assetClassSlug));
}

/** Provider detail page: empty when no issuer in the country index slugifies to
 *  this provider slug. The "others" slug (ETFs with no issuer) is backed by the
 *  index's `others` bucket. */
export function isProviderDetailEmpty(index: EtfProvidersIndexResponse | null, providerSlug: string): boolean {
  if (!index) return false;
  if (providerSlug === ETF_OTHERS_GROUP_KEY) return (index.others?.count ?? 0) === 0;
  return !index.providers.some((issuer) => slugifyEtfTag(issuer) === providerSlug);
}

export function providerDetailRobots(index: EtfProvidersIndexResponse | null, providerSlug: string): Pick<Metadata, 'robots'> {
  return etfListingRobots(isProviderDetailEmpty(index, providerSlug));
}
