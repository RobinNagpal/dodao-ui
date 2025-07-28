import { fetchTariffReports, TariffIndustryDefinition } from '@/scripts/industry-tariff-reports/tariff-industries';
import { ReportType } from '@/types/project/project';
import { getPostsData } from '@/util/blog-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
}

// Fetch all project IDs
async function getAllProjects(): Promise<string[]> {
  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/crowd-funding/projects`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data.projectIds || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return []; // Return an empty array to prevent breaking the sitemap
  }
}

// Generate sitemap URLs
async function generateCrowdFundingUrls(): Promise<SiteMapUrl[]> {
  const projectIds = await getAllProjects();
  const urls: SiteMapUrl[] = [];

  urls.push({
    url: '/crowd-funding',
    changefreq: 'daily',
    priority: 0.8,
  });

  if (projectIds.length === 0) {
    console.warn('No projects found for the sitemap.');
    return urls; // Return at least the home page URL
  }

  for (const projectId of projectIds) {
    urls.push({
      url: `/crowd-funding/projects/${projectId}`,
      changefreq: 'weekly',
      priority: 0.8,
    });

    for (const reportType of Object.values(ReportType)) {
      urls.push({
        url: `/crowd-funding/projects/${projectId}/reports/${reportType}`,
        changefreq: 'weekly',
        priority: 0.7,
      });
    }
  }

  return urls;
}

async function getAllTickers(): Promise<string[]> {
  const baseUrl = getBaseUrl();
  try {
    // Use the new paginated API with a large page size to get all tickers for sitemap
    const response = await fetch(`${baseUrl}/api/tickers?all=true`, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to fetch tickers: ${response.statusText}`);
    }
    const data = await response.json();
    return data.tickers.map((t: any) => t.tickerKey);
  } catch (error) {
    console.error('Error fetching tickers:', error);
    return [];
  }
}

async function getAllCriteriaKeys(): Promise<string[]> {
  try {
    const response = await fetch(
      'https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/real-estate/equity-real-estate-investment-trusts-reits/custom-criteria.json',
      { cache: 'no-cache' }
    );
    const data = await response.json();
    return data?.criteria?.map((c: any) => c.key) || [];
  } catch (error) {
    console.error('Error fetching criteria:', error);
    return [];
  }
}

async function generateTickerUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];
  const tickerKeys = await getAllTickers();
  const criterionKeys = await getAllCriteriaKeys();

  urls.push({
    url: '/public-equities/tickers',
    changefreq: 'daily',
    priority: 0.8,
  });

  for (const tickerKey of tickerKeys) {
    urls.push({
      url: `/public-equities/tickers/${tickerKey}`,
      changefreq: 'weekly',
      priority: 0.8,
    });

    for (const cKey of criterionKeys) {
      urls.push({
        url: `/public-equities/tickers/${tickerKey}/criteria/${cKey}`,
        changefreq: 'weekly',
        priority: 0.7,
      });
    }
  }

  return urls;
}

async function generateBlogUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  urls.push({
    url: '/blogs',
    changefreq: 'daily',
    priority: 0.8,
  });

  const posts = await getPostsData();

  posts.forEach((post) => {
    urls.push({
      url: `/blogs/${post.id}`,
      changefreq: 'weekly',
      priority: 0.7,
    });
  });

  return urls;
}

// Fetch all tariff report IDs

// Generate URLs for tariff reports and their sections
async function generateTariffReportUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];
  const tariffReports: TariffIndustryDefinition[] = fetchTariffReports();

  // Main reports page
  urls.push({
    url: '/tariff-reports',
    changefreq: 'daily',
    priority: 0.8,
  });

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
    });

    // Standard report sections based on navigation structure
    const reportSections = ['executive-summary', 'tariff-updates', 'understand-industry', 'industry-areas', 'final-conclusion'];

    // Add URLs for each section
    for (const section of reportSections) {
      urls.push({
        url: `/industry-tariff-report/${industryId}/${section}`,
        changefreq: 'weekly',
        priority: 0.7,
      });
    }

    // Try to fetch report data to get evaluate-industry-areas sub-sections
    try {
      const baseUrl = getBaseUrl();
      const reportResponse = await fetch(`${baseUrl}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });

      if (reportResponse.ok) {
        const report = await reportResponse.json();

        // Add the main evaluate-industry-areas section
        urls.push({
          url: `/industry-tariff-report/${industryId}/evaluate-industry-areas`,
          changefreq: 'weekly',
          priority: 0.7,
        });

        // Add sub-areas if they exist
        if (report.industryAreas?.areas) {
          report.industryAreas.areas.forEach((heading: any, index: number) => {
            heading.subAreas.forEach((_: any, subIndex: number) => {
              urls.push({
                url: `/industry-tariff-report/${industryId}/evaluate-industry-areas/${index}-${subIndex}`,
                changefreq: 'weekly',
                priority: 0.6,
              });
            });
          });
        }
      }
    } catch (error) {
      console.error(`Error processing evaluate-industry-areas for ${industryId}:`, error);
      // If we can't fetch the detailed structure, add a generic URL for the section
      urls.push({
        url: `/industry-tariff-report/${industryId}/evaluate-industry-areas`,
        changefreq: 'weekly',
        priority: 0.7,
      });
    }
  }

  return urls;
}

async function generateSitemapUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  urls.push(
    {
      url: '/',
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      url: '/reports',
      changefreq: 'daily',
      priority: 0.8,
    }
  );

  // Add all URL collections
  const [crowdFundingUrls, tickerUrls, blogUrls, tariffReportUrls] = await Promise.all([
    generateCrowdFundingUrls(),
    generateTickerUrls(),
    generateBlogUrls(),
    generateTariffReportUrls(), // Add tariff report URLs
  ]);

  urls.push(...crowdFundingUrls);
  urls.push(...tickerUrls);
  urls.push(...blogUrls);
  urls.push(...tariffReportUrls); // Include the tariff report URLs

  return urls;
}

async function GET(req: NextRequest): Promise<NextResponse<Buffer>> {
  const host = req.headers.get('host') as string;
  try {
    const urls = await generateSitemapUrls();
    const smStream = new SitemapStream({ hostname: 'https://' + host });

    for (const url of urls) {
      smStream.write(url);
    }

    smStream.end();
    const response: Buffer = await streamToPromise(smStream);

    return new NextResponse(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
