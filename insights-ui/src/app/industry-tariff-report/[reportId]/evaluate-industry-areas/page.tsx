import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { IndustryTariffReport } from '@/types/industry-tariff/industry-tariff-report-types';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import EvaluateIndustryAreasActions from '@/components/industry-tariff/section-actions/EvaluateIndustryAreasActions';
import Link from 'next/link';

export default async function EvaluateIndustryAreasPage({ params }: { params: Promise<{ reportId: string }> }) {
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

  const { evaluateIndustryAreas } = report;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <EvaluateIndustryAreasActions reportId={reportId} />
        </PrivateWrapper>
      </div>

      <h1 className="text-2xl font-bold mb-6 heading-color">Evaluate Industry Areas</h1>

      <div className="mb-6">
        <div className="space-y-4">
          {evaluateIndustryAreas.map((area, index) => (
            <div key={index} className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2 heading-color">{area.title}</h3>
              {area.aboutParagraphs.length > 0 && <p className="mb-2">{area.aboutParagraphs[0].substring(0, 200)}...</p>}
              <Link href={`/industry-tariff-report/${reportId}/evaluate-industry-areas/${index}`} className="link-color hover:underline">
                View evaluation
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
