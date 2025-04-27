import PrivateWrapper from '@/components/auth/PrivateWrapper';
import UnderstandIndustryActions from '@/components/industry-tariff/section-actions/UnderstandIndustryActions';
import { getMarkdownContentForUnderstandIndustry } from '@/scripts/industry-tariff-reports/04-understand-industry';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default async function UnderstandIndustryPage({ params }: { params: Promise<{ industrySlug: string }> }) {
  const { industrySlug } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industrySlug}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  const content = report.understandIndustry ? parseMarkdown(getMarkdownContentForUnderstandIndustry(report.understandIndustry)) : 'No content available';
  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <UnderstandIndustryActions industrySlug={industrySlug} />
        </PrivateWrapper>
      </div>

      <div dangerouslySetInnerHTML={{ __html: content }} className="markdown-body" />
    </div>
  );
}
