import PrivateWrapper from '@/components/auth/PrivateWrapper';
import IndustryAreasActions from '@/components/industry-tariff/section-actions/IndustryAreasActions';
import { getMarkdownContentForIndustryAreas } from '@/scripts/industry-tariff-reports/05-industry-areas';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default async function IndustryAreasPage({ params }: { params: Promise<{ reportId: string }> }) {
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

  const content = report.industryAreas ? parseMarkdown(getMarkdownContentForIndustryAreas(report.industryAreas)) : 'No content available';

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <IndustryAreasActions reportId={reportId} />
        </PrivateWrapper>
      </div>

      <div dangerouslySetInnerHTML={{ __html: content }} className="markdown-body" />
    </div>
  );
}
