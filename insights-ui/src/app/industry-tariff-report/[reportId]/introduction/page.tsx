import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { IndustryTariffReport } from '@/types/industry-tariff/industry-tariff-report-types';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import IntroductionSectionActions from '@/components/industry-tariff/section-actions/IntroductionSectionActions';

export default async function AboutConsumptionPage({ params }: { params: { reportId: string } }) {
  const { reportId } = params;

  // Fetch the report data
  const reportResponse = await fetch(`${getBaseUrl()}/api/industry-tariff-reports/${reportId}`, { cache: 'no-cache' });
  let report: IndustryTariffReport | null = null;

  if (reportResponse.ok) {
    report = await reportResponse.json();
  }

  if (!report) {
    return <div>Report not found</div>;
  }

  const { aboutConsumption } = report.introduction;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <PrivateWrapper>
          <IntroductionSectionActions reportId={reportId} sectionKey="aboutConsumption" sectionName="About Consumption" />
        </PrivateWrapper>
      </div>

      <h1 className="text-2xl font-bold mb-6">{aboutConsumption.title}</h1>
      <div className="mb-6">
        <p>{aboutConsumption.aboutConsumption}</p>
      </div>
    </div>
  );
}
