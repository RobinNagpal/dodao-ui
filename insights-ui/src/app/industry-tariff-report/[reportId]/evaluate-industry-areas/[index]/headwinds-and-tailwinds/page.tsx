import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { IndustryTariffReport } from '@/types/industry-tariff/industry-tariff-report-types';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import EvaluateIndustryAreasActions from '@/components/industry-tariff/section-actions/EvaluateIndustryAreasActions';

export default async function HeadwindsAndTailwindsPage({ params }: { params: Promise<{ reportId: string; index: string }> }) {
  const { reportId, index } = await params;
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
  const { headwindsAndTailwinds } = area;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <EvaluateIndustryAreasActions reportId={reportId} areaIndex={areaIndex} areaTitle={area.title} subSection="headwindsAndTailwinds" />
        </PrivateWrapper>
      </div>

      <h1 className="text-2xl font-bold mb-6 heading-color">Headwinds & Tailwinds: {area.title}</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 heading-color">Headwinds</h2>
        <ul className="list-disc pl-5 space-y-2">
          {headwindsAndTailwinds.headwinds.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 heading-color">Tailwinds</h2>
        <ul className="list-disc pl-5 space-y-2">
          {headwindsAndTailwinds.tailwinds.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {headwindsAndTailwinds.headwindChartUrls && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 heading-color">Headwind Charts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {headwindsAndTailwinds.headwindChartUrls.map((chart, idx) => (
              <div key={idx} className="border rounded-md p-4">
                <img src={chart.chartUrl || '/placeholder.svg'} alt={`Headwind chart ${idx + 1}`} className="w-full" />
                <p className="mt-2 text-sm text-color">{chart.chartCode}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {headwindsAndTailwinds.tailwindChartUrls && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 heading-color">Tailwind Charts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {headwindsAndTailwinds.tailwindChartUrls.map((chart, idx) => (
              <div key={idx} className="border rounded-md p-4">
                <img src={chart.chartUrl || '/placeholder.svg'} alt={`Tailwind chart ${idx + 1}`} className="w-full" />
                <p className="mt-2 text-sm text-color">{chart.chartCode}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
