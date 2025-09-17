'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import ReportGenerator, { TickerReportV1 } from '@/components/public-equitiesv1/ReportGenerator';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerV1 } from '@/types/public-equity/analysis-factors-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { useFetchData, UseFetchDataResponse } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import React, { useState } from 'react';
import { IndustryTickersResponse } from '@/types/ticker-typesv1';

// Refactored per TickerManagementPage: strict types, no extra Blocks/useEffect, no ticker add/edit management
export default function CreateReportsV1Page(): JSX.Element {
  // Selection state
  const [selectedIndustryKey, setSelectedIndustryKey] = useState<string>('');
  const [selectedSubIndustryKey, setSelectedSubIndustryKey] = useState<string>('');

  // Ticker/report state
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [tickerReports, setTickerReports] = useState<Record<string, TickerReportV1>>({});

  // Industries
  const { data: industries, loading: loadingIndustries } = useFetchData<TickerV1Industry[]>(`${getBaseUrl()}/api/industries`, {}, 'Failed to fetch industries');

  // Sub-Industries (refetched explicitly like in TickerManagementPage)
  const {
    data: subIndustries = [],
    loading: loadingSubIndustries,
    reFetchData: refetchSubIndustries,
  } = useFetchData<TickerV1SubIndustry[]>(
    `${getBaseUrl()}/api/sub-industries?industryKey=${selectedIndustryKey}`,
    { skipInitialFetch: !selectedIndustryKey },
    'Failed to fetch sub-industries'
  );

  // Tickers for the selected sub-industry
  const { data: tickerInfos, reFetchData: reFetchTickersForSubIndustry }: UseFetchDataResponse<IndustryTickersResponse> = useFetchData<IndustryTickersResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/industry/${selectedIndustryKey}/${selectedSubIndustryKey}`,
    { skipInitialFetch: true },
    'Failed to fetch tickers'
  );

  // Filter active entries
  const activeIndustries: TickerV1Industry[] | undefined = industries?.filter((i: TickerV1Industry) => !i.archived);
  const activeSubIndustries: TickerV1SubIndustry[] = subIndustries.filter((s: TickerV1SubIndustry) => !s.archived);

  // Handlers match TickerManagementPage (no useEffect)
  const selectIndustry = async (industryKey: string): Promise<void> => {
    setSelectedIndustryKey(industryKey);
    setSelectedSubIndustryKey('');
    setSelectedTickers([]);
    await refetchSubIndustries();
  };

  const selectSubIndustry = async (subIndustryKey: string): Promise<void> => {
    setSelectedSubIndustryKey(subIndustryKey);
    setSelectedTickers([]);
    await reFetchTickersForSubIndustry();
  };

  // Convenience derived data
  const tickers: TickerV1[] = (tickerInfos?.tickers as TickerV1[]) || [];
  const selectedIndustryName: string | undefined = activeIndustries?.find((i) => i.industryKey === selectedIndustryKey)?.name;
  const selectedSubIndustryName: string | undefined = activeSubIndustries.find((s) => s.subIndustryKey === selectedSubIndustryKey)?.name;

  // Report fetching helpers (on-demand only; no effects)
  const fetchTickerReport = async (ticker: string): Promise<void> => {
    const url: string = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}`;
    const resp: Response = await fetch(url, { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`Failed to fetch report for ${ticker}`);
    const report = (await resp.json()) as TickerReportV1;
    setTickerReports((prev) => ({ ...prev, [ticker]: report }));
  };

  const fetchSelectedTickerReports = async (): Promise<void> => {
    for (const t of selectedTickers) {
      // Intentionally sequential for simplicity; adjust if needed
      // eslint-disable-next-line no-await-in-loop
      await fetchTickerReport(t);
    }
  };

  const updateSelectedTickers = async (tickers: string[]) => {
    setSelectedTickers(tickers);
    for (const t of tickers) {
      if (!tickerReports[t]) {
        await fetchTickerReport(t);
      }
    }
    setSelectedTickers(tickers);
  };

  if (loadingIndustries) return <FullPageLoader />;

  return (
    <PageWrapper>
      <AdminNav />

      <div className="space-y-3">
        {/* Filters (mirroring TickerManagementPage) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Industry */}
          {loadingIndustries ? (
            <div className="flex justify-center items-center h-full">Loading ...</div>
          ) : (
            <StyledSelect
              label="Industry"
              showPleaseSelect
              selectedItemId={selectedIndustryKey}
              items={activeIndustries?.map((industry) => ({ id: industry.industryKey, label: industry.name })) ?? []}
              setSelectedItemId={(id) => id && selectIndustry(id)}
              className="w-full"
            />
          )}

          {/* Sub-Industry */}
          {loadingSubIndustries ? (
            <div className="flex justify-center items-center h-full">Loading ...</div>
          ) : (
            <StyledSelect
              label="Sub-Industry"
              showPleaseSelect
              selectedItemId={selectedSubIndustryKey}
              items={activeSubIndustries.map((sub) => ({ id: sub.subIndustryKey, label: sub.name }))}
              setSelectedItemId={(id) => id && selectSubIndustry(id)}
              className="w-full"
            />
          )}
        </div>

        {/* Filter summary */}
        {(selectedIndustryKey || selectedSubIndustryKey) && (
          <div className="mt-1 p-2 border border-gray-300 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Filtering by: {selectedIndustryName || selectedIndustryKey} → {selectedSubIndustryName || selectedSubIndustryKey}
            </p>
            {!!tickers.length && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Showing {tickers.length} ticker{tickers.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Ticker selection (no add/edit management) */}
        {!selectedIndustryKey || !selectedSubIndustryKey ? (
          <div className="text-center py-3 text-amber-600 dark:text-amber-400">
            <p>Please select both an Industry and a Sub-Industry to view available tickers.</p>
            {selectedIndustryKey && !selectedSubIndustryKey && <p className="mt-1 text-xs">You've selected an Industry. Now please select a Sub-Industry.</p>}
            {!selectedIndustryKey && selectedSubIndustryKey && <p className="mt-1 text-xs">You've selected a Sub-Industry. Now please select an Industry.</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {tickers.length > 0 ? (
              <div>
                <div className="mb-4">
                  <Checkboxes
                    items={[
                      {
                        id: 'select-all',
                        name: 'select-all',
                        label: <span className="flex-grow cursor-pointer">Select All</span>,
                      },
                    ]}
                    selectedItemIds={selectedTickers.length === tickers.length ? ['select-all'] : []}
                    onChange={(ids: string[]) => {
                      if (selectedTickers.length === tickers.length) updateSelectedTickers([]);
                      else {
                        updateSelectedTickers(tickers.map((t) => t.symbol));
                      }
                    }}
                  />
                </div>
                <Checkboxes
                  items={tickers.map(
                    (t): CheckboxItem => ({
                      id: t.symbol,
                      name: `ticker-${t.symbol}`,
                      label: (
                        <span className="flex-grow cursor-pointer">
                          {t.symbol} - {t.name}
                        </span>
                      ),
                    })
                  )}
                  selectedItemIds={selectedTickers}
                  onChange={(ids: string[]) => updateSelectedTickers(ids)}
                />
              </div>
            ) : (
              <div className="text-center py-3 text-gray-500 dark:text-gray-400">No tickers found for the selected Industry and Sub-Industry.</div>
            )}

            {selectedTickers.length > 0 && (
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outlined" onClick={() => setSelectedTickers([])}>
                  Clear Selection
                </Button>
                <Button variant="contained" primary onClick={fetchSelectedTickerReports}>
                  Refresh Reports
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Report generator */}
        {selectedTickers.length > 0 && (
          <ReportGenerator
            selectedTickers={selectedTickers}
            tickerReports={tickerReports}
            onReportGenerated={(ticker: string) => {
              void fetchTickerReport(ticker);
            }}
          />
        )}
      </div>
    </PageWrapper>
  );
}
