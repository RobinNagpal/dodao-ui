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

async function generateCompetitionUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  const competitionRecords = await prisma.tickerV1VsCompetition.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      // The competition page renders `overallAnalysisDetails` (Comprehensive Analysis)
      // and the competitorTickers cards — `summary` is never displayed. Filter on the
      // field that actually drives the rendered body.
      overallAnalysisDetails: { not: '' },
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

  for (const record of competitionRecords) {
    const competitionUrl = `/stocks/${record.ticker.exchange}/${record.ticker.symbol}/competition`;

    urls.push({
      url: competitionUrl,
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
    const urls = await generateCompetitionUrls();
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
    console.error('Error generating competition sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
