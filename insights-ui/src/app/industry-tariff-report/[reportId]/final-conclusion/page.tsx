import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { IndustryTariffReport } from '@/types/industry-tariff/industry-tariff-report-types';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import FinalConclusionActions from '@/components/industry-tariff/section-actions/FinalConclusionActions';

export default async function FinalConclusionPage({ params }: { params: Promise<{ reportId: string }> }) {
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

  const { finalConclusion } = report;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <FinalConclusionActions reportId={reportId} />
        </PrivateWrapper>
      </div>

      <h1 className="text-2xl font-bold mb-6 heading-color">{finalConclusion.title}</h1>
      <div className="mb-6">
        <p>{finalConclusion.conclusionBrief}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 heading-color">{finalConclusion.positiveImpacts.title}</h2>
        <p>{finalConclusion.positiveImpacts.positiveImpacts}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 heading-color">{finalConclusion.negativeImpacts.title}</h2>
        <p>{finalConclusion.negativeImpacts.negativeImpacts}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 heading-color">Final Statements</h2>
        <p>{finalConclusion.finalStatements}</p>
      </div>
    </div>
  );
}
