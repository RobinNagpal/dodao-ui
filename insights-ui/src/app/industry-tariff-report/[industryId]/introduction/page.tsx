import { getMarkdownContentForIntroduction } from '@/scripts/industry-tariff-reports/02-introduction';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import IntroductionSectionActions from '@/components/industry-tariff/section-actions/IntroductionSectionActions';

export default async function AboutConsumptionPage({ params }: { params: Promise<{ industryId: string }> }) {
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

  const content = report.introduction ? parseMarkdown(getMarkdownContentForIntroduction(report.introduction)) : 'No content available';

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <IntroductionSectionActions industryId={industryId} sectionKey="aboutConsumption" sectionName="About Consumption" />
        </PrivateWrapper>
      </div>

      <div dangerouslySetInnerHTML={{ __html: content }} className="markdown-body" />
    </div>
  );
}
