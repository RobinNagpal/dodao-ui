'use client';

import LoadingOrError from '@/components/core/LoadingOrError';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerV1GenerationRequestWithTicker } from '@/types/public-equity/analysis-factors-types';
import { GenerationRequestStatus } from '@/lib/mappingsV1';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

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
    return <div className="w-4 h-4 rounded-full bg-gray-400" title="Not enabled" />;
  }

  // Red if enabled and in failedSteps
  if (failedSteps.includes(stepName)) {
    return <div className="w-4 h-4 rounded-full bg-red-500" title="Failed" />;
  }

  // Green if enabled and in completedSteps
  if (completedSteps.includes(stepName)) {
    return <div className="w-4 h-4 rounded-full bg-green-500" title="Completed" />;
  }

  // Blue if enabled but not yet completed
  return <div className="w-4 h-4 rounded-full bg-blue-500" title="Pending" />;
}

export default function TickerV1RequestsPage(): JSX.Element {
  const {
    data: requests,
    loading,
    error,
    reFetchData,
  } = useFetchData<TickerV1GenerationRequestWithTicker[]>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/get-ticker-v1-request`,
    { cache: 'no-cache' },
    'Failed to fetch ticker generation requests.'
  );

  if (loading || error) {
    return <LoadingOrError loading={loading} error={error} />;
  }

  const regenerateFields = Object.keys(FIELD_LABELS);

  return (
    <PageWrapper>
      <div className="p-4 text-color">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl heading-color">Ticker V1 Generation Requests</h1>
          <Button onClick={() => reFetchData()} variant="outlined" className="flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Legend */}
        <div className="p-2 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-semibold">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400" />
              <span>Not Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span>Failed</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="mt-4 w-full border border-color">
            <thead className="block-bg-color">
              <tr>
                <th className="text-left p-2 border-color border sticky left-0 bg-inherit">Ticker</th>
                {regenerateFields.map((field) => (
                  <th key={field} className="text-center p-2 border-color border min-w-[80px]">
                    {FIELD_LABELS[field]}
                  </th>
                ))}
                <th className="text-left p-2 border-color border">Status</th>
                <th className="text-left p-2 border-color border">Created At</th>
              </tr>
            </thead>
            <tbody>
              {requests && requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request.id} className="border border-color ">
                    <td className="p-2 border border-color font-semibold sticky left-0 bg-inherit">{request.ticker?.symbol || 'N/A'}</td>
                    {regenerateFields.map((field) => (
                      <td key={field} className="p-2 border border-color text-center">
                        <div className="flex justify-center">
                          <StatusDot
                            isEnabled={request[field as keyof typeof request] as boolean}
                            stepName={FIELD_TO_STEP_MAP[field]}
                            completedSteps={request.completedSteps || []}
                            failedSteps={request.failedSteps || []}
                          />
                        </div>
                      </td>
                    ))}
                    <td className="p-2 border border-color">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          request.status === GenerationRequestStatus.Completed
                            ? ' bg-green-800 text-green-200'
                            : request.status === GenerationRequestStatus.Failed
                            ? 'bg-red-800 text-red-200'
                            : request.status === GenerationRequestStatus.InProgress
                            ? 'bg-blue-800 text-blue-200'
                            : 'bg-gray-800 text-gray-200'
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="p-2 border border-color text-sm">{new Date(request.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={regenerateFields.length + 3} className="p-4 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
