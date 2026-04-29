import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import type { StockScenarioListingResponse } from '@/app/api/[spaceId]/stock-scenarios/listing/route';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
  lastmod?: string;
}

async function getAllStockScenarios(): Promise<StockScenarioListingResponse['scenarios']> {
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/stock-scenarios/listing?pageSize=200`);
  if (!response.ok) return [];
  const body = (await response.json()) as StockScenarioListingResponse;
  return body.scenarios ?? [];
}

async function generateStockScenarioUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  urls.push({
    url: '/stock-scenarios',
    changefreq: 'daily',
    priority: 0.8,
  });

  const scenarios = await getAllStockScenarios();
  for (const scenario of scenarios) {
    if (scenario.archived) continue;
    urls.push({
      url: `/stock-scenarios/${scenario.slug}`,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: scenario.outlookAsOfDate ? scenario.outlookAsOfDate.split('T')[0] : undefined,
    });
  }

  return urls;
}

async function GET(req: NextRequest): Promise<NextResponse<Buffer>> {
  const host = req.headers.get('host') as string;

  try {
    const urls = await generateStockScenarioUrls();
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
    console.error('Error generating stock-scenarios sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
