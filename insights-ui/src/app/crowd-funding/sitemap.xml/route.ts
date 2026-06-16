import { ProcessingStatus, ProjectDetails, REPORT_TYPES_TO_DISPLAY } from '@/types/project/project';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getCanonicalUrl } from '@/utils/getBaseUrlForServerSidePages';
import { NextResponse } from 'next/server';
import { SitemapStream, streamToPromise } from 'sitemap';
import crowdFundingLastmod from '@/utils/lastmod/crowd-funding-lastmod.json';

export const dynamic = 'force-dynamic';

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

async function getProjectDetails(projectId: string): Promise<ProjectDetails | undefined> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
    if (!response.ok) return undefined;
    const data: { projectDetails: ProjectDetails } = await response.json();
    return data.projectDetails;
  } catch (error) {
    console.warn(`Failed to fetch details for project ${projectId} while building sitemap:`, error);
    return undefined;
  }
}

function isReportIndexable(details: ProjectDetails | undefined, reportType: string): boolean {
  const report = details?.reports?.[reportType];
  if (!report) return false;
  if (report.status !== ProcessingStatus.COMPLETED) return false;
  return (report.summary?.trim()?.length ?? 0) > 0;
}

// Generate sitemap URLs — only include URLs whose reports are complete + non-empty.
// Incomplete URLs still resolve, but are emitted with `robots: noindex` from the pages
// themselves and are kept out of the sitemap so Google doesn't churn crawl budget on
// thin/"Empty" report pages (the main driver of the "Discovered — currently not indexed" bucket).
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

  const projectDetailsList = await Promise.all(projectIds.map(async (projectId) => ({ projectId, details: await getProjectDetails(projectId) })));

  for (const { projectId, details } of projectDetailsList) {
    const indexableReportTypes = REPORT_TYPES_TO_DISPLAY.filter((reportType) => isReportIndexable(details, reportType));
    if (indexableReportTypes.length === 0) {
      // Skip projects with no indexable reports — pages still resolve via direct URL,
      // and `generateMetadata` flips them to `noindex` so Google can drop them.
      continue;
    }

    const lastmod = (crowdFundingLastmod as Record<string, string>)[projectId] || undefined;
    urls.push({
      url: `/crowd-funding/projects/${projectId}`,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod,
    });

    for (const reportType of indexableReportTypes) {
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

async function GET(): Promise<NextResponse<Buffer>> {
  try {
    const urls = await generateCrowdFundingUrls();
    const smStream = new SitemapStream({ hostname: getCanonicalUrl() });

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
