'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { GenerationRequestsResponse } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import { GenerationRequestStatus } from '@/lib/mappingsV1';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { TickerV1GenerationRequest } from '@prisma/client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Canonical list of boolean "regenerate*" flags we render as dots.
 */
const REGENERATE_FIELDS = [
  'regenerateCompetition',
  'regenerateFinancialAnalysis',
  'regenerateBusinessAndMoat',
  'regeneratePastPerformance',
  'regenerateFutureGrowth',
  'regenerateFairValue',
  'regenerateFutureRisk',
  'regenerateWarrenBuffett',
  'regenerateCharlieMunger',
  'regenerateBillAckman',
  'regenerateFinalSummary',
  'regenerateCachedScore',
];

type RegenerateField = (typeof REGENERATE_FIELDS)[number];

/** Enrich the Prisma type with our flag fields (booleans)
 *  and ensure completed/failed steps are arrays (not null).
 */
type GenerationRequestWithFlags = TickerV1GenerationRequest &
  Record<RegenerateField, boolean> & {
    completedSteps: string[] | null;
    failedSteps: string[] | null;
  };

// Field mapping for better display names
const FIELD_LABELS: Record<RegenerateField, string> = {
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
const FIELD_TO_STEP_MAP: Record<RegenerateField, string> = {
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
  if (!isEnabled) {
    return <div className="w-3 h-3 rounded-full bg-gray-400" title="Not enabled" />;
  }
  if (failedSteps.includes(stepName)) {
    return <div className="w-3 h-3 rounded-full bg-red-500" title="Failed" />;
  }
  if (completedSteps.includes(stepName)) {
    return <div className="w-3 h-3 rounded-full bg-green-500" title="Completed" />;
  }
  return <div className="w-3 h-3 rounded-full bg-blue-500" title="Pending" />;
}

const REFRESH_SECONDS: number = 10;

// ---------- helpers ----------
function getLatestByTicker(items: GenerationRequestWithFlags[]): GenerationRequestWithFlags[] {
  const map: Map<string, GenerationRequestWithFlags> = new Map();
  for (const req of items) {
    const key: string = req.tickerId; // symbol injected by API
    const prev: GenerationRequestWithFlags | undefined = map.get(key);
    if (!prev) {
      map.set(key, req);
      continue;
    }
    const tNew: number = new Date(req.createdAt as unknown as string).getTime();
    const tPrev: number = new Date(prev.createdAt as unknown as string).getTime();
    if (tNew > tPrev) map.set(key, req);
  }
  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt as unknown as string).getTime() - new Date(a.createdAt as unknown as string).getTime());
}

function SectionHeader({ title, count }: { title: string; count: number }): JSX.Element {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <h3 className="text-xl font-semibold">{title}</h3>
      <span className="text-sm text-gray-400">
        Showing latest per ticker • {count} item{count === 1 ? '' : 's'}
      </span>
    </div>
  );
}

