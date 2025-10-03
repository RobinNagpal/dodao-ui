import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { CountryNavigation } from '@/components/industry-tariff/renderers/CountryNavigation';
import AllCountriesTariffUpdatesActions from '@/components/industry-tariff/section-actions/AllCountriesTariffUpdatesActions';
import { getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import { KeyTradePartnersTariff, IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { Metadata } from 'next';
import React from 'react';

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
      title: 'All Key Markets | Industry Report',
      description: 'Comprehensive tariff updates for all key markets in the industry',
    };
  }

  // Get the SEO details specific to all countries tariff updates
  const seoDetails = report.reportSeoDetails?.allCountriesTariffUpdatesSeoDetails;

  // Create a title that includes the industry name
  const industryName = report.executiveSummary?.title || 'Industry';
  const seoTitle = seoDetails?.title || `${industryName} All Key Markets | Global Trade Impact Analysis`;
  const seoDescription =
    seoDetails?.shortDescription ||
    `Complete analysis of tariff changes across all key markets for the ${industryName} industry, covering global trade impacts and market-specific updates.`;
  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${industryId}/all-countries-tariff-updates`;

  // Get countries affected to use in keywords
  const countries = report.allCountriesTariffUpdates?.countryNames;

  // Create keywords from SEO details or fallback to generic ones
  const keywords = seoDetails?.keywords || [industryName, 'all key markets', 'global trade', 'tariff updates', 'trade agreements', 'KoalaGains'].slice(0, 10); // Limit to 10 keywords

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

export default async function AllCountriesTariffUpdatesPage({ params }: { params: Promise<{ industryId: TariffIndustryId }> }) {
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
  const seoDetails = report.reportSeoDetails?.allCountriesTariffUpdatesSeoDetails;
  const isSeoMissing = !seoDetails || !seoDetails.title || !seoDetails.shortDescription || !seoDetails.keywords?.length;

  return (
    <div className="mx-auto max-w-7xl py-2">
      {/* Title and Actions */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold heading-color">All Key Markets - {definition.name} Industry</h1>
          <PrivateWrapper>
            <AllCountriesTariffUpdatesActions industryId={industryId} />
          </PrivateWrapper>
        </div>
      </div>

      {/* SEO Warning Banner for Admins */}
      {report.allCountriesTariffUpdates && isSeoMissing && (
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

      <div className="space-y-8">
        {/* Country Navigation */}
        {report.allCountriesTariffUpdates &&
          report.allCountriesTariffUpdates?.countrySpecificTariffs &&
          Array.isArray(report.allCountriesTariffUpdates?.countrySpecificTariffs) && (
            <CountryNavigation countries={report.allCountriesTariffUpdates?.countrySpecificTariffs.map((c) => c.countryName)} industryId={industryId} />
          )}

        {report.allCountriesTariffUpdates?.countrySpecificTariffs &&
          Array.isArray(report.allCountriesTariffUpdates?.countrySpecificTariffs) &&
          report.allCountriesTariffUpdates?.countrySpecificTariffs?.map((countryTariff, index) => {
            return (
              <div className="mb-6" id={`country-${slugify(countryTariff?.countryName?.toLowerCase())}`}>
                <h2 className="text-2xl">{countryTariff?.countryName}</h2>
                <div
                  className="max-w-max markdown markdown-body text-sm"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(countryTariff?.tariffInfo || '') }}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
