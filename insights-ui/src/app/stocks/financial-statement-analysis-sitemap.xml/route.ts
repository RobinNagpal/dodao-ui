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

async function generateFinancialStatementAnalysisUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  const financialStatementRecords = await prisma.tickerV1CategoryAnalysisResult.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      categoryKey: TickerAnalysisCategory.FinancialStatementAnalysis,
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

  for (const record of financialStatementRecords) {
    const financialStatementUrl = `/stocks/${record.ticker.exchange}/${record.ticker.symbol}/financial-statement-analysis`;

    urls.push({
      url: financialStatementUrl,
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
    const urls = await generateFinancialStatementAnalysisUrls();
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
    console.error('Error generating financial statement analysis sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
