import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { canonicalizeCategory } from '@/utils/etf-category-aliases';
import { getAllEtfGroups, getCategoriesForGroupKey, getEtfGroupKey } from '@/utils/etf-categorization-utils';
import { etfBrowseDetailPath, etfBrowsePath, etfGroupCategoryPath, etfSectionIndexPath } from '@/utils/etf-country-route-utils';
import { ETF_ASSET_CLASS_OPTIONS } from '@/utils/etf-filter-utils';
import { slugifyEtfTag } from '@/utils/etf-tag-slug-utils';
import { AllEtfExchanges, ETF_EXCHANGE_TO_COUNTRY, ETF_SUPPORTED_COUNTRIES, EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { buildEtfSitemapResponse, SiteMapUrl } from '@/utils/etfSitemapUtils';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Per-country presence buckets derived from one ETF scan. Keys are the country code; the inner sets
// hold the group keys / canonical category names / asset-class values / provider names that have at
// least one populated ETF in that country.
interface CountryPresence {
  hasEtfs: boolean;
  groups: Set<string>;
  categories: Set<string>;
  assetClasses: Set<string>;
  providers: Set<string>;
}

function emptyPresence(): CountryPresence {
  return { hasEtfs: false, groups: new Set(), categories: new Set(), assetClasses: new Set(), providers: new Set() };
}

// Build the listing/browse URLs (/etfs root, group/category/asset-class/provider pages) plus every
// individual ETF report page (/etfs/{exchange}/{symbol}). Per-ETF analysis sub-pages
// (risk-analysis, competition, …) live in their own sitemaps under /etfs/*-sitemap.xml.
//
// Everything is derived from a SINGLE populated-ETF scan. The previous version issued ~9
// relation-heavy queries (fetchEtfsForGroupings/fetchEtfProvidersForCountry per country), which
// timed out at the origin and made Google Search Console report "Couldn't fetch" for this sitemap.
async function generateEtfUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  // The only valid asset-class values are the canonical filter options (the index pages bucket by
  // exact match against these); anything else in the DB does not get its own listing page.
  const knownAssetClasses = new Set(ETF_ASSET_CLASS_OPTIONS.filter((option) => option.value !== '').map((option) => option.value));

  const etfs = await prisma.etf.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      // Populated only (cachedScore present), matching the listing pages' POPULATED_ETF_WHERE filter.
      // Unpopulated ETFs render thin pages that Google flags as "Crawled — currently not indexed".
      cachedScore: { isNot: null },
    },
    select: {
      symbol: true,
      exchange: true,
      updatedAt: true,
      stockAnalyzerInfo: { select: { category: true, assetClass: true, issuer: true } },
    },
  });

  const presenceByCountry = new Map<EtfSupportedCountry, CountryPresence>();
  for (const country of ETF_SUPPORTED_COUNTRIES) {
    presenceByCountry.set(country, emptyPresence());
  }

  for (const etf of etfs) {
    // Individual ETF report page. Emitted for every populated ETF regardless of country mapping.
    urls.push({
      url: `/etfs/${etf.exchange}/${etf.symbol}`,
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: etf.updatedAt ? etf.updatedAt.toISOString().split('T')[0] : undefined,
    });

    const country = ETF_EXCHANGE_TO_COUNTRY[etf.exchange as AllEtfExchanges];
    const presence = country ? presenceByCountry.get(country) : undefined;
    if (!presence) continue;
    presence.hasEtfs = true;

    const rawCategory = etf.stockAnalyzerInfo?.category;
    if (rawCategory) {
      const groupKey = getEtfGroupKey(rawCategory);
      if (groupKey) presence.groups.add(groupKey);
      presence.categories.add(canonicalizeCategory(rawCategory));
    }

    const assetClass = etf.stockAnalyzerInfo?.assetClass;
    if (assetClass && knownAssetClasses.has(assetClass)) presence.assetClasses.add(assetClass);

    const issuer = etf.stockAnalyzerInfo?.issuer?.trim();
    if (issuer) presence.providers.add(issuer);
  }

  const groups = getAllEtfGroups();

  for (const country of ETF_SUPPORTED_COUNTRIES) {
    const presence = presenceByCountry.get(country);
    if (!presence?.hasEtfs) continue;

    // Section index pages. The groups index collapses onto the country root (/etfs for US,
    // /etfs/countries/<country> otherwise), so use etfSectionIndexPath for it.
    urls.push({ url: etfSectionIndexPath(country, 'groups'), changefreq: 'daily', priority: 0.8 });
    urls.push({ url: etfBrowsePath(country, 'asset-classes'), changefreq: 'weekly', priority: 0.7 });
    urls.push({ url: etfBrowsePath(country, 'providers'), changefreq: 'weekly', priority: 0.7 });

    // Group + category detail pages — only those with at least one populated ETF in this country.
    for (const group of groups) {
      if (presence.groups.has(group.key)) {
        urls.push({ url: etfBrowseDetailPath(country, 'groups', group.key), changefreq: 'weekly', priority: 0.6 });
      }
      for (const category of getCategoriesForGroupKey(group.key)) {
        if (presence.categories.has(category.name)) {
          urls.push({ url: etfGroupCategoryPath(country, group.key, category.name), changefreq: 'weekly', priority: 0.6 });
        }
      }
    }

    for (const option of ETF_ASSET_CLASS_OPTIONS) {
      if (option.value !== '' && presence.assetClasses.has(option.value)) {
        urls.push({ url: etfBrowseDetailPath(country, 'asset-classes', slugifyEtfTag(option.value)), changefreq: 'weekly', priority: 0.6 });
      }
    }

    for (const provider of presence.providers) {
      urls.push({ url: etfBrowseDetailPath(country, 'providers', slugifyEtfTag(provider)), changefreq: 'weekly', priority: 0.6 });
    }
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
