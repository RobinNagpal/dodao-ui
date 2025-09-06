import PrivateWrapper from '@/components/auth/PrivateWrapper';
import TariffUpdatesActions from '@/components/industry-tariff/section-actions/TariffUpdatesActions';
import { CountryTariffRenderer } from '@/components/industry-tariff/renderers/CountryTariffRenderer';

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

  // Function to render section with header and actions
  const renderSection = (title: string, content: JSX.Element, actions?: JSX.Element) => (
    <div className="mb-12">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-2 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold heading-color">{title}</h2>
          {actions}
        </div>
      </div>
      {content}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl py-2">
      {/* Title and Actions */}
      <div className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold heading-color">Tariff Updates for {definition.name}</h1>
          <PrivateWrapper>
            <TariffUpdatesActions industryId={industryId} />
          </PrivateWrapper>
        </div>
      </div>

      {/* SEO Warning Banner for Admins */}
      {report.tariffUpdates && isSeoMissing && (
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
        {report.tariffUpdates ? (
          report.tariffUpdates.countrySpecificTariffs.map((countryTariff, index) => {
            return (
              <div key={index} className="mb-12">
                <div className="flex justify-end mb-4">
                  <PrivateWrapper>
                    <TariffUpdatesActions industryId={industryId} tariffIndex={index} countryName={countryTariff.countryName} />
                  </PrivateWrapper>
                </div>
                <CountryTariffRenderer countryTariff={countryTariff} />
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold">No tariff updates available</h2>
          </div>
        )}
      </div>
    </div>
  );
}
