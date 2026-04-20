'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { EtfGenerationRequestsResponse, EtfGenerationRequestWithEtf } from '@/app/api/[spaceId]/etfs-v1/generation-requests/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfGenerationRequestStatus, EtfReportType } from '@/types/etf/etf-analysis-types';
import { calculateEtfPendingSteps } from '@/utils/etf-analysis-reports/etf-report-steps-statuses';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const ETF_REGENERATE_FIELDS = [
  'regeneratePerformanceAndReturns',
  'regenerateCostEfficiencyAndTeam',
  'regenerateRiskAnalysis',
  'regenerateIndexStrategy',
  'regenerateFinalSummary',
] as const;

type EtfRegenerateField = (typeof ETF_REGENERATE_FIELDS)[number];

const ETF_FIELD_LABELS: Record<EtfRegenerateField, string> = {
  regeneratePerformanceAndReturns: 'Performance',
  regenerateCostEfficiencyAndTeam: 'Cost & Team',
  regenerateRiskAnalysis: 'Risk',
  regenerateIndexStrategy: 'Index & Strategy',
  regenerateFinalSummary: 'Final Summary',
};

const ETF_FIELD_TO_STEP_MAP: Record<EtfRegenerateField, EtfReportType> = {
  regeneratePerformanceAndReturns: EtfReportType.PERFORMANCE_AND_RETURNS,
  regenerateCostEfficiencyAndTeam: EtfReportType.COST_EFFICIENCY_AND_TEAM,
  regenerateRiskAnalysis: EtfReportType.RISK_ANALYSIS,
  regenerateIndexStrategy: EtfReportType.INDEX_STRATEGY,
  regenerateFinalSummary: EtfReportType.FINAL_SUMMARY,
};

interface StatusDotProps {
  isEnabled: boolean;
  stepName: EtfReportType;
  completedSteps: string[];
  failedSteps: string[];
  inProgressStep?: string | null;
}

function StatusDot({ isEnabled, stepName, completedSteps, failedSteps, inProgressStep }: StatusDotProps): JSX.Element {
  if (!isEnabled) return <div className="w-3 h-3 rounded-full bg-gray-400" title="Not enabled" />;
  if (failedSteps.includes(stepName)) return <div className="w-3 h-3 rounded-full bg-red-500" title="Failed" />;
  if (completedSteps.includes(stepName)) return <div className="w-3 h-3 rounded-full bg-green-500" title="Completed" />;
  if (inProgressStep === stepName) return <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" title="In Progress" />;
  return <div className="w-3 h-3 rounded-full bg-blue-500" title="Pending" />;
}

const REFRESH_SECONDS = 30;

function SectionHeader({
  title,
  count,
  totalCount,
  onShowMore,
  hasMore,
}: {
  title: string;
  count: number;
  totalCount: number;
  onShowMore?: () => void;
  hasMore: boolean;
}): JSX.Element {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <h3 className="text-xl font-semibold">{title}</h3>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          Showing {count} of {totalCount}
        </span>
        {hasMore && onShowMore && (
          <Button onClick={onShowMore} variant="text" className="text-blue-400 hover:text-blue-300">
            Show More
          </Button>
        )}
      </div>
    </div>
  );
}

