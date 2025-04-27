import PrivateWrapper from '@/components/auth/PrivateWrapper';
import FinalConclusionActions from '@/components/industry-tariff/section-actions/FinalConclusionActions';
import { getMarkdownContentForFinalConclusion } from '@/scripts/industry-tariff-reports/07-final-conclusion';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default async function FinalConclusionPage({ params }: { params: Promise<{ industryId: string }> }) {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  const content = report.finalConclusion ? parseMarkdown(getMarkdownContentForFinalConclusion(report.finalConclusion)) : 'No content available';
  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <FinalConclusionActions industryId={industryId} />
        </PrivateWrapper>
      </div>

      <div dangerouslySetInnerHTML={{ __html: content }} className="markdown-body" />
    </div>
  );
}
