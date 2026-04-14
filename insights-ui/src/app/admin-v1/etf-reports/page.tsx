'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import { EtfReportsResponse } from '@/app/api/[spaceId]/etfs-v1/etf-admin-reports/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { AllExchanges, EXCHANGES } from '@/utils/countryExchangeUtils';
import BulkActionsBar from './BulkActionsBar';
import EtfReportsFilters from './EtfReportsFilters';
import EtfReportsTable from './EtfReportsTable';
import SelectMissingBar from './SelectMissingBar';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

export default function EtfReportsPage(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [exchange, setExchange] = useState<AllExchanges | ''>('');
  const [missing, setMissing] = useState<'' | 'stockAnalyze' | 'mor' | 'analysis'>('');
  const [search, setSearch] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const pageSize = 100;

  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    setCurrentPage(1);
  }, [exchange, missing, debouncedSearch]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [currentPage, exchange, missing, debouncedSearch]);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));
    if (exchange) params.set('exchange', exchange);
    if (missing) params.set('missing', missing);
    if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
    return `${getBaseUrl()}/api/${KoalaGainsSpaceId}/etfs-v1/etf-admin-reports?${params.toString()}`;
  }, [currentPage, exchange, missing, debouncedSearch]);

  const { data: response, loading, reFetchData } = useFetchData<EtfReportsResponse>(apiUrl, {}, 'Failed to load ETFs');

  const etfs = useMemo(() => response?.etfs ?? [], [response]);
  const totalCount = response?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const availableExchanges: ReadonlyArray<AllExchanges> = response?.availableExchanges ?? EXCHANGES;

  const selectedEtfs = useMemo(() => etfs.filter((e) => selectedIds.has(e.id)), [etfs, selectedIds]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = etfs.length > 0 && etfs.every((e) => prev.has(e.id));
      if (allSelected) {
        return new Set();
      }
      return new Set(etfs.map((e) => e.id));
    });
  }, [etfs]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return (
    <PageWrapper>
      <AdminNav />

      <div className="bg-gray-800 -mx-6 px-6 py-6 mb-6 border-b border-gray-700/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">ETF Reports</h1>
            <p className="text-gray-300 mt-1">Browse ETFs and see which data tables are populated</p>
          </div>
          <EtfReportsFilters
            exchange={exchange}
            onExchangeChange={setExchange}
            availableExchanges={availableExchanges}
            missing={missing}
            onMissingChange={setMissing}
            search={search}
            onSearchChange={setSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400" />
          <span className="ml-3 text-indigo-300">Loading ETFs...</span>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-700/50 bg-gray-900/40 overflow-hidden">
          <SelectMissingBar etfs={etfs} onSelectIds={setSelectedIds} />
          {selectedEtfs.length > 0 && <BulkActionsBar selectedEtfs={selectedEtfs} onClearSelection={handleClearSelection} onRefresh={reFetchData} />}

          <EtfReportsTable
            etfs={etfs}
            onRefresh={reFetchData}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700/50 bg-gray-800/60">
              <span className="text-sm text-gray-400">
                Showing {(currentPage - 1) * pageSize + 1}
                {'\u2013'}
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount} ETFs
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
