'use client';

import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { CriteriaEvaluation, Metric, Report, TickerReport } from '@/types/public-equity/ticker-report';
import { useState, useEffect } from 'react';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';

interface CriterionDetailsProps {
  tickerKey: string;
  criterionKey: string;
}

export default function CriterionDetails({ tickerKey, criterionKey }: CriterionDetailsProps) {
  const {
    data: reportData,
    loading,
    error,
  } = useFetchData<TickerReport>(
    `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/tickers/${tickerKey}/latest-10q-report.json`,
    {},
    'Failed to fetch data'
  );

  const [reportContentMap, setReportContentMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!reportData?.evaluationsOfLatest10Q?.length) return;
    const fetchReports = async () => {
      const newReportContentMap: { [key: string]: string } = {};
      for (const criterion of reportData.evaluationsOfLatest10Q ?? []) {
        for (const report of criterion.reports || []) {
          if (report.outputFileUrl) {
            try {
              const response = await fetch(report.outputFileUrl);
              const text = await response.text();
              newReportContentMap[`${criterion.criterionKey}__${report.reportKey}`] = text;
            } catch (err) {
              console.error(`Failed to fetch report: ${report.outputFileUrl}`);
            }
          }
        }
      }
      setReportContentMap(newReportContentMap);
    };
    fetchReports();
  }, [reportData]);

  const criterion = reportData?.evaluationsOfLatest10Q?.find((item) => item.criterionKey === criterionKey);

  if (loading) return <p>Loading...</p>;
  if (error || !criterion) return <p>Error fetching data or no data available for this criterion.</p>;

  const renderer = getMarkedRenderer();
  const getMarkdownContent = (content?: string) => {
    return content ? marked.parse(content, { renderer }) : 'No Information';
  };

  // Breadcrumb structure
  const breadcrumbs = [
    { label: `${tickerKey}`, href: `/public-equities/ticker/${tickerKey}`, name: `${tickerKey}`, current: false },
    {
      label: `Criterion: ${criterionKey}`,
      href: `/puclic-equities/ticker/${tickerKey}/criterion/${criterionKey}`,
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

            {/* Important Metrics Section */}
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
              criterion.reports.map((report, index) => (
                <div key={(report.reportKey || index) + '_report_key'} className="mt-2">
                  <h2 className="text-lg font-semibold">
                    {(report.reportKey && report.reportKey.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())) || `Report ${index + 1}`}
                  </h2>
                  {reportContentMap[`${criterion.criterionKey}__${report.reportKey}`] ? (
                    <div
                      className="markdown-body text-md"
                      dangerouslySetInnerHTML={{ __html: getMarkdownContent(reportContentMap[`${criterion.criterionKey}__${report.reportKey}`]) }}
                    />
                  ) : (
                    <div className="text-center">Empty</div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No reports available.</p>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
