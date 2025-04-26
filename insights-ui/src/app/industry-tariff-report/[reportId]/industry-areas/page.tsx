import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { IndustryTariffReport } from '@/types/industry-tariff/industry-tariff-report-types';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import IndustryAreasActions from '@/components/industry-tariff/section-actions/IndustryAreasActions';
import Link from 'next/link';

export default async function IndustryAreasPage({ params }: { params: Promise<{ reportId: string }> }) {
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

  const { industryAreas } = report;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <IndustryAreasActions reportId={reportId} />
        </PrivateWrapper>
      </div>

      <h1 className="text-2xl font-bold mb-6 heading-color">Industry Areas</h1>

      <div className="mb-6">
        <div className="space-y-4">
          {industryAreas.map((area, index) => (
            <div key={index} className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2 heading-color">{area.title}</h3>
              <p className="mb-2">{area.industryAreas.substring(0, 200)}...</p>
              <Link href={`/industry-tariff-report/${reportId}/industry-areas/${index}`} className="link-color hover:underline">
                Read more
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
