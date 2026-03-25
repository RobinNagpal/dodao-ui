import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
  lastmod?: string;
}

async function generateFuturePerformanceUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  const futurePerformanceRecords = await prisma.tickerV1CategoryAnalysisResult.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      categoryKey: TickerAnalysisCategory.FutureGrowth,
    },
    select: {
      updatedAt: true,
      ticker: {
        select: {
          symbol: true,
          exchange: true,
        },
      },
    },
  });

  for (const record of futurePerformanceRecords) {
    const futurePerformanceUrl = `/stocks/${record.ticker.exchange}/${record.ticker.symbol}/future-performance`;

    urls.push({
      url: futurePerformanceUrl,
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: record.updatedAt ? new Date(record.updatedAt).toISOString().split('T')[0] : undefined,
    });
  }

  return urls;
}

async function GET(req: NextRequest): Promise<NextResponse<Buffer>> {
  const host = req.headers.get('host') as string;

  try {
    const urls = await generateFuturePerformanceUrls();
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
    console.error('Error generating future performance sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
