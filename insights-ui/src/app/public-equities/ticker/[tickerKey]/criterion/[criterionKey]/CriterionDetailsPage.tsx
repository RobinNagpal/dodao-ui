'use client';

import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { CriteriaEvaluation, PerformanceChecklistItem, SpiderGraphPie, Metric, TickerReport } from '@/types/public-equity/ticker-report';
import RadarChart from '@/components/ui/RadarChart';

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

  const criterion = reportData?.evaluationsOfLatest10Q?.find((item) => item.criterionKey === criterionKey);

  if (loading) return <p>Loading...</p>;
  if (error || !criterion) return <p>Error fetching data or no data available for this criterion.</p>;

  const spiderGraphData: SpiderGraphPie = {
    key: criterion.criterionKey,
    name: criterion.criterionKey,
    summary: criterion.importantMetrics?.status || '',
    scores:
      criterion.performanceChecklist?.map((pc: PerformanceChecklistItem) => ({
        score: pc.score,
        comment: `${pc.checklistItem}: ${pc.oneLinerExplanation}`,
      })) || [],
  };

  return (
    <div className="text-color p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Criterion: {criterion.criterionKey}</h2>
      <p className="text-sm mb-4">Status: {criterion.importantMetrics?.status || 'Not Available'}</p>

      <div className="max-w-lg mx-auto mb-6">
        <RadarChart data={{ [criterion.criterionKey]: spiderGraphData }} />
      </div>

      <h3 className="text-lg font-semibold mb-2">Important Metrics</h3>
      {criterion.importantMetrics?.metrics?.length ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Metric</th>
              <th className="border border-gray-300 px-4 py-2">Value</th>
              <th className="border border-gray-300 px-4 py-2">Explanation</th>
            </tr>
          </thead>
          <tbody>
            {criterion.importantMetrics.metrics.map((metricArray, index) =>
              metricArray.map((metric: Metric, i) => (
                <tr key={`${index}-${i}`} className="border">
                  <td className="border border-gray-300 px-4 py-2">{metric.metric}</td>
                  <td className="border border-gray-300 px-4 py-2">{metric.value}</td>
                  <td className="border border-gray-300 px-4 py-2">{metric.calculationExplanation}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-gray-500">No metrics available</p>
      )}

      <h3 className="text-lg font-semibold mt-6 mb-2">Performance Checklist</h3>
      {criterion.performanceChecklist?.length ? (
        <ul className="list-disc pl-5">
          {criterion.performanceChecklist.map((item, index) => (
            <li key={index} className="mb-2">
              <span className="font-semibold">{item.checklistItem}:</span> {item.oneLinerExplanation} <br />
              <span className="text-sm text-gray-500">{item.detailedExplanation}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No checklist available</p>
      )}
    </div>
  );
}
