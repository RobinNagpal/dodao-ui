import { fetchTariffReports, TariffIndustryDefinition, getAllHeadingSubheadingCombinations } from '@/scripts/industry-tariff-reports/tariff-industries';
import { ReportType } from '@/types/project/project';
import { getPostsData } from '@/util/blog-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';

interface Industry {
  industryKey: string;
  name: string;
}

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

// Fetch all industries
async function getAllIndustries(): Promise<Industry[]> {
  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/industries`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch industries: ${response.statusText}`);
    }

    const industries = await response.json();
    return industries || [];
  } catch (error) {
    console.error('Error fetching industries:', error);
    return []; // Return an empty array to prevent breaking the sitemap
  }
}

// Fetch all tickers
async function getAllTickers(): Promise<Array<{ symbol: string; exchange: string; industryKey: string }>> {
  const baseUrl = getBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/koala_gains/tickers-v1`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tickers: ${response.statusText}`);
    }

    const tickers = await response.json();
    return tickers || [];
  } catch (error) {
    console.error('Error fetching tickers:', error);
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

async function generateTickerUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  // Add main stocks page
  urls.push({
    url: '/stocks',
    changefreq: 'daily',
    priority: 0.8,
  });

  // Add industry pages - /stocks/industry/{industry}
  try {
    const industries = await getAllIndustries();
    for (const industry of industries) {
      urls.push({
        url: `/stocks/industry/${industry.industryKey}`,
        changefreq: 'weekly',
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error('Error generating industry URLs:', error);
    // Continue without industry URLs if API fails
  }

  // Fetch all tickers and add individual ticker pages - /stocks/{exchange}/{ticker}
  try {
    const tickers = await getAllTickers();

    // Use a Set to avoid duplicates (in case same ticker exists on multiple exchanges)
    const addedUrls = new Set<string>();

    for (const ticker of tickers) {
      const tickerUrl = `/stocks/${ticker.exchange}/${ticker.symbol}`;

      if (!addedUrls.has(tickerUrl)) {
        urls.push({
          url: tickerUrl,
          changefreq: 'weekly',
          priority: 0.6,
        });
        addedUrls.add(tickerUrl);
      }
    }
  } catch (error) {
    console.error('Error generating ticker URLs:', error);
    // Continue without ticker URLs if API fails
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
    const reportSections = ['tariff-updates', 'understand-industry', 'industry-areas', 'final-conclusion'];

    // Add URLs for each section
    for (const section of reportSections) {
      urls.push({
        url: `/industry-tariff-report/${industryId}/${section}`,
        changefreq: 'weekly',
        priority: 0.7,
      });
    }

    const combos = getAllHeadingSubheadingCombinations(industry.industryId);
    // Add the main evaluate-industry-areas section
    urls.push({
      url: `/industry-tariff-report/${industryId}/evaluate-industry-areas`,
      changefreq: 'weekly',
      priority: 0.7,
    });
    combos.forEach((c) =>
      urls.push({
        url: `/industry-tariff-report/${industry.industryId}/evaluate-industry-areas/${c.headingIndex}-${c.subHeadingIndex}`,
        changefreq: 'weekly',
        priority: 0.6,
      })
    );
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
    },
    {
      url: '/genai-simulation',
      changefreq: 'weekly',
      priority: 0.7,
    },
    {
      url: '/genai-business',
      changefreq: 'weekly',
      priority: 0.7,
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

    return new NextResponse(response as BodyInit, {
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
