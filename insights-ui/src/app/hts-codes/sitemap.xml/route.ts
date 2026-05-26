import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { chapterDetailHref } from '@/utils/tariff-calculator/chapter-slug';
import { NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

export const dynamic = 'force-dynamic';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
  lastmod?: string;
}

async function generateHtsCodeUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [{ url: '/hts-codes', changefreq: 'weekly', priority: 0.7 }];

  const chapters = await prisma.tariffChapter.findMany({
    where: { spaceId: KoalaGainsSpaceId },
    select: { number: true, title: true, updatedAt: true, section: { select: { number: true } } },
    orderBy: { number: 'asc' },
  });

  for (const chapter of chapters) {
    urls.push({
      url: chapterDetailHref(chapter.section.number, chapter.number, chapter.title),
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: chapter.updatedAt.toISOString(),
    });
  }

  return urls;
}

async function GET(): Promise<NextResponse<Buffer>> {
  try {
    const urls = await generateHtsCodeUrls();
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
    console.error('Error generating hts-codes sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
