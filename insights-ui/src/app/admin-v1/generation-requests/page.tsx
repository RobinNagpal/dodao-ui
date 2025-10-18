'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { GenerationRequestStatus } from '@/lib/mappingsV1';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { TickerV1GenerationRequest } from '@prisma/client';
import React, { useEffect } from 'react';

interface GenerationRequestsResponse {
  inProgress: TickerV1GenerationRequest[];
  failed: TickerV1GenerationRequest[];
  notStarted: TickerV1GenerationRequest[];
}

// Field mapping for better display names
const FIELD_LABELS: Record<string, string> = {
  regenerateCompetition: 'Competition',
  regenerateFinancialAnalysis: 'Financial',
  regenerateBusinessAndMoat: 'Business & Moat',
  regeneratePastPerformance: 'Past Perf.',
  regenerateFutureGrowth: 'Future Growth',
  regenerateFairValue: 'Fair Value',
  regenerateFutureRisk: 'Future Risk',
  regenerateWarrenBuffett: 'Buffett',
  regenerateCharlieMunger: 'Munger',
  regenerateBillAckman: 'Ackman',
  regenerateFinalSummary: 'Summary',
  regenerateCachedScore: 'Score',
};

// Map regenerate field names to their corresponding completedSteps/failedSteps values
const FIELD_TO_STEP_MAP: Record<string, string> = {
  regenerateCompetition: 'competition',
  regenerateFinancialAnalysis: 'financial-analysis',
  regenerateBusinessAndMoat: 'business-and-moat',
  regeneratePastPerformance: 'past-performance',
  regenerateFutureGrowth: 'future-growth',
  regenerateFairValue: 'fair-value',
  regenerateFutureRisk: 'future-risk',
  regenerateWarrenBuffett: 'investor-analysis-warren-buffett',
  regenerateCharlieMunger: 'investor-analysis-charlie-munger',
  regenerateBillAckman: 'investor-analysis-bill-ackman',
  regenerateFinalSummary: 'final-summary',
  regenerateCachedScore: 'cached-score',
};

interface StatusDotProps {
  isEnabled: boolean;
  stepName: string;
  completedSteps: string[];
  failedSteps: string[];
}

function StatusDot({ isEnabled, stepName, completedSteps, failedSteps }: StatusDotProps): JSX.Element {
  // Grey if false (not enabled)
  if (!isEnabled) {
    return <div className="w-3 h-3 rounded-full bg-gray-400" title="Not enabled" />;
  }

  // Red if enabled and in failedSteps
  if (failedSteps.includes(stepName)) {
    return <div className="w-3 h-3 rounded-full bg-red-500" title="Failed" />;
  }

  // Green if enabled and in completedSteps
  if (completedSteps.includes(stepName)) {
    return <div className="w-3 h-3 rounded-full bg-green-500" title="Completed" />;
  }

  // Blue if enabled but not yet completed
  return <div className="w-3 h-3 rounded-full bg-blue-500" title="Pending" />;
}

export default function GenerationRequestsPage(): JSX.Element {
  const { data, loading, reFetchData } = useFetchData<GenerationRequestsResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`,
    {},
    'Failed to fetch generation requests'
  );

  useEffect(() => {
    // Set up a refresh interval
    let interval: ReturnType<typeof setInterval> | undefined;
    if (data?.inProgress) {
      interval = setInterval(reFetchData, 30000); // Refresh every 30 seconds
    }
    return () => interval && clearInterval(interval);
  }, [data, reFetchData]);

  // Combine all requests into a single array
  const allRequests: TickerV1GenerationRequest[] = React.useMemo(() => {
    if (!data) return [];
    return [...(data.inProgress || []), ...(data.failed || []), ...(data.notStarted || [])];
  }, [data]);

  // Get unique tickers from all requests
  const uniqueTickers: string[] = React.useMemo(() => {
    if (!allRequests.length) return [];
    const tickers = allRequests.map((request) => request.tickerId);
    return [...new Set(tickers)];
  }, [allRequests]);

  // Get the regenerate fields
  const regenerateFields: string[] = React.useMemo(() => {
    return Object.keys(FIELD_LABELS);
  }, []);

  // Render the grid view of generation requests
  const renderGenerationRequestsGrid = (): JSX.Element => {
    if (uniqueTickers.length === 0) {
      return <div className="text-center py-4">No tickers found</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">Ticker</th>
              {regenerateFields.map((field) => (
                <th key={field} className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {FIELD_LABELS[field]}
                </th>
              ))}
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Created At</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {uniqueTickers.map((ticker) => {
              // Find the latest request for this ticker
              const tickerRequests = allRequests.filter((req) => req.tickerId === ticker);
              const latestRequest = tickerRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

              return (
                <tr key={ticker}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-gray-800 z-10">{ticker}</td>
                  {regenerateFields.map((field) => (
                    <td key={`${ticker}-${field}`} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex justify-center">
                        <StatusDot
                          isEnabled={latestRequest[field as keyof typeof latestRequest] as boolean}
                          stepName={FIELD_TO_STEP_MAP[field]}
                          completedSteps={latestRequest.completedSteps || []}
                          failedSteps={latestRequest.failedSteps || []}
                        />
                      </div>
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        latestRequest.status === GenerationRequestStatus.InProgress
                          ? 'bg-blue-900 text-blue-200'
                          : latestRequest.status === GenerationRequestStatus.Failed
                          ? 'bg-red-900 text-red-200'
                          : latestRequest.status === GenerationRequestStatus.Completed
                          ? 'bg-green-900 text-green-200'
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      {latestRequest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{new Date(latestRequest.createdAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="mt-12 px-4 text-color">
      <AdminNav />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Generation Requests</h2>
        <Button onClick={() => reFetchData()} variant="outlined" className="flex items-center gap-2">
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Legend */}
      <div className="p-2 bg-gray-800 rounded-lg mb-4">
        <div className="flex items-center gap-6 text-sm">
          <span className="font-semibold">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>Not Enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Failed</span>
          </div>
        </div>
      </div>

      <Block title="Generation Requests Grid" className="mb-6">
        {loading ? <div className="text-center py-8">Loading generation requests...</div> : renderGenerationRequestsGrid()}
      </Block>
    </div>
  );
}
