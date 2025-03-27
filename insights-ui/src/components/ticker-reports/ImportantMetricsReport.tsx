import { FullCriterionEvaluation, MetricValueItem } from '@/types/public-equity/ticker-report-types';

export default function ImportantMetricsReport({ criterionEvaluation }: { criterionEvaluation?: FullCriterionEvaluation }) {
  return criterionEvaluation?.importantMetricsEvaluation?.metrics?.length ? (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2">Metric</th>
          <th className="border border-gray-300 px-4 py-2">Value</th>
          <th className="border border-gray-300 px-4 py-2">Explanation</th>
        </tr>
      </thead>
      <tbody>
        {criterionEvaluation.importantMetricsEvaluation?.metrics?.map((metric: MetricValueItem) => (
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
  );
}
