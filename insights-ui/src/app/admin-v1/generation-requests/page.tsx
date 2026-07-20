'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { GenerationRequestWithFlags } from '@/app/admin-v1/generation-requests/GenerationRequestsTable';
import ReloadRequestModal from '@/app/admin-v1/generation-requests/ReloadRequestModal';
import RequestsSection from '@/app/admin-v1/generation-requests/RequestsSection';
import StatusLegend from '@/app/admin-v1/generation-requests/StatusLegend';
import { GenerationRequestsResponse, TickerIdentifier } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGenerateReports } from '@/hooks/useGenerateReports';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ReportType } from '@/types/ticker-typesv1';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

const REFRESH_SECONDS: number = 30;
const PAGE_SIZE: number = 15;

type Pagination = { skip: number; take: number };
const INITIAL_PAGINATION: Pagination = { skip: 0, take: PAGE_SIZE };

export default function GenerationRequestsPage(): JSX.Element {
  const [inProgressPagination, setInProgressPagination] = useState<Pagination>(INITIAL_PAGINATION);
  const [failedPagination, setFailedPagination] = useState<Pagination>(INITIAL_PAGINATION);
  const [notStartedPagination, setNotStartedPagination] = useState<Pagination>(INITIAL_PAGINATION);
  const [completedPagination, setCompletedPagination] = useState<Pagination>(INITIAL_PAGINATION);

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

    // Merge based on the skip echoed back in the response (not local pagination state, which
    // updates before the matching fetch resolves and would re-append the previous batch).
    const mergeRows = (prev: GenerationRequestWithFlags[], rows: GenerationRequestWithFlags[], skip: number): GenerationRequestWithFlags[] => {
      const base: GenerationRequestWithFlags[] = skip === 0 ? [] : prev.slice(0, skip);
      const seenIds = new Set<string>(base.map((row) => row.id));
      return [...base, ...rows.filter((row) => !seenIds.has(row.id))];
    };

    setAccumulatedInProgress((p) => mergeRows(p, data.inProgress || [], data.pagination.inProgress.skip));
    setAccumulatedFailed((p) => mergeRows(p, data.failed || [], data.pagination.failed.skip));
    setAccumulatedNotStarted((p) => mergeRows(p, data.notStarted || [], data.pagination.notStarted.skip));
    setAccumulatedCompleted((p) => mergeRows(p, data.completed || [], data.pagination.completed.skip));
  }, [data]);

  const hasActive: boolean = (data?.notStarted?.length ?? 0) > 0 || (data?.inProgress?.length ?? 0) > 0;

  const [secondsLeft, setSecondsLeft] = useState<number>(REFRESH_SECONDS);
  const [showReloadModal, setShowReloadModal] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<GenerationRequestWithFlags | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  function resetPagination(): void {
    setInProgressPagination(INITIAL_PAGINATION);
    setFailedPagination(INITIAL_PAGINATION);
    setNotStartedPagination(INITIAL_PAGINATION);
    setCompletedPagination(INITIAL_PAGINATION);
    setAccumulatedInProgress([]);
    setAccumulatedFailed([]);
    setAccumulatedNotStarted([]);
    setAccumulatedCompleted([]);
  }

  function handleManualRefresh(): void {
    resetPagination();
    reFetchData();
    setSecondsLeft(REFRESH_SECONDS);
  }

  function handleTogglePause(): void {
    setIsPaused((prev) => !prev);
  }

  const loadMore = (setPagination: React.Dispatch<React.SetStateAction<Pagination>>) => (): void => {
    setPagination((prev) => ({ skip: prev.skip + prev.take, take: prev.take }));
  };

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
      const ticker: TickerIdentifier = {
        symbol: selectedRequest.ticker.symbol,
        exchange: selectedRequest.ticker.exchange as TickerIdentifier['exchange'],
      };
      await createFailedPartsOnlyGenerationRequests([{ ticker, failedSteps: selectedRequest.failedSteps as ReportType[] }]);
      handleCloseModal();
      reFetchData();
    } catch (err) {
      console.error('Failed to create generation request for failed parts:', err);
    }
  }

  async function handleReloadFullRequest(): Promise<void> {
    if (!selectedRequest) return;
    try {
      const ticker: TickerIdentifier = {
        symbol: selectedRequest.ticker.symbol,
        exchange: selectedRequest.ticker.exchange as TickerIdentifier['exchange'],
      };
      await createFullBackgroundGenerationRequests([ticker]);
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

  const counts = data?.counts;
  const activeCount: number = (counts?.inProgress ?? 0) + (counts?.notStarted ?? 0);

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

      <StatusLegend />

      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">In Progress &amp; Not Started ({activeCount})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({counts?.failed ?? 0})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({counts?.completed ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex flex-col gap-4">
          <RequestsSection
            title="In Progress Requests"
            tone="blue"
            rows={accumulatedInProgress}
            totalCount={counts?.inProgress ?? accumulatedInProgress.length}
            loading={loading}
            onShowMore={loadMore(setInProgressPagination)}
            onReloadRequest={handleReloadRequest}
          />
          <RequestsSection
            title="Not Started Requests"
            tone="gray"
            rows={accumulatedNotStarted}
            totalCount={counts?.notStarted ?? accumulatedNotStarted.length}
            loading={loading}
            onShowMore={loadMore(setNotStartedPagination)}
            onReloadRequest={handleReloadRequest}
          />
        </TabsContent>

        <TabsContent value="failed">
          <RequestsSection
            title="Failed Requests"
            tone="red"
            rows={accumulatedFailed}
            totalCount={counts?.failed ?? accumulatedFailed.length}
            loading={loading}
            onShowMore={loadMore(setFailedPagination)}
            onReloadRequest={handleReloadRequest}
          />
        </TabsContent>

        <TabsContent value="completed">
          <RequestsSection
            title="Completed Requests"
            tone="green"
            rows={accumulatedCompleted}
            totalCount={counts?.completed ?? accumulatedCompleted.length}
            loading={loading}
            onShowMore={loadMore(setCompletedPagination)}
            onReloadRequest={handleReloadRequest}
          />
        </TabsContent>
      </Tabs>

      <ReloadRequestModal
        open={showReloadModal}
        request={selectedRequest}
        onClose={handleCloseModal}
        onReloadFailedPartsOnly={handleReloadFailedPartsOnly}
        onReloadFullRequest={handleReloadFullRequest}
      />
    </div>
  );
}
