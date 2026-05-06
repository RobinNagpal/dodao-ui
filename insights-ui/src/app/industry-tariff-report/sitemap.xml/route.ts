import { chapterUrlSlug, getIndustryForPrimaryChapter, HTS_CHAPTERS } from '@/scripts/industry-tariff-reports/tariff-industries';
import { getSeededChapterReports } from '@/utils/tariff-reports/seeded-chapter-reports';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

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

async function generateTariffReportUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];
  const seeded = await getSeededChapterReports();

  for (const row of seeded) {
    const lastmod = row.updatedAt.toISOString();
    const industry = getIndustryForPrimaryChapter(row.chapterNumber);

    if (industry) {
      const industryPath = `/industry-tariff-report/${industry.industryId}`;
      urls.push({ url: industryPath, changefreq: 'weekly', priority: 0.8, lastmod });
      for (const section of REPORT_SECTIONS) {
        urls.push({ url: `${industryPath}/${section}`, changefreq: 'weekly', priority: 0.7, lastmod });
      }
      continue;
    }

    const chapter = HTS_CHAPTERS[row.chapterNumber];
    if (!chapter) continue;
    const chapterPath = `/industry-tariff-report/chapters/${chapterUrlSlug(chapter)}`;
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
