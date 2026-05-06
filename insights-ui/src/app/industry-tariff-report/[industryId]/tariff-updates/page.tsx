import PrivateWrapper from '@/components/auth/PrivateWrapper';
import TariffUpdatesActions from '@/components/industry-tariff/section-actions/TariffUpdatesActions';
import { CountryNavigation } from '@/components/industry-tariff/renderers/CountryNavigation';
import { getTariffIndustryDefinitionById, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import { fetchIndustryTariffUpdatesMetadata } from '@/utils/tariff-reports/industry-metadata';
import { tariffReportTag } from '@/utils/tariff-report-tags';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';
import { CountryTariffRenderer } from '@/components/industry-tariff/renderers/CountryTariffRenderer';

export async function generateMetadata({ params }: { params: Promise<{ industryId: string }> }): Promise<Metadata> {
  const { industryId } = await params;
  return fetchIndustryTariffUpdatesMetadata(industryId);
}

export default async function TariffUpdatesPage({ params }: { params: Promise<{ industryId: string }> }) {
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

  const definition = getTariffIndustryDefinitionById(industryId as TariffIndustryId);

  // Check if SEO data exists for this page
  const seoDetails = report.reportSeoDetails?.tariffUpdatesSeoDetails;
  const isSeoMissing = !seoDetails || !seoDetails.title || !seoDetails.shortDescription || !seoDetails.keywords?.length;

  return (
    <div className="mx-auto max-w-7xl py-2">
      {/* Title and Actions */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold heading-color">Top 5 Trade Partners - {definition.name} Industry</h1>
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

      <div className="space-y-4">
        {/* Country Navigation */}
        {report.tariffUpdates && report.tariffUpdates.countryNames && <CountryNavigation countries={report.tariffUpdates.countryNames} />}

        {report.tariffUpdates ? (
          report.tariffUpdates.countrySpecificTariffs.map((countryTariff, index) => {
            const sectionId = `country-${countryTariff.countryName.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <div key={index} className="mb-6">
                <div className="flex justify-end mb-4">
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
