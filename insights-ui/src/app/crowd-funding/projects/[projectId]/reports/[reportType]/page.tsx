import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import RadarChart from '@/components/ui/RadarChart';

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

  const startupEvaluation = {
    productInnovation: { score: 4 },
    marketOpportunity: { score: 5 },
    teamStrength: { score: 4 },
    financialHealth: { score: 3 },
    businessModel: { score: 4 },
  };

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="max-w-lg">
        <RadarChart data={startupEvaluation} />
      </div>
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
