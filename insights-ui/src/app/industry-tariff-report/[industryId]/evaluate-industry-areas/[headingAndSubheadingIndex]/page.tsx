import PrivateWrapper from '@/components/auth/PrivateWrapper';
import EvaluateIndustryAreasActions from '@/components/industry-tariff/section-actions/EvaluateIndustryAreasActions';
import { establishedPlayerToMarkdown } from '@/scripts/industry-tariff-reports/render-tariff-markdown';

import { getNumberOfSubHeadings, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { EvaluateIndustryContent, IndustryArea, IndustrySubArea, IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';

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
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
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
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
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
    <div>
      {/* SEO Warning Banner for Admins */}
      {isSeoMissing && (
        <PrivateWrapper>
          <div className="my-8 p-3 bg-amber-100 border border-amber-300 rounded-md text-amber-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <span className="font-medium">SEO metadata is missing for this page</span>
              </div>
            </div>
          </div>
        </PrivateWrapper>
      )}

      {/* Title and Overall Actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold heading-color">{evaluateIndustryArea?.title || subArea?.title || 'Industry Area Evaluation'}</h1>
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

      {/* About section */}
      {renderSection(
        'About',
        <div className="markdown-body">
          {evaluateIndustryArea?.aboutParagraphs ? (
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(evaluateIndustryArea.aboutParagraphs) }} />
          ) : (
            renderPlaceholder()
          )}
        </div>,
        EvaluateIndustryContent.ALL
      )}

      {/* Established Players section */}
      {renderSection(
        'Established Players',
        <div>
          {evaluateIndustryArea?.establishedPlayerDetails && evaluateIndustryArea.establishedPlayerDetails.length > 0
            ? evaluateIndustryArea.establishedPlayerDetails.map((player, idx) => {
                const markdown = establishedPlayerToMarkdown(player);
                const renderedMarkdown = markdown && parseMarkdown(markdown);
                return (
                  <div key={idx} className="mb-6 p-4 border rounded">
                    <div className="flex justify-between items-center mb-4">
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
                    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
                  </div>
                );
              })
            : renderPlaceholder()}
        </div>,
        EvaluateIndustryContent.ESTABLISHED_PLAYERS
      )}

      {/* New Challengers section */}
      {renderSection(
        'New Challengers',
        <div>
          {evaluateIndustryArea?.newChallengersDetails && evaluateIndustryArea.newChallengersDetails.length > 0
            ? evaluateIndustryArea.newChallengersDetails.map((challenger, idx) => {
                const markdown = establishedPlayerToMarkdown(challenger);
                const renderedMarkdown = markdown && parseMarkdown(markdown);
                return (
                  <div key={idx} className="mb-6 p-4 border rounded">
                    <div className="flex justify-between items-center mb-4">
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
                    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />
                  </div>
                );
              })
            : renderPlaceholder()}
        </div>,
        EvaluateIndustryContent.NEW_CHALLENGERS
      )}

      {/* Headwinds & Tailwinds section */}
      {renderSection(
        'Headwinds & Tailwinds',
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Headwinds</h3>
            {evaluateIndustryArea?.headwindsAndTailwinds?.headwinds && evaluateIndustryArea.headwindsAndTailwinds.headwinds.length > 0 ? (
              <ul className="list-disc pl-5 markdown-body">
                {evaluateIndustryArea.headwindsAndTailwinds.headwinds.map((item, idx) => (
                  <li key={idx} className="mb-2" dangerouslySetInnerHTML={{ __html: item ? parseMarkdown(item) : '' }} />
                ))}
              </ul>
            ) : (
              renderPlaceholder()
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Tailwinds</h3>
            {evaluateIndustryArea?.headwindsAndTailwinds?.tailwinds && evaluateIndustryArea.headwindsAndTailwinds.tailwinds.length > 0 ? (
              <ul className="list-disc pl-5 markdown-body">
                {evaluateIndustryArea.headwindsAndTailwinds.tailwinds.map((item, idx) => (
                  <li key={idx} className="mb-2" dangerouslySetInnerHTML={{ __html: item ? parseMarkdown(item) : '' }} />
                ))}
              </ul>
            ) : (
              renderPlaceholder()
            )}
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
            {evaluateIndustryArea?.positiveTariffImpactOnCompanyType && evaluateIndustryArea.positiveTariffImpactOnCompanyType.length > 0
              ? evaluateIndustryArea.positiveTariffImpactOnCompanyType.map((impact, idx) => (
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
                ))
              : renderPlaceholder()}
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Negative Impact</h3>
            {evaluateIndustryArea?.negativeTariffImpactOnCompanyType && evaluateIndustryArea.negativeTariffImpactOnCompanyType.length > 0
              ? evaluateIndustryArea.negativeTariffImpactOnCompanyType.map((impact, idx) => (
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
                ))
              : renderPlaceholder()}
          </div>
        </div>,
        EvaluateIndustryContent.TARIFF_IMPACT_BY_COMPANY_TYPE
      )}

      {/* Tariff Impact Summary section */}
      {renderSection(
        'Tariff Impact Summary',
        <div className="prose max-w-none markdown-body">
          {evaluateIndustryArea?.tariffImpactSummary ? (
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(evaluateIndustryArea.tariffImpactSummary) }} />
          ) : (
            renderPlaceholder()
          )}
        </div>,
        EvaluateIndustryContent.TARIFF_IMPACT_SUMMARY
      )}
    </div>
  );
}
