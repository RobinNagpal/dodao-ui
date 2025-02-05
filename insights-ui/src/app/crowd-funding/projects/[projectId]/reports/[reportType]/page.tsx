import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export async function generateMetadata({ params }: { params: Promise<{ projectId: string; reportType: string }> }): Promise<Metadata> {
  const { projectId, reportType } = await params;

  // Map report types to better human-readable titles
  const reportTitles: Record<string, string> = {
    general_info: 'General Information',
    red_flags: 'Red Flags',
    green_flags: 'Green Flags',
    team_info: 'Team Information',
    financial_review: 'Financial Review',
    relevant_links: 'Relevant Links',
  };

  // Default title if the report type is unknown
  const readableReportType = reportTitles[reportType] || 'Project Report';

  return {
    title: `${readableReportType} - ${projectId} | DoDAO`,
    description: `Explore the ${readableReportType} for the crowdfunding project "${projectId}". Get insights into funding status, risks, and investment potential.`,
    keywords: [
      'project report',
      'blockchain funding',
      'crowdfunding insights',
      'investment analysis',
      'investor reports',
      'analysis',
      'team assessment',
      'risk analysis',
      reportType, // Dynamic keyword from report type
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
    twitter: {
      card: 'summary_large_image',
      title: `${readableReportType} - ${projectId} | DoDAO`,
      description: `Discover the ${readableReportType} for project "${projectId}". Get details on funding, risks, and team evaluation.`,
      site: '@dodao_io',
      creator: '@dodao_io',
    },
  };
}

export default async function ReportDetailPage({ params }: { params: Promise<{ projectId: string; reportType: string }> }) {
  const { projectId, reportType } = await params;

  const res = await fetch(`${getBaseUrl()}/api/crowd-funding/projects/${projectId}/reports/${reportType}`);
  const data: { reportDetail: string } = await res.json();

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
            {data.reportDetail ? (
              <>
                <Markdown
                  className="markdown"
                  remarkPlugins={[remarkGfm]}
                  components={{
                    th: ({ node, ...props }) => <th className="border border-color px-4 py-2" {...props} />,
                    td: ({ node, ...props }) => <td className="border border-color px-4 py-2" {...props} />,
                  }}
                >
                  {data.reportDetail}
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
