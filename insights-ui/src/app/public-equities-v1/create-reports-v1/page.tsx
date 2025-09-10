'use client';

import AddTickersForm from '@/components/public-equities/AddTickersForm';
import ReportGenerator from '@/components/public-equities/ReportGenerator';
import { INDUSTRY_OPTIONS, SUB_INDUSTRY_OPTIONS, getIndustryDisplayName, getSubIndustryDisplayName } from '@/lib/mappingsV1';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerV1 } from '@/types/public-equity/analysis-factors-types';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useState, useEffect, useMemo } from 'react';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';

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

  // Fetch all tickers
  const {
    data: tickers,
    loading: tickersLoading,
    reFetchData: refetchTickers,
  } = useFetchData<TickerV1[]>(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1`, { cache: 'no-cache' }, 'Failed to fetch tickers');

  // Filter tickers based on selected industry and sub-industry
  const filteredTickers = useMemo(() => {
    if (!tickers) return [];

    return tickers.filter((ticker) => {
      const matchesIndustry = !selectedIndustry || ticker.industryKey === selectedIndustry;
      const matchesSubIndustry = !selectedSubIndustry || ticker.subIndustryKey === selectedSubIndustry;
      return matchesIndustry && matchesSubIndustry;
    });
  }, [tickers, selectedIndustry, selectedSubIndustry]);

  // Get available sub-industries based on selected industry
  const availableSubIndustries = useMemo(() => {
    if (!selectedIndustry || !tickers) return SUB_INDUSTRY_OPTIONS;

    const subIndustriesInSelectedIndustry = new Set(tickers.filter((ticker) => ticker.industryKey === selectedIndustry).map((ticker) => ticker.subIndustryKey));

    return SUB_INDUSTRY_OPTIONS.filter((option) => subIndustriesInSelectedIndustry.has(option.key));
  }, [selectedIndustry, tickers]);

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
      <div className="space-y-6">
        {!showAddTickerForm && (
          <Block title="Ticker Reports V1 Management" className="text-color">
            <div className="space-y-4">
              {/* Add New Ticker Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Manage Ticker Analyses</h2>
                <Button variant="contained" primary onClick={() => setShowAddTickerForm(true)}>
                  Add New Ticker
                </Button>
              </div>

              {/* Industry and Sub-Industry Filters */}
              <Block title="Filter by Industry" className="dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Industry Selection */}
                  <StyledSelect
                    label="Industry"
                    selectedItemId={selectedIndustry || 'all'}
                    items={[
                      { id: 'all', label: 'All Industries' },
                      ...INDUSTRY_OPTIONS.map((industry) => ({
                        id: industry.key,
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
                      { id: 'all', label: selectedIndustry ? 'All Sub-Industries' : 'All Sub-Industries' },
                      ...availableSubIndustries.map((subIndustry) => ({
                        id: subIndustry.key,
                        label: subIndustry.name,
                      })),
                    ]}
                    setSelectedItemId={(id) => setSelectedSubIndustry(id === 'all' ? '' : id || '')}
                    className="w-full"
                  />
                </div>

                {/* Filter Summary */}
                {(selectedIndustry || selectedSubIndustry) && (
                  <div className="mt-4 p-3 border border-gray-300 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Filtering by: {selectedIndustry && getIndustryDisplayName(selectedIndustry)}
                      {selectedIndustry && selectedSubIndustry && ' → '}
                      {selectedSubIndustry && getSubIndustryDisplayName(selectedSubIndustry)}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Showing {filteredTickers.length} ticker{filteredTickers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </Block>

              {/* Ticker Selection - Only show if we have filters applied or show all */}
              {(selectedIndustry || selectedSubIndustry || (!selectedIndustry && !selectedSubIndustry)) && (
                <Block title="Select Tickers" className="dark:bg-gray-800">
                  {filteredTickers && filteredTickers.length > 0 ? (
                    <Checkboxes
                      items={filteredTickers.map(
                        (ticker): CheckboxItem => ({
                          id: ticker.symbol,
                          name: `ticker-${ticker.symbol}`,
                          label: (
                            <span className="flex-grow cursor-pointer">
                              <span className="font-medium">{ticker.symbol}</span> - {ticker.name}
                              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                                {getIndustryDisplayName(ticker.industryKey)} → {getSubIndustryDisplayName(ticker.subIndustryKey)}
                              </span>
                            </span>
                          ),
                        })
                      )}
                      selectedItemIds={selectedTickers}
                      onChange={(selectedIds: string[]) => setSelectedTickers(selectedIds)}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {selectedIndustry || selectedSubIndustry ? 'No tickers found for the selected filters.' : 'No tickers available. Add some tickers first.'}
                    </div>
                  )}
                  {selectedTickers.length > 0 && (
                    <div className="mt-4 flex justify-end">
                      <Button variant="outlined" onClick={() => setSelectedTickers([])} className="mr-2">
                        Clear Selection
                      </Button>
                      <Button variant="contained" primary onClick={fetchSelectedTickerReports}>
                        Refresh Reports
                      </Button>
                    </div>
                  )}
                </Block>
              )}

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
          />
        )}
      </div>
    </PageWrapper>
  );
}
