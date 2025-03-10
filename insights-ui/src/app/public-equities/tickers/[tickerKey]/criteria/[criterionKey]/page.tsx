import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CriterionReportWaterfallChart from '@/components/visualizations/CriterionReportWaterfallChart';
import { IndustryGroupCriteria } from '@/types/public-equity/criteria-types';
import { CriterionReportValueItem, TickerReport } from '@/types/public-equity/ticker-report';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';

interface ReportContentProps {
  criterionKey: string;
  criterionReport: CriterionReportValueItem;
  industryGroupCriteria: IndustryGroupCriteria;
  content: string;
}
function ReportContent({ criterionKey, criterionReport, industryGroupCriteria, content }: ReportContentProps) {
  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };

  const reportDefinition = industryGroupCriteria.criteria
    .find((item) => item.key === criterionKey)
    ?.reports.find((item) => item.key === criterionReport.reportKey);
  if (reportDefinition && reportDefinition.outputType === 'WaterfallChart') {
    return <CriterionReportWaterfallChart content={content} />;
  }

  return <div className="markdown-body text-md" dangerouslySetInnerHTML={{ __html: getMarkdownContent(content) }} />;
}

export default async function CriterionDetailsPage({ params }: { params: Promise<{ tickerKey: string; criterionKey: string }> }) {
  const { tickerKey, criterionKey } = await params;

  const response = await fetch(`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/tickers/${tickerKey}/latest-10q-report.json`, {
    cache: 'no-cache',
  });
  const tickerReport = (await response.json()) as TickerReport;

  const criteriaResponse = await fetch(
    `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/real-estate/equity-real-estate-investment-trusts-reits/custom-criteria.json`,
    { cache: 'no-cache' }
  );
  const industryGroupCriteria: IndustryGroupCriteria = (await criteriaResponse.json()) as IndustryGroupCriteria;

  if (!tickerReport.evaluationsOfLatest10Q) {
    return <div>No data available</div>;
  }
  const reportContentMap: Record<string, string | object> = {};
  for (const criterion of tickerReport.evaluationsOfLatest10Q ?? []) {
    for (const report of criterion.reports || []) {
      if (report.outputFileUrl) {
        try {
          const response = await fetch(report.outputFileUrl, { cache: 'no-cache' });
          reportContentMap[`${criterion.criterionKey}__${report.reportKey}`] = await response.text();
        } catch (err) {
          console.error(`Failed to fetch report: ${report.outputFileUrl}`);
        }
      }
    }
  }

  const criterion = tickerReport.evaluationsOfLatest10Q.find((item) => item.criterionKey === criterionKey)!;

  // Breadcrumb structure
  const breadcrumbs = [
    { label: `${tickerReport.ticker}`, href: `/public-equities/tickers/${tickerKey}`, name: `${tickerKey}`, current: false },
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
            {criterion.performanceChecklist?.length ? (
              <ul className="list-disc mt-2">
                {criterion.performanceChecklist.map((item, index) => (
                  <li key={index} className="mb-1 flex items-start">
                    <span className="mr-2">{item.score === 1 ? '✅' : '❌'}</span>
                    <span>{item.checklistItem}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center">No checklist available</p>
            )}

            <h3 className="text-lg font-semibold mt-6 mb-4">Important Metrics</h3>
            {criterion.importantMetrics?.metrics?.length ? (
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Metric</th>
                    <th className="border border-gray-300 px-4 py-2">Value</th>
                    <th className="border border-gray-300 px-4 py-2">Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {criterion.importantMetrics.metrics.map((metric) => (
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
            {criterion.reports?.length ? (
              criterion.reports.map((report, index) => {
                const reportContent = reportContentMap[`${criterion.criterionKey}__${report.reportKey}`];
                return (
                  <div key={(report.reportKey || index) + '_report_key'} className="mt-2">
                    <h2 className="text-lg font-semibold">
                      {(report.reportKey && report.reportKey.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())) || `Report ${index + 1}`}
                    </h2>
                    {reportContent ? (
                      <ReportContent
                        content={reportContent as string}
                        criterionKey={criterionKey}
                        criterionReport={report}
                        industryGroupCriteria={industryGroupCriteria}
                      />
                    ) : (
                      <div className="text-center">Empty</div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm">No reports available.</p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
