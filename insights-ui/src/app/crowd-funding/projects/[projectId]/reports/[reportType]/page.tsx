import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { ProjectDetails, ReportType, SpiderGraph } from '@/types/project/project';

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
    title: `${readableReportType} - ${projectId} | DoDAO`,
    description: `Explore the ${readableReportType} for the crowdfunding project "${projectId}". ${report.summary || ''}`,
    keywords: [
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
      canonical: `https://dodao.io/crowd-funding/projects/${projectId}/reports/${reportType}`,
    },
    openGraph: {
      title: `${readableReportType} - ${projectId} | DoDAO`,
      description: `View the ${readableReportType} for project "${projectId}". Detailed analysis of investment risks, funding health, and team assessment.`,
      url: `https://dodao.io/crowd-funding/projects/${projectId}/reports/${reportType}`,
      type: 'article',
      siteName: 'DoDAO',
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

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
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
            {reportData.reportDetail ? (
              <>
                <Markdown
                  className="markdown"
                  remarkPlugins={[remarkGfm]}
                  components={{
                    th: ({ node, ...props }) => <th className="border border-color px-4 py-2" {...props} />,
                    td: ({ node, ...props }) => <td className="border border-color px-4 py-2" {...props} />,
                  }}
                >
                  {reportData.reportDetail}
                </Markdown>
              </>
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
