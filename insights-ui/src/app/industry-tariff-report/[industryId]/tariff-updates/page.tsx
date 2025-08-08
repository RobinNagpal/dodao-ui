import PrivateWrapper from '@/components/auth/PrivateWrapper';
import TariffUpdatesActions from '@/components/industry-tariff/section-actions/TariffUpdatesActions';

import { getMarkdownContentForCountryTariffs } from '@/scripts/industry-tariff-reports/render-tariff-markdown';
import { getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ industryId: string }> }): Promise<Metadata> {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`);
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return {
      title: 'Tariff Updates | Industry Report',
      description: 'Latest tariff updates and their impact on the industry',
    };
  }

  // Get the SEO details specific to tariff updates
  const seoDetails = report.reportSeoDetails?.tariffUpdatesSeoDetails;

  // Create a title that includes the industry name
  const industryName = report.executiveSummary?.title || 'Industry';
  const seoTitle = seoDetails?.title || `${industryName} Tariff Updates | Trade Impact Analysis`;
  const seoDescription =
    seoDetails?.shortDescription ||
    `Detailed analysis of recent tariff changes affecting the ${industryName} industry, including country-specific impacts and trade agreement changes.`;
  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${industryId}/tariff-updates`;

  // Get countries affected to use in keywords
  const countries = report.tariffUpdates?.countrySpecificTariffs.map((tariff) => tariff.countryName) || [];

  // Create keywords from SEO details or fallback to generic ones
  const keywords =
    seoDetails?.keywords || [industryName, 'tariff updates', 'trade agreements', 'import tariffs', 'export tariffs', ...countries, 'KoalaGains'].slice(0, 10); // Limit to 10 keywords

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

export default async function TariffUpdatesPage({ params }: { params: Promise<{ industryId: TariffIndustryId }> }) {
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

  const definition = getTariffIndustryDefinitionById(industryId);

  // Check if SEO data exists for this page
  const seoDetails = report.reportSeoDetails?.tariffUpdatesSeoDetails;
  const isSeoMissing = !seoDetails || !seoDetails.title || !seoDetails.shortDescription || !seoDetails.keywords?.length;

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">Tariff Updates for {definition.name}</h1>
        <PrivateWrapper>
          <TariffUpdatesActions industryId={industryId} />
        </PrivateWrapper>
      </div>

      {/* SEO Warning Banner for Admins */}
      {report.tariffUpdates && isSeoMissing && (
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

      {report.tariffUpdates ? (
        report.tariffUpdates.countrySpecificTariffs.map((countryTariff, index) => {
          const markdownContent = getMarkdownContentForCountryTariffs(countryTariff);
          return (
            <div key={countryTariff.countryName} className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{countryTariff.countryName}</h2>
                <PrivateWrapper>
                  <TariffUpdatesActions industryId={industryId} tariffIndex={index} countryName={countryTariff.countryName} />
                </PrivateWrapper>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: markdownContent && parseMarkdown(markdownContent),
                }}
                className="markdown-body"
              />
            </div>
          );
        })
      ) : (
        <div>
          <h2 className="text-2xl font-bold">No tariff updates available</h2>
        </div>
      )}
    </div>
  );
}
