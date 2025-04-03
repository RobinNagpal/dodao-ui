'use client';

import React from 'react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';

interface MetricValueItem {
  metricKey: string;
  value: string;
  calculationExplanation: string;
}

interface Evaluation {
  importantMetricsEvaluation?: {
    metrics: MetricValueItem[];
  } | null;
}

interface Ticker {
  tickerKey: string;
  companyName: string;
  evaluationsOfLatest10Q: Evaluation[];
}

export default function CompareMetricsPage() {
  const { data, loading, error } = useFetchData<Ticker[]>('/api/tickers/compare/metrics', {}, 'Failed to fetch metrics');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data found</div>;

  // Build a set of all unique metric keys across tickers.
  const metricKeysSet = new Set<string>();
  // Create a mapping for each ticker's metrics for quick lookup.
  const tickerMetrics: { [tickerKey: string]: { [metricKey: string]: MetricValueItem } } = {};

  data.forEach((ticker) => {
    // Use the first evaluation if available.
    const evaluation = ticker.evaluationsOfLatest10Q[0]?.importantMetricsEvaluation;
    const metricsMapping: { [metricKey: string]: MetricValueItem } = {};
    if (evaluation && evaluation.metrics) {
      evaluation.metrics.forEach((metric) => {
        metricKeysSet.add(metric.metricKey);
        metricsMapping[metric.metricKey] = metric;
      });
    }
    tickerMetrics[ticker.tickerKey] = metricsMapping;
  });

  // Convert the set into an array to iterate over table rows.
  const metricKeys = Array.from(metricKeysSet);

  return (
    <div>
      <h1>Compare Metrics</h1>
      <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Metric</th>
            {data.map((ticker) => (
              <th key={ticker.tickerKey}>{ticker.companyName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metricKeys.map((metricKey) => (
            <tr key={metricKey}>
              <td>{metricKey}</td>
              {data.map((ticker) => {
                const metric = tickerMetrics[ticker.tickerKey][metricKey];
                return <td key={ticker.tickerKey}>{metric ? metric.value : 'N/A'}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
