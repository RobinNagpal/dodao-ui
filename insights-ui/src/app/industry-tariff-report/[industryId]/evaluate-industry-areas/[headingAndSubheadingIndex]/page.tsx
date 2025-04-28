import PrivateWrapper from '@/components/auth/PrivateWrapper';
import EvaluateIndustryAreasActions from '@/components/industry-tariff/section-actions/EvaluateIndustryAreasActions';
import { establishedPlayerToMarkdown } from '@/scripts/industry-tariff-reports/render-markdown';

import { getNumberOfSubHeadings } from '@/scripts/industry-tariff-reports/tariff-industries';
import { EvaluateIndustryContent, IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
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

  // Function to render section with header and actions
  const renderSection = (title: string, content: JSX.Element, sectionType: EvaluateIndustryContent) => (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold heading-color">{title}</h2>
        <PrivateWrapper>
          <EvaluateIndustryAreasActions
            industryId={industryId}
            sectionName={title}
            headingIndex={headingIndex}
            subHeadingIndex={subHeadingIndex}
            sectionType={sectionType}
          />
        </PrivateWrapper>
      </div>
      {content}
    </div>
  );

  return (
    <div>
      {/* Title and Overall Actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold heading-color">{evaluateIndustryArea.title}</h1>
        <PrivateWrapper>
          <EvaluateIndustryAreasActions
            industryId={industryId}
            sectionName={evaluateIndustryArea.title}
            headingIndex={headingIndex}
            subHeadingIndex={subHeadingIndex}
            sectionType={EvaluateIndustryContent.ALL}
          />
        </PrivateWrapper>
      </div>

      {/* About section */}
      <div className="mb-10 markdown-body">
        <div dangerouslySetInnerHTML={{ __html: evaluateIndustryArea.aboutParagraphs ? parseMarkdown(evaluateIndustryArea.aboutParagraphs) : '' }} />
      </div>

      {/* Established Players section */}
      {renderSection(
        'Established Players',
        <div>
          {evaluateIndustryArea.establishedPlayers.map((player, idx) => {
            const markdown = establishedPlayerToMarkdown(player);
            const renderedMarkdown = markdown && parseMarkdown(markdown);
            return (
              <div key={idx} className="mb-6 p-4 border rounded">
                <div className="markdown-body" dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
              </div>
            );
          })}
        </div>,
        EvaluateIndustryContent.ESTABLISHED_PLAYERS
      )}

      {/* New Challengers section */}
      {evaluateIndustryArea.newChallengers.length > 0 &&
        renderSection(
          'New Challengers',
          <div>
            {evaluateIndustryArea.newChallengers.map((challenger, idx) => {
              const markdown = establishedPlayerToMarkdown(challenger);
              const renderedMarkdown = markdown && parseMarkdown(markdown);
              return (
                <div key={idx} className="mb-6 p-4 border rounded">
                  <div className="markdown-body" dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
                </div>
              );
            })}
          </div>,
          EvaluateIndustryContent.NEW_CHALLENGERS
        )}

      {/* Headwinds & Tailwinds section */}
      {renderSection(
        'Headwinds & Tailwinds',
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Headwinds</h3>
            <ul className="list-disc pl-5 markdown-body">
              {evaluateIndustryArea.headwindsAndTailwinds.headwinds.map((item, idx) => (
                <li key={idx} className="mb-2" dangerouslySetInnerHTML={{ __html: item ? parseMarkdown(item) : '' }} />
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Tailwinds</h3>
            <ul className="list-disc pl-5 markdown-body">
              {evaluateIndustryArea.headwindsAndTailwinds.tailwinds.map((item, idx) => (
                <li key={idx} className="mb-2" dangerouslySetInnerHTML={{ __html: item ? parseMarkdown(item) : '' }} />
              ))}
            </ul>
          </div>
        </div>,
        EvaluateIndustryContent.HEADWINDS_AND_TAILWINDS
      )}

      {/* Tariff Impact by Company Type section */}
      {renderSection(
        'Tariff Impact by Company Type',
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Positive Impact</h3>
            {evaluateIndustryArea.positiveTariffImpactOnCompanyType.map((impact, idx) => (
              <div key={idx} className="mb-3 p-3 border rounded">
                <h4 className="font-medium">{impact.companyType}</h4>
                <div className="markdown-body">
                  <p>
                    <strong>Impact:</strong> <span dangerouslySetInnerHTML={{ __html: impact.impact ? parseMarkdown(impact.impact) : '' }} />
                  </p>
                  <p>
                    <strong>Reasoning:</strong> <span dangerouslySetInnerHTML={{ __html: impact.reasoning ? parseMarkdown(impact.reasoning) : '' }} />
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Negative Impact</h3>
            {evaluateIndustryArea.negativeTariffImpactOnCompanyType.map((impact, idx) => (
              <div key={idx} className="mb-3 p-3 border rounded">
                <h4 className="font-medium">{impact.companyType}</h4>
                <div className="markdown-body">
                  <p>
                    <strong>Impact:</strong> <span dangerouslySetInnerHTML={{ __html: impact.impact ? parseMarkdown(impact.impact) : '' }} />
                  </p>
                  <p>
                    <strong>Reasoning:</strong> <span dangerouslySetInnerHTML={{ __html: impact.reasoning ? parseMarkdown(impact.reasoning) : '' }} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>,
        EvaluateIndustryContent.TARIFF_IMPACT_BY_COMPANY_TYPE
      )}

      {/* Tariff Impact Summary section */}
      {renderSection(
        'Tariff Impact Summary',
        <div className="prose max-w-none markdown-body">
          <div dangerouslySetInnerHTML={{ __html: evaluateIndustryArea.tariffImpactSummary ? parseMarkdown(evaluateIndustryArea.tariffImpactSummary) : '' }} />
        </div>,
        EvaluateIndustryContent.TARIFF_IMPACT_SUMMARY
      )}
    </div>
  );
}
