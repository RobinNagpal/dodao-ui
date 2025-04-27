import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { IndustryTariffReport } from '@/scripts/industry-tariff-reports/tariff-types';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import EvaluateIndustryAreasActions from '@/components/industry-tariff/section-actions/EvaluateIndustryAreasActions';
import Link from 'next/link';

export default async function EvaluateIndustryAreaPage({ params }: { params: Promise<{ reportId: string; index: string }> }) {
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

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <EvaluateIndustryAreasActions reportId={reportId} areaIndex={areaIndex} areaTitle={area.title} />
        </PrivateWrapper>
      </div>

      <h1 className="text-2xl font-bold mb-6 heading-color">{area.title}</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 heading-color">Overview</h2>
        <div className="space-y-4">
          {area.aboutParagraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 heading-color">New Challengers</h2>
        <div className="space-y-4">
          {area.newChallengers.map((company, idx) => (
            <div key={idx} className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2 heading-color">{company.companyName}</h3>
              <p className="mb-2">{company.companyDescription.substring(0, 150)}...</p>
              <Link
                href={`/industry-tariff-report/${reportId}/evaluate-industry-areas/${areaIndex}/new-challengers/${idx}`}
                className="link-color hover:underline"
              >
                View details
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 heading-color">Established Players</h2>
        <div className="space-y-4">
          {area.establishedPlayers.map((company, idx) => (
            <div key={idx} className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2 heading-color">{company.companyName}</h3>
              <p className="mb-2">{company.companyDescription.substring(0, 150)}...</p>
              <Link
                href={`/industry-tariff-report/${reportId}/evaluate-industry-areas/${areaIndex}/established-players/${idx}`}
                className="link-color hover:underline"
              >
                View details
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 heading-color">Headwinds & Tailwinds</h2>
        <Link href={`/industry-tariff-report/${reportId}/evaluate-industry-areas/${areaIndex}/headwinds-and-tailwinds`} className="link-color hover:underline">
          View headwinds and tailwinds
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 heading-color">Tariff Impact Summary</h2>
        <p className="mb-4">{area.tariffImpactSummary}</p>
        <div className="space-y-4">
          <Link
            href={`/industry-tariff-report/${reportId}/evaluate-industry-areas/${areaIndex}/positive-tariff-impact`}
            className="link-color hover:underline block"
          >
            View positive tariff impacts
          </Link>
          <Link
            href={`/industry-tariff-report/${reportId}/evaluate-industry-areas/${areaIndex}/negative-tariff-impact`}
            className="link-color hover:underline block"
          >
            View negative tariff impacts
          </Link>
        </div>
      </div>
    </div>
  );
}
