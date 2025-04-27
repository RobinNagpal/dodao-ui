import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ExecutiveSummaryActions from '@/components/industry-tariff/section-actions/ExecutiveSummaryActions';

export default async function IndustryTariffReportPage({ params }: { params: Promise<{ industryId: string }> }) {
  const { industryId } = await params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Report not found</h1>
        <p className="mt-4">The requested industry tariff report could not be found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <ExecutiveSummaryActions industryId={industryId} />
        </PrivateWrapper>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 heading-color">Report Overview</h2>
        <p>
          This report provides a comprehensive analysis of tariff impacts on this industry. Navigate through the sections using the sidebar to explore different
          aspects of the report.
        </p>
      </div>
    </div>
  );
}
