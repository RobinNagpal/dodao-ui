import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { getNumberOfSubHeadings, getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ industryId: TariffIndustryId }> }): Promise<Metadata> {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`);
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return {
      title: 'Industry Areas | Tariff Report',
      description: 'Evaluation of industry areas affected by tariff changes',
    };
  }

  // Get the SEO details specific to industry areas
  const seoDetails = report.reportSeoDetails?.industryAreasSeoDetails;

  // Create a title that includes the industry name
  const industryName = report.executiveSummary?.title || 'Industry';
  const seoTitle = seoDetails?.title || `${industryName} Industry Areas | Tariff Impact Analysis`;
  const seoDescription =
    seoDetails?.shortDescription ||
    `Comprehensive analysis of key ${industryName} industry areas, examining how tariff changes affect different market segments.`;
  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${industryId}/evaluate-industry-areas`;

  // Create keywords from SEO details or fallback to generic ones
  const keywords = seoDetails?.keywords || [industryName, 'industry areas', 'market segments', 'tariff impact', 'sector analysis', 'KoalaGains'];

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

export default async function EvaluateIndustryAreasPage({ params }: { params: Promise<{ industryId: TariffIndustryId }> }) {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`);
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  const { industryAreas } = report;

  const definition = getTariffIndustryDefinitionById(industryId);

  if (!industryAreas?.areas || industryAreas?.areas?.length === 0) {
    return <div>No industry area headings found</div>;
  }

  // Check if SEO data exists for this page
  const seoDetails = report.reportSeoDetails?.industryAreasSeoDetails;
  const isSeoMissing = !seoDetails || !seoDetails.title || !seoDetails.shortDescription || !seoDetails.keywords?.length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-6 heading-color">Evaluate Industry Areas for {definition.name}</h1>

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

      {industryAreas.areas.map((heading, index) => (
        <div key={`heading-${index}`} className="mb-6">
          <h2 className="text-xl font-semibold mb-3 heading-color">{heading.title}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heading.subAreas.map((subHeading, subIndex) => {
              const indexInArray = index * getNumberOfSubHeadings(industryId) + subIndex;
              const evaluated = report?.evaluateIndustryAreas?.[indexInArray];

              if (!evaluated) {
                return (
                  <li key={`subheading-${index}-${subIndex}`} className="list-none">
                    Data not available
                  </li>
                );
              }

              return (
                <li key={`subheading-${index}-${subIndex}`} className="list-none">
                  <Link
                    href={`/industry-tariff-report/${industryId}/evaluate-industry-areas/${index}-${subIndex}`}
                    className="block h-full border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="p-5 flex flex-col h-full">
                      <h3 className="text-lg font-medium mb-3 heading-color">{evaluated.title}</h3>

                      {evaluated.aboutParagraphs?.length > 0 && (
                        <p className="text-sm opacity-80 flex-grow">
                          {evaluated.aboutParagraphs.substring(0, 180)}
                          {evaluated.aboutParagraphs.length > 180 && '...'}
                        </p>
                      )}

                      <div className="mt-3 text-sm link-color font-medium">Read analysis →</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
