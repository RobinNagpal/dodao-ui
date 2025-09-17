'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import SelectIndustryAndSubIndustry from '@/app/admin-v1/SelectIndustryAndSubIndustry';
import ReportGenerator, { TickerReportV1 } from '@/components/public-equitiesv1/ReportGenerator';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerV1 } from '@/types/public-equity/analysis-factors-types';
import { IndustryTickersResponse } from '@/types/ticker-typesv1';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData, UseFetchDataResponse } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import React, { useEffect, useState } from 'react';

// Refactored per TickerManagementPage: strict types, no extra Blocks/useEffect, no ticker add/edit management
export default function CreateReportsV1Page(): JSX.Element {
  // Selection state
  const [selectedIndustry, setSelectedIndustry] = useState<TickerV1Industry | null>(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<TickerV1SubIndustry | null>(null);

  // Ticker/report state
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [tickerReports, setTickerReports] = useState<Record<string, TickerReportV1>>({});

  // Tickers for the selected sub-industry
  const { data: tickerInfos, reFetchData: reFetchTickersForSubIndustry }: UseFetchDataResponse<IndustryTickersResponse> = useFetchData<IndustryTickersResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/industry/${selectedIndustry?.industryKey}/${selectedSubIndustry?.subIndustryKey}`,
    { skipInitialFetch: !!(selectedIndustry?.industryKey || selectedSubIndustry?.subIndustryKey), cache: 'no-cache' },
    'Failed to fetch tickers'
  );

  const selectIndustry = async (industry: TickerV1Industry | null) => {
    setSelectedIndustry(industry);
    setSelectedSubIndustry(null);
  };

  const selectSubIndustry = async (subIndustry: TickerV1SubIndustry | null) => {
    console.log('selectSubIndustry', subIndustry);
    setSelectedSubIndustry(subIndustry);
  };

  useEffect(() => {
    if (selectedIndustry?.industryKey && selectedSubIndustry?.subIndustryKey) {
      reFetchTickersForSubIndustry();
    }
  }, [selectedIndustry?.industryKey, selectedSubIndustry?.subIndustryKey]);

  // Convenience derived data
  const tickers: TickerV1[] = (tickerInfos?.tickers as TickerV1[]) || [];

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

  return (
    <PageWrapper>
      <AdminNav />

      <div className="space-y-3">
        {/* Filters (mirroring TickerManagementPage) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2"></div>
        <SelectIndustryAndSubIndustry
          selectedIndustry={selectedIndustry}
          selectedSubIndustry={selectedSubIndustry}
          setSelectedIndustry={selectIndustry}
          setSelectedSubIndustry={selectSubIndustry}
        />

        {selectedIndustry?.industryKey && selectedSubIndustry?.subIndustryKey && (
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
