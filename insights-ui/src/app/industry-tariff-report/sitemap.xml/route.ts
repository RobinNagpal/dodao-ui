import { getTariffReportsLastModifiedDates } from '@/scripts/industry-tariff-reports/fetch-tariff-reports-with-updated-at';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
  lastmod?: string;
}

// evaluate-industry-areas is omitted: its URLs 301 to /tariff-reports (see next.config.ts) and
// must not be advertised in the sitemap, otherwise Google keeps recrawling them.
const REPORT_SECTIONS = ['tariff-updates', 'all-countries-tariff-updates', 'understand-industry', 'industry-areas', 'final-conclusion'];

// Generate URLs for tariff reports and their sections
async function generateTariffReportUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];
  const lastModifiedDates = await getTariffReportsLastModifiedDates();
  const { chapterNumbersWithoutPrimaryIndustry, chapterUrlSlug, getTariffIndustryDefinitionById, HTS_CHAPTERS, TariffIndustryId } = await import(
    '@/scripts/industry-tariff-reports/tariff-industries'
  );
  const tariffReports = Object.values(TariffIndustryId).map((industryId) => ({
    ...getTariffIndustryDefinitionById(industryId),
    lastModified: lastModifiedDates[industryId] || new Date().toISOString(),
  }));

  if (tariffReports.length === 0) {
    console.warn('No tariff reports found for the sitemap.');
  }

  // For each industry report
  for (const industry of tariffReports) {
    const industryId = industry.industryId;

    // Main report page
    urls.push({
      url: `/industry-tariff-report/${industryId}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: industry.lastModified,
    });

    // Standard report sections based on navigation structure.
    for (const section of REPORT_SECTIONS) {
      urls.push({
        url: `/industry-tariff-report/${industryId}/${section}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: industry.lastModified,
      });
    }
  }

  // HTS chapter pages — only include chapters that don't redirect to an industry URL. Primary
  // chapters issue a 301 to the industry page (see chapter route handlers), so emitting them here
  // would advertise URLs Google must follow a redirect to reach.
  const fallbackLastmod = new Date().toISOString();
  for (const chapterNumber of chapterNumbersWithoutPrimaryIndustry()) {
    const chapter = HTS_CHAPTERS[chapterNumber];
    if (!chapter) continue;
    const chapterPath = `/industry-tariff-report/chapter/${chapterUrlSlug(chapter)}`;
    urls.push({ url: chapterPath, changefreq: 'weekly', priority: 0.6, lastmod: fallbackLastmod });
    for (const section of REPORT_SECTIONS) {
      urls.push({ url: `${chapterPath}/${section}`, changefreq: 'weekly', priority: 0.5, lastmod: fallbackLastmod });
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