function EtfRequestsTable({
  rows,
  onReloadRequest,
}: {
  rows: EtfGenerationRequestWithEtf[];
  onReloadRequest: (r: EtfGenerationRequestWithEtf) => void;
}): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">ETF</th>
            {ETF_REGENERATE_FIELDS.map((field) => (
              <th key={field} className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">
                {ETF_FIELD_LABELS[field]}
              </th>
            ))}
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Updated At</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {rows.map((request) => {
            const completedSteps = request.completedSteps ?? [];
            const failedSteps = request.failedSteps ?? [];
            const isFailed = request.status === EtfGenerationRequestStatus.Failed;
            const inProgressStep = request.inProgressStep ?? null;
            return (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-gray-800 z-10 link-color">
                  <Link href={`/etfs/${request.etf.exchange}/${request.etf.symbol}`} target="_blank">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{request.etf.symbol}</span>
                      <span className="text-blue-400 text-xs">({request.etf.exchange})</span>
                    </div>
                    <div className="text-xs text-gray-400">{request.etf.name}</div>
                  </Link>
                </td>
                {ETF_REGENERATE_FIELDS.map((field) => {
                  const stepName = ETF_FIELD_TO_STEP_MAP[field];
                  return (
                    <td key={`${request.id}-${field}`} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex justify-center">
                        <StatusDot
                          isEnabled={Boolean(request[field])}
                          stepName={stepName}
                          completedSteps={completedSteps}
                          failedSteps={failedSteps}
                          inProgressStep={inProgressStep}
                        />
                      </div>
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      request.status === EtfGenerationRequestStatus.InProgress
                        ? 'bg-blue-900 text-blue-200'
                        : request.status === EtfGenerationRequestStatus.NotStarted
                        ? 'bg-gray-700 text-gray-200'
                        : request.status === EtfGenerationRequestStatus.Failed
                        ? 'bg-red-900 text-red-200'
                        : 'bg-green-900 text-green-200'
                    }`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{new Date(request.updatedAt || request.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {isFailed && failedSteps.length > 0 && (
                    <button
                      onClick={() => onReloadRequest(request)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Reload failed request"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function EtfGenerationRequestsPage(): JSX.Element {
  const [inProgressPagination, setInProgressPagination] = useState({ skip: 0, take: 15 });
  const [failedPagination, setFailedPagination] = useState({ skip: 0, take: 15 });
  const [notStartedPagination, setNotStartedPagination] = useState({ skip: 0, take: 15 });
  const [completedPagination, setCompletedPagination] = useState({ skip: 0, take: 15 });

  const [accumulatedInProgress, setAccumulatedInProgress] = useState<EtfGenerationRequestWithEtf[]>([]);
  const [accumulatedFailed, setAccumulatedFailed] = useState<EtfGenerationRequestWithEtf[]>([]);
  const [accumulatedNotStarted, setAccumulatedNotStarted] = useState<EtfGenerationRequestWithEtf[]>([]);
  const [accumulatedCompleted, setAccumulatedCompleted] = useState<EtfGenerationRequestWithEtf[]>([]);

  const params = new URLSearchParams();
  params.append('inProgressSkip', inProgressPagination.skip.toString());
  params.append('inProgressTake', inProgressPagination.take.toString());
  params.append('failedSkip', failedPagination.skip.toString());
  params.append('failedTake', failedPagination.take.toString());
  params.append('notStartedSkip', notStartedPagination.skip.toString());
  params.append('notStartedTake', notStartedPagination.take.toString());
  params.append('completedSkip', completedPagination.skip.toString());
  params.append('completedTake', completedPagination.take.toString());
  const apiUrl = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests?${params.toString()}`;

  const { data, loading, reFetchData } = useFetchData<EtfGenerationRequestsResponse>(apiUrl, {}, 'Failed to fetch ETF generation requests');

  useEffect(() => {
    if (!data) return;
    if (inProgressPagination.skip === 0) setAccumulatedInProgress(data.inProgress || []);
    if (failedPagination.skip === 0) setAccumulatedFailed(data.failed || []);
    if (notStartedPagination.skip === 0) setAccumulatedNotStarted(data.notStarted || []);
    if (completedPagination.skip === 0) setAccumulatedCompleted(data.completed || []);

    if (inProgressPagination.skip > 0 && data.inProgress) setAccumulatedInProgress((p) => [...p, ...data.inProgress]);
    if (failedPagination.skip > 0 && data.failed) setAccumulatedFailed((p) => [...p, ...data.failed]);
    if (notStartedPagination.skip > 0 && data.notStarted) setAccumulatedNotStarted((p) => [...p, ...data.notStarted]);
    if (completedPagination.skip > 0 && data.completed) setAccumulatedCompleted((p) => [...p, ...data.completed]);
  }, [data, inProgressPagination.skip, failedPagination.skip, notStartedPagination.skip, completedPagination.skip]);

  const hasActive = (data?.counts?.notStarted ?? 0) > 0 || (data?.counts?.inProgress ?? 0) > 0;
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_SECONDS);
  const [isPaused, setIsPaused] = useState(false);

  function resetPagination() {
    setInProgressPagination({ skip: 0, take: 15 });
    setFailedPagination({ skip: 0, take: 15 });
    setNotStartedPagination({ skip: 0, take: 15 });
    setCompletedPagination({ skip: 0, take: 15 });
    setAccumulatedInProgress([]);
    setAccumulatedFailed([]);
    setAccumulatedNotStarted([]);
    setAccumulatedCompleted([]);
  }

  function handleManualRefresh() {
    resetPagination();
    reFetchData();
    setSecondsLeft(REFRESH_SECONDS);
  }

  async function handleReloadRequest(request: EtfGenerationRequestWithEtf) {
    try {
      const res = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests/${request.id}/reload`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reload');
      reFetchData();
    } catch (err) {
      console.error('Failed to reload ETF generation request:', err);
    }
  }

  useEffect((): (() => void) | void => {
    if (!hasActive || isPaused) {
      setSecondsLeft(REFRESH_SECONDS);
      return;
    }
    const timerId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          reFetchData();
          return REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1_000);
    return () => clearInterval(timerId);
  }, [hasActive, isPaused, reFetchData]);

  return (
    <div className="mt-12 px-4 text-color">
      <AdminNav />

      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">ETF Generation Requests</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-300">
            {hasActive && !isPaused ? (
              <span>
                Reloading in <span className="font-semibold">{secondsLeft}</span>s
              </span>
            ) : (
              <span className="opacity-80">Auto-refresh {isPaused ? 'paused' : 'inactive'}</span>
            )}
          </div>
          <Button onClick={() => setIsPaused((p) => !p)} variant="outlined" className="flex items-center gap-2">
            {isPaused ? (
              <>
                <PlayIcon className="w-4 h-4" /> Resume
              </>
            ) : (
              <>
                <PauseIcon className="w-4 h-4" /> Pause
              </>
            )}
          </Button>
          <Button onClick={handleManualRefresh} variant="outlined" className="flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

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
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>In Progress</span>
          </div>
        </div>
      </div>

      {[
        {
          title: 'In Progress',
          rows: accumulatedInProgress,
          border: 'border-blue-500',
          count: data?.counts?.inProgress,
          onMore: () => setInProgressPagination((p) => ({ skip: p.skip + p.take, take: p.take })),
        },
        {
          title: 'Not Started',
          rows: accumulatedNotStarted,
          border: 'border-gray-500',
          count: data?.counts?.notStarted,
          onMore: () => setNotStartedPagination((p) => ({ skip: p.skip + p.take, take: p.take })),
        },
        {
          title: 'Failed',
          rows: accumulatedFailed,
          border: 'border-red-500',
          count: data?.counts?.failed,
          onMore: () => setFailedPagination((p) => ({ skip: p.skip + p.take, take: p.take })),
        },
        {
          title: 'Completed',
          rows: accumulatedCompleted,
          border: 'border-green-500',
          count: data?.counts?.completed,
          onMore: () => setCompletedPagination((p) => ({ skip: p.skip + p.take, take: p.take })),
        },
      ].map(({ title, rows, border, count, onMore }) => (
        <div key={title} className="mb-6">
          <div className={`bg-gray-800 border ${border} rounded-lg p-4`}>
            <SectionHeader
              title={`${title} Requests`}
              count={rows.length}
              totalCount={count || rows.length}
              onShowMore={onMore}
              hasMore={rows.length < (count || 0)}
            />
            {loading && rows.length === 0 ? (
              <div className="py-8">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="py-4">No {title.toLowerCase()} requests.</div>
            ) : (
              <EtfRequestsTable rows={rows} onReloadRequest={handleReloadRequest} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
