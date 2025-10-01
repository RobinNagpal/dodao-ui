import PrivateWrapper from '@/components/auth/PrivateWrapper';
import TariffUpdatesActions from '@/components/industry-tariff/section-actions/TariffUpdatesActions';
import { CountryTariffRenderer } from '@/components/industry-tariff/renderers/CountryTariffRenderer';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

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
      title: 'All Countries Tariff Updates | Industry Report',
      description: 'Complete tariff updates for all countries affecting the industry',
    };
  }

  // Get the SEO details specific to tariff updates
  const seoDetails = report.reportSeoDetails?.tariffUpdatesSeoDetails;

  // Create a title that includes the industry name
  const industryName = report.executiveSummary?.title || 'Industry';
  const seoTitle = seoDetails?.title || `${industryName} - All Countries Tariff Updates | Comprehensive Trade Analysis`;
  const seoDescription =
    seoDetails?.shortDescription ||
    `Complete analysis of tariff updates across all major trading countries affecting the ${industryName} industry, including detailed trade impacts and policy changes.`;

  const canonicalUrl = `https://koalagains.com/industry-tariff-report/${industryId}/all-countries-tariff-updates`;

  // Get all countries for keywords
  const countries = report.tariffUpdates?.countryNames || [];

  // Create keywords from SEO details or fallback to generic ones
  const keywords =
    seoDetails?.keywords || [industryName, 'tariff updates', 'trade agreements', 'import tariffs', 'export tariffs', ...countries, 'KoalaGains'].slice(0, 10);

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

  // Set up breadcrumbs
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Reports',
      href: '/reports',
      current: false,
    },
    {
      name: 'Tariff Reports',
      href: '/tariff-reports',
      current: false,
    },
    {
      name: `${definition.name} Report`,
      href: `/industry-tariff-report/${industryId}`,
      current: false,
    },
    {
      name: 'Tariff Updates',
      href: `/industry-tariff-report/${industryId}/tariff-updates`,
      current: false,
    },
    {
      name: 'All Countries',
      href: `/industry-tariff-report/${industryId}/all-countries-tariff-updates`,
      current: true,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl py-2">
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      {/* Back Button */}
      <div className="mb-6">
        <Link
          href={`/industry-tariff-report/${industryId}/tariff-updates`}
          className="inline-flex items-center text-sm font-medium primary-color hover:text-primary-color/80 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Top Countries
        </Link>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold heading-color mb-2">All Countries Tariff Updates</h1>
        <p className="text-muted-foreground">
          Complete tariff updates for {definition.name} across all major trading countries
        </p>
      </div>

      <div className="space-y-12">
        {report.tariffUpdates ? (
          report.tariffUpdates.countrySpecificTariffs.map((countryTariff, index) => {
            const sectionId = `country-${countryTariff.countryName.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <div key={index} className="mb-12">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold heading-color">{countryTariff.countryName}</h2>
                  <PrivateWrapper>
                    <TariffUpdatesActions industryId={industryId} tariffIndex={index} countryName={countryTariff.countryName} />
                  </PrivateWrapper>
                </div>
                <CountryTariffRenderer countryTariff={countryTariff} sectionId={sectionId} />
              </div>
            );
          })
        ) : (
          <div className="bg-gray-900 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold">No tariff updates available</h2>
          </div>
        )}
      </div>
    </div>
  );
}
