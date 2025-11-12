'use client';

import AdminNav from '@/app/admin-v1/AdminNav';
import AdminCountryFilter, { filterTickersByCountries } from '@/app/admin-v1/AdminCountryFilter';
import { CountryCode } from '@/utils/countryExchangeUtils';
import SelectIndustryAndSubIndustry from '@/app/admin-v1/SelectIndustryAndSubIndustry';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ReportTickersResponse } from '@/types/ticker-typesv1';
import { getMissingReportCount, TickerWithMissingReportInfo } from '@/utils/analysis-reports/report-steps-statuses';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData, UseFetchDataResponse } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import React, { useEffect, useState } from 'react';

interface TickerSelectionPageProps {
  /** The component to render when tickers are selected */
  renderActionComponent: (props: {
    selectedTickers: string[];
    tickerData: Record<string, TickerWithMissingReportInfo>;
    onDataUpdated: (ticker: string) => void;
  }) => React.ReactNode;

  /**
   * Button text for refreshing data
   */
  refreshButtonText: string;
}

export default function TickerSelectionPage({ renderActionComponent, refreshButtonText }: TickerSelectionPageProps): JSX.Element {
  // Selection state
  const [selectedIndustry, setSelectedIndustry] = useState<TickerV1Industry | null>(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<TickerV1SubIndustry | null>(null);

  // Ticker/data state - now stores unique IDs (symbol-exchange)
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);

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
    setSelectedTickers([]);
    setSelectedIndustry(industry);
    setSelectedSubIndustry(null);
  };

  const selectSubIndustry = async (subIndustry: TickerV1SubIndustry | null) => {
    setSelectedTickers([]);
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
    const { missingReportCount, totalReportCount } = getMissingReportCount(ticker);
    if (showMissingOnly && missingReportCount === totalReportCount) return false;
    if (showPartialOnly && missingReportCount !== totalReportCount && missingReportCount > 0) return false;
    return true;
  });

  // Apply country filter
  tickers = filterTickersByCountries(tickers, selectedCountries);

  const updateSelectedTickers = async (tickers: string[]) => {
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
                        updateSelectedTickers(tickers.map((t) => `${t.symbol}-${t.exchange}`));
                      }
                    }}
                  />
                </div>
                <Checkboxes
                  items={tickers.map((t): CheckboxItem => {
                    const { missingReportCount, totalReportCount } = getMissingReportCount(t);
                    const uniqueId = `${t.symbol}-${t.exchange}`;
                    return {
                      id: uniqueId,
                      name: `ticker-${uniqueId}`,
                      label: (
                        <div className="flex-grow cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{t.symbol}</span>
                              <span className="text-blue-400 text-sm">({t.exchange})</span>
                              <span className="text-gray-400">-</span>
                              <span className="text-gray-300">{t.name}</span>
                              {t.cachedScoreEntry?.finalScore && <span className="text-blue-400 text-sm">Score: {t.cachedScoreEntry.finalScore}/25</span>}
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
                              {missingReportCount === totalReportCount && <span className="text-red-400 text-xs">MISSING</span>}
                              {missingReportCount > 0 && missingReportCount < totalReportCount && <span className="text-yellow-400 text-xs">PARTIAL</span>}
                              {missingReportCount == 0 && <span className="text-green-400 text-xs">COMPLETE</span>}
                            </div>
                          </div>
                        </div>
                      ),
                    };
                  })}
                  selectedItemIds={selectedTickers}
                  onChange={(uniqueIds: string[]) => {
                    updateSelectedTickers(uniqueIds);
                  }}
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
                <Button variant="contained" primary onClick={reFetchTickersForSubIndustry}>
                  {refreshButtonText}
                </Button>
              </div>
            )}
          </div>
        )}

        {selectedTickers.length > 0 &&
          renderActionComponent({
            selectedTickers,
            tickerData: Object.fromEntries(tickerInfos?.tickers?.map((t) => [`${t.symbol}-${t.exchange}`, t]) || []),
            onDataUpdated: (ticker: string) => {
              void reFetchTickersForSubIndustry();
            },
          })}
      </div>
    </PageWrapper>
  );
}
