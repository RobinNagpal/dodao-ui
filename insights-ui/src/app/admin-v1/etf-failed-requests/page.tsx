'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { useDebouncedValue } from '@/app/admin-v1/etf-reports/useDebouncedValue';
import { EtfGenerationRequestsResponse, EtfGenerationRequestWithEtf } from '@/app/api/[spaceId]/etfs-v1/generation-requests/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { EtfReportType } from '@/types/etf/etf-analysis-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

const ETF_STEP_LABELS: Record<EtfReportType, string> = {
  [EtfReportType.PERFORMANCE_AND_RETURNS]: 'Performance',
  [EtfReportType.COST_EFFICIENCY_AND_TEAM]: 'Cost & Team',
  [EtfReportType.RISK_ANALYSIS]: 'Risk',
  [EtfReportType.FUTURE_PERFORMANCE_OUTLOOK]: 'Future Outlook',
  [EtfReportType.KEY_FACTS]: 'Key Facts',
  [EtfReportType.COMPETITION]: 'Competition',
  [EtfReportType.FINAL_SUMMARY]: 'Final Summary',
};

function stepLabel(step: string): string {
  return ETF_STEP_LABELS[step as EtfReportType] ?? step;
}

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

function FailedRequestsTable({
  rows,
  reloadingId,
  onReloadRequest,
}: {
  rows: EtfGenerationRequestWithEtf[];
  reloadingId: string | null;
  onReloadRequest: (r: EtfGenerationRequestWithEtf) => void;
}): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-700 z-10">ETF</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Failed Steps</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Updated At</th>
            <th className="px-6 py-3 text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {rows.map((request) => {
            const failedSteps = request.failedSteps ?? [];
            const isReloading = reloadingId === request.id;
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
                <td className="px-6 py-4 text-sm">
                  {failedSteps.length === 0 ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {failedSteps.map((step) => (
                        <span key={`${request.id}-${step}`} className="px-2 py-1 rounded-full text-xs bg-red-900 text-red-200">
                          {stepLabel(step)}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{new Date(request.updatedAt || request.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {failedSteps.length > 0 && (
                    <button
                      onClick={() => onReloadRequest(request)}
                      disabled={isReloading}
                      className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Reload failed request"
                    >
                      <ArrowPathIcon className={`w-5 h-5 ${isReloading ? 'animate-spin' : ''}`} />
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

export default function EtfFailedRequestsPage(): JSX.Element {
  const [failedPage, setFailedPage] = useState(1);
  const [reloadingId, setReloadingId] = useState<string | null>(null);
  const [isRetryingAll, setIsRetryingAll] = useState(false);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);

  // Reset to page 1 whenever the active search term changes.
  useEffect(() => {
    setFailedPage(1);
  }, [debouncedSearch]);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    // Only the Failed section is needed; request zero rows for the others.
    params.append('inProgressTake', '0');
    params.append('notStartedTake', '0');
    params.append('completedTake', '0');
    params.append('failedSkip', String((failedPage - 1) * PAGE_SIZE));
    params.append('failedTake', String(PAGE_SIZE));
    const trimmed = debouncedSearch.trim();
    if (trimmed) params.append('q', trimmed);
    return `${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests?${params.toString()}`;
  }, [failedPage, debouncedSearch]);

  const { data, loading, reFetchData } = useFetchData<EtfGenerationRequestsResponse>(apiUrl, {}, 'Failed to fetch ETF failed requests');

  const failedRows = data?.failed ?? [];
  const failedCount = data?.counts?.failed ?? 0;

  function handleManualRefresh() {
    setFailedPage(1);
    reFetchData();
  }

  async function reloadRequest(request: EtfGenerationRequestWithEtf): Promise<void> {
    const res = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/generation-requests/${request.id}/reload`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reload');
  }

  async function handleReloadRequest(request: EtfGenerationRequestWithEtf): Promise<void> {
    setReloadingId(request.id);
    try {
      await reloadRequest(request);
      reFetchData();
    } catch (err) {
      console.error('Failed to reload ETF generation request:', err);
    } finally {
      setReloadingId(null);
    }
  }

  async function handleRetryAll(): Promise<void> {
    if (failedRows.length === 0) return;
    setIsRetryingAll(true);
    try {
      await Promise.all(failedRows.map((request) => reloadRequest(request)));
      reFetchData();
    } catch (err) {
      console.error('Failed to retry all ETF failed requests:', err);
    } finally {
      setIsRetryingAll(false);
    }
  }

  return (
    <div className="mt-12 px-4 text-color">
      <AdminNav />

      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">ETF Failed Requests</h2>
        <div className="flex items-center gap-3">
          <Button onClick={handleRetryAll} disabled={isRetryingAll || failedRows.length === 0} variant="contained" primary className="flex items-center gap-2">
            <ArrowPathIcon className={`w-4 h-4 ${isRetryingAll ? 'animate-spin' : ''}`} /> Retry All on Page
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

      <div className="mb-6">
        <div className="bg-gray-800 border border-red-500 rounded-lg p-4">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-xl font-semibold">Failed Requests</h3>
            <span className="text-sm text-gray-400">
              {failedCount} total item{failedCount === 1 ? '' : 's'}
            </span>
          </div>
          {loading && failedRows.length === 0 ? (
            <div className="py-8">Loading...</div>
          ) : failedRows.length === 0 ? (
            <div className="py-4">No failed requests.</div>
          ) : (
            <>
              <FailedRequestsTable rows={failedRows} reloadingId={reloadingId} onReloadRequest={handleReloadRequest} />
              <SectionPagination currentPage={failedPage} totalCount={failedCount} rowsOnPage={failedRows.length} onPageChange={setFailedPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
