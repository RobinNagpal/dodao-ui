import { fetchEtfProvidersForCountry, fetchEtfsForGroupings } from '@/app/api/[spaceId]/etfs-v1/listings/listings-prisma';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getAllEtfGroups, getCategoriesForGroupKey } from '@/utils/etf-categorization-utils';
import { etfBrowseDetailPath, etfBrowsePath, etfGroupCategoryPath, etfSectionIndexPath } from '@/utils/etf-country-route-utils';
import { ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { ETF_SUPPORTED_COUNTRIES } from '@/utils/etfCountryExchangeUtils';
import { buildEtfSitemapResponse, SITEMAP_EXCLUDED_ETF_EXCHANGES, SiteMapUrl } from '@/utils/etfSitemapUtils';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Build the listing/browse URLs (/etfs root, group/category/asset-class/provider pages) plus every
// individual ETF report page (/etfs/{exchange}/{symbol}). Per-ETF analysis sub-pages
// (risk-analysis, competition, …) live in their own sitemaps under /etfs/*-sitemap.xml.
async function generateEtfUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  // Category → group / category buckets, mirroring the groups-index API route so the sitemap's
  // notion of "which group/category has ETFs" matches what the listing pages actually render.
  const groups = getAllEtfGroups();
  const categoryValueToKey = new Map<string, string>();
  const groupValueToKey = new Map<string, string>();
  for (const group of groups) {
    for (const category of getCategoriesForGroupKey(group.key)) {
      categoryValueToKey.set(category.name, category.name);
      groupValueToKey.set(category.name, group.key);
    }
  }

  const assetClassValueToKey = new Map<string, string>();
  for (const option of ETF_ASSET_CLASS_OPTIONS) {
    if (option.value !== '') assetClassValueToKey.set(option.value, option.value);
  }

  // UK ETF pages stay live but are kept out of the sitemap so Google stops rediscovering them
  // (see SITEMAP_EXCLUDED_ETF_EXCHANGES) — skip the UK listing/browse section here.
  const sitemapCountries = ETF_SUPPORTED_COUNTRIES.filter((country) => country !== SupportedCountries.UK);

  for (const country of sitemapCountries) {
    // Section index pages. The groups index collapses onto the country root (/etfs for US,
    // /etfs/countries/<country> otherwise), so use etfSectionIndexPath for it.
    urls.push({ url: etfSectionIndexPath(country, 'groups'), changefreq: 'daily', priority: 0.8 });
    urls.push({ url: etfBrowsePath(country, 'asset-classes'), changefreq: 'weekly', priority: 0.7 });
    urls.push({ url: etfBrowsePath(country, 'providers'), changefreq: 'weekly', priority: 0.7 });

    // Counts come from the same bucketing the index pages use, so a group/category/asset-class page
    // only enters the sitemap when at least one populated ETF lands in it. Providers are already
    // populated-only and content-derived.
    const [byGroup, byCategory, byAssetClass, providers] = await Promise.all([
      fetchEtfsForGroupings(KoalaGainsSpaceId, 'category', groupValueToKey, country),
      fetchEtfsForGroupings(KoalaGainsSpaceId, 'category', categoryValueToKey, country),
      fetchEtfsForGroupings(KoalaGainsSpaceId, 'assetClass', assetClassValueToKey, country),
      fetchEtfProvidersForCountry(KoalaGainsSpaceId, country),
    ]);

    for (const group of groups) {
      if ((byGroup.counts[group.key] ?? 0) > 0) {
        urls.push({ url: etfBrowseDetailPath(country, 'groups', group.key), changefreq: 'weekly', priority: 0.6 });
      }
      for (const category of getCategoriesForGroupKey(group.key)) {
        if ((byCategory.counts[category.name] ?? 0) > 0) {
          urls.push({ url: etfGroupCategoryPath(country, group.key, category.name), changefreq: 'weekly', priority: 0.6 });
        }
      }
    }

    for (const option of ETF_ASSET_CLASS_OPTIONS) {
      if (option.value !== '' && (byAssetClass.counts[option.value] ?? 0) > 0) {
        urls.push({ url: etfBrowseDetailPath(country, 'asset-classes', slugifyEtfTag(option.value)), changefreq: 'weekly', priority: 0.6 });
      }
    }

    for (const provider of providers.providers) {
      urls.push({ url: etfBrowseDetailPath(country, 'providers', slugifyEtfTag(provider)), changefreq: 'weekly', priority: 0.6 });
    }
  }

  // Individual ETF report pages — only populated ETFs (cachedScore present), matching the listing
  // pages' POPULATED_ETF_WHERE filter. Unpopulated ETFs render thin pages that Google flags as
  // "Crawled — currently not indexed".
  const etfs = await prisma.etf.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      cachedScore: { isNot: null },
      exchange: { notIn: SITEMAP_EXCLUDED_ETF_EXCHANGES },
    },
    select: {
      symbol: true,
      exchange: true,
      updatedAt: true,
    },
  });

  for (const etf of etfs) {
    urls.push({
      url: `/etfs/${etf.exchange}/${etf.symbol}`,
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: etf.updatedAt ? etf.updatedAt.toISOString().split('T')[0] : undefined,
    });
  }

  return urls;
}

async function GET(): Promise<NextResponse> {
  try {
    const urls = await generateEtfUrls();
    return await buildEtfSitemapResponse(urls);
  } catch (error) {
    console.error('Error generating ETFs sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
