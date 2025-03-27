import ImportantMetricsReport from '@/components/ticker-reports/ImportantMetricsReport';
import PerformanceChecklistEvaluation from '@/components/ticker-reports/PerformanceChecklistEvaluation';
import { ReportSection } from '@/components/ticker-reports/ReportSection';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { CriterionDefinition, IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default async function CriterionDetailsPage({ params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }) {
  const { tickerKey, criterionKey } = await params;

  const response = await fetch(`${getBaseUrl()}/api/tickers/${tickerKey}`, { cache: 'no-cache' });
  const tickerReport = (await response.json()) as FullNestedTickerReport;

  const criteriaResponse = await fetch(
    `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/real-estate/equity-real-estate-investment-trusts-reits/custom-criteria.json`,
    { cache: 'no-cache' }
  );
  const industryGroupCriteria: IndustryGroupCriteriaDefinition = (await criteriaResponse.json()) as IndustryGroupCriteriaDefinition;
  const selectedCriterion: CriterionDefinition = industryGroupCriteria.criteria.find((c) => c.key === criterionKey)!;
  if (!tickerReport.evaluationsOfLatest10Q) {
    return <div>No data available</div>;
  }

  const criterionEvaluation = tickerReport.evaluationsOfLatest10Q.find((item) => item.criterionKey === criterionKey)!;

  // Breadcrumb structure
  const breadcrumbs = [
    { label: `${tickerReport.tickerKey}`, href: `/public-equities/tickers/${tickerKey}`, name: `${tickerKey}`, current: false },
    {
      label: `Criterion: ${criterionKey}`,
      href: `/public-equities/tickers/${tickerKey}/criteria/${criterionKey}`,
      name: `Criterion: ${criterionKey}`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="mx-auto text-color">
        <div className="text-center text-color my-5">
          <h1 className="font-semibold leading-6 text-2xl">Ticker: {tickerKey}</h1>
          <div className="my-5">Criterion: {criterionEvaluation.criterionKey}</div>
        </div>

        <div className="block-bg-color p-8">
          <div className="overflow-x-auto">
            {/* Performance Checklist Section */}
            <h3 className="text-lg font-semibold mt-6 mb-4">Performance Checklist</h3>
            <PerformanceChecklistEvaluation criterionEvaluation={criterionEvaluation} />

            <h3 className="text-lg font-semibold mt-6 mb-4">Important Metrics</h3>
            <ImportantMetricsReport criterionEvaluation={criterionEvaluation} />
            {/* Reports Section */}
            <h3 className="text-lg font-semibold mt-6 mb-4">Reports</h3>
            {selectedCriterion.reports.map((reportDefinition) => {
              const report = criterionEvaluation.reports.find((report) => report.reportKey === reportDefinition.key);
              return (
                <ReportSection
                  key={reportDefinition.key}
                  reportDefinition={reportDefinition}
                  report={report}
                  criterionKey={criterionKey}
                  industryGroupCriteria={industryGroupCriteria}
                />
              );
            })}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
