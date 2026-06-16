import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import Link from 'next/link';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { ProcessingStatus, ProjectDetails, REPORT_TYPES_TO_DISPLAY, ReportType, SpiderGraph } from '@/types/project/project';
import { parseMarkdown } from '@/util/parse-markdown';
import { formatProjectName, getReportName, truncateDescription } from '@/util/report-utils';

const DEFAULT_OG_IMAGE = 'https://koalagains.com/koalagain_logo.png';

const REPORT_TITLES: Record<string, string> = {
  [ReportType.GENERAL_INFO]: 'General Information',
  [ReportType.FOUNDER_AND_TEAM]: 'Founder and Team',
  [ReportType.TRACTION]: 'Traction',
  [ReportType.MARKET_OPPORTUNITY]: 'Market Opportunity',
  [ReportType.VALUATION]: 'Valuation',
  [ReportType.EXECUTION_AND_SPEED]: 'Execution and Speed',
  [ReportType.FINANCIAL_HEALTH]: 'Financial Health',
  [ReportType.RELEVANT_LINKS]: 'Relevant Links',
};

function getReadableReportType(reportType: string): string {
  return REPORT_TITLES[reportType] ?? getReportName(reportType);
}

export async function generateMetadata({ params }: { params: Promise<{ projectId: string; reportType: string }> }): Promise<Metadata> {
  const { projectId, reportType } = await params;

  const projectResponse = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
  const projectData: { projectDetails: ProjectDetails; spiderGraph: SpiderGraph | {} } = await projectResponse.json();

  const projectName = projectData.projectDetails?.name || formatProjectName(projectId);
  const report = projectData.projectDetails?.reports?.[reportType];
  const readableReportType = getReadableReportType(reportType);
  const summary = report?.summary?.trim();
  const isReportReady = report?.status === ProcessingStatus.COMPLETED && (summary?.length ?? 0) > 0;

  const description =
    truncateDescription(summary) ??
    `Independent ${readableReportType.toLowerCase()} analysis for ${projectName}: checklist scoring, calculation logic, and key findings for crowdfunding investors.`;

  const canonicalUrl = `https://koalagains.com/crowd-funding/projects/${projectId}/reports/${reportType}`;
  const ogImage = projectData.projectDetails?.imgUrl || DEFAULT_OG_IMAGE;

  return {
    title: `${projectName} — ${readableReportType} Report | KoalaGains`,
    description,
    robots: isReportReady ? { index: true, follow: true } : { index: false, follow: true },
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${projectName} — ${readableReportType} Report`,
      description,
      url: canonicalUrl,
      type: 'article',
      siteName: 'KoalaGains',
      images: [ogImage],
      publishedTime: report?.startTime,
      modifiedTime: report?.endTime ?? report?.startTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${projectName} — ${readableReportType}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function ReportDetailPage({ params }: { params: Promise<{ projectId: string; reportType: string }> }) {
  const { projectId, reportType } = await params;

  const [reportResponse, projectResponse] = await Promise.all([
    fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}/reports/${reportType}`),
    fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`),
  ]);
  const reportData: { reportDetail: string } = await reportResponse.json();
  const projectData: { projectDetails: ProjectDetails; spiderGraph: SpiderGraph | {} } = await projectResponse.json();

  const projectName = projectData.projectDetails?.name || formatProjectName(projectId);
  const report = projectData.projectDetails?.reports?.[reportType];
  const readableReportType = getReadableReportType(reportType);
  const summary = report?.summary?.trim();

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Crowd Funding Projects',
      href: `/crowd-funding`,
      current: false,
    },
    {
      name: projectName,
      href: `/crowd-funding/projects/${projectId}`,
      current: false,
    },
    {
      name: readableReportType,
      href: `/crowd-funding/projects/${projectId}/reports/${reportType}`,
      current: true,
    },
  ];

  const reportDetailContents = reportData.reportDetail && parseMarkdown(reportData.reportDetail);
  const canonicalUrl = `https://koalagains.com/crowd-funding/projects/${projectId}/reports/${reportType}`;
  const ogImage = projectData.projectDetails?.imgUrl || DEFAULT_OG_IMAGE;
  const headlineDescription =
    summary ??
    `Independent ${readableReportType.toLowerCase()} analysis for ${projectName}: checklist scoring, calculation logic, and key findings for crowdfunding investors.`;

  const siblingReports = REPORT_TYPES_TO_DISPLAY.filter((rt) => rt !== reportType).filter(
    (rt) => (projectData.projectDetails?.reports?.[rt]?.summary?.trim()?.length ?? 0) > 0
  );

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${projectName} — ${readableReportType} Report`,
    description: truncateDescription(headlineDescription) ?? headlineDescription,
    image: [ogImage],
    datePublished: report?.startTime,
    dateModified: report?.endTime ?? report?.startTime,
    author: {
      '@type': 'Organization',
      name: 'KoalaGains',
      url: 'https://koalagains.com',
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'KoalaGains',
      url: 'https://koalagains.com',
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_OG_IMAGE,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    articleSection: readableReportType,
    about: {
      '@type': 'Organization',
      name: projectName,
      url: projectData.projectDetails?.projectInfoInput?.websiteUrl,
    },
  };

  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} />
      <div className="mx-auto text-color">
        <header className="text-center my-5">
          <h1 className="font-semibold text-3xl sm:text-4xl">
            {projectName} — {readableReportType}
          </h1>
          <p className="mt-3 text-sm opacity-80">
            Crowdfunding analysis ·{' '}
            <Link href={`/crowd-funding/projects/${projectId}`} className="link-color">
              View {projectName} overview
            </Link>
          </p>
        </header>
        <article className="block-bg-color p-8" itemScope itemType="https://schema.org/Article">
          <div className="overflow-x-auto">
            {report?.performanceChecklist?.length ? (
              <ul className="list-disc mt-2">
                {report.performanceChecklist.map((item, index) => (
                  <li key={index} className="mb-1 flex items-start">
                    <span className="mr-2">{item.score === 1 ? '✅' : '❌'}</span>
                    <span>{item.checklistItem}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {reportDetailContents ? (
              <div className="markdown-body text-md" dangerouslySetInnerHTML={{ __html: reportDetailContents }} />
            ) : (
              <div className="text-center">Empty</div>
            )}
          </div>
        </article>
        {siblingReports.length > 0 && (
          <nav aria-label="Other sections of this project" className="my-8 text-color">
            <h2 className="font-semibold text-lg mb-3">Other sections of {projectName}</h2>
            <ul className="flex flex-wrap gap-3">
              {siblingReports.map((rt) => (
                <li key={rt}>
                  <Link href={`/crowd-funding/projects/${projectId}/reports/${rt}`} className="link-color underline underline-offset-2">
                    {getReadableReportType(rt)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </PageWrapper>
  );
}
