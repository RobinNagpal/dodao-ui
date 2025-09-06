'use client';

import AddTickersForm from '@/components/public-equities/AddTickersForm';
import ReportGenerator from '@/components/public-equities/ReportGenerator';
import { INVESTOR_OPTIONS } from '@/lib/mappingsV1';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerV1 } from '@/types/public-equity/analysis-factors-types';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkbox from '@dodao/web-core/components/app/Form/Checkbox';
import Checkboxes, { CheckboxItem } from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useState, useEffect } from 'react';

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
}

interface TickerReportV1 {
  ticker: TickerV1;
  analysisStatus: AnalysisStatus;
}

interface GenerationSettings {
  investorKey: string;
}

export default function CreateReportsV1Page(): JSX.Element {
  const [showAddTickerForm, setShowAddTickerForm] = useState<boolean>(false);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [tickerReports, setTickerReports] = useState<Record<string, TickerReportV1>>({});
  const [generationSettings, setGenerationSettings] = useState<GenerationSettings>({
    investorKey: 'WARREN_BUFFETT',
  });

  // Fetch all tickers
  const {
    data: tickers,
    loading: tickersLoading,
    reFetchData: refetchTickers,
  } = useFetchData<TickerV1[]>(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1`, { cache: 'no-cache' }, 'Failed to fetch tickers');

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

  // This function is no longer needed as the Checkboxes component handles selection internally

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

              {/* Ticker Selection */}
              <Block title="Select Tickers" className="dark:bg-gray-800">
                {tickers && tickers.length > 0 && (
                  <Checkboxes
                    items={tickers.map(
                      (ticker): CheckboxItem => ({
                        id: ticker.symbol,
                        name: `ticker-${ticker.symbol}`,
                        label: (
                          <span className="flex-grow cursor-pointer">
                            <span className="font-medium">{ticker.symbol}</span> - {ticker.name}
                          </span>
                        ),
                      })
                    )}
                    selectedItemIds={selectedTickers}
                    onChange={(selectedIds: string[]) => setSelectedTickers(selectedIds)}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  />
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

              {/* Generation Settings */}
              <Block title="Generation Settings" className="dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StyledSelect
                    label="Investor Style (for Investor Analysis)"
                    selectedItemId={generationSettings.investorKey}
                    items={INVESTOR_OPTIONS.map((opt) => ({ id: opt.key, label: opt.name }))}
                    setSelectedItemId={(key: string | null) =>
                      setGenerationSettings((prev: GenerationSettings) => ({
                        ...prev,
                        investorKey: key || 'WARREN_BUFFETT',
                      }))
                    }
                  />
                </div>
              </Block>

              {/* Report Generator Component */}
              {selectedTickers.length > 0 && (
                <ReportGenerator
                  selectedTickers={selectedTickers}
                  tickerReports={tickerReports}
                  onReportGenerated={handleReportGenerated}
                  generationSettings={generationSettings}
                />
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
