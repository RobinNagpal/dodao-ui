import PrivateWrapper from '@/components/auth/PrivateWrapper';
import EvaluateIndustryAreasActions from '@/components/industry-tariff/section-actions/EvaluateIndustryAreasActions';
import { getMarkdownContentForEvaluateIndustryArea } from '@/scripts/industry-tariff-reports/06-evaluate-industry-area';

import { getNumberOfSubHeadings } from '@/scripts/industry-tariff-reports/tariff-industries';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default async function EvaluateIndustryAreaPage({ params }: { params: Promise<{ industryId: string; headingAndSubheadingIndex: string }> }) {
  const { industryId, headingAndSubheadingIndex } = await params;
  const [headingString, subHeadingString] = headingAndSubheadingIndex.split('-');

  const headingIndex = Number.parseInt(headingString, 10);
  const subHeadingIndex = Number.parseInt(subHeadingString, 10);

  const indexInArray = headingIndex * getNumberOfSubHeadings(industryId) + subHeadingIndex;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  const evaluateIndustryArea = report?.evaluateIndustryAreas?.[indexInArray];
  if (!report || !evaluateIndustryArea) {
    return <div>Industry area evaluation not found</div>;
  }

  const content = evaluateIndustryArea ? parseMarkdown(getMarkdownContentForEvaluateIndustryArea(evaluateIndustryArea)) : 'No content available';

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <EvaluateIndustryAreasActions
            industryId={industryId}
            sectionName={evaluateIndustryArea.title}
            headingIndex={headingIndex}
            subHeadingIndex={subHeadingIndex}
          />
        </PrivateWrapper>
      </div>

      <div dangerouslySetInnerHTML={{ __html: content }} className="markdown-body" />
    </div>
  );
}
