import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
  lastmod?: string;
}

async function generateManagementTeamUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  const records = await prisma.tickerV1ManagementTeamReport.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      summary: { not: '' },
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

  for (const record of records) {
    const url = `/stocks/${record.ticker.exchange}/${record.ticker.symbol}/management-team`;
    urls.push({
      url,
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: record.updatedAt ? new Date(record.updatedAt).toISOString().split('T')[0] : undefined,
    });
  }

  return urls;
}

async function GET(req: NextRequest): Promise<NextResponse<Buffer | string>> {
  const host = req.headers.get('host') as string;

  try {
    const urls = await generateManagementTeamUrls();

    // streamToPromise() rejects on an empty SitemapStream, so emit a valid
    // empty urlset directly until the first management-team report exists.
    if (urls.length === 0) {
      const empty = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
      return new NextResponse(empty, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
        },
      });
    }

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
    console.error('Error generating management team sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
