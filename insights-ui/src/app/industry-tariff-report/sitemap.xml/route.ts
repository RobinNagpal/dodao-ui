import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

export const dynamic = 'force-dynamic';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
  lastmod?: string;
}

// evaluate-industry-areas and all-countries-tariff-updates are omitted: both render the cover with
// `<link rel="canonical">` pointing back at the cover, so advertising them here would surface
// non-canonical URLs.
const REPORT_SECTIONS = ['tariff-updates', 'understand-industry', 'industry-areas', 'final-conclusion'];

// A row counts as "seeded" when its cover (introduction) JSON has been written. Slug-only rows
// inserted for chapters with no industry mapping carry a NULL introduction and are excluded.
const SEEDED_FILTER = { introduction: { not: Prisma.DbNull } } as const;

async function generateTariffReportUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  const rows = await prisma.tariffChapterReport.findMany({
    where: { spaceId: KoalaGainsSpaceId, ...SEEDED_FILTER },
    select: { slug: true, updatedAt: true, tariffEngineering: true },
    orderBy: { chapter: { number: 'asc' } },
  });

  for (const row of rows) {
    const lastmod = row.updatedAt.toISOString();
    const chapterPath = `/industry-tariff-report/chapters/${row.slug}`;
    urls.push({ url: chapterPath, changefreq: 'weekly', priority: 0.8, lastmod });
    for (const section of REPORT_SECTIONS) {
      urls.push({ url: `${chapterPath}/${section}`, changefreq: 'weekly', priority: 0.7, lastmod });
    }
    // Tariff Engineering is only seeded for a subset of chapters — include the URL only when the
    // JSONB column has content so we don't advertise placeholder section pages in the sitemap.
    if (row.tariffEngineering !== null) {
      urls.push({ url: `${chapterPath}/tariff-engineering`, changefreq: 'weekly', priority: 0.7, lastmod });
    }
  }

  return urls;
}

async function GET(): Promise<NextResponse<Buffer>> {
  try {
    const urls = await generateTariffReportUrls();
    const smStream = new SitemapStream({ hostname: getBaseUrlForServerSidePages() });

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
