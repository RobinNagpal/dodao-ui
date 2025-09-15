'use client';

import AddTickersForm from '@/components/public-equitiesv1/AddTickersForm';
import ReportGenerator from '@/components/public-equitiesv1/ReportGenerator';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerV1 } from '@/types/public-equity/analysis-factors-types';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData, UseFetchDataResponse } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useState, useEffect, useMemo } from 'react';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import { TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';

interface AnalysisStatus {
  businessAndMoat: boolean;
  financialAnalysis: boolean;
  pastPerformance: boolean;
  futureGrowth: boolean;
  fairValue: boolean;
  competition: boolean;
  investorAnalysis: {
    WARREN_BUFFETT: boolean;
    CHARLIE_MUNGER: boolean;
    BILL_ACKMAN: boolean;
  };
  futureRisk: boolean;
  finalSummary: boolean;
  cachedScore: boolean;
}

interface TickerReportV1 {
  ticker: TickerV1;
  analysisStatus: AnalysisStatus;
}

export default function CreateReportsV1Page(): JSX.Element {
  const [showAddTickerForm, setShowAddTickerForm] = useState<boolean>(false);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [tickerReports, setTickerReports] = useState<Record<string, TickerReportV1>>({});
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string>('');

  // Fetch industries using useFetchData hook
  const { data: industries = [], loading: loadingIndustries } = useFetchData<TickerV1Industry[]>(
    `${getBaseUrl()}/api/industries`,
    {},
    'Failed to fetch industries'
  );

  // Fetch sub-industries when industry is selected
  const {
    data: subIndustries = [],
    loading: loadingSubIndustries,
    reFetchData: refetchSubIndustries,
  } = useFetchData<TickerV1SubIndustry[]>(
    `${getBaseUrl()}/api/sub-industries?industryKey=${selectedIndustry}`,
    { skipInitialFetch: !selectedIndustry },
    'Failed to fetch sub-industries'
  );

  // Refetch sub-industries when industry changes
  useEffect(() => {
    if (selectedIndustry) {
      refetchSubIndustries();
    }
  }, [selectedIndustry, refetchSubIndustries]);

  // Filter out archived industries and sub-industries
  const activeIndustries = industries.filter((industry) => !industry.archived);
  const activeSubIndustries = subIndustries.filter((subIndustry) => !subIndustry.archived);

  // Fetch tickers based on selected industry and sub-industry
  // Only create a URL if both industry and sub-industry are selected
  const tickersUrl = useMemo((): string => {
    // Only proceed if both industry and sub-industry are selected
    if (!selectedIndustry || !selectedSubIndustry) {
      return '';
    }

    let url = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1`;
    const params = new URLSearchParams();

    params.append('industryKey', selectedIndustry);
    params.append('subIndustryKey', selectedSubIndustry);

    return `${url}?${params.toString()}`;
  }, [selectedIndustry, selectedSubIndustry]);

  // Define explicit types for the useFetchData hook
  const {
    data: tickers,
    loading: tickersLoading,
    reFetchData: refetchTickers,
  }: UseFetchDataResponse<TickerV1[]> = useFetchData<TickerV1[]>(
    tickersUrl,
    {
      cache: 'no-cache',
      // Skip initial fetch if URL is empty (both filters not selected)
      skipInitialFetch: !tickersUrl,
    },
    'Failed to fetch tickers'
  );

  // Use tickers directly since filtering is now done on the server
  const filteredTickers = useMemo(() => {
    return tickers || [];
  }, [tickers]);

  // Helper functions to get display names
  const getIndustryDisplayName = (industryKey: string): string => {
    const industry = activeIndustries.find((ind) => ind.industryKey === industryKey);
    return industry?.name || industryKey;
  };

  const getSubIndustryDisplayName = (subIndustryKey: string): string => {
    const subIndustry = activeSubIndustries.find((sub) => sub.subIndustryKey === subIndustryKey);
    return subIndustry?.name || subIndustryKey;
  };

  // Reset sub-industry selection when industry changes
  useEffect(() => {
    setSelectedSubIndustry('');
    setSelectedTickers([]);
  }, [selectedIndustry]);

  // Reset ticker selection when sub-industry changes
  useEffect(() => {
    setSelectedTickers([]);
  }, [selectedSubIndustry]);

  // Function to fetch a ticker report
  const fetchTickerReport = async (ticker: string): Promise<TickerReportV1 | null> => {
    try {
      const response: Response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}`, {
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch report for ${ticker}`);
      }

      const report: TickerReportV1 = await response.json();
      setTickerReports((prev: Record<string, TickerReportV1>) => ({
        ...prev,
        [ticker]: report,
      }));

      return report;
    } catch (error) {
      console.error(`Error fetching report for ${ticker}:`, error);
      return null;
    }
  };

  // Fetch reports for selected tickers
  const fetchSelectedTickerReports = async (): Promise<void> => {
    for (const ticker of selectedTickers) {
      await fetchTickerReport(ticker);
    }
  };

  // Effect to fetch reports when selected tickers change
  useEffect(() => {
    if (selectedTickers.length > 0) {
      fetchSelectedTickerReports();
    }
  }, [selectedTickers]);

  // Handle report generation completion
  const handleReportGenerated = (ticker: string): void => {
    fetchTickerReport(ticker);
  };

  if (tickersLoading) {
    return <FullPageLoader />;
  }

  return (
    <PageWrapper>
      <div className="space-y-2">
        {!showAddTickerForm && (
          <Block title="Ticker Reports V1 Management" className="text-color">
            <div className="space-y-2">
              {/* Add New Ticker Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Manage Ticker Analyses</h2>
                <Button variant="contained" primary onClick={() => setShowAddTickerForm(true)}>
                  Add New Ticker
                </Button>
              </div>

              {/* Industry and Sub-Industry Filters */}
              <Block title="Filter by Industry" className="dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Industry Selection */}
                  <StyledSelect
                    label="Industry"
                    selectedItemId={selectedIndustry || 'all'}
                    items={[
                      { id: 'all', label: loadingIndustries ? 'Loading industries...' : 'All Industries' },
                      ...activeIndustries.map((industry) => ({
                        id: industry.industryKey,
                        label: industry.name,
                      })),
                    ]}
                    setSelectedItemId={(id) => setSelectedIndustry(id === 'all' ? '' : id || '')}
                    className="w-full"
                  />

                  {/* Sub-Industry Selection */}
                  <StyledSelect
                    label="Sub-Industry"
                    selectedItemId={selectedSubIndustry || 'all'}
                    items={[
                      { id: 'all', label: loadingSubIndustries ? 'Loading sub-industries...' : 'All Sub-Industries' },
                      ...activeSubIndustries.map((subIndustry) => ({
                        id: subIndustry.subIndustryKey,
                        label: subIndustry.name,
                      })),
                    ]}
                    setSelectedItemId={(id) => setSelectedSubIndustry(id === 'all' ? '' : id || '')}
                    className="w-full"
                  />
                </div>

                {/* Filter Summary */}
                {(selectedIndustry || selectedSubIndustry) && (
                  <div className="mt-2 p-2 border border-gray-300 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Filtering by: {selectedIndustry && getIndustryDisplayName(selectedIndustry)}
                      {selectedIndustry && selectedSubIndustry && ' → '}
                      {selectedSubIndustry && getSubIndustryDisplayName(selectedSubIndustry)}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Showing {filteredTickers.length} ticker{filteredTickers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </Block>

              {/* Ticker Selection */}
              <Block title="Select Tickers" className="dark:bg-gray-800">
                {!selectedIndustry || !selectedSubIndustry ? (
                  <div className="text-center py-3 text-amber-600 dark:text-amber-400">
                    <p>Please select both an Industry and a Sub-Industry to view available tickers.</p>
                    {selectedIndustry && !selectedSubIndustry && (
                      <p className="mt-1 text-xs">{"You've selected an Industry. Now please select a Sub-Industry."}</p>
                    )}
                    {!selectedIndustry && selectedSubIndustry && (
                      <p className="mt-1 text-xs">{"You've selected a Sub-Industry. Now please select an Industry."}</p>
                    )}
                  </div>
                ) : filteredTickers && filteredTickers.length > 0 ? (
                  <Checkboxes
                    items={filteredTickers.map(
                      (ticker): CheckboxItem => ({
                        id: ticker.symbol,
                        name: `ticker-${ticker.symbol}`,
                        label: (
                          <span className="flex-grow cursor-pointer">
                            {ticker.symbol} - {ticker.name}
                          </span>
                        ),
                      })
                    )}
                    selectedItemIds={selectedTickers}
                    onChange={(selectedIds: string[]) => setSelectedTickers(selectedIds)}
                  />
                ) : (
                  <div className="text-center py-3 text-gray-500 dark:text-gray-400">No tickers found for the selected Industry and Sub-Industry.</div>
                )}
                {selectedTickers.length > 0 && (
                  <div className="mt-2 flex justify-end">
                    <Button variant="outlined" onClick={() => setSelectedTickers([])} className="mr-1">
                      Clear Selection
                    </Button>
                    <Button variant="contained" primary onClick={fetchSelectedTickerReports}>
                      Refresh Reports
                    </Button>
                  </div>
                )}
              </Block>

              {/* Report Generator Component */}
              {selectedTickers.length > 0 && (
                <ReportGenerator selectedTickers={selectedTickers} tickerReports={tickerReports} onReportGenerated={handleReportGenerated} />
              )}
            </div>
          </Block>
        )}

        {/* Add Ticker Form */}
        {showAddTickerForm && (
          <AddTickersForm
            onSuccess={async (): Promise<void> => {
              setShowAddTickerForm(false);
              await refetchTickers();
            }}
            onCancel={(): void => setShowAddTickerForm(false)}
            initialIndustry={selectedIndustry}
            initialSubIndustry={selectedSubIndustry}
            industries={activeIndustries}
            subIndustries={activeSubIndustries}
          />
        )}
      </div>
    </PageWrapper>
  );
}
