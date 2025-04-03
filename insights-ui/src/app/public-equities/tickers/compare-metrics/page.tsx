'use client';

import React, { useState, useEffect } from 'react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { TickerCompareMetrics } from '@/types/public-equity/ticker-request-response';
import { IndustryGroupCriteriaDefinition, CriterionDefinition } from '@/types/public-equity/criteria-types';
import { getCriteriaByIds } from '@/lib/industryGroupCriteria';

export default function CompareMetricsTable() {
  const { data, loading, error } = useFetchData<TickerCompareMetrics[]>(`${getBaseUrl()}/api/tickers/compare/metrics`, {}, 'Failed to fetch metrics');
  const [activeCriterion, setActiveCriterion] = useState<string | null>(null);
  const [industryGroupCriteria, setIndustryGroupCriteria] = useState<IndustryGroupCriteriaDefinition | null>(null);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);

  // Fetch industry group criteria when we have ticker data
  useEffect(() => {
    const fetchCriteria = async () => {
      if (data && data.length > 0) {
        // Use the first ticker's sector and industry group IDs
        const firstTicker = data[0];
        if (firstTicker.sectorId && firstTicker.industryGroupId) {
          setIsLoadingCriteria(true);
          try {
            const criteria = await getCriteriaByIds(60, 6010);
            setIndustryGroupCriteria(criteria);
          } catch (error) {
            console.error('Failed to fetch industry group criteria:', error);
          } finally {
            setIsLoadingCriteria(false);
          }
        }
      }
    };

    fetchCriteria();
  }, [data]);

  if (loading || isLoadingCriteria) {
    return <FullPageLoader />;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!data || !industryGroupCriteria) {
    return <div className="p-4">No data available</div>;
  }

  // Get valid criterion keys from industry group criteria
  const validCriterionKeys = new Set(industryGroupCriteria.criteria.map((criterion) => criterion.key));

  // Create a mapping of criterion key to valid metric keys
  const validMetricsBycriterion: Record<string, Set<string>> = {};
  industryGroupCriteria.criteria.forEach((criterion) => {
    validMetricsBycriterion[criterion.key] = new Set(criterion.importantMetrics.map((metric) => metric.key));
  });

  // First, merge metrics from ALL evaluations for each ticker.
  const tickerMetricsData = data.map((ticker) => {
    const metricsMapping: { [key: string]: string | number } = {};
    ticker.evaluationsOfLatest10Q.forEach((evaluationObj) => {
      const evaluation = evaluationObj.importantMetricsEvaluation;
      if (evaluation && evaluation.metrics && validCriterionKeys.has(evaluation.criterionKey)) {
        evaluation.metrics.forEach((metric) => {
          // Only include valid metrics for this criterion
          if (validMetricsBycriterion[evaluation.criterionKey]?.has(metric.metricKey)) {
            // Overwrite duplicate keys if present.
            metricsMapping[metric.metricKey] = metric.value;
          }
        });
      }
    });
    return { tickerKey: ticker.tickerKey, metrics: metricsMapping };
  });

  // Next, build a global grouping: criterion key -> set of metric keys.
  const criterionToMetricKeys: { [criterion: string]: Set<string> } = {};
  data.forEach((ticker) => {
    ticker.evaluationsOfLatest10Q.forEach((evaluationObj) => {
      const evaluation = evaluationObj.importantMetricsEvaluation;
      if (evaluation && evaluation.metrics && validCriterionKeys.has(evaluation.criterionKey)) {
        const crit = evaluation.criterionKey;
        if (!criterionToMetricKeys[crit]) {
          criterionToMetricKeys[crit] = new Set();
        }

        evaluation.metrics.forEach((metric) => {
          // Only add valid metrics
          if (validMetricsBycriterion[crit]?.has(metric.metricKey)) {
            criterionToMetricKeys[crit].add(metric.metricKey);
          }
        });
      }
    });
  });

  // Transform to an array of groups.
  const criterionGroups = Object.entries(criterionToMetricKeys)
    .filter(([criterion]) => validCriterionKeys.has(criterion)) // Extra safety filter
    .map(([criterion, metricSet]) => ({
      criterion,
      metricKeys: Array.from(metricSet),
      // Add display name from criteria definition
      displayName: industryGroupCriteria.criteria.find((c) => c.key === criterion)?.name || formatKey(criterion),
    }));

  // Set the first criterion as active if none is selected or if previously selected one is no longer valid
  if ((activeCriterion === null || !validCriterionKeys.has(activeCriterion)) && criterionGroups.length > 0) {
    setActiveCriterion(criterionGroups[0].criterion);
  }

  // Find the active criterion group
  const activeGroup = criterionGroups.find((group) => group.criterion === activeCriterion);

  // Helper to format keys for display.
  function formatKey(key: string) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  // Helper to get metric display name
  function getMetricDisplayName(criterionKey: string, metricKey: string): string {
    const criterion = industryGroupCriteria?.criteria.find((c) => c.key === criterionKey);
    if (!criterion) return formatKey(metricKey);

    const metric = criterion.importantMetrics.find((m) => m.key === metricKey);
    return metric?.name || formatKey(metricKey);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mt-6">
        <div className="sm:flex-auto text-center mx-auto">
          <h1 className="text-2xl font-semibold heading-color">Metrics Comparison</h1>
          <p className="mt-2 text-sm text-color">A comparison of different metrics grouped by criterion across tickers.</p>
        </div>
      </div>

      {criterionGroups.length === 0 ? (
        <div className="mt-6 p-4 text-center">
          <p>No active criteria found for these tickers. Please check your industry group criteria configuration.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex items-center justify-center">
            <div className="flex flex-wrap space-x-2 space-y-2 sm:space-y-0 sm:space-x-4">
              {criterionGroups.map((group) => (
                <button
                  key={group.criterion}
                  className={`py-2 px-4 text-md transition-colors ${
                    activeCriterion === group.criterion ? 'font-bold border-b-2 border-primary-color primary-color' : 'font-medium'
                  }`}
                  onClick={() => setActiveCriterion(group.criterion)}
                >
                  {group.displayName}
                </button>
              ))}
            </div>
          </div>

          {activeGroup && (
            <div className="mt-6 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr className="divide-x divide-gray-200">
                        <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold primary-text-color">
                          Tickers
                        </th>
                        {activeGroup.metricKeys.map((metricKey) => (
                          <th key={metricKey} scope="col" className="py-3.5 px-4 text-center text-sm font-semibold primary-text-color">
                            {getMetricDisplayName(activeGroup.criterion, metricKey)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tickerMetricsData.map((ticker) => (
                        <tr key={ticker.tickerKey} className="divide-x divide-gray-200">
                          <td className="whitespace-nowrap py-4 px-4 text-sm font-medium primary-text-color">{ticker.tickerKey}</td>
                          {activeGroup.metricKeys.map((metricKey) => (
                            <td key={metricKey} className="whitespace-nowrap p-4 text-center text-sm text-color">
                              {ticker.metrics[metricKey] !== undefined ? ticker.metrics[metricKey] : 'N/A'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
