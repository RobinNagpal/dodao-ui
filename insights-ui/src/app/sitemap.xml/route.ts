import {
  fetchTariffReports,
  TariffIndustryDefinition,
  getAllHeadingSubheadingCombinations,
  fetchTariffReportsWithUpdatedAt,
} from '@/scripts/industry-tariff-reports/tariff-industries';
import { REPORT_TYPES_TO_DISPLAY } from '@/types/project/project';
import { getPostsData } from '@/util/blog-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import crowdFundingLastmod from '@/utils/lastmod/crowd-funding-lastmod.json';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

interface Industry {
  industryKey: string;
  name: string;
}

interface SiteMapUrl {
  url: string;
  changefreq: string;
  priority?: number;
  lastmod?: string;
}

// Fetch all project IDs
async function getAllProjects(): Promise<string[]> {
  const response = await fetch(`${getBaseUrl()}/api/crowd-funding/projects`);
  const data = await response.json();
  return data.projectIds || [];
}

// Fetch all industries
async function getAllIndustries(): Promise<Industry[]> {
  const response = await fetch(`${getBaseUrl()}/api/industries`);
  const industries = await response.json();
  return industries || [];
}

// Fetch all industries for a specific country
async function getAllIndustriesByCountry(country: string): Promise<Industry[]> {
  const response = await fetch(`${getBaseUrl()}/api/industries?country=${country}`);
  const industries = await response.json();
  return industries || [];
}

// Fetch all tickers
async function getAllTickers(): Promise<Array<{ symbol: string; exchange: string; industryKey: string; updatedAt: string }>> {
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1`);
  const tickers = await response.json();
  return tickers || [];
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
    const lastmod = (crowdFundingLastmod as Record<string, string>)[projectId] || undefined;
    urls.push({
      url: `/crowd-funding/projects/${projectId}`,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod,
    });

    for (const reportType of REPORT_TYPES_TO_DISPLAY) {
      urls.push({
        url: `/crowd-funding/projects/${projectId}/reports/${reportType}`,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod,
      });
    }
  }

  return urls;
}

async function generateTickerUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];

  // Add main stocks page
  urls.push(
    {
      url: '/stocks',
      changefreq: 'daily',
      priority: 0.8,
    },
    { url: '/stocks/comparison', changefreq: 'weekly', priority: 0.7 },
    { url: '/stocks/countries/Canada', changefreq: 'weekly', priority: 0.7 }
  );

  // Add industry pages - /stocks/industries/{industry}
  const industries = await getAllIndustries();
  for (const industry of industries) {
    urls.push({
      url: `/stocks/industries/${industry.industryKey}`,
      changefreq: 'weekly',
      priority: 0.7,
    });
  }

  // Add country-specific industry pages for Canada - /stocks/countries/Canada/industries/{industry}
  const canadaIndustries = await getAllIndustriesByCountry('Canada');
  for (const industry of canadaIndustries) {
    urls.push({
      url: `/stocks/countries/Canada/industries/${industry.industryKey}`,
      changefreq: 'weekly',
      priority: 0.7,
    });
  }

  // Fetch all tickers and add individual ticker pages - /stocks/{exchange}/{ticker}
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
        lastmod: ticker.updatedAt ? new Date(ticker.updatedAt).toISOString().split('T')[0] : undefined,
      });
      addedUrls.add(tickerUrl);
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
      lastmod: post.datetime && post.datetime !== 'Unknown Date' ? post.datetime : undefined,
    });
  });

  return urls;
}

// Generate URLs for tariff reports and their sections
async function generateTariffReportUrls(): Promise<SiteMapUrl[]> {
  const urls: SiteMapUrl[] = [];
  const tariffReports: (TariffIndustryDefinition & { lastModified: string })[] = await fetchTariffReportsWithUpdatedAt();

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
      lastmod: industry.lastModified,
    });

    // Standard report sections based on navigation structure
    const reportSections = ['tariff-updates', 'understand-industry', 'industry-areas', 'final-conclusion'];

    // Add URLs for each section
    for (const section of reportSections) {
      urls.push({
        url: `/industry-tariff-report/${industryId}/${section}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: industry.lastModified,
      });
    }

    const combos = getAllHeadingSubheadingCombinations(industry.industryId);
    // Add the main evaluate-industry-areas section
    urls.push({
      url: `/industry-tariff-report/${industryId}/evaluate-industry-areas`,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: industry.lastModified,
    });
    combos.forEach((c) =>
      urls.push({
        url: `/industry-tariff-report/${industry.industryId}/evaluate-industry-areas/${c.headingIndex}-${c.subHeadingIndex}`,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: industry.lastModified,
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
