import PrivateWrapper from '@/components/auth/PrivateWrapper';
import EvaluateIndustryAreasActions from '@/components/industry-tariff/section-actions/EvaluateIndustryAreasActions';
import { establishedPlayerToMarkdown } from '@/scripts/industry-tariff-reports/render-tariff-markdown';

import { getNumberOfSubHeadings, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { EvaluateIndustryContent, IndustryArea, IndustrySubArea, IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import { getPreviousNextIndices } from '@/util/getPreviousNextIndices';
import { tariffReportTag } from '@/utils/tariff-report-tags';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industryId: TariffIndustryId; headingAndSubheadingIndex: string }>;
}): Promise<Metadata> {
  const { industryId, headingAndSubheadingIndex } = await params;
  const [headingString, subHeadingString] = headingAndSubheadingIndex.split('-');

  const headingIndex = Number.parseInt(headingString, 10);
  const subHeadingIndex = Number.parseInt(subHeadingString, 10);

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, {
    next: { tags: [tariffReportTag(industryId)] },
  });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return {
      title: 'Industry Area Evaluation | Tariff Report',
      description: 'Information about industry area impacts from tariff changes',
    };
  }

  // Get industry area information
  const area: IndustryArea | undefined = report?.industryAreas?.areas?.[headingIndex];
  const subArea: IndustrySubArea | undefined = area?.subAreas?.[subHeadingIndex];
  const indexInArray = headingIndex * getNumberOfSubHeadings(industryId) + subHeadingIndex;
  const evaluateIndustryArea = report?.evaluateIndustryAreas?.[indexInArray];

  // Get the SEO details specific to this industry area
  const areaKey = `${headingIndex}-${subHeadingIndex}`;
  const seoDetails = report?.reportSeoDetails?.evaluateIndustryAreasSeoDetails?.[areaKey];

  // Create a title that includes the area name
  const areaTitle = evaluateIndustryArea?.title || subArea?.title || 'Industry Area';
  const seoTitle = seoDetails?.title || `${areaTitle} Analysis | Tariff Impact Evaluation`;
  const seoDescription =
    seoDetails?.shortDescription ||
    `Detailed analysis of ${areaTitle} including established players, new challengers, and tariff impacts on this industry segment.`;
  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${industryId}/evaluate-industry-areas/${headingAndSubheadingIndex}`;

  // Create keywords from SEO details or fallback to generic ones
  const keywords = seoDetails?.keywords || [
    areaTitle,
    'tariff analysis',
    'industry evaluation',
    'established players',
    'new challengers',
    'tariff impacts',
    'KoalaGains',
  ];

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
    },
    keywords: keywords,
  };
}

export default async function EvaluateIndustryAreaPage({ params }: { params: Promise<{ industryId: TariffIndustryId; headingAndSubheadingIndex: string }> }) {
  const { industryId, headingAndSubheadingIndex } = await params;
  const [headingString, subHeadingString] = headingAndSubheadingIndex.split('-');

  const headingIndex = Number.parseInt(headingString, 10);
  const subHeadingIndex = Number.parseInt(subHeadingString, 10);

  const indexInArray = headingIndex * getNumberOfSubHeadings(industryId) + subHeadingIndex;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, {
    next: { tags: [tariffReportTag(industryId)] },
  });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  const area: IndustryArea | undefined = report?.industryAreas?.areas?.[headingIndex];
  const subArea: IndustrySubArea | undefined = area?.subAreas?.[subHeadingIndex];

  const evaluateIndustryArea = report?.evaluateIndustryAreas?.[indexInArray];

  // Check if SEO data exists for this area
  const areaKey = `${headingIndex}-${subHeadingIndex}`;
  const seoDetails = report?.reportSeoDetails?.evaluateIndustryAreasSeoDetails?.[areaKey];
  const isSeoMissing = !seoDetails || !seoDetails.title || !seoDetails.shortDescription || !seoDetails.keywords?.length;

  // Function to render section with header and actions
  const renderSection = (
    title: string,
    content: JSX.Element,
    sectionType: EvaluateIndustryContent,
    challengerTicker?: string,
    establishedPlayerTicker?: string
  ) => (
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
            challengerTicker={challengerTicker}
            establishedPlayerTicker={establishedPlayerTicker}
          />
        </PrivateWrapper>
      </div>
      {content}
    </div>
  );

  // Function to render placeholder content
  const renderPlaceholder = () => <div className="text-gray-500 italic">No Content Available</div>;

  return (
    <div className="mx-auto max-w-7xl py-2">
      {/* SEO Warning Banner for Admins */}
      {isSeoMissing && (
        <PrivateWrapper>
          <div className="mb-8 p-4 bg-amber-100 border border-amber-300 rounded-md text-amber-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <span className="font-medium">SEO metadata is missing for this page</span>
              </div>
            </div>
          </div>
        </PrivateWrapper>
      )}

      {/* Title and Overall Actions */}
      <div className="mb-8 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold heading-color">{evaluateIndustryArea?.title || subArea?.title || 'Industry Area Evaluation'}</h1>
          <PrivateWrapper>
            <EvaluateIndustryAreasActions
              industryId={industryId}
              sectionName={evaluateIndustryArea?.title || 'Industry Area Evaluation'}
              headingIndex={headingIndex}
              subHeadingIndex={subHeadingIndex}
              sectionType={EvaluateIndustryContent.ALL}
            />
          </PrivateWrapper>
        </div>
      </div>

      <div className="space-y-12">
        {/* About section */}
        {renderSection(
          'About',
          <div className="bg-gray-900 rounded-lg py-2 shadow-sm">
            <div className="markdown-body prose max-w-none px-2">
              {evaluateIndustryArea?.aboutParagraphs ? (
                <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(evaluateIndustryArea.aboutParagraphs) }} />
              ) : (
                renderPlaceholder()
              )}
            </div>
          </div>,
          EvaluateIndustryContent.ALL
        )}

        {/* Established Players section */}
        {renderSection(
          'Established Players',
          <div className="space-y-6">
            {evaluateIndustryArea?.establishedPlayerDetails && evaluateIndustryArea.establishedPlayerDetails.length > 0 ? (
              evaluateIndustryArea.establishedPlayerDetails.map((player, idx) => {
                const markdown = establishedPlayerToMarkdown(player);
                const renderedMarkdown = markdown && parseMarkdown(markdown);
                return (
                  <div key={idx} className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gray-800 p-4 border-b border-gray-700">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">{player.companyName}</h3>
                        <PrivateWrapper>
                          <EvaluateIndustryAreasActions
                            industryId={industryId}
                            sectionName={`Established Player: ${player.companyName}`}
                            headingIndex={headingIndex}
                            subHeadingIndex={subHeadingIndex}
                            sectionType={EvaluateIndustryContent.ESTABLISHED_PLAYER}
                            establishedPlayerTicker={player.companyTicker}
                          />
                        </PrivateWrapper>
                      </div>
                    </div>
                    <div className="py-6 px-6">
                      <div className="markdown markdown-body prose max-w-none" dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-gray-900 rounded-lg p-6 shadow-sm">{renderPlaceholder()}</div>
            )}
          </div>,
          EvaluateIndustryContent.ESTABLISHED_PLAYERS
        )}

        {/* New Challengers section */}
        {renderSection(
          'New Challengers',
          <div className="space-y-6">
            {evaluateIndustryArea?.newChallengersDetails && evaluateIndustryArea.newChallengersDetails.length > 0 ? (
              evaluateIndustryArea.newChallengersDetails.map((challenger, idx) => {
                const markdown = establishedPlayerToMarkdown(challenger);
                const renderedMarkdown = markdown && parseMarkdown(markdown);
                return (
                  <div key={idx} className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gray-800 p-4 border-b border-gray-700">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">{challenger.companyName}</h3>
                        <PrivateWrapper>
                          <EvaluateIndustryAreasActions
                            industryId={industryId}
                            sectionName={`New Challenger: ${challenger.companyName}`}
                            headingIndex={headingIndex}
                            subHeadingIndex={subHeadingIndex}
                            sectionType={EvaluateIndustryContent.NEW_CHALLENGER}
                            challengerTicker={challenger.companyTicker}
                          />
                        </PrivateWrapper>
                      </div>
                    </div>
                    <div className="py-6 px-6">
                      <div className="markdown markdown-body prose max-w-none" dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-gray-900 rounded-lg p-6 shadow-sm">{renderPlaceholder()}</div>
            )}
          </div>,
          EvaluateIndustryContent.NEW_CHALLENGERS
        )}

        {/* Headwinds & Tailwinds section */}
        {renderSection(
          'Headwinds & Tailwinds',
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg shadow-sm py-6">
              <h3 className="text-xl font-medium mb-4 pb-2 border-b border-gray-700 px-6">Headwinds</h3>
              <div className="px-6">
                {evaluateIndustryArea?.headwindsAndTailwinds?.headwinds && evaluateIndustryArea.headwindsAndTailwinds.headwinds.length > 0 ? (
                  <ul className="list-disc pl-5 markdown-body space-y-3">
                    {evaluateIndustryArea.headwindsAndTailwinds.headwinds.map((item, idx) => (
                      <li key={idx} className="text-gray-300 markdown markdown-body" dangerouslySetInnerHTML={{ __html: item ? parseMarkdown(item) : '' }} />
                    ))}
                  </ul>
                ) : (
                  renderPlaceholder()
                )}
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg shadow-sm py-6">
              <h3 className="text-xl font-medium mb-4 pb-2 border-b border-gray-700 px-6">Tailwinds</h3>
              <div className="px-6">
                {evaluateIndustryArea?.headwindsAndTailwinds?.tailwinds && evaluateIndustryArea.headwindsAndTailwinds.tailwinds.length > 0 ? (
                  <ul className="list-disc pl-5 markdown-body space-y-3">
                    {evaluateIndustryArea.headwindsAndTailwinds.tailwinds.map((item, idx) => (
                      <li key={idx} className="text-gray-300 markdown markdown-body" dangerouslySetInnerHTML={{ __html: item ? parseMarkdown(item) : '' }} />
                    ))}
                  </ul>
                ) : (
                  renderPlaceholder()
                )}
              </div>
            </div>
          </div>,
          EvaluateIndustryContent.HEADWINDS_AND_TAILWINDS
        )}

        {/* Tariff Impact by Company Type section */}
        {renderSection(
          'Tariff Impact by Company Type',
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg shadow-sm py-6">
              <h3 className="text-xl font-medium mb-4 pb-2 border-b border-gray-700 px-6">Positive Impact</h3>
              <div className="px-6">
                {evaluateIndustryArea?.positiveTariffImpactOnCompanyType && evaluateIndustryArea.positiveTariffImpactOnCompanyType.length > 0 ? (
                  <div className="space-y-4">
                    {evaluateIndustryArea.positiveTariffImpactOnCompanyType.map((impact, idx) => (
                      <div key={idx} className="bg-gray-800 p-4 rounded-md">
                        <h4 className="font-medium text-lg mb-2">{impact.companyType}</h4>
                        <div className="markdown markdown-body space-y-3">
                          <div>
                            <strong className="text-gray-300">Impact:</strong>
                            <div
                              className="mt-1 markdown markdown-body"
                              dangerouslySetInnerHTML={{ __html: impact.impact ? parseMarkdown(impact.impact) : '' }}
                            />
                          </div>
                          <div>
                            <strong className="text-gray-300">Reasoning:</strong>
                            <div
                              className="mt-1 markdown markdown-body"
                              dangerouslySetInnerHTML={{ __html: impact.reasoning ? parseMarkdown(impact.reasoning) : '' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  renderPlaceholder()
                )}
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg shadow-sm py-6">
              <h3 className="text-xl font-medium mb-4 pb-2 border-b border-gray-700 px-6">Negative Impact</h3>
              <div className="px-6">
                {evaluateIndustryArea?.negativeTariffImpactOnCompanyType && evaluateIndustryArea.negativeTariffImpactOnCompanyType.length > 0 ? (
                  <div className="space-y-4">
                    {evaluateIndustryArea.negativeTariffImpactOnCompanyType.map((impact, idx) => (
                      <div key={idx} className="bg-gray-800 p-4 rounded-md">
                        <h4 className="font-medium text-lg mb-2">{impact.companyType}</h4>
                        <div className="markdown markdown-body space-y-3">
                          <div>
                            <strong className="text-gray-300">Impact:</strong>
                            <div
                              className="mt-1 markdown markdown-body"
                              dangerouslySetInnerHTML={{ __html: impact.impact ? parseMarkdown(impact.impact) : '' }}
                            />
                          </div>
                          <div>
                            <strong className="text-gray-300">Reasoning:</strong>
                            <div
                              className="mt-1 markdown markdown-body"
                              dangerouslySetInnerHTML={{ __html: impact.reasoning ? parseMarkdown(impact.reasoning) : '' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  renderPlaceholder()
                )}
              </div>
            </div>
          </div>,
          EvaluateIndustryContent.TARIFF_IMPACT_BY_COMPANY_TYPE
        )}

        {/* Tariff Impact Summary section */}
        {renderSection(
          'Tariff Impact Summary',
          <div className="bg-gray-900 rounded-lg shadow-sm py-6">
            <div className="prose max-w-none markdown-body px-6">
              {evaluateIndustryArea?.tariffImpactSummary ? (
                <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(evaluateIndustryArea.tariffImpactSummary) }} />
              ) : (
                renderPlaceholder()
              )}
            </div>
          </div>,
          EvaluateIndustryContent.TARIFF_IMPACT_SUMMARY
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-700">
        {(() => {
          const navigation = getPreviousNextIndices(industryId, headingIndex, subHeadingIndex);

          return (
            <>
              <div className="flex-1">
                {navigation.hasPrevious && (
                  <Link
                    href={`/industry-tariff-report/${industryId}/evaluate-industry-areas/${navigation.prevHeadingIndex}-${navigation.prevSubHeadingIndex}`}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-sm text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Previous
                  </Link>
                )}
              </div>

              <div className="flex-1 text-center">
                <span className="text-sm text-gray-500">
                  {navigation.currentPosition + 1} of {navigation.totalPositions}
                </span>
              </div>

              <div className="flex-1 text-right">
                {navigation.hasNext && (
                  <Link
                    href={`/industry-tariff-report/${industryId}/evaluate-industry-areas/${navigation.nextHeadingIndex}-${navigation.nextSubHeadingIndex}`}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-sm text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors duration-200"
                  >
                    Next
                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
