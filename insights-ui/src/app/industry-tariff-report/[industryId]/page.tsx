import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ReportCoverActions from '@/components/industry-tariff/section-actions/ReportCoverActions';
import { getMarkdownContentForReportCover } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
import type { IndustryTariffReport, ReportCover } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default async function IndustryTariffReportPage({ params }: { params: Promise<{ industryId: string }> }) {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Report not found</h1>
        <p className="mt-4">The requested industry tariff report could not be found.</p>
      </div>
    );
  }

  const reportCover: ReportCover | undefined = report?.reportCover;
  const markdownContent = reportCover && getMarkdownContentForReportCover(reportCover);
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{report?.reportCover?.title || 'Tariff report for ' + industryId}</h1>
        <PrivateWrapper>
          <ReportCoverActions industryId={industryId} />
        </PrivateWrapper>
      </div>
      <div
        dangerouslySetInnerHTML={{
          __html: (markdownContent && parseMarkdown(markdownContent)) || 'No content available',
        }}
        className="markdown-body"
      />
    </div>
  );
}
