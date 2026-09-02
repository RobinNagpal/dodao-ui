'use client';

import { GenerationRequestWithFlags } from '@/app/admin-v1/generation-requests/GenerationRequestsTable';
import ReloadRequestModal from '@/app/admin-v1/generation-requests/ReloadRequestModal';
import RequestsSection from '@/app/admin-v1/generation-requests/RequestsSection';
import StatusLegend from '@/app/admin-v1/generation-requests/StatusLegend';
import { filterGenerationRequests } from '@/app/admin-v1/generation-requests/generation-request-filters';
import { GenerationRequestsResponse, TickerIdentifier, TickerV1GenerationRequestWithTicker } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import ClientStockFilters from '@/components/stocks/filters/ClientStockFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGenerateReports } from '@/hooks/useGenerateReports';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ReportType } from '@/types/ticker-typesv1';
import { type SelectedFiltersMap } from '@/utils/ticker-filter-utils';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useState } from 'react';

const REFRESH_SECONDS: number = 30;
const PAGE_SIZE: number = 15;

/**
 * Completed requests are filtered and paged entirely in the browser, so the tab
 * loads a window of the most recently updated ones instead of a single page.
 * "Load more" widens the window in these steps, up to the API's cap.
 */
const COMPLETED_WINDOW_STEP: number = 250;
const COMPLETED_WINDOW_MAX: number = 1000;

type RequestsTab = 'active' | 'failed' | 'completed';

