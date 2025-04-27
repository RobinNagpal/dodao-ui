import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ExecutiveSummaryActions from '@/components/industry-tariff/section-actions/ExecutiveSummaryActions';
import { getMarkdownContentForExecutiveSummary } from '@/scripts/industry-tariff-reports/01-executive-summary';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default async function ExecutiveSummaryPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${reportId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  const content = report.executiveSummary ? parseMarkdown(getMarkdownContentForExecutiveSummary(report.executiveSummary)) : 'No content available';
  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <ExecutiveSummaryActions reportId={reportId} />
        </PrivateWrapper>
      </div>

      <div dangerouslySetInnerHTML={{ __html: content }} className="markdown-body" />
    </div>
  );
}
