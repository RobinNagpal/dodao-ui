import { ReportType } from '@/types/project/project';
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
async function generateSitemapUrls(): Promise<SiteMapUrl[]> {
  const projectIds = await getAllProjects();
  const urls: SiteMapUrl[] = [];

  // Add home page URL
  urls.push({
    url: '/',
    changefreq: 'daily',
    priority: 1.0,
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

// Handle GET request for sitemap
async function GET(req: NextRequest): Promise<NextResponse<Buffer>> {
  try {
    const baseUrl = getBaseUrl();
    const urls = await generateSitemapUrls();
    const smStream = new SitemapStream({ hostname: baseUrl });

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
