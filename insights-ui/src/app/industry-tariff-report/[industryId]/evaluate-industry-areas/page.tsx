import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { getNumberOfSubHeadings, getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { tariffReportTag } from '@/utils/tariff-report-cache-utils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ industryId: TariffIndustryId }> }): Promise<Metadata> {
  const { industryId } = await params;

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
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, {
    next: { tags: [tariffReportTag(industryId)] },
  });
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
    <div className="mx-auto max-w-7xl py-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 heading-color">Evaluate Industry Areas for {definition.name}</h1>
        <p className="text-lg text-gray-300">Explore the impact of tariff changes across different areas of the {definition.name} industry.</p>
      </div>

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

      <div className="space-y-12">
        {industryAreas.areas.map((heading, index) => (
          <div key={`heading-${index}`} className="bg-gray-900 rounded-lg shadow-sm py-6">
            <h2 className="text-2xl font-semibold mb-6 pb-3 border-b border-gray-700 heading-color px-6">{heading.title}</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
              {heading.subAreas.map((subHeading, subIndex) => {
                const indexInArray = index * getNumberOfSubHeadings(industryId) + subIndex;
                const evaluated = report?.evaluateIndustryAreas?.[indexInArray];

                if (!evaluated) {
                  return (
                    <li key={`subheading-${index}-${subIndex}`} className="list-none bg-gray-800 p-4 rounded-md">
                      <div className="text-gray-500 italic">Data not available</div>
                    </li>
                  );
                }

                return (
                  <li key={`subheading-${index}-${subIndex}`} className="list-none">
                    <Link
                      href={`/industry-tariff-report/${industryId}/evaluate-industry-areas/${index}-${subIndex}`}
                      className="block h-full bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-700"
                    >
                      <div className="p-6 flex flex-col h-full">
                        <h3 className="text-xl font-medium mb-3 heading-color">{evaluated.title}</h3>

                        {evaluated.aboutParagraphs?.length > 0 && (
                          <p className="text-gray-300 flex-grow">
                            {evaluated.aboutParagraphs.substring(0, 180)}
                            {evaluated.aboutParagraphs.length > 180 && '...'}
                          </p>
                        )}

                        <div className="mt-4 text-sm link-color font-medium flex items-center">
                          Read analysis
                          <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
