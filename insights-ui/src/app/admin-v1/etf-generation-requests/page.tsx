'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { useDebouncedValue } from '@/app/admin-v1/etf-reports/useDebouncedValue';
import { EtfGenerationRequestsResponse, EtfGenerationRequestWithEtf } from '@/app/api/[spaceId]/etfs-v1/generation-requests/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfGenerationRequestStatus, EtfReportType } from '@/types/etf/etf-analysis-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

const ETF_REGENERATE_FIELDS = [
  'regeneratePerformanceAndReturns',
  'regenerateCostEfficiencyAndTeam',
  'regenerateRiskAnalysis',
  'regenerateFuturePerformanceOutlook',
  'regenerateIndexStrategy',
  'regenerateCompetition',
  'regenerateFinalSummary',
] as const;

type EtfRegenerateField = (typeof ETF_REGENERATE_FIELDS)[number];

const ETF_FIELD_LABELS: Record<EtfRegenerateField, string> = {
  regeneratePerformanceAndReturns: 'Performance',
  regenerateCostEfficiencyAndTeam: 'Cost & Team',
  regenerateRiskAnalysis: 'Risk',
  regenerateFuturePerformanceOutlook: 'Future Outlook',
  regenerateIndexStrategy: 'Index & Strategy',
  regenerateCompetition: 'Competition',
  regenerateFinalSummary: 'Final Summary',
};

const ETF_FIELD_TO_STEP_MAP: Record<EtfRegenerateField, EtfReportType> = {
  regeneratePerformanceAndReturns: EtfReportType.PERFORMANCE_AND_RETURNS,
  regenerateCostEfficiencyAndTeam: EtfReportType.COST_EFFICIENCY_AND_TEAM,
  regenerateRiskAnalysis: EtfReportType.RISK_ANALYSIS,
  regenerateFuturePerformanceOutlook: EtfReportType.FUTURE_PERFORMANCE_OUTLOOK,
  regenerateIndexStrategy: EtfReportType.INDEX_STRATEGY,
  regenerateCompetition: EtfReportType.COMPETITION,
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
const PAGE_SIZE = 50;

interface SectionPaginationProps {
  currentPage: number;
  totalCount: number;
  rowsOnPage: number;
  onPageChange: (page: number) => void;
}

function SectionPagination({ currentPage, totalCount, rowsOnPage, onPageChange }: SectionPaginationProps): JSX.Element | null {
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  if (totalPages <= 1) return null;

  const rangeStart = (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = (currentPage - 1) * PAGE_SIZE + rowsOnPage;

  return (
    <div className="flex items-center justify-between px-2 py-3 mt-3 border-t border-gray-700/60">
      <span className="text-sm text-gray-400">
        Showing {rangeStart}
        {'–'}
        {rangeEnd} of {totalCount}
      </span>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <span className="text-sm text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ title, totalCount }: { title: string; totalCount: number }): JSX.Element {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <h3 className="text-xl font-semibold">{title}</h3>
      <span className="text-sm text-gray-400">
        {totalCount} total item{totalCount === 1 ? '' : 's'}
      </span>
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
  const [inProgressPage, setInProgressPage] = useState(1);
  const [failedPage, setFailedPage] = useState(1);
  const [notStartedPage, setNotStartedPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);

  // Reset all sections to page 1 whenever the active search term changes.
  useEffect(() => {
    setInProgressPage(1);
    setFailedPage(1);
    setNotStartedPage(1);
    setCompletedPage(1);
  }, [debouncedSearch]);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.append('inProgressSkip', String((inProgressPage - 1) * PAGE_SIZE));
    params.append('inProgressTake', String(PAGE_SIZE));
    params.append('failedSkip', String((failedPage - 1) * PAGE_SIZE));
    params.append('failedTake', String(PAGE_SIZE));
    params.append('notStartedSkip', String((notStartedPage - 1) * PAGE_SIZE));
    params.append('notStartedTake', String(PAGE_SIZE));
    params.append('completedSkip', String((completedPage - 1) * PAGE_SIZE));
    params.append('completedTake', String(PAGE_SIZE));
    const trimmed = debouncedSearch.trim();
    if (trimmed) params.append('q', trimmed);
    return `${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests?${params.toString()}`;
  }, [inProgressPage, failedPage, notStartedPage, completedPage, debouncedSearch]);

  const { data, loading, reFetchData } = useFetchData<EtfGenerationRequestsResponse>(apiUrl, {}, 'Failed to fetch ETF generation requests');

  const hasActive = (data?.counts?.notStarted ?? 0) > 0 || (data?.counts?.inProgress ?? 0) > 0;
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_SECONDS);
  const [isPaused, setIsPaused] = useState(false);

  function handleManualRefresh() {
    setInProgressPage(1);
    setFailedPage(1);
    setNotStartedPage(1);
    setCompletedPage(1);
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

  const sections = [
    {
      title: 'In Progress',
      rows: data?.inProgress ?? [],
      border: 'border-blue-500',
      count: data?.counts?.inProgress ?? 0,
      currentPage: inProgressPage,
      setPage: setInProgressPage,
    },
    {
      title: 'Not Started',
      rows: data?.notStarted ?? [],
      border: 'border-gray-500',
      count: data?.counts?.notStarted ?? 0,
      currentPage: notStartedPage,
      setPage: setNotStartedPage,
    },
    {
      title: 'Failed',
      rows: data?.failed ?? [],
      border: 'border-red-500',
      count: data?.counts?.failed ?? 0,
      currentPage: failedPage,
      setPage: setFailedPage,
    },
    {
      title: 'Completed',
      rows: data?.completed ?? [],
      border: 'border-green-500',
      count: data?.counts?.completed ?? 0,
      currentPage: completedPage,
      setPage: setCompletedPage,
    },
  ];

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

      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ETF symbol or name…"
            className="w-full max-w-md px-3 py-2 bg-gray-900 text-gray-200 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="px-2 py-2 text-xs text-gray-300 hover:text-white" title="Clear search">
              ×
            </button>
          )}
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

      {sections.map(({ title, rows, border, count, currentPage, setPage }) => (
        <div key={title} className="mb-6">
          <div className={`bg-gray-800 border ${border} rounded-lg p-4`}>
            <SectionHeader title={`${title} Requests`} totalCount={count} />
            {loading && rows.length === 0 ? (
              <div className="py-8">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="py-4">No {title.toLowerCase()} requests.</div>
            ) : (
              <>
                <EtfRequestsTable rows={rows} onReloadRequest={handleReloadRequest} />
                <SectionPagination currentPage={currentPage} totalCount={count} rowsOnPage={rows.length} onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
