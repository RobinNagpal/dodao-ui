import { getTariffReportsLastModifiedDates } from '@/scripts/industry-tariff-reports/fetch-tariff-reports-with-updated-at';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
  lastmod?: string;
}

// Generate URLs for tariff reports and their sections
async function generateTariffReportUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];
  const lastModifiedDates = await getTariffReportsLastModifiedDates();
  const { getTariffIndustryDefinitionById, TariffIndustryId } = await import('@/scripts/industry-tariff-reports/tariff-industries');
  const tariffReports = Object.values(TariffIndustryId).map((industryId) => ({
    ...getTariffIndustryDefinitionById(industryId),
    lastModified: lastModifiedDates[industryId] || new Date().toISOString(),
  }));

  if (tariffReports.length === 0) {
    console.warn('No tariff reports found for the sitemap.');
    return urls;
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

    // Standard report sections based on navigation structure. evaluate-industry-areas is omitted:
    // its URLs 301 to /tariff-reports (see next.config.ts) and must not be advertised in the
    // sitemap, otherwise Google keeps recrawling them.
    const reportSections = ['tariff-updates', 'all-countries-tariff-updates', 'understand-industry', 'industry-areas', 'final-conclusion'];

    // Add URLs for each section
    for (const section of reportSections) {
      urls.push({
        url: `/industry-tariff-report/${industryId}/${section}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: industry.lastModified,
      });
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
