import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { ProjectDetails, ReportType, SpiderGraph } from '@/types/project/project';
import { parseMarkdown } from '@/util/parse-markdown';

export async function generateMetadata({ params }: { params: Promise<{ projectId: string; reportType: string }> }): Promise<Metadata> {
  const { projectId, reportType } = await params;

  const projectResponse = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
  const projectData: { projectDetails: ProjectDetails; spiderGraph: SpiderGraph | {} } = await projectResponse.json();

  const report = projectData.projectDetails.reports[reportType];

  // Map report types to better human-readable titles
  const reportTitles: Record<string, string> = {
    [ReportType.GENERAL_INFO]: 'General Information',
    [ReportType.FOUNDER_AND_TEAM]: 'Founder and Team',
    [ReportType.TRACTION]: 'Traction',
    [ReportType.MARKET_OPPORTUNITY]: 'Market Opportunity',
    [ReportType.VALUATION]: 'Valuation',
    [ReportType.EXECUTION_AND_SPEED]: 'Execution and Speed',
    [ReportType.FINANCIAL_HEALTH]: 'Financial Health',
    [ReportType.RELEVANT_LINKS]: 'Relevant Links',
  };

  // Default title if the report type is unknown
  const readableReportType = reportTitles[reportType] || 'Project Report';

  return {
    title: `${readableReportType} - ${projectData.projectDetails.name}`,
    description: `Explore the ${readableReportType} for the crowdfunding project "${projectData.projectDetails.name}". ${report.summary || ''}`,
    keywords: [
      projectData.projectDetails.name,
      'crowdfunding insights',
      'investment analysis',
      'investor reports',
      'analysis',
      'risk analysis',
      'investment risks',
      'funding health',
      projectId,
      readableReportType, // Dynamic keyword from report type
    ],
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://koalagains.com/crowd-funding/projects/${projectId}/reports/${reportType}`,
    },
    openGraph: {
      title: `${readableReportType} - ${projectId}`,
      description: `View the ${readableReportType} for project "${projectId}". Detailed analysis of investment risks, funding health, and team assessment.`,
      url: `https://koalagains.com/crowd-funding/projects/${projectId}/reports/${reportType}`,
      type: 'article',
      siteName: 'KoalaGains',
    },
  };
}

export default async function ReportDetailPage({ params }: { params: Promise<{ projectId: string; reportType: string }> }) {
  const { projectId, reportType } = await params;

  const reportResponse = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}/reports/${reportType}`);
  const reportData: { reportDetail: string } = await reportResponse.json();

  const projectResponse = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}`);
  const projectData: { projectDetails: ProjectDetails; spiderGraph: SpiderGraph | {} } = await projectResponse.json();

  const report = projectData.projectDetails.reports[reportType];
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Crowd Funding Projects',
      href: `/crowd-funding`,
      current: false,
    },
    {
      name: projectId,
      href: `/crowd-funding/projects/${projectId}`,
      current: false,
    },
    {
      name: reportType,
      href: `/crowd-funding/projects/${projectId}/reports/${reportType}`,
      current: true,
    },
  ];

  const reportDetailContents = reportData.reportDetail && parseMarkdown(reportData.reportDetail);

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} hideHomeIcon={true} />
      <div className="mx-auto text-color">
        <div className="text-center text-color my-5">
          <h1 className="font-semibold leading-6 text-2xl">Project: {projectId}</h1>
          <div className="my-5">Report: {reportType}</div>
        </div>
        <div className="block-bg-color p-8">
          <div className="overflow-x-auto">
            {report.performanceChecklist?.length && (
              <ul className="list-disc mt-2">
                {report.performanceChecklist.map((item, index) => (
                  <li key={index} className="mb-1 flex items-start">
                    <span className="mr-2">{item.score === 1 ? '✅' : '❌'}</span>
                    <span>{item.checklistItem}</span>
                  </li>
                ))}
              </ul>
            )}
            {reportDetailContents ? (
              <div className="markdown-body text-md" dangerouslySetInnerHTML={{ __html: reportDetailContents }} />
            ) : (
              <>
                <div className="text-center">Empty</div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
