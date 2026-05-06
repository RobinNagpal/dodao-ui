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

// evaluate-industry-areas and all-countries-tariff-updates are omitted: both 301 to the cover
// (see next.config.ts), so advertising them here would advertise URLs Google must follow a
// redirect to reach.
const REPORT_SECTIONS = ['tariff-updates', 'understand-industry', 'industry-areas', 'final-conclusion'];

// `oldUrl` on a row is the canonical "this chapter is part of an industry" signal — when set, the
// content lives at `/industry-tariff-report/<oldUrl>` and `/chapters/<slug>` is never advertised.
async function generateTariffReportUrls(): Promise<SiteMapUrl[]> {
  const rows = await prisma.tariffChapterReport.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    select: { slug: true, oldUrl: true, updatedAt: true },
    orderBy: { chapter: { number: 'asc' } },
  });

  const urls: SiteMapUrl[] = [];

  for (const row of rows) {
    const lastmod = row.updatedAt.toISOString();

    if (row.oldUrl) {
      const industryPath = `/industry-tariff-report/${row.oldUrl}`;
      urls.push({ url: industryPath, changefreq: 'weekly', priority: 0.8, lastmod });
      for (const section of REPORT_SECTIONS) {
        urls.push({ url: `${industryPath}/${section}`, changefreq: 'weekly', priority: 0.7, lastmod });
      }
      continue;
    }

    const chapterPath = `/industry-tariff-report/chapters/${row.slug}`;
    urls.push({ url: chapterPath, changefreq: 'weekly', priority: 0.6, lastmod });
    for (const section of REPORT_SECTIONS) {
      urls.push({ url: `${chapterPath}/${section}`, changefreq: 'weekly', priority: 0.5, lastmod });
    }
  }

  return urls;
}

async function GET(req: NextRequest): Promise<NextResponse<Buffer>> {
  const host = req.headers.get('host') as string;

  try {
    const urls = await generateTariffReportUrls();
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
    console.error('Error generating industry-tariff-report sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
