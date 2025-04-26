import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { IndustryTariffReport } from '@/types/industry-tariff/industry-tariff-report-types';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import EvaluateIndustryAreasActions from '@/components/industry-tariff/section-actions/EvaluateIndustryAreasActions';

export default async function PositiveTariffImpactPage({ params }: { params: { reportId: string; index: string } }) {
  const { reportId, index } = params;
  const areaIndex = Number.parseInt(index, 10);

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${reportId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report || !report.evaluateIndustryAreas[areaIndex]) {
    return <div>Industry area evaluation not found</div>;
  }

  const area = report.evaluateIndustryAreas[areaIndex];
  const { positiveTariffImpactOnCompanyType } = area;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <EvaluateIndustryAreasActions reportId={reportId} areaIndex={areaIndex} areaTitle={area.title} subSection="positiveTariffImpactOnCompanyType" />
        </PrivateWrapper>
      </div>

      <h1 className="text-2xl font-bold mb-6 heading-color">Positive Tariff Impact: {area.title}</h1>

      <div className="mb-8 space-y-6">
        {positiveTariffImpactOnCompanyType.map((impact, idx) => (
          <div key={idx} className="border rounded-md p-4">
            <h2 className="text-xl font-semibold mb-2 heading-color">{impact.companyType}</h2>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-1 heading-color">Impact</h3>
              <p>{impact.impact}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-1 heading-color">Reasoning</h3>
              <p>{impact.reasoning}</p>
            </div>

            {impact.chartUrls && impact.chartUrls.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2 heading-color">Supporting Charts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {impact.chartUrls.map((chart, chartIdx) => (
                    <div key={chartIdx} className="border rounded-md p-2">
                      <img src={chart.chartUrl || '/placeholder.svg'} alt={`Chart ${chartIdx + 1}`} className="w-full" />
                      <p className="mt-2 text-sm text-color">{chart.chartCode}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
