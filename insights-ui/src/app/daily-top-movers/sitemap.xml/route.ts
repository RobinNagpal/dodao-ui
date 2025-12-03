import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
  lastmod?: string;
}

// Fetch all top gainers IDs
async function getAllTopGainers(): Promise<Array<{ id: string; updatedAt: string }>> {
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/daily-top-gainers`);
  const gainers = await response.json();
  return gainers || [];
}

// Fetch all top losers IDs
async function getAllTopLosers(): Promise<Array<{ id: string; updatedAt: string }>> {
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/daily-top-losers`);
  const losers = await response.json();
  return losers || [];
}

// Generate all /daily-top-movers related URLs for this sitemap
async function generateDailyTopMoversUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  // Main daily-top-movers page
  urls.push({
    url: '/daily-top-movers',
    changefreq: 'daily',
    priority: 0.8,
  });

  // Country pages - currently only US is supported
  urls.push(
    {
      url: '/daily-top-movers/top-gainers/country/US',
      changefreq: 'daily',
      priority: 0.7,
    },
    {
      url: '/daily-top-movers/top-losers/country/US',
      changefreq: 'daily',
      priority: 0.7,
    }
  );

  // Individual top gainers detail pages
  const gainers = await getAllTopGainers();
  for (const gainer of gainers) {
    urls.push({
      url: `/daily-top-movers/top-gainers/details/${gainer.id}`,
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: gainer.updatedAt ? new Date(gainer.updatedAt).toISOString().split('T')[0] : undefined,
    });
  }

  // Individual top losers detail pages
  const losers = await getAllTopLosers();
  for (const loser of losers) {
    urls.push({
      url: `/daily-top-movers/top-losers/details/${loser.id}`,
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: loser.updatedAt ? new Date(loser.updatedAt).toISOString().split('T')[0] : undefined,
    });
  }

  return urls;
}

async function GET(req: NextRequest): Promise<NextResponse<Buffer>> {
  const host = req.headers.get('host') as string;

  try {
    const urls = await generateDailyTopMoversUrls();
    const smStream = new SitemapStream({ hostname: 'https://' + host });

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
    console.error('Error generating daily-top-movers sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
