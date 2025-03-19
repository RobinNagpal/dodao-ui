import { ReportSection } from '@/components/ticker-reports/ReportSection';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { CriterionDefinition, IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { FullNestedTickerReport, MetricValueItem } from '@/types/public-equity/ticker-report-types';
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

  const criterion = tickerReport.evaluationsOfLatest10Q.find((item) => item.criterionKey === criterionKey)!;

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
          <div className="my-5">Criterion: {criterion.criterionKey}</div>
        </div>

        <div className="block-bg-color p-8">
          <div className="overflow-x-auto">
            {/* Performance Checklist Section */}
            <h3 className="text-lg font-semibold mt-6 mb-4">Performance Checklist</h3>
            {criterion.performanceChecklistEvaluation?.performanceChecklist?.length ? (
              <ul className="list-disc mt-2">
                {criterion.performanceChecklistEvaluation.performanceChecklist.map((item, index) => (
                  <li key={index} className="mb-1 flex items-start">
                    <span className="mr-2">{item.score === 1 ? '✅' : '❌'}</span>
                    <span>{item.checklistItem}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center">No performance checklist available</p>
            )}

            <h3 className="text-lg font-semibold mt-6 mb-4">Important Metrics</h3>
            {criterion.importantMetricsEvaluation?.metrics?.length ? (
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Metric</th>
                    <th className="border border-gray-300 px-4 py-2">Value</th>
                    <th className="border border-gray-300 px-4 py-2">Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {criterion.importantMetricsEvaluation?.metrics?.map((metric: MetricValueItem) => (
                    <tr key={metric.metricKey} className="border">
                      <td className="border border-gray-300 px-4 py-2">{metric.metricKey.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</td>
                      <td className="border border-gray-300 px-4 py-2">{metric.value}</td>
                      <td className="border border-gray-300 px-4 py-2">{metric.calculationExplanation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500 text-center">No metrics available</p>
            )}
            {/* Reports Section */}
            <h3 className="text-lg font-semibold mt-6 mb-4">Reports</h3>
            {selectedCriterion.reports.map((reportDefinition) => {
              const report = criterion.reports.find((report) => report.reportKey === reportDefinition.key);
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
