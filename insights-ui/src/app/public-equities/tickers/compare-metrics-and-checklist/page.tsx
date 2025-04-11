'use client';

import React, { useState, useEffect } from 'react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import { TickerCompareMetricsAndChecklist } from '@/types/public-equity/ticker-request-response';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { getCriteriaByIds } from '@/lib/industryGroupCriteria';
import { formatKey } from '@/util/format-key';
import ValueFlyoutMenu from './ValueFlyoutMenu';
import HeadingFlyoutMenu from './HeadingFlyoutMenu';

export default function CompareMetricsTable() {
  const { data, loading, error } = useFetchData<TickerCompareMetricsAndChecklist[]>(
    `${getBaseUrl()}/api/tickers/compare/metrics-and-checklist`,
    {},
    'Failed to fetch metrics'
  );
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
            const criteria = await getCriteriaByIds(firstTicker.sectorId, firstTicker.industryGroupId);
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

  // Merge metrics and performance checklist data from ALL evaluations for each ticker.
  // For checklistMapping, instead of a number, we now store an array of PerformanceChecklistItem.
  const tickerData = data.map((ticker) => {
    const metricsMapping: { [key: string]: string | number } = {};
    const checklistMapping: { [key: string]: any[] } = {};

    ticker.evaluationsOfLatest10Q.forEach((evaluationObj) => {
      // Process important metrics evaluation
      const metricsEvaluation = evaluationObj.importantMetricsEvaluation;
      if (metricsEvaluation && metricsEvaluation.metrics && validCriterionKeys.has(metricsEvaluation.criterionKey)) {
        metricsEvaluation.metrics.forEach((metric) => {
          if (validMetricsBycriterion[metricsEvaluation.criterionKey]?.has(metric.metricKey)) {
            // Overwrite duplicate keys if present.
            metricsMapping[metric.metricKey] = metric.value;
          }
        });
      }

      // Process performance checklist evaluation and store checklist items in an array
      const checklistEvaluation = evaluationObj.performanceChecklistEvaluation;
      if (checklistEvaluation && checklistEvaluation.performanceChecklistItems && validCriterionKeys.has(checklistEvaluation.criterionKey)) {
        checklistEvaluation.performanceChecklistItems.forEach((checklistItem) => {
          if (checklistItem.metricKey && validMetricsBycriterion[checklistEvaluation.criterionKey]?.has(checklistItem.metricKey)) {
            if (!checklistMapping[checklistItem.metricKey]) {
              checklistMapping[checklistItem.metricKey] = [];
            }
            checklistMapping[checklistItem.metricKey].push(checklistItem);
          }
        });
      }
    });

    return { tickerKey: ticker.tickerKey, metrics: metricsMapping, checklist: checklistMapping };
  });

  // Build global grouping: criterion key -> set of metric keys from metrics evaluations.
  const criterionToMetricKeys: { [criterion: string]: Set<string> } = {};
  data.forEach((ticker) => {
    ticker.evaluationsOfLatest10Q.forEach((evaluationObj) => {
      const metricsEvaluation = evaluationObj.importantMetricsEvaluation;
      if (metricsEvaluation && metricsEvaluation.metrics && validCriterionKeys.has(metricsEvaluation.criterionKey)) {
        const crit = metricsEvaluation.criterionKey;
        if (!criterionToMetricKeys[crit]) {
          criterionToMetricKeys[crit] = new Set();
        }
        metricsEvaluation.metrics.forEach((metric) => {
          if (validMetricsBycriterion[crit]?.has(metric.metricKey)) {
            criterionToMetricKeys[crit].add(metric.metricKey);
          }
        });
      }
    });
  });

  // Transform to an array of groups with display names.
  const criterionGroups = Object.entries(criterionToMetricKeys)
    .filter(([criterion]) => validCriterionKeys.has(criterion)) // Extra safety
    .map(([criterion, metricSet]) => ({
      criterion,
      metricKeys: Array.from(metricSet),
      displayName: industryGroupCriteria.criteria.find((c) => c.key === criterion)?.name || formatKey(criterion),
    }));

  // Set the first criterion as active if none is selected or if previously selected one is no longer valid
  if ((activeCriterion === null || !validCriterionKeys.has(activeCriterion)) && criterionGroups.length > 0) {
    setActiveCriterion(criterionGroups[0].criterion);
  }

  // Find the active criterion group
  const activeGroup = criterionGroups.find((group) => group.criterion === activeCriterion);

  // Helper to get metric display name
  function getMetricDisplayName(criterionKey: string, metricKey: string): string {
    const criterion = industryGroupCriteria?.criteria.find((c) => c.key === criterionKey);
    if (!criterion) return formatKey(metricKey);

    const metric = criterion.importantMetrics.find((m) => m.key === metricKey);
    return metric?.name || formatKey(metricKey);
  }

  function getMetricDescription(criterionKey: string, metricKey: string): string {
    const criterion = industryGroupCriteria?.criteria.find((c) => c.key === criterionKey);
    if (!criterion) return '';
    const metric = criterion.importantMetrics.find((m) => m.key === metricKey);
    return metric?.description || '';
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
                        <th scope="col" className="py-3.5 px-2 text-left text-sm font-semibold primary-text-color">
                          Tickers
                        </th>
                        {activeGroup.metricKeys.map((metricKey) => (
                          <th key={metricKey} scope="col" className="py-3.5 px-2 text-center text-sm font-semibold primary-text-color">
                            <div className="flex items-center justify-center gap-x-2">
                              {getMetricDisplayName(activeGroup.criterion, metricKey)}
                              <HeadingFlyoutMenu description={getMetricDescription(activeGroup.criterion, metricKey)} />
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tickerData.map((ticker) => (
                        <tr key={ticker.tickerKey} className="divide-x divide-gray-200">
                          <td className="whitespace-nowrap py-4 px-2 text-sm font-medium primary-text-color">{ticker.tickerKey}</td>
                          {activeGroup.metricKeys.map((metricKey) => (
                            <td className="whitespace-nowrap p-4 text-center text-sm text-color">
                              <div className="flex items-center justify-center gap-x-2">
                                {/* Metric Value */}
                                <span>{ticker.metrics[metricKey] !== undefined ? ticker.metrics[metricKey] : 'N/A'}</span>

                                {/* Checklist tick/cross and Flyout */}
                                {ticker.checklist && ticker.checklist[metricKey] !== undefined && (
                                  <span className="flex items-center">
                                    {/* Tick/Cross based on score */}
                                    <span>{ticker.checklist[metricKey].some((item) => item.score === 1) ? '✅' : '❌'}</span>
                                    {/* Information icon with flyout */}
                                    <ValueFlyoutMenu checklistItems={ticker.checklist[metricKey]} />
                                  </span>
                                )}
                              </div>
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
