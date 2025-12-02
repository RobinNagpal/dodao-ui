import { REPORT_TYPES_TO_DISPLAY } from '@/types/project/project';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { NextRequest, NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import crowdFundingLastmod from '@/utils/lastmod/crowd-funding-lastmod.json';

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

async function GET(req: NextRequest): Promise<NextResponse<Buffer>> {
  const host = req.headers.get('host') as string;
  try {
    const urls = await generateCrowdFundingUrls();
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
    console.error('Error generating crowd-funding sitemap:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export { GET };
