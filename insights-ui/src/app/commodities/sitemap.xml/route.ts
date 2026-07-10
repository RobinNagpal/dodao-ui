import { NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { COMMODITIES_LISTING_TAG } from '@/utils/commodity-analysis-reports/commodity-cache-utils';
import { getCanonicalUrl } from '@/utils/getBaseUrlForServerSidePages';
import { COMMODITY_CATEGORY_TO_PATH } from '@/types/commodity/commodity-analysis-types';
import type { CommodityListItem } from '@/app/api/[spaceId]/commodities-v1/listing/route';

// The four per-commodity category sub-report pages (supply-and-demand, price-and-value,
// volatility-and-risk, future-outlook) — kept in sync with the route folders via the shared map.
const COMMODITY_CATEGORY_PATHS: string[] = Object.values(COMMODITY_CATEGORY_TO_PATH);

export const dynamic = 'force-dynamic';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
  lastmod?: string;
}

/**
 * Every commodity for the sitemap. The listing fetch uses cache tags only (no
 * time-based revalidation for now) so it can be purged on demand via
 * `COMMODITIES_LISTING_TAG`.
 */
async function getAllCommodities(): Promise<CommodityListItem[]> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/commodities-v1/listing`, {
      next: { tags: [COMMODITIES_LISTING_TAG] },
    });
    if (!response.ok) return [];
    return (await response.json()) as CommodityListItem[];
  } catch (error) {
    console.error('Error fetching commodity listing for sitemap:', error);
    return [];
  }
}

async function generateCommodityUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  // Main commodities index page
  urls.push({
    url: '/commodities',
    changefreq: 'daily',
    priority: 0.8,
  });

  // Per-commodity overview page + its four category sub-report pages
  const commodities = await getAllCommodities();
  for (const commodity of commodities) {
    urls.push({
      url: `/commodities/${commodity.slug}`,
      changefreq: 'weekly',
      priority: 0.7,
    });

    for (const categoryPath of COMMODITY_CATEGORY_PATHS) {
      urls.push({
        url: `/commodities/${commodity.slug}/${categoryPath}`,
        changefreq: 'weekly',
        priority: 0.6,
      });
    }
  }

  return urls;
}

async function GET(): Promise<NextResponse<Buffer>> {
  try {
    const urls = await generateCommodityUrls();
    const smStream = new SitemapStream({ hostname: getCanonicalUrl() });

    for (const url of urls) {
      smStream.write(url);
    }

    smStream.end();
    const response: Buffer = await streamToPromise(smStream);

    return new NextResponse(response as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating commodities sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
