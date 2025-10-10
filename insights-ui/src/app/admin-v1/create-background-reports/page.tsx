'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import AdminCountryFilter, { CountryCode, filterTickersByCountries } from '@/app/admin-v1/AdminCountryFilter';
import SelectIndustryAndSubIndustry from '@/app/admin-v1/SelectIndustryAndSubIndustry';
import RequestGenerator, { TickerRequestV1 } from '@/components/public-equitiesv1/RequestGenerator';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ReportTickersResponse } from '@/types/ticker-typesv1';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData, UseFetchDataResponse } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import React, { useEffect, useState } from 'react';

// Refactored per TickerManagementPage: strict types, no extra Blocks/useEffect, no ticker add/edit management
export default function CreateBackgroundReportsV1Page(): JSX.Element {
  // Selection state
  const [selectedIndustry, setSelectedIndustry] = useState<TickerV1Industry | null>(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<TickerV1SubIndustry | null>(null);

  // Ticker/request state
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [tickerRequests, setTickerRequests] = useState<Record<string, TickerRequestV1>>({});

  // Filter state
  const [showMissingOnly, setShowMissingOnly] = useState<boolean>(false);
  const [showPartialOnly, setShowPartialOnly] = useState<boolean>(false);
  const [selectedCountries, setSelectedCountries] = useState<CountryCode[]>([]);

  // Tickers for the selected sub-industry
  const { data: tickerInfos, reFetchData: reFetchTickersForSubIndustry }: UseFetchDataResponse<ReportTickersResponse> = useFetchData<ReportTickersResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/industry/${selectedIndustry?.industryKey}/${
      selectedSubIndustry?.subIndustryKey
    }?withAnalysisStatus=true`,
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
  const allTickers = tickerInfos?.tickers || [];

  // Apply filters
  let tickers = allTickers.filter((ticker) => {
    if (showMissingOnly && !ticker.isMissingAllAnalysis) return false;
    if (showPartialOnly && !ticker.isPartial) return false;
    return true;
  });

  // Apply country filter
  tickers = filterTickersByCountries(tickers, selectedCountries);

  // Request fetching helpers (on-demand only; no effects)
  const fetchTickerRequest = async (ticker: string): Promise<void> => {
    const url: string = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}/generation-request`;
    const resp: Response = await fetch(url, { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`Failed to fetch request for ${ticker}`);
    const request = (await resp.json()) as TickerRequestV1;
    setTickerRequests((prev) => ({ ...prev, [ticker]: request }));
  };

  const fetchSelectedTickerRequests = async (): Promise<void> => {
    for (const t of selectedTickers) {
      // Intentionally sequential for simplicity; adjust if needed
      // eslint-disable-next-line no-await-in-loop
      await fetchTickerRequest(t);
    }
  };

  const updateSelectedTickers = async (tickers: string[]) => {
    setSelectedTickers(tickers);
    for (const t of tickers) {
      if (!tickerRequests[t]) {
        await fetchTickerRequest(t);
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
            {/* Country Filter - Global filter above statistics */}
            <div className="bg-gray-800 rounded-lg p-4">
              <AdminCountryFilter
                selectedCountries={selectedCountries}
                onCountriesChange={(countries) => {
                  setSelectedCountries(countries);
                  setSelectedTickers([]);
                }}
                disabled={!tickerInfos}
              />
            </div>

            {/* Statistics and Filter Controls */}
            {tickerInfos && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-300">
                      Total: <span className="font-medium text-white">{tickerInfos.count}</span>
                    </span>
                    <span className="text-red-400">
                      Missing: <span className="font-medium">{tickerInfos.missingCount}</span>
                    </span>
                    <span className="text-yellow-400">
                      Partial: <span className="font-medium">{tickerInfos.partialCount}</span>
                    </span>
                    <span className="text-green-400">
                      Complete: <span className="font-medium">{tickerInfos.completeCount}</span>
                    </span>
                    <span className="text-gray-300">
                      Showing: <span className="font-medium text-white">{tickers.length}</span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={showMissingOnly ? 'contained' : 'outlined'}
                      size="sm"
                      onClick={() => {
                        setShowMissingOnly(!showMissingOnly);
                        setShowPartialOnly(false);
                        setSelectedTickers([]);
                      }}
                    >
                      Show Missing ({tickerInfos.missingCount})
                    </Button>
                    <Button
                      variant={showPartialOnly ? 'contained' : 'outlined'}
                      size="sm"
                      onClick={() => {
                        setShowPartialOnly(!showPartialOnly);
                        setShowMissingOnly(false);
                        setSelectedTickers([]);
                      }}
                    >
                      Show Partial ({tickerInfos.partialCount})
                    </Button>
                    {(showMissingOnly || showPartialOnly) && (
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() => {
                          setShowMissingOnly(false);
                          setShowPartialOnly(false);
                          setSelectedTickers([]);
                        }}
                      >
                        Show All
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tickers.length > 0 ? (
              <div>
                <div className="mb-4">
                  <Checkboxes
                    items={[
                      {
                        id: 'select-all',
                        name: 'select-all',
                        label: <span className="flex-grow cursor-pointer">Select All ({tickers.length})</span>,
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
                        <div className="flex-grow cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{t.symbol}</span>
                              <span className="text-gray-400">-</span>
                              <span className="text-gray-300">{t.name}</span>
                              {t.cachedScore && <span className="text-blue-400 text-sm">Score: {t.cachedScore}/25</span>}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                              <span>
                                Updated:{' '}
                                {new Date(t.updatedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {t.isMissingAllAnalysis && <span className="text-red-400 text-xs">MISSING</span>}
                              {t.isPartial && <span className="text-yellow-400 text-xs">PARTIAL</span>}
                              {!t.isMissingAllAnalysis && !t.isPartial && <span className="text-green-400 text-xs">COMPLETE</span>}
                            </div>
                          </div>
                        </div>
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
                <Button variant="contained" primary onClick={fetchSelectedTickerRequests}>
                  Refresh Requests
                </Button>
              </div>
            )}
          </div>
        )}

        {selectedTickers.length > 0 && (
          <RequestGenerator
            selectedTickers={selectedTickers}
            tickerRequests={tickerRequests}
            onRequestCreated={(ticker: string) => {
              void fetchTickerRequest(ticker);
            }}
          />
        )}
      </div>
    </PageWrapper>
  );
}