export default function GenerationRequestsPage(): JSX.Element {
  const [inProgressPage, setInProgressPage] = useState<number>(1);
  const [notStartedPage, setNotStartedPage] = useState<number>(1);
  const [failedPage, setFailedPage] = useState<number>(1);
  const [completedPage, setCompletedPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<RequestsTab>('active');
  const [completedWindow, setCompletedWindow] = useState<number>(COMPLETED_WINDOW_STEP);
  const [completedFilters, setCompletedFilters] = useState<SelectedFiltersMap>({});

  const apiUrl: string = useMemo(() => {
    const params = new URLSearchParams();
    params.append('inProgressSkip', String((inProgressPage - 1) * PAGE_SIZE));
    params.append('inProgressTake', String(PAGE_SIZE));
    params.append('failedSkip', String((failedPage - 1) * PAGE_SIZE));
    params.append('failedTake', String(PAGE_SIZE));
    params.append('notStartedSkip', String((notStartedPage - 1) * PAGE_SIZE));
    params.append('notStartedTake', String(PAGE_SIZE));
    // The completed tab filters/pages client-side, so it pulls a window of the
    // most recent requests — and nothing at all while another tab is open.
    params.append('completedSkip', '0');
    params.append('completedTake', String(activeTab === 'completed' ? completedWindow : 0));
    return `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/generation-requests?${params.toString()}`;
  }, [inProgressPage, failedPage, notStartedPage, activeTab, completedWindow]);

  const { data, loading, reFetchData } = useFetchData<GenerationRequestsResponse>(apiUrl, {}, 'Failed to fetch generation requests');

  const counts = data?.counts;
  const activeCount: number = (counts?.inProgress ?? 0) + (counts?.notStarted ?? 0);
  const hasActive: boolean = (counts?.inProgress ?? 0) > 0 || (counts?.notStarted ?? 0) > 0;

  // ----- Completed tab: filtered + paged in the browser over the loaded window -----
  const completedTotalCount: number = counts?.completed ?? 0;
  const loadedCompletedCount: number = data?.completed?.length ?? 0;

  const filteredCompleted: TickerV1GenerationRequestWithTicker[] = useMemo(
    () => filterGenerationRequests(data?.completed ?? [], completedFilters),
    [data?.completed, completedFilters]
  );

  const completedTotalPages: number = Math.max(1, Math.ceil(filteredCompleted.length / PAGE_SIZE));
  const completedCurrentPage: number = Math.min(completedPage, completedTotalPages);
  const completedPageRows: TickerV1GenerationRequestWithTicker[] = filteredCompleted.slice(
    (completedCurrentPage - 1) * PAGE_SIZE,
    completedCurrentPage * PAGE_SIZE
  );

  const hasCompletedFilters: boolean = Object.values(completedFilters).some((v) => v && v.length > 0);
  const canLoadMoreCompleted: boolean = loadedCompletedCount < completedTotalCount && completedWindow < COMPLETED_WINDOW_MAX;

  const completedNote: string | undefined =
    loadedCompletedCount < completedTotalCount
      ? `Filters apply to the ${loadedCompletedCount} most recently updated of ${completedTotalCount} completed requests. Load more to widen the range.`
      : undefined;

  const completedSummary: string = hasCompletedFilters
    ? `${filteredCompleted.length} of ${loadedCompletedCount} loaded requests match`
    : `${loadedCompletedCount} loaded`;

  function handleCompletedFiltersChange(next: SelectedFiltersMap): void {
    setCompletedFilters(next);
    setCompletedPage(1);
  }

  function handleLoadMoreCompleted(): void {
    setCompletedWindow((prev: number): number => Math.min(COMPLETED_WINDOW_MAX, prev + COMPLETED_WINDOW_STEP));
  }

  const [secondsLeft, setSecondsLeft] = useState<number>(REFRESH_SECONDS);
  const [showReloadModal, setShowReloadModal] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<GenerationRequestWithFlags | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // A background refresh can drain a bucket below the page the user is on, leaving them on an
  // out-of-range (empty) page with no way back. Snap each section's page into range when data lands.
  useEffect(() => {
    if (!data) return;
    const clampToRange = (count: number) => (page: number) => Math.min(page, Math.max(1, Math.ceil(count / PAGE_SIZE)));
    setInProgressPage(clampToRange(data.counts.inProgress));
    setNotStartedPage(clampToRange(data.counts.notStarted));
    setFailedPage(clampToRange(data.counts.failed));
  }, [data]);

  function resetToFirstPage(): void {
    setInProgressPage(1);
    setNotStartedPage(1);
    setFailedPage(1);
    setCompletedPage(1);
  }

  function handleManualRefresh(): void {
    resetToFirstPage();
    reFetchData();
    setSecondsLeft(REFRESH_SECONDS);
  }

  function handleTogglePause(): void {
    setIsPaused((prev) => !prev);
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

  return (
    <>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Generation Requests</h2>

        <div className="flex items-center gap-3">
          <div className="text-sm text-muted">
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

      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as RequestsTab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">In Progress &amp; Not Started ({activeCount})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({counts?.failed ?? 0})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({counts?.completed ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex flex-col gap-4">
          <RequestsSection
            title="In Progress Requests"
            tone="blue"
            rows={data?.inProgress ?? []}
            totalCount={counts?.inProgress ?? 0}
            loading={loading}
            currentPage={inProgressPage}
            pageSize={PAGE_SIZE}
            onPageChange={setInProgressPage}
            onReloadRequest={handleReloadRequest}
          />
          <RequestsSection
            title="Not Started Requests"
            tone="gray"
            rows={data?.notStarted ?? []}
            totalCount={counts?.notStarted ?? 0}
            loading={loading}
            currentPage={notStartedPage}
            pageSize={PAGE_SIZE}
            onPageChange={setNotStartedPage}
            onReloadRequest={handleReloadRequest}
          />
        </TabsContent>

        <TabsContent value="failed">
          <RequestsSection
            title="Failed Requests"
            tone="red"
            rows={data?.failed ?? []}
            totalCount={counts?.failed ?? 0}
            loading={loading}
            currentPage={failedPage}
            pageSize={PAGE_SIZE}
            onPageChange={setFailedPage}
            onReloadRequest={handleReloadRequest}
          />
        </TabsContent>

        <TabsContent value="completed">
          <RequestsSection
            title="Completed Requests"
            tone="green"
            rows={completedPageRows}
            totalCount={filteredCompleted.length}
            loading={loading}
            currentPage={completedCurrentPage}
            pageSize={PAGE_SIZE}
            onPageChange={setCompletedPage}
            onReloadRequest={handleReloadRequest}
            note={completedNote}
            emptyMessage={hasCompletedFilters ? 'No completed requests match the selected filters.' : 'No completed requests.'}
            toolbar={<ClientStockFilters selected={completedFilters} onChange={handleCompletedFiltersChange} resultSummary={completedSummary} />}
            footer={
              canLoadMoreCompleted ? (
                <Button onClick={handleLoadMoreCompleted} variant="outlined" disabled={loading}>
                  Load {Math.min(COMPLETED_WINDOW_STEP, completedTotalCount - loadedCompletedCount)} more
                </Button>
              ) : undefined
            }
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
    </>
  );
}
