import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { IndustryTariffReport } from '@/types/industry-tariff/industry-tariff-report-types';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import TariffUpdatesActions from '@/components/industry-tariff/section-actions/TariffUpdatesActions';
import Link from 'next/link';

export default async function TariffUpdatesPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${reportId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  const { tariffUpdates } = report;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <TariffUpdatesActions reportId={reportId} />
        </PrivateWrapper>
      </div>

      <h1 className="text-2xl font-bold mb-6 heading-color">Tariff Updates</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 heading-color">Country Specific Tariffs</h2>
        <div className="space-y-4">
          {tariffUpdates.countrySpecificTariffs.map((tariff, index) => (
            <div key={index} className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2 heading-color">{tariff.countryName}</h3>
              <p className="mb-2">
                <span className="font-medium heading-color">Tariff Details:</span> {tariff.tariffDetails}
              </p>
              <p className="mb-2">
                <span className="font-medium heading-color">Recent Changes:</span> {tariff.changes}
              </p>
              <Link href={`/industry-tariff-report/${reportId}/tariff-updates/country-specific-tariffs/${index}`} className="link-color hover:underline">
                View details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