function RequestsTable({ rows, regenerateFields }: { rows: GenerationRequestWithFlags[]; regenerateFields: RegenerateField[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">Ticker</th>
            {regenerateFields.map((field: RegenerateField) => (
              <th key={field} className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">
                {FIELD_LABELS[field]}
              </th>
            ))}
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Created At</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {rows.map((latestRequest: GenerationRequestWithFlags) => {
            const ticker: string = latestRequest.tickerId;
            const completedSteps: string[] = latestRequest.completedSteps ?? [];
            const failedSteps: string[] = latestRequest.failedSteps ?? [];
            return (
              <tr key={ticker}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-gray-800 z-10">{ticker}</td>
                {regenerateFields.map((field: RegenerateField) => (
                  <td key={`${ticker}-${field}`} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex justify-center">
                      <StatusDot
                        isEnabled={Boolean(latestRequest[field])}
                        stepName={FIELD_TO_STEP_MAP[field]}
                        completedSteps={completedSteps}
                        failedSteps={failedSteps}
                      />
                    </div>
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      latestRequest.status === GenerationRequestStatus.InProgress
                        ? 'bg-blue-900 text-blue-200'
                        : latestRequest.status === GenerationRequestStatus.NotStarted
                        ? 'bg-gray-700 text-gray-200'
                        : latestRequest.status === GenerationRequestStatus.Failed
                        ? 'bg-red-900 text-red-200'
                        : 'bg-green-900 text-green-200'
                    }`}
                  >
                    {latestRequest.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{new Date(latestRequest.createdAt as unknown as string).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------- component ----------
export default function GenerationRequestsPage(): JSX.Element {
  const { data, loading, reFetchData } = useFetchData<GenerationRequestsResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`,
    {},
    'Failed to fetch generation requests'
  );

  const hasActive: boolean = useMemo<boolean>(() => {
    return (data?.notStarted?.length ?? 0) > 0 || (data?.inProgress?.length ?? 0) > 0;
  }, [data]);

  const [secondsLeft, setSecondsLeft] = useState<number>(REFRESH_SECONDS);

  const handleManualRefresh: () => void = useCallback((): void => {
    reFetchData();
    setSecondsLeft(REFRESH_SECONDS);
  }, [reFetchData]);

  useEffect((): (() => void) | void => {
    if (!hasActive) {
      setSecondsLeft(REFRESH_SECONDS);
      return;
    }
    const timerId: ReturnType<typeof setInterval> = setInterval(() => {
      setSecondsLeft((prev: number): number => {
        if (prev <= 1) {
          reFetchData();
          return REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1_000);
    return () => clearInterval(timerId);
  }, [hasActive, reFetchData]);

  // Section data (latest per ticker within each status, newest first)
  const inProgressRows: GenerationRequestWithFlags[] = useMemo(
    () => getLatestByTicker((data?.inProgress ?? []) as GenerationRequestWithFlags[]),
    [data?.inProgress]
  );
  const notStartedRows: GenerationRequestWithFlags[] = useMemo(
    () => getLatestByTicker((data?.notStarted ?? []) as GenerationRequestWithFlags[]),
    [data?.notStarted]
  );
  const failedRows: GenerationRequestWithFlags[] = useMemo(() => getLatestByTicker((data?.failed ?? []) as GenerationRequestWithFlags[]), [data?.failed]);
  const completedRows: GenerationRequestWithFlags[] = useMemo(
    () => getLatestByTicker((data?.completed ?? []) as GenerationRequestWithFlags[]),
    [data?.completed]
  );

  const regenerateFields: RegenerateField[] = REGENERATE_FIELDS;

  return (
    <div className="mt-12 px-4 text-color">
      <AdminNav />

      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Generation Requests</h2>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-300">
            {hasActive ? (
              <span>
                Reloading in <span className="font-semibold">{secondsLeft}</span> seconds
              </span>
            ) : (
              <span className="opacity-80">Auto-refresh paused</span>
            )}
          </div>

          <Button onClick={handleManualRefresh} variant="outlined" className="flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </Button>
        </div>
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

      {/* Sections in requested order */}
      <div className="mb-6">
        <SectionHeader title="In Progress Requests" count={inProgressRows.length} />
        {loading ? (
          <div className="py-8">Loading generation requests...</div>
        ) : inProgressRows.length === 0 ? (
          <div className="py-4">No In Progress requests.</div>
        ) : (
          <RequestsTable rows={inProgressRows} regenerateFields={regenerateFields} />
        )}
      </div>

      <div className="mb-6">
        <SectionHeader title="Not Started Requests" count={notStartedRows.length} />
        {loading ? (
          <div className="py-8">Loading generation requests...</div>
        ) : notStartedRows.length === 0 ? (
          <div className="py-4">No Not Started requests.</div>
        ) : (
          <RequestsTable rows={notStartedRows} regenerateFields={regenerateFields} />
        )}
      </div>

      <div className="mb-6">
        <SectionHeader title="Failed Requests" count={failedRows.length} />
        {loading ? (
          <div className="py-8">Loading generation requests...</div>
        ) : failedRows.length === 0 ? (
          <div className="py-4">No Failed requests.</div>
        ) : (
          <RequestsTable rows={failedRows} regenerateFields={regenerateFields} />
        )}
      </div>

      <div className="mb-6">
        <SectionHeader title="Completed Requests" count={completedRows.length} />
        {loading ? (
          <div className="py-8">Loading generation requests...</div>
        ) : completedRows.length === 0 ? (
          <div className="py-4">No Completed requests.</div>
        ) : (
          <RequestsTable rows={completedRows} regenerateFields={regenerateFields} />
        )}
      </div>
    </div>
  );
}
