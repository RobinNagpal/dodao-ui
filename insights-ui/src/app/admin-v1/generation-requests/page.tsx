'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { GenerationRequestsResponse, TickerV1GenerationRequestWithTicker } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { useGenerateReports } from '@/hooks/useGenerateReports';
import { GenerationRequestStatus, ReportType } from '@/types/ticker-typesv1';
import { calculatePendingSteps } from '@/utils/analysis-reports/calculate-pending-steps';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

/** Canonical list of flags we render */
type GenerationReportFields = keyof Pick<
  TickerV1GenerationRequestWithTicker,
  | 'regenerateCompetition'
  | 'regenerateFinancialAnalysis'
  | 'regenerateBusinessAndMoat'
  | 'regeneratePastPerformance'
  | 'regenerateFutureGrowth'
  | 'regenerateFairValue'
  | 'regenerateFutureRisk'
  | 'regenerateWarrenBuffett'
  | 'regenerateCharlieMunger'
  | 'regenerateBillAckman'
  | 'regenerateFinalSummary'
  | 'regenerateCachedScore'
>;
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
] as GenerationReportFields[];

type RegenerateField = (typeof REGENERATE_FIELDS)[number];

type GenerationRequestWithFlags = TickerV1GenerationRequestWithTicker;

const FIELD_LABELS: Record<GenerationReportFields, string> = {
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

const FIELD_TO_STEP_MAP: Record<RegenerateField, ReportType> = {
  regenerateCompetition: ReportType.COMPETITION,
  regenerateFinancialAnalysis: ReportType.FINANCIAL_ANALYSIS,
  regenerateBusinessAndMoat: ReportType.BUSINESS_AND_MOAT,
  regeneratePastPerformance: ReportType.PAST_PERFORMANCE,
  regenerateFutureGrowth: ReportType.FUTURE_GROWTH,
  regenerateFairValue: ReportType.FAIR_VALUE,
  regenerateFutureRisk: ReportType.FUTURE_RISK,
  regenerateWarrenBuffett: ReportType.WARREN_BUFFETT,
  regenerateCharlieMunger: ReportType.CHARLIE_MUNGER,
  regenerateBillAckman: ReportType.BILL_ACKMAN,
  regenerateFinalSummary: ReportType.FINAL_SUMMARY,
  regenerateCachedScore: ReportType.CACHED_SCORE,
};

interface StatusDotProps {
  isEnabled: boolean;
  stepName: ReportType;
  completedSteps: ReportType[];
  failedSteps: ReportType[];
  pendingSteps: ReportType[];
  inProgressStep?: ReportType | null;
}

function StatusDot({ isEnabled, stepName, completedSteps, failedSteps, inProgressStep }: StatusDotProps): JSX.Element {
  if (!isEnabled) return <div className="w-3 h-3 rounded-full bg-gray-400" title="Not enabled" />;
  if (failedSteps.includes(stepName)) return <div className="w-3 h-3 rounded-full bg-red-500" title="Failed" />;
  if (completedSteps.includes(stepName)) return <div className="w-3 h-3 rounded-full bg-green-500" title="Completed" />;
  if (inProgressStep && inProgressStep === stepName) return <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" title="In Progress" />;

  return <div className="w-3 h-3 rounded-full bg-blue-500" title="Pending" />;
}

const REFRESH_SECONDS: number = 30;

/** ---------- helpers ---------- */

interface SectionHeaderProps {
  title: string;
  count: number;
  totalCount: number;
  onShowMore?: () => void;
  hasMore: boolean;
}

function SectionHeader({ title, count, totalCount, onShowMore, hasMore }: SectionHeaderProps): JSX.Element {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <h3 className="text-xl font-semibold">{title}</h3>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          Showing {count} of {totalCount} • {totalCount} total item{totalCount === 1 ? '' : 's'}
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

interface RequestsTableProps {
  rows: GenerationRequestWithFlags[];
  regenerateFields: RegenerateField[];
  onReloadRequest: (request: GenerationRequestWithFlags) => void;
}

function RequestsTable({ rows, regenerateFields, onReloadRequest }: RequestsTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">Ticker</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Industry</th>
            {regenerateFields.map((field: RegenerateField) => (
              <th key={field} className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">
                {FIELD_LABELS[field]}
              </th>
            ))}
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Created At</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {rows.map((latestRequest: GenerationRequestWithFlags) => {
            const exchange: string = latestRequest.ticker.exchange;
            const symbol: string = latestRequest.ticker.symbol;
            const completedSteps: ReportType[] = (latestRequest.completedSteps as ReportType[] | undefined) ?? [];
            const failedSteps: ReportType[] = (latestRequest.failedSteps as ReportType[] | undefined) ?? [];
            const isFailed: boolean = latestRequest.status === GenerationRequestStatus.Failed;
            const inProgressStep: ReportType | null = (latestRequest.inProgressStep as ReportType | undefined) ?? null;
            const pendingSteps: ReportType[] = calculatePendingSteps(latestRequest) || [];
            return (
              <tr key={latestRequest.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky left-0 bg-gray-800 z-10 link-color">
                  <Link href={`/stocks/${exchange}/${symbol}`} target="_blank">
                    {symbol}
                    <div className="text-xs text-gray-400">{latestRequest.ticker.name}</div>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="text-xs text-gray-400">
                    {latestRequest.ticker.industry?.name || 'Unknown Industry'}
                    <br />
                    {latestRequest.ticker.subIndustry?.name || 'Unknown Sub-Industry'}
                  </div>
                </td>
                {regenerateFields.map((field: RegenerateField) => {
                  const stepName = FIELD_TO_STEP_MAP[field];
                  return (
                    <td key={`${symbol}-${field}`} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex justify-center">
                        <StatusDot
                          isEnabled={Boolean(latestRequest[field])}
                          stepName={stepName}
                          completedSteps={completedSteps}
                          failedSteps={failedSteps}
                          inProgressStep={inProgressStep}
                          pendingSteps={pendingSteps}
                        />
                      </div>
                    </td>
                  );
                })}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {isFailed && failedSteps.length > 0 && (
                    <button
                      onClick={() => onReloadRequest(latestRequest)}
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

/** ---------- component ---------- */
export default function GenerationRequestsPage(): JSX.Element {
  const [inProgressPagination, setInProgressPagination] = useState<{ skip: number; take: number }>({ skip: 0, take: 15 });
  const [failedPagination, setFailedPagination] = useState<{ skip: number; take: number }>({ skip: 0, take: 15 });
  const [notStartedPagination, setNotStartedPagination] = useState<{ skip: number; take: number }>({ skip: 0, take: 15 });
  const [completedPagination, setCompletedPagination] = useState<{ skip: number; take: number }>({ skip: 0, take: 15 });

  const [accumulatedInProgress, setAccumulatedInProgress] = useState<GenerationRequestWithFlags[]>([]);
  const [accumulatedFailed, setAccumulatedFailed] = useState<GenerationRequestWithFlags[]>([]);
  const [accumulatedNotStarted, setAccumulatedNotStarted] = useState<GenerationRequestWithFlags[]>([]);
  const [accumulatedCompleted, setAccumulatedCompleted] = useState<GenerationRequestWithFlags[]>([]);

  const baseUrl: string = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests`;
  const params = new URLSearchParams();
  params.append('inProgressSkip', inProgressPagination.skip.toString());
  params.append('inProgressTake', inProgressPagination.take.toString());
  params.append('failedSkip', failedPagination.skip.toString());
  params.append('failedTake', failedPagination.take.toString());
  params.append('notStartedSkip', notStartedPagination.skip.toString());
  params.append('notStartedTake', notStartedPagination.take.toString());
  params.append('completedSkip', completedPagination.skip.toString());
  params.append('completedTake', completedPagination.take.toString());
  const apiUrl: string = `${baseUrl}?${params.toString()}`;

  const { data, loading, reFetchData } = useFetchData<GenerationRequestsResponse>(apiUrl, {}, 'Failed to fetch generation requests');

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

  const hasActive: boolean = (data?.notStarted?.length ?? 0) > 0 || (data?.inProgress?.length ?? 0) > 0;

  const [secondsLeft, setSecondsLeft] = useState<number>(REFRESH_SECONDS);
  const [showReloadModal, setShowReloadModal] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<GenerationRequestWithFlags | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  function handleManualRefresh(): void {
    resetPagination();
    reFetchData();
    setSecondsLeft(REFRESH_SECONDS);
  }

  function handleTogglePause(): void {
    setIsPaused((prev) => !prev);
  }

  function handleLoadMoreInProgress(): void {
    setInProgressPagination((prev) => ({ skip: prev.skip + prev.take, take: prev.take }));
  }
  function handleLoadMoreFailed(): void {
    setFailedPagination((prev) => ({ skip: prev.skip + prev.take, take: prev.take }));
  }
  function handleLoadMoreNotStarted(): void {
    setNotStartedPagination((prev) => ({ skip: prev.skip + prev.take, take: prev.take }));
  }
  function handleLoadMoreCompleted(): void {
    setCompletedPagination((prev) => ({ skip: prev.skip + prev.take, take: prev.take }));
  }

  function resetPagination(): void {
    setInProgressPagination({ skip: 0, take: 15 });
    setFailedPagination({ skip: 0, take: 15 });
    setNotStartedPagination({ skip: 0, take: 15 });
    setCompletedPagination({ skip: 0, take: 15 });
    setAccumulatedInProgress([]);
    setAccumulatedFailed([]);
    setAccumulatedNotStarted([]);
    setAccumulatedCompleted([]);
  }

  function handleReloadRequest(request: GenerationRequestWithFlags): void {
    setSelectedRequest(request);
    setShowReloadModal(true);
  }

  function handleCloseModal(): void {
    setShowReloadModal(false);
    setSelectedRequest(null);
  }

  const { createFailedPartsOnlyGenerationRequests, createFullBackgroundGenerationRequests } = useGenerateReports();

  async function handleReloadFailedPartsOnly(): Promise<void> {
    if (!selectedRequest || !selectedRequest.failedSteps || selectedRequest.failedSteps.length === 0) return;
    try {
      await createFailedPartsOnlyGenerationRequests([{ ticker: selectedRequest.ticker.symbol, failedSteps: selectedRequest.failedSteps as ReportType[] }]);
      handleCloseModal();
      reFetchData();
    } catch (err) {
      console.error('Failed to create generation request for failed parts:', err);
    }
  }

  async function handleReloadFullRequest(): Promise<void> {
    if (!selectedRequest) return;
    try {
      await createFullBackgroundGenerationRequests([selectedRequest.ticker.symbol]);
      handleCloseModal();
      reFetchData();
    } catch (err) {
      console.error('Failed to create full generation request:', err);
    }
  }

  useEffect((): (() => void) | void => {
    if (!hasActive || isPaused) {
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
  }, [hasActive, isPaused, reFetchData]);

  const inProgressRows: GenerationRequestWithFlags[] = accumulatedInProgress;
  const notStartedRows: GenerationRequestWithFlags[] = accumulatedNotStarted;
  const failedRows: GenerationRequestWithFlags[] = accumulatedFailed;
  const completedRows: GenerationRequestWithFlags[] = accumulatedCompleted;

  const regenerateFields: GenerationReportFields[] = REGENERATE_FIELDS;

  return (
    <div className="mt-12 px-4 text-color">
      <AdminNav />

      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Generation Requests</h2>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-300">
            {hasActive && !isPaused ? (
              <span>
                Reloading in <span className="font-semibold">{secondsLeft}</span> seconds
              </span>
            ) : (
              <span className="opacity-80">Auto-refresh {isPaused ? 'paused' : 'inactive'}</span>
            )}
          </div>

          <Button onClick={handleTogglePause} variant="outlined" className="flex items-center gap-2">
            {isPaused ? (
              <>
                <PlayIcon className="w-4 h-4" />
                Resume
              </>
            ) : (
              <>
                <PauseIcon className="w-4 h-4" />
                Pause
              </>
            )}
          </Button>

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

      {/* Sections */}
      <div className="mb-6">
        <div className="bg-gray-800 border border-blue-500 rounded-lg p-4">
          <SectionHeader
            title="In Progress Requests"
            count={inProgressRows.length}
            totalCount={data?.counts?.inProgress || inProgressRows.length}
            onShowMore={handleLoadMoreInProgress}
            hasMore={inProgressRows.length < (data?.counts?.inProgress || 0)}
          />
          {loading && inProgressRows.length === 0 ? (
            <div className="py-8">Loading generation requests...</div>
          ) : inProgressRows.length === 0 ? (
            <div className="py-4">No In Progress requests.</div>
          ) : (
            <RequestsTable rows={inProgressRows} regenerateFields={regenerateFields} onReloadRequest={handleReloadRequest} />
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-gray-800 border border-gray-500 rounded-lg p-4">
          <SectionHeader
            title="Not Started Requests"
            count={notStartedRows.length}
            totalCount={data?.counts?.notStarted || notStartedRows.length}
            onShowMore={handleLoadMoreNotStarted}
            hasMore={notStartedRows.length < (data?.counts?.notStarted || 0)}
          />
          {loading && notStartedRows.length === 0 ? (
            <div className="py-8">Loading generation requests...</div>
          ) : notStartedRows.length === 0 ? (
            <div className="py-4">No Not Started requests.</div>
          ) : (
            <RequestsTable rows={notStartedRows} regenerateFields={regenerateFields} onReloadRequest={handleReloadRequest} />
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-gray-800 border border-red-500 rounded-lg p-4">
          <SectionHeader
            title="Failed Requests"
            count={failedRows.length}
            totalCount={data?.counts?.failed || failedRows.length}
            onShowMore={handleLoadMoreFailed}
            hasMore={failedRows.length < (data?.counts?.failed || 0)}
          />
          {loading && failedRows.length === 0 ? (
            <div className="py-8">Loading generation requests...</div>
          ) : failedRows.length === 0 ? (
            <div className="py-4">No Failed requests.</div>
          ) : (
            <RequestsTable rows={failedRows} regenerateFields={regenerateFields} onReloadRequest={handleReloadRequest} />
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-gray-800 border border-green-500 rounded-lg p-4">
          <SectionHeader
            title="Completed Requests"
            count={completedRows.length}
            totalCount={data?.counts?.completed || completedRows.length}
            onShowMore={handleLoadMoreCompleted}
            hasMore={completedRows.length < (data?.counts?.completed || 0)}
          />
          {loading && completedRows.length === 0 ? (
            <div className="py-8">Loading generation requests...</div>
          ) : completedRows.length === 0 ? (
            <div className="py-4">No Completed requests.</div>
          ) : (
            <RequestsTable rows={completedRows} regenerateFields={regenerateFields} onReloadRequest={handleReloadRequest} />
          )}
        </div>
      </div>

      {/* Reload Modal */}
      <FullScreenModal open={showReloadModal} onClose={handleCloseModal} title="Reload Generation Request">
        <div className="p-4">
          {selectedRequest && (
            <>
              <p className="mb-4">
                How would you like to reload the generation request for <strong>{selectedRequest.ticker.symbol}</strong>?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Button variant="contained" onClick={handleReloadFailedPartsOnly} className="w-full">
                  Reload Failed Parts Only ({selectedRequest.failedSteps?.length || 0} steps)
                </Button>

                <Button variant="outlined" onClick={handleReloadFullRequest} className="w-full">
                  Reload Full Request
                </Button>
              </div>
            </>
          )}
        </div>
      </FullScreenModal>
    </div>
  );
}
